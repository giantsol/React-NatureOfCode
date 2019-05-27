import {AsteroidDTO, BulletDTO, GameDataDTO, PlayerDTO} from "../shared/DTOs"
import CustomP5Methods from "./CustomP5Methods"
import Utils from "../shared/Utils"

const HALF_PI = Math.PI / 2
const TWO_PI = Math.PI * 2

export class ClientPlayer implements PlayerDTO {
    static readonly meColor = `rgb(255, 0, 0)`
    static readonly othersColor = `rgb(255, 255, 255)`

    readonly id: string
    readonly name: string
    size: number
    heading: number
    x: number
    y: number

    private readonly cp5: CustomP5Methods

    constructor(data: PlayerDTO, cp5: CustomP5Methods) {
        this.id = data.id
        this.name = data.name
        this.size = data.size
        this.heading = data.heading
        this.x = data.x
        this.y = data.y
        this.cp5 = cp5
    }

    update(newData: PlayerDTO): void {
        this.x = newData.x
        this.y = newData.y
        this.size = newData.size
        this.heading = newData.heading
    }

    draw(isMe: boolean): void {
        const p5 = this.cp5
        const r = this.size
        p5.save()
        p5.translate(this.x, this.y)
        p5.rotate(this.heading - HALF_PI)
        if (isMe) {
            p5.fill(255, 0, 0)
            p5.stroke(255, 0, 0)
        } else {
            p5.fill(255)
            p5.stroke(255)
        }
        p5.triangle(-r, r, r, r, 0, -r)
        p5.restore()
    }
}

export class ClientGameData implements GameDataDTO {
    readonly players: ClientPlayer[] = []
    readonly asteroids: ClientAsteroid[] = []
    readonly bullets: ClientBullet[] = []
    canvasHeight: number = 0
    canvasWidth: number = 0

    update(newData: GameDataDTO, cp5: CustomP5Methods): void {
        this.updatePlayers(newData.players, cp5)
        this.updateAsteroids(newData.asteroids, cp5)
        this.updateBullets(newData.bullets, cp5)

        this.canvasWidth = newData.canvasWidth
        this.canvasHeight = newData.canvasHeight
    }

    private updatePlayers(newPlayersData: PlayerDTO[], cp5: CustomP5Methods) {
        Utils.updateArrayData(this.players, newPlayersData,
            (e, n) => e.id === n.id,
            (e, n) => e.update(n),
            n => new ClientPlayer(n, cp5)
        )
    }

    private updateAsteroids(newAsteroidsData: AsteroidDTO[], cp5: CustomP5Methods) {
        Utils.updateArrayData(this.asteroids, newAsteroidsData,
            (a: ClientAsteroid, b: AsteroidDTO) => a.id === b.id,
            (prevData: ClientAsteroid, newData: AsteroidDTO) => prevData.update(newData),
            (newData: AsteroidDTO) => new ClientAsteroid(newData, cp5)
        )
    }

    private updateBullets(newData: BulletDTO[], cp5: CustomP5Methods) {
        Utils.updateArrayData(this.bullets, newData,
            (a, b) => a.id === b.id,
            (a, b) => a.update(b),
            (b) => new ClientBullet(b, cp5)
        )
    }

    draw(ctx: CanvasRenderingContext2D, myId: string | null): void {
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

        const prevFillStyle = ctx.fillStyle
        ctx.fillStyle = 'rgb(0,0,0)'
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
        ctx.fillStyle = prevFillStyle

        for (let asteroid of this.asteroids) {
            asteroid.draw()
        }

        for (let bullet of this.bullets) {
            bullet.draw()
        }

        for (let player of this.players) {
            player.draw(myId === player.id)
        }
    }
}

export class ClientAsteroid implements AsteroidDTO {
    readonly id: string
    x: number
    y: number
    readonly maxSize: number
    readonly minSize: number
    readonly vertices: number[][]
    rotation: number

    private readonly cp5: CustomP5Methods

    constructor(dto: AsteroidDTO, cp5: CustomP5Methods) {
        this.id = dto.id
        this.x = dto.x
        this.y = dto.y
        this.maxSize = dto.maxSize
        this.minSize = dto.minSize
        this.vertices = dto.vertices
        this.rotation = dto.rotation

        this.cp5 = cp5
    }

    update(newData: AsteroidDTO): void {
        this.x = newData.x
        this.y = newData.y
        this.rotation = newData.rotation
    }

    draw(): void {
        const cp5 = this.cp5
        cp5.save()
        cp5.translate(this.x, this.y)
        cp5.rotate(this.rotation)
        cp5.fill(255)
        cp5.stroke(255)
        cp5.beginShape()
        for (let vertex of this.vertices) {
            cp5.vertex(vertex[0], vertex[1])
        }
        cp5.endShape()
        cp5.restore()
    }
}

export class ClientBullet implements BulletDTO {
    static readonly size = 10

    id: string
    x: number
    y: number
    heading: number

    private readonly cp5: CustomP5Methods

    constructor(data: BulletDTO, cp5: CustomP5Methods) {
        this.id = data.id
        this.x = data.x
        this.y = data.y
        this.heading = data.heading
        this.cp5 = cp5
    }

    update(data: BulletDTO) {
        this.x = data.x
        this.y = data.y
        this.heading = data.heading
    }

    draw() {
        const cp5 = this.cp5
        cp5.save()
        cp5.translate(this.x, this.y)
        cp5.rotate(this.heading - HALF_PI)
        cp5.noFill()
        cp5.stroke(255)
        cp5.strokeWeight(5)
        cp5.beginShape()
        const halfSize = ClientBullet.size
        cp5.vertex(0, -halfSize)
        cp5.vertex(0, halfSize)
        cp5.endShape()
        cp5.restore()
    }
}