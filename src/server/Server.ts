import {Request, Response} from "express"
import {ServerSocketEventsHelper} from "./ServerSocketEventsHelper"
import {Socket} from "socket.io"
import {Arena, ServerAsteroid, ServerBullet, ServerGameData, ServerPlayer} from "./ServerModels"
import {GameDataDTO, PlayerInputDTO, RootMessageDTO} from "../shared/DTOs"

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = 8080

app.use(express.static('build_dev'))

app.get('/', (req: Request, res: Response) => {
    res.sendFile('index.html')
})

class Server implements Arena {

    static readonly gameUpdateInterval = 1000 / 60
    private gameDataReceivingSockets: Array<Socket> = []
    private readonly gameData: ServerGameData = new ServerGameData(this)

    private projectSelectionDataReceivingSockets: Array<Socket> = []
    private readonly projectPreviews = [
        { num: 1, name: "First", isOpen: true },
        { num: 2, name: "Second", isOpen: true },
        { num: 3, name: "Third", isOpen: false },
        { num: 4, name: "Fourth", isOpen: true },
        { num: 5, name: "Final", isOpen: true }
    ]
    private rootIds: string[] = []

    private readonly rootPassword = "2052"

    start(port: number): void {
        http.listen(port, () => {
            console.info(`Listening on port ${port}`)
        })

        ServerSocketEventsHelper.subscribeConnectedEvent(io, socket => {
            this.subscribeSocketEvents(socket)
        })

        setTimeout(this.gameUpdateLoop, Server.gameUpdateInterval)
    }

    private subscribeSocketEvents(socket: Socket): void {
        ServerSocketEventsHelper.subscribePlayerLoggingInEvent(socket, name => {
            this.onPlayerLoggingInEvent(socket, name)
        })

        ServerSocketEventsHelper.subscribeDisconnectedEvent(socket, () => {
            this.onDisconnectedEvent(socket)
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

    private onPlayerLoggingInEvent = (socket: Socket, name: string) => {
        if (this.gameData.hasPlayerWithId(socket.id)) {
            return
        }

        const newPlayer = new ServerPlayer(socket.id, name, this.gameData.bulletHouse, this)
        this.gameData.addNewPlayer(newPlayer)

        ServerSocketEventsHelper.sendPlayerLoggedIn(socket, newPlayer.createDigestedData())
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
    }

    private onPlayerLeavingGameEvent = (socket: Socket) => {
        const disconnectedPlayer = this.gameData.removePlayerById(socket.id)
        if (disconnectedPlayer) {
            ServerSocketEventsHelper.sendPlayerLeft(socket, disconnectedPlayer.createDigestedData())
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
        if (password == this.rootPassword) {
            this.rootIds.push(socket.id)
            ServerSocketEventsHelper.sendProjectSelectionData(socket, this.projectPreviews, this.rootIds)
            ServerSocketEventsHelper.sendRootMessageEvent(socket, RootMessageDTO.ROOT_REQUEST_ACCEPTED)
        } else {
            ServerSocketEventsHelper.sendRootMessageEvent(socket, RootMessageDTO.ROOT_REQUEST_DENIED)
        }
    }

    private onRequestUnrootEvent = (socket: Socket) => {
        const index = this.rootIds.indexOf(socket.id, 0)
        if (index > -1) {
            this.rootIds.splice(index, 1)
        }
        ServerSocketEventsHelper.sendProjectSelectionData(socket, this.projectPreviews, this.rootIds)
        ServerSocketEventsHelper.sendRootMessageEvent(socket, RootMessageDTO.UNROOTED)
    }

    private onRequestLockProjectEvent = (socket: Socket, projectNum: number) => {
        if (this.rootIds.includes(socket.id)) {
            const lockTarget = this.projectPreviews.find(preview => preview.num == projectNum)
            if (lockTarget) {
                lockTarget.isOpen = false
                ServerSocketEventsHelper.sendRootMessageEvent(socket, RootMessageDTO.PROJECT_LOCKED)
                this.projectSelectionDataReceivingSockets.forEach(socket => {
                    ServerSocketEventsHelper.sendProjectSelectionData(socket, this.projectPreviews, this.rootIds)
                })
            }
        } else {
            ServerSocketEventsHelper.sendRootMessageEvent(socket, RootMessageDTO.PERMISSION_DENIED)
        }
    }

    private onRequestUnlockProjectEvent = (socket: Socket, projectNum: number) => {
        if (this.rootIds.includes(socket.id)) {
            const unlockTarget = this.projectPreviews.find(preview => preview.num == projectNum)
            if (unlockTarget) {
                unlockTarget.isOpen = true
                ServerSocketEventsHelper.sendRootMessageEvent(socket, RootMessageDTO.PROJECT_UNLOCKED)
                this.projectSelectionDataReceivingSockets.forEach(socket => {
                    ServerSocketEventsHelper.sendProjectSelectionData(socket, this.projectPreviews, this.rootIds)
                })
            }
        } else {
            ServerSocketEventsHelper.sendRootMessageEvent(socket, RootMessageDTO.PERMISSION_DENIED)
        }
    }

    private gameUpdateLoop = () => {
        const gameData = this.gameData
        gameData.update()

        const digestedData: GameDataDTO = gameData.createDigestedData()
        for (let socket of this.gameDataReceivingSockets) {
            ServerSocketEventsHelper.sendGameData(socket, digestedData)
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
                ServerSocketEventsHelper.sendKilledByAsteroidEvent(killedPlayerSocket, killedPlayer.createDigestedData())
            }
        }

        gameData.onAsteroidDamaged(asteroid)
    }

    bulletKilledAsteroid(bullet: ServerBullet, asteroid: ServerAsteroid): void {
        const gameData = this.gameData
        gameData.recycleBulletById(bullet.id)
        gameData.onAsteroidDamaged(asteroid)
    }

    bulletKilledPlayer(bullet: ServerBullet, player: ServerPlayer): void {
        const gameData = this.gameData
        if (bullet.firerId) {
            const firer = gameData.getPlayerWithId(bullet.firerId)
            const killedPlayer = gameData.removePlayerById(player.id)
            if (firer && killedPlayer) {
                const killedPlayerSocket = this.gameDataReceivingSockets.find(socket => socket.id === killedPlayer.id)
                if (killedPlayerSocket) {
                    ServerSocketEventsHelper.sendKilledByPlayerEvent(killedPlayerSocket,
                        firer.createDigestedData(), killedPlayer.createDigestedData())
                }
            }
        }

        gameData.recycleBulletById(bullet.id)
    }

}

const server = new Server()
server.start(port)