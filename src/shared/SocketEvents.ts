import {ClientModels} from "../client/ClientModels"
import {ServerSocket} from "../server/ServerSocket"

export type ConnectedEventCallback = (socket: ServerSocket) => void
export class ConnectedEvent {
    static readonly key = "connection"
}

export type DisconnectedEventCallback = () => void
export class DisconnectedEvent {
    static readonly key = "disconnect"
}

export type NewPlayerJoinedEventCallback = (player: ClientModels.Player) => void
export class NewPlayerJoinedEvent {
    static readonly key = "new_player_joined"
    static createParams(player: ClientModels.Player): any[] {
        return [player]
    }
}

export type PlayerLeftEventCallback = (player: ClientModels.Player) => void
export class PlayerLeftEvent {
    static readonly key = "player_left"
    static createParams(player: ClientModels.Player): any[] {
        return [player]
    }
}

export type PlayerSignedInEventCallback = (player: ClientModels.Player) => void
export class PlayerSignedInEvent {
    static readonly key = "player_signed_in"
    static createParams(player: ClientModels.Player): any[] {
        return [player]
    }
}

export type PlayerSignedOutEventCallback = () => void
export class PlayerSignedOutEvent {
    static readonly key = "player_signed_out"
}

export type YouJoinedEventCallback = (player: ClientModels.Player) => void
export class YouJoinedEvent {
    static readonly key = "you_joined"
    static createParams(player: ClientModels.Player): any[] {
        return [player]
    }
}




