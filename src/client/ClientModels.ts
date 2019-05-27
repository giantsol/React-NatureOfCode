import {GameDataDTO, PlaceDTO, PlaceTypeDTO, PlayerDTO} from "../shared/DTOs"
import CustomP5Methods from "./CustomP5Methods"

const HALF_PI = Math.PI / 2

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
    places: ClientPlace[] = []
    canvasHeight: number = 0
    canvasWidth: number = 0

    update(newData: GameDataDTO, cp5: CustomP5Methods): void {
        this.updatePlayers(newData.players, cp5)
        this.updatePlaces(newData.places)

        this.canvasWidth = newData.canvasWidth
        this.canvasHeight = newData.canvasHeight
    }

    private updatePlayers(newPlayersData: PlayerDTO[], cp5: CustomP5Methods) {
        const players = this.players
        let i = players.length

        while (i--) {
            const player = players[i]
            const newPlayerDataIndex = newPlayersData.findIndex(value => value.id == player.id)
            if (newPlayerDataIndex == -1) {
                players.splice(i, 1)
            } else {
                // found
                const newPlayerData = newPlayersData[newPlayerDataIndex]
                player.update(newPlayerData)
                newPlayersData.splice(newPlayerDataIndex, 1)
            }
        }

        for (let newPlayerData of newPlayersData) {
            players.push(new ClientPlayer(newPlayerData, cp5))
        }
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

        for (let player of this.players) {
            player.draw(ctx, myId === player.id)
        }
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
