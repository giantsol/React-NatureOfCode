import {Request, Response} from "express"
import {ServerSocket} from "./ServerSocket"
import {ClientModels} from "../client/ClientModels"
import {ServerModels} from "./ServerModels"
import {ServerSocketEventsHelper} from "./ServerSocketEventsHelper"

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

    constructor() {
        ServerSocketEventsHelper.subscribeConnectedEvent(io, socket => {
            this.subscribeSocketEvents(socket)
        })
    }

    start(port: number): void {
        http.listen(port, () => {
            console.info(`Listening on port ${port}`)
        })
    }

    private subscribeSocketEvents(socket: ServerSocket): void {
        this.subscribePlayerSignedInEvent(socket)
        this.subscribePlayerSignedOutEvent(socket)
    }

    private subscribePlayerSignedInEvent(socket: ServerSocket): void {
        ServerSocketEventsHelper.subscribePlayerSignedInEvent(socket, (player: ClientModels.Player) => {
            socket.player = ServerModels.Player.createFrom(player)
            ServerSocketEventsHelper.onNewPlayerCreated(socket, socket.player)
        })
    }

    private subscribePlayerSignedOutEvent(socket: ServerSocket): void {
        ServerSocketEventsHelper.subscribePlayerSignedOutEvent(socket, () => {
            if (socket.player) {
                ServerSocketEventsHelper.onPlayerLeft(socket, socket.player)
            }
        })
    }
}

const server = new Server()
server.start(port)