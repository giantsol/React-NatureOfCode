import {GameDataDTO, PlaceDTO, PlaceTypeDTO, PlayerDTO, PlayerInputDTO} from "../shared/DTOs"
import Utils from "../shared/Utils"

export class ServerGameData implements GameDataDTO {
    readonly players: ServerPlayer[] = []
    readonly places: ServerPlace[]
    readonly canvasHeight: number = 1000
    readonly canvasWidth: number = 1000

    constructor() {
        this.places = [
            new ServerLake(200, 200, 50),
            new ServerSnowland(400, 250, 50),
            new ServerIceland(800, 600, 100),
            new ServerHighGrassland(100, 900, 70)
        ]
    }

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

export class ServerPlayer implements PlayerDTO {
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

interface ServerPlace extends PlaceDTO {
    applyForce(player: ServerPlayer): void
}

export class ServerLake implements ServerPlace {
    readonly x: number
    readonly y: number
    readonly type: PlaceTypeDTO
    readonly size: number

    constructor(x: number, y: number, size: number) {
        this.x = x
        this.y = y
        this.size = size
        this.type = PlaceTypeDTO.LAKE
    }

    applyForce(player: ServerPlayer): void {

    }
}

export class ServerSnowland implements ServerPlace {
    readonly x: number
    readonly y: number
    readonly type: PlaceTypeDTO
    readonly size: number

    constructor(x: number, y: number, size: number) {
        this.x = x
        this.y = y
        this.size = size
        this.type = PlaceTypeDTO.SNOWLAND
    }

    applyForce(player: ServerPlayer): void {

    }
}

export class ServerIceland implements ServerPlace {
    readonly x: number
    readonly y: number
    readonly type: PlaceTypeDTO
    readonly size: number

    constructor(x: number, y: number, size: number) {
        this.x = x
        this.y = y
        this.size = size
        this.type = PlaceTypeDTO.ICELAND
    }

    applyForce(player: ServerPlayer): void {

    }
}

export class ServerHighGrassland implements ServerPlace {
    readonly x: number
    readonly y: number
    readonly type: PlaceTypeDTO
    readonly size: number

    constructor(x: number, y: number, size: number) {
        this.x = x
        this.y = y
        this.size = size
        this.type = PlaceTypeDTO.HIGHGRASSLAND
    }

    applyForce(player: ServerPlayer): void {

    }
}
