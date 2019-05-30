import {Socket} from "socket.io"
import {
    ConnectedEvent,
    ConnectedEventCallback,
    DisconnectedEvent,
    DisconnectedEventCallback,
    GameDataEvent,
    KilledByAsteroidEvent,
    KilledByPlayerEvent,
    NewPlayerJoinedEvent,
    OtherPlayerKilledByAsteroidEvent,
    OtherPlayerKilledByPlayerEvent,
    PlayerInputEvent,
    PlayerInputEventCallback,
    PlayerLeavingGameEvent,
    PlayerLeavingGameEventCallback,
    PlayerLeftEvent,
    PlayerLoggingInEvent,
    PlayerLoggingInEventCallback,
    ProjectSelectionDataEvent,
    ProjectSelectionMessageEvent,
    RequestLockProjectEvent,
    RequestLockProjectEventCallback,
    RequestRootEvent,
    RequestRootEventCallback,
    RequestUnlockProjectEvent,
    RequestUnlockProjectEventCallback,
    RequestUnrootEvent,
    RequestUnrootEventCallback,
    StartReceivingGameDataEvent,
    StartReceivingGameDataEventCallback,
    StartReceivingProjectSelectionDataEvent,
    StartReceivingProjectSelectionDataEventCallback,
    StopReceivingGameDataEvent,
    StopReceivingGameDataEventCallback,
    StopReceivingProjectSelectionDataEvent,
    StopReceivingProjectSelectionDataEventCallback,
    YouLoggedInEvent
} from "../shared/SocketEvents"
import {GameDataDTO, PlayerDTO, ProjectPreviewDTO, ProjectSelectionMessageDTO} from "../shared/DTOs"

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

    public static subscribeStartReceivingProjectSelectionDataEvent(socket: Socket, callback: StartReceivingProjectSelectionDataEventCallback): void {
        socket.on(StartReceivingProjectSelectionDataEvent.key, callback)
    }

    public static subscribeStopReceivingProjectSelectionDataEvent(socket: Socket, callback: StopReceivingProjectSelectionDataEventCallback): void {
        socket.on(StopReceivingProjectSelectionDataEvent.key, callback)
    }

    public static sendProjectSelectionData(socket: Socket, projectPreviews: ProjectPreviewDTO[], rootIds: string[]): void {
        socket.emit(ProjectSelectionDataEvent.key,
            ...ProjectSelectionDataEvent.emitterParams({isRoot: rootIds.includes(socket.id), previews: projectPreviews})
        )
    }

    public static subscribeRequestRootEvent(socket: Socket, callback: RequestRootEventCallback): void {
        socket.on(RequestRootEvent.key, callback)
    }

    public static subscribeRequestUnrootEvent(socket: Socket, callback: RequestUnrootEventCallback): void {
        socket.on(RequestUnrootEvent.key, callback)
    }

    public static sendProjectSelectionMessageEvent(socket: Socket, message: ProjectSelectionMessageDTO): void {
        socket.emit(ProjectSelectionMessageEvent.key, ...ProjectSelectionMessageEvent.emitterParams(message))
    }

    public static subscribeRequestLockProjectEvent(socket: Socket, callback: RequestLockProjectEventCallback): void {
        socket.on(RequestLockProjectEvent.key, callback)
    }

    public static subscribeRequestUnlockProjectEvent(socket: Socket, callback: RequestUnlockProjectEventCallback): void {
        socket.on(RequestUnlockProjectEvent.key, callback)
    }

    public static subscribePlayerLeavingGameEvent(socket: Socket, callback: PlayerLeavingGameEventCallback): void {
        socket.on(PlayerLeavingGameEvent.key, callback)
    }

    public static sendKilledByAsteroidEvent(socket: Socket, killedPlayer: PlayerDTO): void {
        socket.emit(KilledByAsteroidEvent.key, ...KilledByAsteroidEvent.emitterParams(killedPlayer))
        socket.broadcast.emit(OtherPlayerKilledByAsteroidEvent.key,
            ...OtherPlayerKilledByAsteroidEvent.emitterParams(killedPlayer))
    }

    public static sendKilledByPlayerEvent(socket: Socket, killer: PlayerDTO, killed: PlayerDTO): void {
        socket.emit(KilledByPlayerEvent.key, ...KilledByPlayerEvent.emitterParams(killer, killed))
        socket.broadcast.emit(OtherPlayerKilledByPlayerEvent.key,
            ...OtherPlayerKilledByPlayerEvent.emitterParams(killer, killed))
    }
}