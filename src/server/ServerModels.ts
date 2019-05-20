import {Utils} from "../shared/Utils"
import {GameDataDTO, PlayerDTO, PlayerInputDTO} from "../shared/DTOs"

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

    removePlayerById(id: string): ServerPlayer | null {
        const players = this.players
        const index = players.findIndex(value => id == value.id)
        if (index >= 0) {
            const removingPlayer = players[index]
            players.splice(index, 1)
            return removingPlayer
        } else {
            return null
        }
    }

    applyPlayerInput(id: string, playerInput: PlayerInputDTO): void {
        const player = this.players.find(value => id == value.id)
        if (player) {
            player.applyInput(playerInput)
        }
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

    applyInput(playerInput: PlayerInputDTO): void {
        if (playerInput.up) {
            this.y -= 1
        }

        if (playerInput.down) {
            this.y += 1
        }

        if (playerInput.left) {
            this.x -= 1
        }

        if (playerInput.right) {
            this.x += 1
        }
    }
}

