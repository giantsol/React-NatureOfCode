import {Socket} from "socket.io"
import {
    ConnectedEvent,
    ConnectedEventCallback,
    GameDataEvent,
    NewPlayerJoinedEvent,
    PlayerLoggingInEvent,
    PlayerLoggingInEventCallback,
    PlayerSignedOutEvent,
    PlayerSignedOutEventCallback,
    StartReceivingGameDataEvent,
    StartReceivingGameDataEventCallback,
    StopReceivingGameDataEvent,
    StopReceivingGameDataEventCallback,
    YouLoggedInEvent
} from "../shared/SocketEvents"
import {GameDataDTO, PlayerDTO} from "../shared/DTOs"

export class ServerSocketEventsHelper {
    public static subscribeConnectedEvent(io: Socket, callback: ConnectedEventCallback): void {
        io.on(ConnectedEvent.key, callback)
    }

    public static subscribePlayerLoggingInEvent(socket: Socket, callback: PlayerLoggingInEventCallback): void {
        socket.on(PlayerLoggingInEvent.key, callback)
    }

    public static subscribePlayerSignedOutEvent(socket: Socket, callback: PlayerSignedOutEventCallback): void {
        socket.on(PlayerSignedOutEvent.key, callback)
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
}