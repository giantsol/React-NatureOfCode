import {Socket} from "socket.io"
import {ServerModels} from "./ServerModels"
import {ClientModels} from "../client/ClientModels"
import {
    ConnectedEvent,
    ConnectedEventCallback,
    NewPlayerJoinedEvent,
    PlayerLeftEvent,
    PlayerSignedInEvent,
    PlayerSignedInEventCallback,
    PlayerSignedOutEvent,
    PlayerSignedOutEventCallback,
    YouJoinedEvent
} from "../shared/SocketEvents"

export class ServerSocketEventsHelper {
    public static subscribeConnectedEvent(io: Socket, callback: ConnectedEventCallback): void {
        io.on(ConnectedEvent.key, callback)
    }

    public static subscribePlayerSignedInEvent(socket: Socket, callback: PlayerSignedInEventCallback): void {
        socket.on(PlayerSignedInEvent.key, callback)
    }

    public static subscribePlayerSignedOutEvent(socket: Socket, callback: PlayerSignedOutEventCallback): void {
        socket.on(PlayerSignedOutEvent.key, callback)
    }

    public static onNewPlayerCreated(socket: Socket, player: ServerModels.Player): void {
        const clientPlayer = ClientModels.Player.createFrom(player)
        socket.emit(YouJoinedEvent.key, YouJoinedEvent.createParams(clientPlayer))
        socket.broadcast.emit(NewPlayerJoinedEvent.key, NewPlayerJoinedEvent.createParams(clientPlayer))
    }

    public static onPlayerLeft(socket: Socket, player: ServerModels.Player): void {
        const clientPlayer = ClientModels.Player.createFrom(player)
        socket.broadcast.emit(PlayerLeftEvent.key, PlayerLeftEvent.createParams(clientPlayer))
    }
}