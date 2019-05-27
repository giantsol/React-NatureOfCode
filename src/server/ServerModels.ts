import {
    AsteroidDTO,
    GameDataDTO,
    PlaceDTO,
    PlaceTypeDTO,
    PlayerDTO,
    PlayerInputDTO
} from "../shared/DTOs"
import Utils from "../shared/Utils"
import Victor = require("victor")
import uuid = require("uuid")

const HALF_PI = Math.PI / 2

export class ServerGameData implements GameDataDTO {
    readonly players: ServerPlayer[] = []
    readonly asteroids: ServerAsteroid[] = []
    readonly places: ServerPlace[]
    readonly canvasHeight: number = 2000
    readonly canvasWidth: number = 2000

    constructor() {
        this.asteroids.push(new ServerAsteroid(100, 100, 50, 0))
        this.places = [
            new ServerLake(200, 200, 50),
            new ServerSnowland(400, 250, 50),
            new ServerIceland(800, 600, 100),
            new ServerHighGrassland(100, 900, 70)
        ]
    }

    addNewPlayer(newPlayer: ServerPlayer): void {
        newPlayer.setPos(this.canvasWidth / 2, this.canvasHeight / 2)
        newPlayer.size = Utils.randInt(12, 15)
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

    update(): void {
        const width = this.canvasWidth
        const height = this.canvasHeight
        this.players.forEach(value => value.update(width, height))
        this.asteroids.forEach(value => value.update(width, height))
    }
}

export class ServerPlayer implements PlayerDTO {
    readonly id: string
    readonly name: string
    private pos: Victor = new Victor(0, 0)
    size: number = 0
    heading: number = HALF_PI
    x: number = this.pos.x
    y: number = this.pos.y

    private rotation = 0
    private velocity = new Victor(0, 0)
    private acceleration = new Victor(0, 0)
    private boostingForce = new Victor(0, 0)
    private isBoosting = false

    constructor(id: string, name: string) {
        this.id = id
        this.name = name
    }

    setPos(x: number, y: number): void {
        this.pos.x = x
        this.pos.y = y
        this.x = x
        this.y = y
    }

    applyInput(playerInput: PlayerInputDTO): void {
        this.isBoosting = playerInput.up

        if (playerInput.left) {
            this.rotation = -0.1
        } else if (playerInput.right) {
            this.rotation = 0.1
        } else if (!playerInput.left && !playerInput.right) {
            this.rotation = 0
        }
    }

    update(width: number, height: number): void {
        this.heading += this.rotation

        this.updateBoostingForce(this.isBoosting)
        this.acceleration.add(this.boostingForce)
        this.velocity.add(this.acceleration)
        this.velocity.multiplyScalar(0.98)
        this.pos.add(this.velocity)
        this.x = this.pos.x
        this.y = this.pos.y

        this.edges(width, height)

        this.acceleration.multiplyScalar(0)
    }

    private updateBoostingForce(isBoosting: boolean): void {
        if (isBoosting) {
            this.boostingForce.addScalar(5).rotateBy(this.heading + HALF_PI).normalize()
            this.boostingForce.multiplyScalar(0.1)
        } else {
            this.boostingForce.multiplyScalar(0)
        }
    }

    private edges(width: number, height: number): void {
        const pos = this.pos
        const r = this.size

        if (pos.x > width + r) {
            pos.x = -r
        } else if (pos.x < -r) {
            pos.x = width + r
        }

        if (pos.y > height + r) {
            pos.y = -r
        } else if (pos.y < -r) {
            pos.y = height + r
        }
    }
}

export class ServerAsteroid implements AsteroidDTO {
    id: string
    x: number
    y: number
    rotation: number
    size: number
    isOutsideScreen = true

    private rotationDelta = 0.1
    private outsideThreshold = 50

    constructor(x: number, y: number, size: number, rotation: number) {
        this.id = uuid()
        this.x = x
        this.y = y
        this.size = size
        this.rotation = rotation
    }

    update(width: number, height: number): void {
        this.rotation += this.rotationDelta

        const x = this.x
        const y = this.y
        const size = this.size
        const outsideThreshold = this.outsideThreshold
        this.isOutsideScreen = x + size > width + outsideThreshold || x - size < -outsideThreshold
            || y + size > height + outsideThreshold || y - size < -outsideThreshold
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
