import {AsteroidDTO, BulletDTO, GameDataDTO, PlayerDTO} from "../shared/DTOs"
import CustomP5Methods from "./CustomP5Methods"
import Utils from "../shared/Utils"
import {RGBColor} from "react-color"
import {Constants} from "../shared/Constants"

export class ClientPlayer implements PlayerDTO {
    readonly id: string
    readonly name: string
    readonly size: number
    readonly vertices: number[][]
    private readonly nameOffset: number
    private readonly tailSize: number
    private readonly cp5: CustomP5Methods
    private readonly tailMinRotation = Constants.QUARTER_PI
    private readonly tailMaxRotation = 3 * Constants.QUARTER_PI
    color: RGBColor
    heading: number
    x: number
    y: number
    showTail: boolean

    constructor(data: PlayerDTO, cp5: CustomP5Methods) {
        this.id = data.id
        this.name = data.name
        this.size = data.size
        this.vertices = data.vertices
        this.nameOffset = -this.size * 2
        this.tailSize = this.size * 1.3
        this.cp5 = cp5
        this.color = data.color
        this.heading = data.heading
        this.x = data.x
        this.y = data.y
        this.showTail = data.showTail
    }

    update(newData: PlayerDTO): void {
        this.x = newData.x
        this.y = newData.y
        this.heading = newData.heading
        this.showTail = newData.showTail
        this.color = newData.color
    }

    draw(isMe: boolean): void {
        const p5 = this.cp5
        p5.save()
        p5.translate(this.x, this.y)

        // 이름 위에 적고
        p5.save()
        p5.translate(0, this.nameOffset)
        p5.fill(255)
        p5.text(this.name, 0, 0, 24)
        p5.restore()

        const color = this.color
        p5.fill(color.r, color.g, color.b)
        p5.stroke(255)

        p5.rotate(this.heading - Constants.HALF_PI)
        const vertices = this.vertices
        p5.triangle(vertices[0][0], vertices[0][1],
            vertices[1][0], vertices[1][1],
            vertices[2][0], vertices[2][1])

        if (this.showTail) {
            p5.save()
            p5.stroke(color.r, color.g, color.b)
            p5.strokeWeight(3)
            p5.translate(0, this.size)
            p5.rotate(Utils.map(Math.random(), 0, 1, this.tailMinRotation, this.tailMaxRotation))
            p5.line(0, 0, this.tailSize, 0)
            p5.restore()
        }

        p5.restore()
    }
}

export class ClientGameData implements GameDataDTO {
    readonly players: ClientPlayer[] = []
    readonly asteroids: ClientAsteroid[] = []
    readonly bullets: ClientBullet[] = []
    canvasHeight: number = 0
    canvasWidth: number = 0

    private readonly cp5: CustomP5Methods

    private readonly playerViewScaleRatio = 3.6
    private playerViewMinX: number = 0
    private playerViewMaxX: number = 0
    private playerViewMinY: number = 0
    private playerViewMaxY: number = 0

    constructor(cp5: CustomP5Methods) {
        this.cp5 = cp5
    }

    update(newData: GameDataDTO, cp5: CustomP5Methods): void {
        this.updatePlayers(newData.players, cp5)
        this.updateAsteroids(newData.asteroids, cp5)
        this.updateBullets(newData.bullets, cp5)

        if (this.canvasWidth !== newData.canvasWidth || this.canvasHeight !== newData.canvasHeight) {
            this.canvasWidth = newData.canvasWidth
            this.canvasHeight = newData.canvasHeight
            this.playerViewMinX = this.canvasWidth / 2 / this.playerViewScaleRatio
            this.playerViewMaxX = this.canvasWidth - this.playerViewMinX
            this.playerViewMinY = this.canvasHeight / 2 / this.playerViewScaleRatio
            this.playerViewMaxY = this.canvasHeight - this.playerViewMinY
        }
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

    draw(myId: string | null): void {
        const cp5 = this.cp5

        cp5.background(0)

        cp5.save()
        const me = this.players.find(player => myId === player.id)
        if (me) {
            cp5.translate(this.canvasWidth / 2, this.canvasHeight / 2)
            cp5.scale(this.playerViewScaleRatio)
            const viewX = Math.min(Math.max(me.x, this.playerViewMinX), this.playerViewMaxX)
            const viewY = Math.min(Math.max(me.y, this.playerViewMinY), this.playerViewMaxY)
            cp5.translate(-viewX, -viewY)
        }

        for (let asteroid of this.asteroids) {
            asteroid.draw()
        }

        for (let bullet of this.bullets) {
            bullet.draw()
        }

        for (let player of this.players) {
            player.draw(myId === player.id)
        }
        cp5.restore()

        // minimap
        cp5.save()
        cp5.translate(this.canvasWidth, this.canvasHeight)
        cp5.translate(-this.canvasWidth / 5, -this.canvasHeight / 5)
        cp5.fill(0)
        cp5.stroke(255)
        cp5.strokeWeight(4)
        cp5.rect(0, 0, this.canvasWidth / 5, this.canvasHeight / 5)
        cp5.scale(0.2)
        if (this.players.length > 0) {
            this.players[0].draw(true)
        }
        cp5.restore()
    }
}

export class ClientAsteroid implements AsteroidDTO {
    readonly id: string
    readonly vertices: number[][]
    x: number
    y: number
    rotation: number

    private readonly cp5: CustomP5Methods

    constructor(dto: AsteroidDTO, cp5: CustomP5Methods) {
        this.id = dto.id
        this.vertices = dto.vertices
        this.x = dto.x
        this.y = dto.y
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
    readonly id: string
    readonly vertices: number[][]
    x: number
    y: number
    heading: number
    color: RGBColor

    private readonly cp5: CustomP5Methods

    constructor(data: BulletDTO, cp5: CustomP5Methods) {
        this.id = data.id
        this.heading = data.heading
        this.x = data.x
        this.y = data.y
        this.vertices = data.vertices
        this.cp5 = cp5
        this.color = data.color
    }

    update(data: BulletDTO) {
        this.x = data.x
        this.y = data.y
        this.heading = data.heading
        this.color = data.color
    }

    draw() {
        const cp5 = this.cp5
        cp5.save()
        cp5.translate(this.x, this.y)
        cp5.rotate(this.heading - Constants.HALF_PI)
        cp5.noFill()
        cp5.stroke(this.color.r, this.color.g, this.color.b)
        cp5.strokeWeight(5)
        cp5.beginShape()
        const vertices = this.vertices
        cp5.vertex(vertices[0][0], vertices[0][1])
        cp5.vertex(vertices[1][0], vertices[1][1])
        cp5.endShape()
        cp5.restore()
    }
}