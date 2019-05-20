import {GameDataDTO, PlayerDTO} from "../shared/DTOs"

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
    canvasHeight: number = 0
    canvasWidth: number = 0

    update(newData: GameDataDTO): void {
        this.updatePlayers(newData.players)

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

    draw(ctx: CanvasRenderingContext2D, myId: string): void {
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        for (let player of this.players) {
            player.draw(ctx, myId == player.id)
        }
    }
}

