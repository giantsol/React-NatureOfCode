import {Request, Response} from "express"
import {ServerSocketEventsHelper} from "./ServerSocketEventsHelper"
import {Socket} from "socket.io"
import {Arena, ServerAsteroid, ServerBullet, ServerGameData, ServerPlayer} from "./ServerModels"
import {PlayerInputDTO, ProjectPreviewDTO, ProjectSelectionMessageDTO} from "../shared/DTOs"
import {RGBColor} from "react-color"

const paths = require('../../config/paths');
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || '8080'

app.use(express.static('build'))

app.get('/', (req: Request, res: Response) => {
    res.sendFile(paths.appHtml, { root: paths.appBuild })
})

const rootPassword = "2052"

class Server implements Arena {

    static readonly gameUpdateInterval = 1000 / 60
    private readonly gameDataReceivingSockets: Array<Socket> = []
    private readonly gameData: ServerGameData = new ServerGameData(this)

    private readonly projectSelectionDataReceivingSockets: Array<Socket> = []
    private readonly projectPreviews: ProjectPreviewDTO[] = [
        { projectNum: 1, title: "First", isOpen: true },
        { projectNum: 2, title: "Second", isOpen: true },
        { projectNum: 3, title: "Third", isOpen: true },
        { projectNum: 4, title: "Fourth", isOpen: true },
        { projectNum: 5, title: "Final", isOpen: true }
    ]
    private rootIds: string[] = []

    start(port: string): void {
        http.listen(port, () => {
            console.info(`Listening on port ${port}`)
        })

        ServerSocketEventsHelper.subscribeConnectedEvent(io, socket => {
            this.subscribeSocketEvents(socket)
            console.log(`gameDataReceivingSocket count: ${this.gameDataReceivingSockets.length}, projectSelectionDataReceivingSocket count: ${this.projectSelectionDataReceivingSockets.length}`)
        })

        setTimeout(this.gameUpdateLoop, Server.gameUpdateInterval)
    }

    private subscribeSocketEvents(socket: Socket): void {
        ServerSocketEventsHelper.subscribePlayerLoggingInEvent(socket, (name, color) => {
            this.onPlayerLoggingInEvent(socket, name, color)
        })

        ServerSocketEventsHelper.subscribeDisconnectedEvent(socket, () => {
            this.onDisconnectedEvent(socket)
            console.log(`gameDataReceivingSocket count: ${this.gameDataReceivingSockets.length}, projectSelectionDataReceivingSocket count: ${this.projectSelectionDataReceivingSockets.length}`)
        })

        ServerSocketEventsHelper.subscribePlayerLeavingGameEvent(socket, () => {
            this.onPlayerLeavingGameEvent(socket)
        })

        ServerSocketEventsHelper.subscribeStartReceivingGameDataEvent(socket, () => {
            this.onStartReceivingGameDataEvent(socket)
        })

        ServerSocketEventsHelper.subscribeStopReceivingGameDataEvent(socket, () => {
            this.onStopReceivingGameDataEvent(socket)
        })

        ServerSocketEventsHelper.subscribePlayerInputEvent(socket, playerInput => {
            this.onPlayerInputEvent(socket, playerInput)
        })

        ServerSocketEventsHelper.subscribeStartReceivingProjectSelectionDataEvent(socket, () => {
            this.onStartReceivingProjectSelectionDataEvent(socket)
        })

        ServerSocketEventsHelper.subscribeStopReceivingProjectSelectionDataEvent(socket, () => {
            this.onStopReceivingProjectSelectionDataEvent(socket)
        })

        ServerSocketEventsHelper.subscribeRequestRootEvent(socket, password => {
            this.onRequestRootEvent(socket, password)
        })

        ServerSocketEventsHelper.subscribeRequestUnrootEvent(socket, () => {
            this.onRequestUnrootEvent(socket)
        })

        ServerSocketEventsHelper.subscribeRequestLockProjectEvent(socket, projectNum => {
            this.onRequestLockProjectEvent(socket, projectNum)
        })

        ServerSocketEventsHelper.subscribeRequestUnlockProjectEvent(socket, projectNum => {
            this.onRequestUnlockProjectEvent(socket, projectNum)
        })
    }

    private onPlayerLoggingInEvent = (socket: Socket, name: string, color: RGBColor) => {
        if (this.gameData.hasPlayerWithId(socket.id)) {
            return
        }

        const newPlayer = new ServerPlayer(socket.id, name, color, this.gameData.bulletHouse, this)
        this.gameData.addNewPlayer(newPlayer)

        ServerSocketEventsHelper.sendPlayerLoggedIn(socket, newPlayer.toDTO())
    }

    private onStartReceivingGameDataEvent = (socket: Socket) => {
        this.gameDataReceivingSockets.push(socket)
    }

    private onStopReceivingGameDataEvent = (socket: Socket) => {
        const index = this.gameDataReceivingSockets.indexOf(socket, 0)
        if (index > -1) {
            this.gameDataReceivingSockets.splice(index, 1)
        }
    }

    private onDisconnectedEvent = (socket: Socket) => {
        // 유저가 크롬 창을 그냥 닫거나 하는 등의 경우, onPlayerLeavingGameEvent같은게 안들어오고 바로
        // 종료되기 때문에, cleanup이 안되었을 수도 있어서 여기서 다 클린업 해줘야함.
        this.onStopReceivingGameDataEvent(socket)
        this.onStopReceivingProjectSelectionDataEvent(socket)
        this.onPlayerLeavingGameEvent(socket)
        this.onRequestUnrootEvent(socket)
    }

    private onPlayerLeavingGameEvent = (socket: Socket) => {
        const disconnectedPlayer = this.gameData.removePlayerById(socket.id)
        if (disconnectedPlayer) {
            ServerSocketEventsHelper.sendPlayerLeft(socket, disconnectedPlayer.toDTO())
        }
    }

    private onPlayerInputEvent = (socket: Socket, playerInput: PlayerInputDTO) => {
        this.gameData.applyPlayerInput(socket.id, playerInput)
    }

    private onStartReceivingProjectSelectionDataEvent = (socket: Socket) => {
        this.projectSelectionDataReceivingSockets.push(socket)

        ServerSocketEventsHelper.sendProjectSelectionData(socket, this.projectPreviews, this.rootIds)
    }

    private onStopReceivingProjectSelectionDataEvent = (socket: Socket) => {
        const index = this.projectSelectionDataReceivingSockets.indexOf(socket, 0)
        if (index > -1) {
            this.projectSelectionDataReceivingSockets.splice(index, 1)
        }
    }

    private onRequestRootEvent = (socket: Socket, password: string) => {
        if (password === rootPassword) {
            this.rootIds.push(socket.id)
            ServerSocketEventsHelper.sendProjectSelectionData(socket, this.projectPreviews, this.rootIds)
            ServerSocketEventsHelper.sendProjectSelectionMessageEvent(socket, ProjectSelectionMessageDTO.ROOTED)
        } else {
            ServerSocketEventsHelper.sendProjectSelectionMessageEvent(socket, ProjectSelectionMessageDTO.PERMISSION_DENIED)
        }
    }

    private onRequestUnrootEvent = (socket: Socket) => {
        const index = this.rootIds.indexOf(socket.id, 0)
        if (index > -1) {
            this.rootIds.splice(index, 1)
        }
        ServerSocketEventsHelper.sendProjectSelectionData(socket, this.projectPreviews, this.rootIds)
        ServerSocketEventsHelper.sendProjectSelectionMessageEvent(socket, ProjectSelectionMessageDTO.UNROOTED)
    }

    private onRequestLockProjectEvent = (socket: Socket, projectNum: number) => {
        if (this.rootIds.includes(socket.id)) {
            const lockTarget = this.projectPreviews.find(preview => preview.projectNum == projectNum)
            if (lockTarget) {
                lockTarget.isOpen = false
                ServerSocketEventsHelper.sendProjectSelectionMessageEvent(socket, ProjectSelectionMessageDTO.PROJECT_LOCKED)
                this.projectSelectionDataReceivingSockets.forEach(socket => {
                    ServerSocketEventsHelper.sendProjectSelectionData(socket, this.projectPreviews, this.rootIds)
                })
            }
        } else {
            ServerSocketEventsHelper.sendProjectSelectionMessageEvent(socket, ProjectSelectionMessageDTO.PERMISSION_DENIED)
        }
    }

    private onRequestUnlockProjectEvent = (socket: Socket, projectNum: number) => {
        if (this.rootIds.includes(socket.id)) {
            const unlockTarget = this.projectPreviews.find(preview => preview.projectNum == projectNum)
            if (unlockTarget) {
                unlockTarget.isOpen = true
                ServerSocketEventsHelper.sendProjectSelectionMessageEvent(socket, ProjectSelectionMessageDTO.PROJECT_UNLOCKED)
                this.projectSelectionDataReceivingSockets.forEach(socket => {
                    ServerSocketEventsHelper.sendProjectSelectionData(socket, this.projectPreviews, this.rootIds)
                })
            }
        } else {
            ServerSocketEventsHelper.sendProjectSelectionMessageEvent(socket, ProjectSelectionMessageDTO.PERMISSION_DENIED)
        }
    }

    private gameUpdateLoop = () => {
        const gameData = this.gameData
        gameData.update()

        const gameDataDTO = gameData.toDTO()
        for (let socket of this.gameDataReceivingSockets) {
            ServerSocketEventsHelper.sendGameData(socket, gameDataDTO)
        }

        // recursively call myself
        setTimeout(this.gameUpdateLoop, Server.gameUpdateInterval)
    }

    asteroidKilledPlayer(asteroid: ServerAsteroid, player: ServerPlayer): void {
        const gameData = this.gameData
        const killedPlayer = gameData.removePlayerById(player.id)
        if (killedPlayer) {
            const killedPlayerSocket = this.gameDataReceivingSockets.find(socket => socket.id === killedPlayer.id)
            if (killedPlayerSocket) {
                ServerSocketEventsHelper.sendKilledByAsteroidEvent(killedPlayerSocket, killedPlayer.toDTO())
            }
        }

        gameData.breakAsteroid(asteroid)
    }

    bulletKilledAsteroid(bullet: ServerBullet, asteroid: ServerAsteroid): void {
        const gameData = this.gameData
        if (bullet.firerId) {
            const firer = gameData.getPlayerWithId(bullet.firerId)
            if (firer) {
                gameData.breakAsteroid(asteroid)
                firer.increaseAsteroidPoint()
            }
        }

        gameData.recycleBulletById(bullet.id)
    }

    bulletKilledPlayer(bullet: ServerBullet, player: ServerPlayer): void {
        const gameData = this.gameData
        if (bullet.firerId) {
            const firer = gameData.getPlayerWithId(bullet.firerId)
            if (firer) {
                const killedPlayer = gameData.removePlayerById(player.id)
                if (killedPlayer) {
                    const killedPlayerSocket = this.gameDataReceivingSockets.find(socket => socket.id === killedPlayer.id)
                    if (killedPlayerSocket) {
                        ServerSocketEventsHelper.sendKilledByPlayerEvent(killedPlayerSocket, firer.toDTO(), killedPlayer.toDTO())
                    }
                    firer.increaseKillingPoint()
                }
            }
        }

        gameData.recycleBulletById(bullet.id)
    }

}

const server = new Server()
server.start(port)