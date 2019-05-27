import {AsteroidDTO, GameDataDTO, PlayerDTO, PlayerInputDTO} from "../shared/DTOs"
import Utils from "../shared/Utils"
import Victor = require("victor")
import uuid = require("uuid")

const HALF_PI = Math.PI / 2

export class ServerGameData implements GameDataDTO {
    readonly players: ServerPlayer[] = []
    readonly asteroids: ServerAsteroid[] = []
    readonly canvasHeight: number = 2000
    readonly canvasWidth: number = 2000

    constructor() {
        const w = this.canvasWidth
        const h = this.canvasHeight
        this.asteroids.push(
            new ServerAsteroid(w, h),
            new ServerAsteroid(w, h),
            new ServerAsteroid(w, h)
        )
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
        this.players.forEach(player => player.update(width, height))
        this.asteroids.forEach(asteroid =>{
            asteroid.update(width, height)
            if (asteroid.needNewTarget) {
                const randPlayer = Utils.pickRandom(this.players)
                if (randPlayer) {
                    asteroid.setTarget(new Victor(randPlayer.x, randPlayer.y))
                } else {
                    asteroid.setTarget(new Victor(Utils.randInt(0, width), Utils.randInt(0, height)))
                }
            }
        })
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
        this.velocity.multiplyScalar(0.99)
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
    x!: number
    y!: number
    rotation: number = 0
    size: number
    needNewTarget = true

    private readonly rotationDelta: number
    private readonly outsideThreshold = 50
    private velocity = new Victor(0, 0)
    private readonly speed: number

    constructor(width: number, height: number) {
        this.id = uuid()
        this.setRandomSpawnPoint(width, height)
        this.size = Utils.randFloat(50, 100)
        this.rotationDelta = Utils.map(Math.random(), 0, 1, 0.01, 0.03)
        this.speed = Utils.map(Math.random(), 0, 1, 1, 2)
    }

    setTarget(pos: Victor): void {
        const v = pos.subtract(new Victor(this.x, this.y))
        this.velocity = v.norm().multiplyScalar(this.speed)
        this.needNewTarget = false
    }

    private setRandomSpawnPoint(width: number, height: number) {
        const rand = Math.random()
        if (rand < 0.25) {
            this.x = Utils.randFloat(-200, -100)
            this.y = Utils.randFloat(0, height)
        } else if (rand < 0.5) {
            this.x = Utils.randFloat(0, width)
            this.y = Utils.randFloat(-200, -100)
        } else if (rand < 0.75) {
            this.x = Utils.randFloat(width + 100, width + 200)
            this.y = Utils.randFloat(0, height)
        } else {
            this.x = Utils.randFloat(0, width)
            this.y = Utils.randFloat(height + 100, height + 200)
        }
    }

    update(width: number, height: number): void {
        this.rotation += this.rotationDelta
        this.x += this.velocity.x
        this.y += this.velocity.y

        const x = this.x
        const y = this.y
        const size = this.size
        const outsideThreshold = this.outsideThreshold

        if (!this.needNewTarget) {
            this.needNewTarget = x - size > width + outsideThreshold || x + size < -outsideThreshold
                || y - size > height + outsideThreshold || y + size < -outsideThreshold
        }
    }
}
