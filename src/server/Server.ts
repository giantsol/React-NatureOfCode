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
        { num: 3, name: "Third", isOpen: false }
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

        ServerSocketEventsHelper.subscribeStartReceivingGameDataEvent(socket, () => {
            this.onStartReceivingGameDataEvent(socket)
        })

        ServerSocketEventsHelper.subscribeStopReceivingGameDataEvent(socket, () => {
            this.onStopReceivingGameDataEvent(socket)
        })

        ServerSocketEventsHelper.subscribeDisconnectedEvent(socket, () => {
            this.onDisconnectedEvent(socket)
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

    private onDisconnectedEvent = (socket: Socket) => {
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

    private gameUpdateLoop = () => {
        const gameData = this.gameData
        // do game update logic

        for (let socket of this.gameDataReceivingSockets) {
            ServerSocketEventsHelper.sendGameData(socket, gameData)
        }

        // recursively call myself
        setTimeout(this.gameUpdateLoop, Server.gameUpdateInterval)
    }
}

const server = new Server()
server.start(port)