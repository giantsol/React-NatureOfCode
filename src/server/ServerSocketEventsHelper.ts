import {Socket} from "socket.io"
import {
    ConnectedEvent,
    ConnectedEventCallback,
    DisconnectedEvent,
    DisconnectedEventCallback,
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
    YouLoggedInEvent,
    PlayerInputEventCallback,
    PlayerInputEvent,
    StartReceivingProjectSelectionDataEventCallback,
    StartReceivingProjectSelectionDataEvent,
    StopReceivingProjectSelectionDataEventCallback,
    StopReceivingProjectSelectionDataEvent,
    ProjectSelectionDataEvent,
    RequestRootEventCallback,
    RequestRootEvent,
    RequestUnrootEventCallback,
    RequestUnrootEvent,
    RootMessageEvent,
    RequestLockProjectEvent,
    RequestLockProjectEventCallback, RequestUnlockProjectEvent, RequestUnlockProjectEventCallback
} from "../shared/SocketEvents"
import {
    GameDataDTO,
    PlayerDTO,
    ProjectPreviewDTO,
    ProjectSelectionDataDTO,
    RootMessageDTO
} from "../shared/DTOs"

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

    public static sendRootMessageEvent(socket: Socket, rootMessage: RootMessageDTO): void {
        socket.emit(RootMessageEvent.key, ...RootMessageEvent.emitterParams(rootMessage))
    }

    public static subscribeRequestLockProjectEvent(socket: Socket, callback: RequestLockProjectEventCallback): void {
        socket.on(RequestLockProjectEvent.key, callback)
    }

    public static subscribeRequestUnlockProjectEvent(socket: Socket, callback: RequestUnlockProjectEventCallback): void {
        socket.on(RequestUnlockProjectEvent.key, callback)
    }
}