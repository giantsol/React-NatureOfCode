import {
    GameDataEvent,
    GameDataEventCallback,
    KilledByAsteroidEvent,
    KilledByAsteroidEventCallback,
    KilledByPlayerEvent,
    KilledByPlayerEventCallback,
    NewPlayerJoinedEvent,
    NewPlayerJoinedEventCallback,
    OtherPlayerKilledByAsteroidEvent,
    OtherPlayerKilledByAsteroidEventCallback,
    OtherPlayerKilledByPlayerEvent,
    OtherPlayerKilledByPlayerEventCallback,
    PlayerInputEvent,
    PlayerLeavingGameEvent,
    PlayerLeftEvent,
    PlayerLeftEventCallback,
    PlayerLoggingInEvent,
    ProjectSelectionDataEvent,
    ProjectSelectionDataEventCallback,
    RequestLockProjectEvent,
    RequestRootEvent,
    RequestUnlockProjectEvent,
    RequestUnrootEvent,
    ProjectSelectionMessageEvent,
    ProjectSelectionMessageEventCallback,
    StartReceivingGameDataEvent,
    StartReceivingProjectSelectionDataEvent,
    StopReceivingGameDataEvent,
    StopReceivingProjectSelectionDataEvent,
    YouLoggedInEvent,
    YouLoggedInEventCallback
} from "../shared/SocketEvents"
import {PlayerInputDTO} from "../shared/DTOs"
import {RGBColor} from "react-color"

export class ClientSocketEventsHelper {

    public static subscribeYouJoinedEvent(socket: SocketIOClient.Emitter, callback: YouLoggedInEventCallback): void {
        socket.on(YouLoggedInEvent.key, callback)
    }

    public static unsubscribeYouJoinedEvent(socket: SocketIOClient.Emitter): void {
        socket.off(YouLoggedInEvent.key)
    }

    public static subscribeNewPlayerJoinedEvent(socket: SocketIOClient.Emitter, callback: NewPlayerJoinedEventCallback): void {
        socket.on(NewPlayerJoinedEvent.key, callback)
    }

    public static unsubscribeNewPlayerJoinedEvent(socket: SocketIOClient.Emitter, callback: NewPlayerJoinedEventCallback) {
        socket.off(NewPlayerJoinedEvent.key, callback)
    }

    public static subscribeGameDataEvent(socket: SocketIOClient.Emitter, callback: GameDataEventCallback): void {
        socket.on(GameDataEvent.key, callback)
    }

    public static unsubscribeGameDataEvent(socket: SocketIOClient.Emitter, callback: GameDataEventCallback): void {
        socket.off(GameDataEvent.key, callback)
    }

    public static sendLoggingInEvent(socket: SocketIOClient.Emitter, name: string, color: RGBColor): void {
        socket.emit(PlayerLoggingInEvent.key, ...PlayerLoggingInEvent.emitterParams(name, color))
    }

    public static startReceivingGameData(socket: SocketIOClient.Emitter): void {
        socket.emit(StartReceivingGameDataEvent.key)
    }

    public static stopReceivingGameData(socket: SocketIOClient.Emitter): void {
        socket.emit(StopReceivingGameDataEvent.key)
    }

    public static subscribePlayerLeftEvent(socket: SocketIOClient.Emitter, callback: PlayerLeftEventCallback): void {
        socket.on(PlayerLeftEvent.key, callback)
    }

    public static unsubscribePlayerLeftEvent(socket: SocketIOClient.Emitter, callback: PlayerLeftEventCallback): void {
        socket.off(PlayerLeftEvent.key, callback)
    }

    public static sendPlayerInput(socket: SocketIOClient.Emitter, playerInput: PlayerInputDTO): void {
        socket.emit(PlayerInputEvent.key, ...PlayerInputEvent.emitterParams(playerInput))
    }

    public static startReceivingProjectSelectionDataEvent(socket: SocketIOClient.Emitter): void {
        socket.emit(StartReceivingProjectSelectionDataEvent.key)
    }

    public static stopReceivingProjectSelectionDataEvent(socket: SocketIOClient.Emitter): void {
        socket.emit(StopReceivingProjectSelectionDataEvent.key)
    }

    public static subscribeProjectSelectionDataEvent(socket: SocketIOClient.Emitter, callback: ProjectSelectionDataEventCallback): void {
        socket.on(ProjectSelectionDataEvent.key, callback)
    }

    public static unsubscribeProjectSelectionDataEvent(socket: SocketIOClient.Emitter, callback: ProjectSelectionDataEventCallback): void {
        socket.off(ProjectSelectionDataEvent.key, callback)
    }

    public static sendRequestRootEvent(socket: SocketIOClient.Emitter, password: string): void {
        socket.emit(RequestRootEvent.key, ...RequestRootEvent.emitterParams(password))
    }

    public static sendRequestUnrootEvent(socket: SocketIOClient.Emitter): void {
        socket.emit(RequestUnrootEvent.key)
    }

    public static subscribeProjectSelectionMessageEvent(socket: SocketIOClient.Emitter, callback: ProjectSelectionMessageEventCallback): void {
        socket.on(ProjectSelectionMessageEvent.key, callback)
    }

    public static unsubscribeProjectSelectionMessageEvent(socket: SocketIOClient.Emitter, callback: ProjectSelectionMessageEventCallback): void {
        socket.off(ProjectSelectionMessageEvent.key, callback)
    }

    public static sendRequestLockProjectEvent(socket: SocketIOClient.Emitter, projectNum: number): void {
        socket.emit(RequestLockProjectEvent.key, ...RequestLockProjectEvent.emitterParams(projectNum))
    }

    public static sendPlayerLeavingGameEvent(socket: SocketIOClient.Emitter): void {
        socket.emit(PlayerLeavingGameEvent.key)
    }

    public static sendRequestUnlockProjectEvent(socket: SocketIOClient.Emitter, projectNum: number): void {
        socket.emit(RequestUnlockProjectEvent.key, ...RequestUnlockProjectEvent.emitterParams(projectNum))
    }

    public static subscribeKilledByAsteroidEvent(socket: SocketIOClient.Emitter, callback: KilledByAsteroidEventCallback): void {
        socket.on(KilledByAsteroidEvent.key, callback)
    }

    public static unsubscribeKilledByAsteroidEvent(socket: SocketIOClient.Emitter, callback: KilledByAsteroidEventCallback): void {
        socket.off(KilledByAsteroidEvent.key, callback)
    }

    public static subscribeOtherPlayerKilledByAsteroidEvent(socket: SocketIOClient.Emitter, callback: OtherPlayerKilledByAsteroidEventCallback):void {
        socket.on(OtherPlayerKilledByAsteroidEvent.key, callback)
    }

    public static unsubscribeOtherPlayerKilledByAsteroidEvent(socket: SocketIOClient.Emitter, callback: OtherPlayerKilledByAsteroidEventCallback):void {
        socket.off(OtherPlayerKilledByAsteroidEvent.key, callback)
    }

    public static subscribeKilledByPlayerEvent(socket: SocketIOClient.Emitter, callback: KilledByPlayerEventCallback): void {
        socket.on(KilledByPlayerEvent.key, callback)
    }

    public static unsubscribeKilledByPlayerEvent(socket: SocketIOClient.Emitter, callback: KilledByPlayerEventCallback): void {
        socket.off(KilledByPlayerEvent.key, callback)
    }

    public static subscribeOtherPlayerKilledByPlayerEvent(socket: SocketIOClient.Emitter, callback: OtherPlayerKilledByPlayerEventCallback):void {
        socket.on(OtherPlayerKilledByPlayerEvent.key, callback)
    }

    public static unsubscribeOtherPlayerKilledByPlayerEvent(socket: SocketIOClient.Emitter, callback: OtherPlayerKilledByPlayerEventCallback):void {
        socket.off(OtherPlayerKilledByPlayerEvent.key, callback)
    }
}
