import {GameDataDTO, PlaceDTO, PlaceTypeDTO, PlayerDTO} from "../shared/DTOs"

export class ClientPlayer implements PlayerDTO {
    static readonly meColor = `rgb(255, 0, 0)`
    static readonly othersColor = `rgb(0, 0, 0)`

    readonly id: string
    readonly name: string
    x: number
    y: number
    size: number

    constructor(data: PlayerDTO) {
        this.id = data.id
        this.name = data.name
        this.x = data.x
        this.y = data.y
        this.size = data.size
    }

    update(newData: PlayerDTO): void {
        this.x = newData.x
        this.y = newData.y
        this.size = newData.size
    }

    draw(ctx: CanvasRenderingContext2D, isMe: boolean): void {
        const x = this.x
        const y = this.y
        const size = this.size

        const prevFillStyle = ctx.fillStyle
        if (isMe) {
            ctx.fillStyle = ClientPlayer.meColor
        } else {
            ctx.fillStyle = ClientPlayer.othersColor
        }
        ctx.beginPath()
        ctx.ellipse(x, y, size, size, 0, 0, 360)
        ctx.stroke()
        ctx.fill()

        ctx.fillStyle = prevFillStyle
    }
}

export class ClientGameData implements GameDataDTO {
    readonly players: ClientPlayer[] = []
    places: ClientPlace[] = []
    canvasHeight: number = 0
    canvasWidth: number = 0

    update(newData: GameDataDTO): void {
        this.updatePlayers(newData.players)
        this.updatePlaces(newData.places)

        this.canvasWidth = newData.canvasWidth
        this.canvasHeight = newData.canvasHeight
    }

    private updatePlayers(newPlayersData: PlayerDTO[]) {
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
            players.push(new ClientPlayer(newPlayerData))
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

    draw(ctx: CanvasRenderingContext2D, myId: string): void {
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

        for (let place of this.places) {
            place.draw(ctx)
        }

        for (let player of this.players) {
            player.draw(ctx, myId == player.id)
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
