import {AsteroidDTO, BulletDTO, GameDataDTO, PlayerDTO, PlayerInputDTO} from "../shared/DTOs"
import Utils from "../shared/Utils"
import Victor = require("victor")
import uuid = require("uuid")

const HALF_PI = Math.PI / 2
const TWO_PI = Math.PI * 2

export class ServerGameData implements GameDataDTO {
    readonly players: ServerPlayer[] = []
    readonly asteroids: ServerAsteroid[] = []
    readonly canvasHeight: number = 2000
    readonly canvasWidth: number = 2000
    // unused. implement가 성사하도록 있는 더미
    bullets: BulletDTO[] = []

    readonly bulletHouse: BulletHouse = new BulletHouse()

    constructor() {
        const w = this.canvasWidth
        const h = this.canvasHeight
        this.asteroids.push(
            new ServerAsteroid(w, h),
            new ServerAsteroid(w, h),
            new ServerAsteroid(w, h)
        )
    }

    createDigestedData(): GameDataDTO {
        return {
            players: this.players.map(player => player.createDigestedData()),
            asteroids: this.asteroids.map(asteroid => asteroid.createDigestedData()),
            bullets: this.bulletHouse.usingBullets.map(bullet => bullet.createDigestedData()),
            canvasHeight: this.canvasHeight,
            canvasWidth: this.canvasWidth
        }
    }

    addNewPlayer(newPlayer: ServerPlayer): void {
        newPlayer.setPos(this.canvasWidth / 2, this.canvasHeight / 2)
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

        this.asteroids.forEach(asteroid => {
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

        this.bulletHouse.update(width, height)
    }
}

export class ServerPlayer implements PlayerDTO {
    readonly id: string
    readonly name: string
    readonly size: number = 15
    heading: number = HALF_PI
    x: number = 0
    y: number = 0
    readonly vertices: number[][] = []

    private rotation = 0
    private velocity = new Victor(0, 0)
    private acceleration = new Victor(0, 0)
    private boostingForce = new Victor(0, 0)
    private isBoosting = false

    private isFiring = false

    private fireInterval = 1000 / 4
    private now = 0
    private then = Date.now()
    private fireDelta = 0

    private bulletHouse: BulletHouse

    constructor(id: string, name: string, bulletHouse: BulletHouse) {
        this.id = id
        this.name = name
        this.bulletHouse = bulletHouse

        const size = this.size
        this.vertices.push([-size, size], [size, size], [0, -size])
    }

    createDigestedData(): PlayerDTO {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            size: this.size,
            heading: this.heading,
            vertices: this.vertices
        }
    }

    setPos(x: number, y: number): void {
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

        this.isFiring = playerInput.fire
    }

    update(width: number, height: number): void {
        this.heading += this.rotation

        this.updateBoostingForce(this.isBoosting)
        this.acceleration.add(this.boostingForce)
        this.velocity.add(this.acceleration)
        this.velocity.multiplyScalar(0.99)
        this.x += this.velocity.x
        this.y += this.velocity.y

        this.edges(width, height)

        this.acceleration.multiplyScalar(0)

        if (this.isFiring) {
            this.now = Date.now()
            this.fireDelta = this.now - this.then
            if (this.fireDelta > this.fireInterval) {
                this.then = this.now

                // fire bullet!
                this.bulletHouse.fireBullet(this.id, this.x, this.y, this.heading)
            }
        }
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
        const r = this.size

        if (this.x > width + r) {
            this.x = -r
        } else if (this.x < -r) {
            this.x = width + r
        }

        if (this.y > height + r) {
            this.y = -r
        } else if (this.y < -r) {
            this.y = height + r
        }
    }
}

export class ServerAsteroid implements AsteroidDTO {
    static readonly vertexSize = 10

    readonly id: string = uuid()
    x!: number
    y!: number
    rotation: number = 0
    readonly maxSize: number
    readonly minSize: number
    readonly vertices: number[][] = []

    needNewTarget = true

    private readonly rotationDelta: number
    private readonly outsideThreshold = 50
    private velocity = new Victor(0, 0)
    private readonly speed: number

    constructor(width: number, height: number) {
        this.setRandomSpawnPoint(width, height)
        this.rotationDelta = Utils.map(Math.random(), 0, 1, 0.01, 0.03)
        this.speed = Utils.map(Math.random(), 0, 1, 1, 2)
        this.maxSize = Utils.randInt(80, 100)
        this.minSize = Utils.randInt(40, 60)

        const vertexCount = ServerAsteroid.vertexSize
        for (let i = 0; i < vertexCount; i++) {
            const angle = Utils.map(i, 0, vertexCount, 0, TWO_PI)
            const r = Utils.randInt(this.minSize, this.maxSize)
            const x = r * Math.cos(angle)
            const y = r * Math.sin(angle)
            this.vertices.push([x, y])
        }
    }

    createDigestedData(): AsteroidDTO {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            minSize: this.minSize,
            maxSize: this.maxSize,
            vertices: this.vertices
        }
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
        const size = this.maxSize
        const outsideThreshold = this.outsideThreshold

        if (!this.needNewTarget) {
            this.needNewTarget = x - size > width + outsideThreshold || x + size < -outsideThreshold
                || y - size > height + outsideThreshold || y + size < -outsideThreshold
        }
    }
}

export class BulletHouse {
    private readonly recycledBullets: ServerBullet[] = []
    readonly usingBullets: ServerBullet[] = []

    fireBullet(firerId: string, x: number, y: number, heading: number): void {
        const bullet = this.createOrGetBullet()
        bullet.setInitValues(firerId, x, y, heading)
        this.usingBullets.push(bullet)
    }

    private createOrGetBullet(): ServerBullet {
        let bullet = this.recycledBullets.pop()
        if (!bullet) {
            bullet = new ServerBullet()
        }
        return bullet
    }

    update(width: number, height: number): void {
        const usingBullets = this.usingBullets
        const recycledBullets = this.recycledBullets
        let i = usingBullets.length
        while (i--) {
            const bullet = usingBullets[i]
            bullet.update(width, height)
            if (bullet.needsToBeRecycled) {
                bullet.prepareRecycle()
                recycledBullets.push(bullet)
                usingBullets.splice(i, 1)
            }
        }
    }
}

export class ServerBullet implements BulletDTO {
    static readonly speed = 10

    readonly id: string = uuid()
    x: number = 0
    y: number = 0
    heading: number = 0

    private firerId: string | null = null
    private velocity = new Victor(0, 0)

    needsToBeRecycled = false

    createDigestedData(): BulletDTO {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            heading: this.heading
        }
    }

    setInitValues(firerId: string, x: number, y: number, heading: number): void {
        this.firerId = firerId
        this.x = x
        this.y = y
        this.heading = heading
        this.velocity = new Victor(1, 1).rotateBy(heading + HALF_PI).norm().multiplyScalar(ServerBullet.speed)
    }

    update(width: number, height: number): void {
        this.x += this.velocity.x
        this.y += this.velocity.y

        const x = this.x
        const y = this.y
        if (!this.needsToBeRecycled) {
            this.needsToBeRecycled = x > width || x < 0 || y > height || y < 0
        }
    }

    prepareRecycle(): void {
        this.firerId = null
        this.needsToBeRecycled = false
    }
}