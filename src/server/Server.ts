import {Request, Response} from "express"
import {ServerSocketEventsHelper} from "./ServerSocketEventsHelper"
import {Socket} from "socket.io"
import {ServerGameData, ServerPlayer} from "./ServerModels"
import {PlayerInputDTO, RootMessageDTO} from "../shared/DTOs"

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = 8080

app.use(express.static('build_dev'))

app.get('/', (req: Request, res: Response) => {
    res.sendFile('index.html')
})

class Server {

    static readonly gameUpdateInterval = 1000 / 60
    private gameDataReceivingSockets: Array<Socket> = []
    private readonly gameData: ServerGameData = new ServerGameData()

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
        console.log(name)
        const newPlayer = new ServerPlayer(socket.id, name)
        this.gameData.addNewPlayer(newPlayer)

        ServerSocketEventsHelper.sendPlayerLoggedIn(socket, newPlayer)
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

    private onPlayerLeavingGameEvent = (socket: Socket) => {
        const disconnectedPlayer = this.gameData.removePlayerById(socket.id)
        if (disconnectedPlayer) {
            ServerSocketEventsHelper.sendPlayerLeft(socket, disconnectedPlayer)
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
        // do game update logic
        gameData.update()

        for (let socket of this.gameDataReceivingSockets) {
            ServerSocketEventsHelper.sendGameData(socket, gameData)
        }

        // recursively call myself
        setTimeout(this.gameUpdateLoop, Server.gameUpdateInterval)
    }
}

const server = new Server()
server.start(port)