import {
    NewPlayerJoinedEvent,
    NewPlayerJoinedEventCallback,
    PlayerSignedInEvent,
    YouJoinedEvent,
    YouJoinedEventCallback
} from "../shared/SocketEvents"

export class ClientSocketEventsHelper {

    public static subscribeYouJoinedEvent(socket: SocketIOClient.Emitter, callback: YouJoinedEventCallback): void {
        socket.on(YouJoinedEvent.key, callback)
    }

    public static subscribeNewPlayerJoinedEvent(socket: SocketIOClient.Emitter, callback: NewPlayerJoinedEventCallback): void {
        socket.on(NewPlayerJoinedEvent.key, callback)
    }

    public static onLogInClicked(socket: SocketIOClient.Emitter): void {
        socket.emit(PlayerSignedInEvent.key, PlayerSignedInEvent.createParams({name: "Hansol"}))
    }
}
