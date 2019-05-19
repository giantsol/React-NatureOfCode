import {GameDataDTO, PlayerDTO} from "./DTOs"
import {Socket} from "socket.io"

export type ConnectedEventCallback = (socket: Socket) => void
export class ConnectedEvent {
    static readonly key = "connection"
}

export type DisconnectedEventCallback = () => void
export class DisconnectedEvent {
    static readonly key = "disconnect"
}

export type NewPlayerJoinedEventCallback = (player: PlayerDTO) => void
export class NewPlayerJoinedEvent {
    static readonly key = "new_player_joined"
    static emitterParams(player: PlayerDTO): any[] {
        return [player]
    }
}

export type PlayerLoggingInEventCallback = (name: string) => void
export class PlayerLoggingInEvent {
    static readonly key = "player_logging_in"
    static emitterParams(name: string): any[] {
        return [name]
    }
}

export type PlayerSignedOutEventCallback = () => void
export class PlayerSignedOutEvent {
    static readonly key = "player_signed_out"
}

export type YouLoggedInEventCallback = (you: PlayerDTO) => void
export class YouLoggedInEvent {
    static readonly key = "you_logged_in"
    static emitterParams(you: PlayerDTO): any[] {
        return [you]
    }
}

export type StartReceivingGameDataEventCallback = () => void
export class StartReceivingGameDataEvent {
    static readonly key = "start_receiving_game_data"
}

export type StopReceivingGameDataEventCallback = () => void
export class StopReceivingGameDataEvent {
    static readonly key = "stop_receiving_game_data"
}

export type GameDataEventCallback = (gameData: GameDataDTO) => void
export class GameDataEvent {
    static readonly key = "game_data"
    static emitterParams(gameData: GameDataDTO): any[] {
        return [gameData]
    }
}
