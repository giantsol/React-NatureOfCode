import {Utils} from "../shared/Utils"
import {GameDataDTO, PlayerDTO} from "../shared/DTOs"

export class ServerGameData implements GameDataDTO {
    readonly players: ServerPlayer[] = []
    readonly canvasHeight: number = 1000
    readonly canvasWidth: number = 1000

    addNewPlayer(newPlayer: ServerPlayer): void {
        newPlayer.x = Utils.randInt(0, this.canvasWidth)
        newPlayer.y = Utils.randInt(0, this.canvasHeight)
        newPlayer.size = Utils.randInt(5, 10)
        this.players.push(newPlayer)
    }
}

export class ServerPlayer implements PlayerDTO{
    readonly id: string
    readonly name: string
    x: number = 0
    y: number = 0
    size: number = 0

    constructor(id: string, name: string) {
        this.id = id
        this.name = name
    }
}

