import {
    AsteroidDTO,
    BulletDTO,
    GameDataDTO,
    PlayerDTO,
    PlayerInputDTO,
    PlayerPointsDTO
} from "../shared/DTOs"
import Utils from "../shared/Utils"
import CollisionHelper from "../client/CollisionHelper"
import {RGBColor} from "react-color"
import {Constants} from "../shared/Constants"
import Victor = require("victor")
import uuid = require("uuid")

export class ServerGameData implements GameDataDTO {
    readonly players: ServerPlayer[] = []
    readonly asteroids: ServerAsteroid[] = []
    readonly canvasHeight: number = 4800
    readonly canvasWidth: number = 4800
    // unused. implement가 성사하도록 있는 더미
    bullets: BulletDTO[] = []

    readonly bulletHouse: BulletHouse = new BulletHouse()

    private readonly arena: Arena

    private readonly minBigAsteroidCount = 7
    private readonly bigAsteroidCountMultiplesOfPlayer = 3
    private curBigAsteroidsCount = 0

    constructor(arena: Arena) {
        const w = this.canvasWidth
        const h = this.canvasHeight
        for (let i = 0; i < this.minBigAsteroidCount; i++) {
            this.asteroids.push(new ServerAsteroid(w, h, true, arena))
            this.curBigAsteroidsCount++
        }
        this.arena = arena
    }

    toDTO(): GameDataDTO {
        return {
            players: this.players.map(player => player.toDTO()),
            asteroids: this.asteroids.map(asteroid => asteroid.toDTO()),
            bullets: this.bulletHouse.bullets.map(bullet => bullet.toDTO()),
            canvasHeight: this.canvasHeight,
            canvasWidth: this.canvasWidth
        }
    }

    hasPlayerWithId(id: string): boolean {
        return this.players.findIndex(player => player.id === id) >= 0
    }

    getPlayerWithId(id: string): ServerPlayer | null {
        return this.players.find(player => player.id === id) || null
    }

    addNewPlayer(newPlayer: ServerPlayer): void {
        newPlayer.setPos(this.canvasWidth / 2, this.canvasHeight / 2)
        this.players.push(newPlayer)
    }

    removePlayerById(id: string): ServerPlayer | null {
        const players = this.players
        const index = players.findIndex(value => id === value.id)
        if (index >= 0) {
            const removingPlayer = players[index]
            players.splice(index, 1)
            return removingPlayer
        } else {
            return null
        }
    }

    applyPlayerInput(id: string, playerInput: PlayerInputDTO): void {
        const player = this.players.find(value => id === value.id)
        if (player) {
            player.applyInput(playerInput)
        }
    }

    update(): void {
        const width = this.canvasWidth
        const height = this.canvasHeight
        const players = this.players
        const asteroids = this.asteroids
        const bulletHouse = this.bulletHouse

        players.forEach(player => player.update(width, height))

        for (let i = 0; i < asteroids.length; i++) {
            const asteroid = asteroids[i]
            asteroid.update(width, height)
            if (asteroid.needNewTarget) {
                if (asteroid.isBig) {
                    const randPlayer = Utils.pickRandom(this.players)
                    if (randPlayer) {
                        asteroid.setTarget(randPlayer.x, randPlayer.y)
                    } else {
                        asteroid.setTarget(Utils.randInt(0, width), Utils.randInt(0, height))
                    }
                } else {
                    asteroids.splice(i--, 1)
                }
            }
        }

        bulletHouse.update(width, height)

        // 위치 업뎃 한번씩 다 거친 후 collision detection 진행
        const bullets = bulletHouse.bullets

        // 운석 먼저. 부딪히기 직전에 총알을 쐈으면 운석이 먼저 죽도록
        let i = asteroids.length
        while (i--) {
            asteroids[i].checkCollision(bullets)
        }

        i = players.length
        while (i--) {
            players[i].checkCollision(asteroids, bullets)
        }

        // 부족한 운석 수 보충
        const neededBigAsteroidCount = Math.max(this.minBigAsteroidCount, players.length * this.bigAsteroidCountMultiplesOfPlayer)
        if (this.curBigAsteroidsCount < neededBigAsteroidCount) {
            const count = neededBigAsteroidCount - this.curBigAsteroidsCount
            const w = this.canvasWidth
            const h = this.canvasHeight
            const arena = this.arena
            for (let i = 0; i < count; i++) {
                asteroids.push(new ServerAsteroid(w, h, true, arena))
                this.curBigAsteroidsCount++
            }
        }
    }

    breakAsteroid(asteroid: ServerAsteroid): void {
        const removed = this.removeAsteroidById(asteroid.id)
        if (removed && removed.isBig) {
            const width = this.canvasWidth
            const height = this.canvasHeight
            this.asteroids.push(
                ServerAsteroid.createPieceOf(width, height, removed),
                ServerAsteroid.createPieceOf(width, height, removed),
                ServerAsteroid.createPieceOf(width, height, removed),
            )
            this.curBigAsteroidsCount--
        }
    }

    private removeAsteroidById(id: string): ServerAsteroid | null {
        const asteroids = this.asteroids
        const index = asteroids.findIndex(value => id == value.id)
        if (index >= 0) {
            const removing = asteroids[index]
            asteroids.splice(index, 1)
            return removing
        } else {
            return null
        }
    }

    recycleBulletById(id: string): void {
        this.bulletHouse.recycleBulletById(id)
    }
}

export interface CollidingObject {
    x: number
    y: number
    vertices: number[][]
    maxSize: number
    checkCollision(...othersArray: CollidingObject[][]): void
    isCollisionTarget(other: CollidingObject): boolean
    processCollision(other: CollidingObject): void
}

export class ServerPlayer implements PlayerDTO, CollidingObject {
    static readonly maxSpeed = 8

    readonly id: string
    readonly name: string
    readonly originalColor: RGBColor
    readonly size: number = 15
    readonly maxSize = this.size
    readonly vertices: number[][] = []
    x: number = 0
    y: number = 0
    color: RGBColor
    heading: number = Constants.HALF_PI
    showTail = false
    readonly points: PlayerPointsDTO = { asteroidPoint: 0, killingPoint: 0 }

    private rotation = 0
    private readonly velocity = new Victor(0, 0)
    private readonly acceleration = new Victor(0, 0)
    private readonly boostingForce = new Victor(0, 0)
    private isBoosting = false
    private isFiring = false

    private fireInterval = 1000 / 4
    private now = 0
    private then = Date.now()
    private fireDelta = 0

    private readonly bulletHouse: BulletHouse
    private readonly collisionHelper = new CollisionHelper()
    private readonly arena: Arena

    private invincibleCountdown = 255

    get isInvincible(): boolean {
        return this.invincibleCountdown > 0
    }

    constructor(id: string, name: string, color: RGBColor, bulletHouse: BulletHouse, arena: Arena) {
        this.id = id
        this.name = name
        this.originalColor = { r: color.r, g: color.g, b: color.b }
        this.color = color
        this.bulletHouse = bulletHouse

        const size = this.size
        this.vertices.push([-size, size], [size, size], [0, -size])
        this.arena = arena
    }

    toDTO(): PlayerDTO {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            x: this.x,
            y: this.y,
            size: this.size,
            heading: this.heading,
            vertices: this.vertices,
            showTail: this.showTail,
            points: this.points
        }
    }

    setPos(x: number, y: number): void {
        this.x = x
        this.y = y
    }

    applyInput(playerInput: PlayerInputDTO): void {
        this.isBoosting = playerInput.up

        if (playerInput.left) {
            this.rotation = -0.08
        } else if (playerInput.right) {
            this.rotation = 0.08
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
        if (this.velocity.magnitude() > ServerPlayer.maxSpeed) {
            this.velocity.norm().multiplyScalar(ServerPlayer.maxSpeed)
        }
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
                this.bulletHouse.fireBullet(this.id, this.x, this.y, this.heading, this.color)
            }
        }

        this.showTail = this.velocity.magnitude() > 1

        if (this.invincibleCountdown > 0) {
            this.invincibleCountdown -= 1
        }

        if (this.invincibleCountdown > 0) {
            const countdown = this.invincibleCountdown
            const origColor = this.originalColor
            this.color.r = Utils.randInt(Utils.map(countdown, 0, 255, origColor.r, 0), origColor.r)
            this.color.g = Utils.randInt(Utils.map(countdown, 0, 255, origColor.g, 0), origColor.g)
            this.color.b = Utils.randInt(Utils.map(countdown, 0, 255, origColor.b, 0), origColor.b)
        } else {
            this.color = this.originalColor
        }
    }

    private updateBoostingForce(isBoosting: boolean): void {
        if (isBoosting) {
            this.boostingForce.addScalar(1).rotateBy(this.heading + Constants.HALF_PI).normalize().multiplyScalar(0.1)
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

    checkCollision(...othersArray: CollidingObject[][]): void {
        if (!this.isInvincible) {
            this.collisionHelper.checkCollision(this, othersArray, this.isCollisionTarget.bind(this), this.processCollision.bind(this))
        }
    }

    isCollisionTarget(other: CollidingObject): boolean {
        if (other instanceof ServerBullet && other.firerId !== this.id && !other.needsToBeRecycled) {
            return true
        } else if (other instanceof ServerAsteroid) {
            return true
        }
        return false
    }

    processCollision(other: CollidingObject): void {
        if (other instanceof ServerBullet) {
            this.arena.bulletKilledPlayer(<ServerBullet>other, this)
        } else if (other instanceof ServerAsteroid) {
            this.arena.asteroidKilledPlayer(<ServerAsteroid>other, this)
        } else {
            console.log(`Collided with unknown: ${other}`)
        }
    }

    increaseAsteroidPoint(): void {
        this.points.asteroidPoint++
    }

    increaseKillingPoint(): void {
        this.points.killingPoint++
    }

}

export class ServerAsteroid implements AsteroidDTO, CollidingObject {
    static readonly vertexSize_big = 10
    static readonly vertexSize_small = 5

    readonly id: string = uuid()
    readonly maxSize: number
    readonly minSize: number
    readonly vertices: number[][] = []
    x!: number
    y!: number
    rotation: number = 0

    needNewTarget = true

    private readonly rotationSpeed: number
    private readonly outsideThreshold = 50
    private readonly velocity = new Victor(0, 0)
    private speed: number

    private readonly collisionHelper = new CollisionHelper()

    readonly isBig: boolean
    private readonly arena: Arena

    static createPieceOf(width: number, height: number, bigAsteroid: ServerAsteroid): ServerAsteroid {
        const asteroid = new ServerAsteroid(width, height, false, bigAsteroid.arena)
        asteroid.x = bigAsteroid.x + Utils.map(Math.random(), 0, 1, -10, 10)
        asteroid.y = bigAsteroid.y + Utils.map(Math.random(), 0, 1, -10, 10)
        asteroid.needNewTarget = false
        asteroid.velocity.x = Utils.map(Math.random(), 0, 1, -1, 1)
        asteroid.velocity.y = Utils.map(Math.random(), 0, 1, -1, 1)
        asteroid.velocity.norm().multiplyScalar(asteroid.speed)
        return asteroid
    }

    constructor(width: number, height: number, isBig: boolean, arena: Arena) {
        this.setRandomSpawnPoint(width, height)
        this.isBig = isBig

        if (isBig) {
            this.rotationSpeed = Utils.map(Math.random(), 0, 1, 0.01, 0.03)
            this.speed = Utils.map(Math.random(), 0, 1, 1, 2)
            this.maxSize = Utils.randInt(80, 100)
            this.minSize = Utils.randInt(40, 60)

            const vertexCount = ServerAsteroid.vertexSize_big
            for (let i = 0; i < vertexCount; i++) {
                const angle = Utils.map(i, 0, vertexCount, 0, Constants.TWO_PI)
                const r = Utils.randInt(this.minSize, this.maxSize)
                const x = r * Math.cos(angle)
                const y = r * Math.sin(angle)
                this.vertices.push([x, y])
            }
        } else {
            this.rotationSpeed = Utils.map(Math.random(), 0, 1, 0.05, 0.07)
            this.speed = Utils.map(Math.random(), 0, 1, 1.5, 2.5)
            this.maxSize = Utils.randInt(40, 60)
            this.minSize = Utils.randInt(10, 30)

            const vertexCount = ServerAsteroid.vertexSize_small
            for (let i = 0; i < vertexCount; i++) {
                const angle = Utils.map(i, 0, vertexCount, 0, Constants.TWO_PI)
                const r = Utils.randInt(this.minSize, this.maxSize)
                const x = r * Math.cos(angle)
                const y = r * Math.sin(angle)
                this.vertices.push([x, y])
            }
        }

        this.arena = arena
    }

    toDTO(): AsteroidDTO {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            vertices: this.vertices
        }
    }

    setTarget(x: number, y: number): void {
        if (this.isBig) {
            this.speed = Utils.map(Math.random(), 0, 1, 1, 2)
        } else {
            this.speed = Utils.map(Math.random(), 0, 1, 1.5, 2.5)
        }
        const v = new Victor(x, y).subtractScalarX(this.x).subtractScalarY(this.y).norm().multiplyScalar(this.speed)
        this.velocity.x = v.x
        this.velocity.y = v.y
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
        this.rotation += this.rotationSpeed
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

    checkCollision(...othersArray: CollidingObject[][]): void {
        this.collisionHelper.checkCollision(this, othersArray, this.isCollisionTarget.bind(this), this.processCollision.bind(this))
    }

    isCollisionTarget(other: CollidingObject): boolean {
        if (other instanceof ServerBullet && !other.needsToBeRecycled) {
            return true
        }
        return false
    }

    processCollision(other: CollidingObject): void {
        if (other instanceof ServerBullet) {
            this.arena.bulletKilledAsteroid(<ServerBullet>other, this)
        }
    }

}

export class BulletHouse {
    private readonly recycledBullets: ServerBullet[] = []
    readonly bullets: ServerBullet[] = []

    fireBullet(firerId: string, x: number, y: number, heading: number, color: RGBColor): void {
        const bullet = this.createOrGetBullet()
        bullet.setInitValues(firerId, x, y, heading, color)
        this.bullets.push(bullet)
    }

    private createOrGetBullet(): ServerBullet {
        let bullet = this.recycledBullets.pop()
        if (!bullet) {
            bullet = new ServerBullet()
        }
        return bullet
    }

    update(width: number, height: number): void {
        const bullets = this.bullets
        const recycledBullets = this.recycledBullets
        let i = bullets.length
        while (i--) {
            const bullet = bullets[i]
            bullet.update(width, height)
            if (bullet.needsToBeRecycled) {
                bullet.prepareRecycle()
                recycledBullets.push(bullet)
                bullets.splice(i, 1)
            }
        }
    }

    recycleBulletById(id: string): void {
        const index = this.bullets.findIndex(bullet => bullet.id === id)
        if (index >= 0) {
            const b = this.bullets[index]
            b.prepareRecycle()
            this.recycledBullets.push(b)
            this.bullets.splice(index, 1)
        }
    }
}

export class ServerBullet implements BulletDTO, CollidingObject {
    static readonly speed = 10

    readonly id: string = uuid()
    readonly maxSize: number = 5
    readonly vertices: number[][] = [[0, -this.maxSize], [0, this.maxSize]]
    x: number = 0
    y: number = 0
    heading: number = 0

    firerId: string | null = null
    private readonly velocity = new Victor(0, 0)
    color = { r: 255, g: 255, b: 255 }

    needsToBeRecycled = false

    toDTO(): BulletDTO {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            heading: this.heading,
            vertices: this.vertices,
            color: this.color
        }
    }

    setInitValues(firerId: string, x: number, y: number, heading: number, color: RGBColor): void {
        this.firerId = firerId
        this.x = x
        this.y = y
        this.heading = heading
        this.velocity.addScalar(1).rotateBy(heading + Constants.HALF_PI).norm().multiplyScalar(ServerBullet.speed)
        this.color = color
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
        this.x = -1000
        this.y = -1000
        this.heading = 0
        this.velocity.multiplyScalar(0)
        this.firerId = null
        this.needsToBeRecycled = false
    }

    checkCollision(...othersArray: CollidingObject[][]): void {
        // dummy
    }

    isCollisionTarget(other: CollidingObject): boolean {
        // dummy
        return false
    }

    processCollision(other: CollidingObject): void {
        // dummy
    }

}

export interface Arena {
    bulletKilledPlayer(bullet: ServerBullet, player: ServerPlayer): void
    bulletKilledAsteroid(bullet: ServerBullet, asteroid: ServerAsteroid): void
    asteroidKilledPlayer(asteroid: ServerAsteroid, player: ServerPlayer): void
}

