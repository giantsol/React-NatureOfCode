import {Socket} from "socket.io"
import {
    ConnectedEvent,
    ConnectedEventCallback, DisconnectedEvent, DisconnectedEventCallback,
    GameDataEvent,
    NewPlayerJoinedEvent,
    PlayerLoggingInEvent,
    PlayerLoggingInEventCallback,
    PlayerLeftEvent,
    PlayerLeftEventCallback,
    StartReceivingGameDataEvent,
    StartReceivingGameDataEventCallback,
    StopReceivingGameDataEvent,
    StopReceivingGameDataEventCallback,
    YouLoggedInEvent, PlayerInputEventCallback, PlayerInputEvent
} from "../shared/SocketEvents"
import {GameDataDTO, PlayerDTO} from "../shared/DTOs"

export class ServerSocketEventsHelper {
    public static subscribeConnectedEvent(socket: Socket, callback: ConnectedEventCallback): void {
        socket.on(ConnectedEvent.key, callback)
    }

    public static subscribeDisconnectedEvent(socket: Socket, callback: DisconnectedEventCallback): void {
        socket.on(DisconnectedEvent.key, callback)
    }

    public static subscribePlayerLoggingInEvent(socket: Socket, callback: PlayerLoggingInEventCallback): void {
        socket.on(PlayerLoggingInEvent.key, callback)
    }

    public static subscribeStartReceivingGameDataEvent(socket: Socket, callback: StartReceivingGameDataEventCallback): void {
        socket.on(StartReceivingGameDataEvent.key, callback)
    }

    public static subscribeStopReceivingGameDataEvent(socket: Socket, callback: StopReceivingGameDataEventCallback): void {
        socket.on(StopReceivingGameDataEvent.key, callback)
    }

    public static sendPlayerLoggedIn(socket: Socket, player: PlayerDTO): void {
        socket.emit(YouLoggedInEvent.key, ...YouLoggedInEvent.emitterParams(player))
        socket.broadcast.emit(NewPlayerJoinedEvent.key, ...NewPlayerJoinedEvent.emitterParams(player))
    }

    public static sendGameData(socket: Socket, gameData: GameDataDTO): void {
        socket.emit(GameDataEvent.key, ...GameDataEvent.emitterParams(gameData))
    }

    public static sendPlayerLeft(socket: Socket, player: PlayerDTO): void {
        socket.broadcast.emit(PlayerLeftEvent.key, ...PlayerLeftEvent.emitterParams(player))
    }

    public static subscribePlayerInputEvent(socket: Socket, callback: PlayerInputEventCallback): void {
        socket.on(PlayerInputEvent.key, callback)
    }
}