import {AsteroidDTO, GameDataDTO, PlaceDTO, PlaceTypeDTO, PlayerDTO} from "../shared/DTOs"
import CustomP5Methods from "./CustomP5Methods"
import Utils from "../shared/Utils"
import * as p5 from "p5"

const HALF_PI = Math.PI / 2
const TWO_PI = Math.PI * 2
const p5p = p5.prototype

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

    draw(ctx: CanvasRenderingContext2D, isMe: boolean): void {
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
    places: ClientPlace[] = []
    canvasHeight: number = 0
    canvasWidth: number = 0

    update(newData: GameDataDTO, cp5: CustomP5Methods): void {
        this.updatePlayers(newData.players, cp5)
        this.updateAsteroids(newData.asteroids, cp5)
        // this.updatePlaces(newData.places)

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

    private updatePlaces(newPlacesData: PlaceDTO[]) {
        const newPlaces = newPlacesData.map(value => {
            switch (value.type) {
                case PlaceTypeDTO.LAKE:
                    return new ClientLake(value)
                case PlaceTypeDTO.SNOWLAND:
                    return new ClientSnowland(value)
                case PlaceTypeDTO.ICELAND:
                    return new ClientIceland(value)
                case PlaceTypeDTO.HIGHGRASSLAND:
                    return new ClientHighGrassland(value)
            }
        })
        this.places = newPlaces
    }

    draw(ctx: CanvasRenderingContext2D, myId: string | null): void {
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

        const prevFillStyle = ctx.fillStyle
        ctx.fillStyle = 'rgb(0,0,0)'
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
        ctx.fillStyle = prevFillStyle

        for (let place of this.places) {
            place.draw(ctx)
        }

        for (let asteroid of this.asteroids) {
            asteroid.draw()
        }

        for (let player of this.players) {
            player.draw(ctx, myId === player.id)
        }
    }
}

export class ClientAsteroid implements AsteroidDTO {
    id: string
    x: number
    y: number
    size: number
    rotation: number

    private readonly cp5: CustomP5Methods
    private readonly vertexCount = 15
    private readonly vertexInsets: number[] = []
    private readonly maxInset: number

    constructor(dto: AsteroidDTO, cp5: CustomP5Methods) {
        this.id = dto.id
        this.x = dto.x
        this.y = dto.y
        this.size = dto.size
        this.rotation = dto.rotation
        this.maxInset = this.size / 4

        this.cp5 = cp5

        const insets = this.vertexInsets
        const maxInset = this.maxInset
        for (let i = 0; i < this.vertexCount; i++) {
            insets.push(p5p.map(Math.random(), 0, 1, 0, maxInset))
        }
    }

    update(newData: AsteroidDTO): void {
        this.x = newData.x
        this.y = newData.y
        this.rotation = newData.rotation
    }

    draw(): void {
        const cp5 = this.cp5
        const size = this.size
        cp5.save()
        cp5.translate(this.x, this.y)
        cp5.rotate(this.rotation)
        cp5.fill(255)
        cp5.stroke(255)
        cp5.beginShape()
        const insets = this.vertexInsets
        const count = this.vertexCount
        for (let i = 0; i < count; i++) {
            const angle = p5p.map(i, 0, count, 0, TWO_PI)
            const r = size - insets[i]
            const x = r * Math.cos(angle)
            const y = r * Math.sin(angle)
            cp5.vertex(x, y)
        }
        cp5.endShape()
        cp5.restore()
    }
}

interface ClientPlace extends PlaceDTO {
    draw(ctx: CanvasRenderingContext2D): void
}

export class ClientLake implements ClientPlace {
    private static color = `rgba(0, 0, 255, 186)`

    readonly size: number
    readonly x: number
    readonly y: number
    readonly type: PlaceTypeDTO

    constructor(place: PlaceDTO) {
        this.size = place.size
        this.x = place.x
        this.y = place.y
        this.type = PlaceTypeDTO.LAKE
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const prevFillStyle = ctx.fillStyle
        ctx.fillStyle = ClientLake.color
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, this.size, this.size, 0, 0, 360)
        ctx.stroke()
        ctx.fill()

        ctx.fillStyle = prevFillStyle
    }
}

export class ClientSnowland implements ClientPlace {
    private static color = `rgba(200, 200, 200, 255)`

    readonly size: number
    readonly x: number
    readonly y: number
    readonly type: PlaceTypeDTO

    constructor(place: PlaceDTO) {
        this.size = place.size
        this.x = place.x
        this.y = place.y
        this.type = PlaceTypeDTO.SNOWLAND
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const prevFillStyle = ctx.fillStyle
        ctx.fillStyle = ClientSnowland.color
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, this.size, this.size, 0, 0, 360)
        ctx.stroke()
        ctx.fill()

        ctx.fillStyle = prevFillStyle
    }
}

export class ClientIceland implements ClientPlace {
    private static color = `rgba(0, 200, 200, 255)`
    readonly size: number
    readonly x: number
    readonly y: number
    readonly type: PlaceTypeDTO

    constructor(place: PlaceDTO) {
        this.size = place.size
        this.x = place.x
        this.y = place.y
        this.type = PlaceTypeDTO.ICELAND
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const prevFillStyle = ctx.fillStyle
        ctx.fillStyle = ClientIceland.color
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, this.size, this.size, 0, 0, 360)
        ctx.stroke()
        ctx.fill()

        ctx.fillStyle = prevFillStyle
    }
}

export class ClientHighGrassland implements ClientPlace {
    private static color = `rgba(0, 255, 0, 255)`
    readonly size: number
    readonly x: number
    readonly y: number
    readonly type: PlaceTypeDTO

    constructor(place: PlaceDTO) {
        this.size = place.size
        this.x = place.x
        this.y = place.y
        this.type = PlaceTypeDTO.HIGHGRASSLAND
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const prevFillStyle = ctx.fillStyle
        ctx.fillStyle = ClientHighGrassland.color
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, this.size, this.size, 0, 0, 360)
        ctx.stroke()
        ctx.fill()

        ctx.fillStyle = prevFillStyle
    }
}
