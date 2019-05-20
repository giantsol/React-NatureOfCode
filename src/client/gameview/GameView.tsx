import React, {createRef} from 'react'
import {ClientSocketEventsHelper} from "../ClientSocketEventsHelper"
import {GameDataDTO, PlayerDTO} from "../../shared/DTOs"
import {ClientGameData} from "../ClientModels"
import {withSnackbar} from 'notistack'
import {WithSnackbarProps} from "notistack/build"

interface Props extends WithSnackbarProps {
    socket: SocketIOClient.Emitter
    myId: string
}

class GameView extends React.Component<Props, any> {
    private readonly canvasRef = createRef<HTMLCanvasElement>()
    private canvasContext: CanvasRenderingContext2D | null = null
    private requestAnimationFrameHandler: number | null = null

    // for fast access
    private canvasWidth = 0
    private canvasHeight = 0

    private currentGameData: ClientGameData = new ClientGameData()

    render() {
        return (
            <React.Fragment>
                <canvas ref={this.canvasRef} width={this.canvasWidth} height={this.canvasHeight}
                        style={{width: "auto", height: "100vh", display: "block", margin: "auto"}}>
                    Fallback text for old browsers.
                </canvas>
            </React.Fragment>
        )
    }

    componentDidMount(): void {
        const canvas = this.canvasRef.current
        this.canvasContext = canvas && canvas.getContext('2d')
        if (this.canvasContext) {
            this.requestAnimationFrameHandler = window.requestAnimationFrame(this.onAnimationFrame)

            const socket = this.props.socket
            ClientSocketEventsHelper.startReceivingGameData(socket)
            ClientSocketEventsHelper.subscribeNewPlayerJoinedEvent(socket, this.onNewPlayerJoinedEvent)
            ClientSocketEventsHelper.subscribeGameDataEvent(socket, this.onGameDataEvent)
            ClientSocketEventsHelper.subscribePlayerLeftEvent(socket, this.onPlayerLeftEvent)
        }
    }

    private onNewPlayerJoinedEvent = (player: PlayerDTO) => {
        this.props.enqueueSnackbar(`New Player ${player.name} joined!`, { variant: 'success' })
    }

    private onGameDataEvent = (gameData: GameDataDTO) => {
        this.currentGameData.update(gameData)
    }

    private onPlayerLeftEvent = (playerDTO: PlayerDTO) => {
        this.props.enqueueSnackbar(`Player Left ${playerDTO.name}`, { variant: 'error' })
    }

    componentWillUnmount(): void {
        this.canvasContext = null
        if (this.requestAnimationFrameHandler) {
            window.cancelAnimationFrame(this.requestAnimationFrameHandler)
        }

        const socket = this.props.socket
        ClientSocketEventsHelper.stopReceivingFrameData(socket)
        ClientSocketEventsHelper.unsubscribeNewPlayerJoinedEvent(socket, this.onNewPlayerJoinedEvent)
        ClientSocketEventsHelper.unsubscribeGameDataEvent(socket, this.onGameDataEvent)
        ClientSocketEventsHelper.unsubscribePlayerLeftEvent(socket, this.onPlayerLeftEvent)
    }

    private onAnimationFrame = () => {
        const ctx = this.canvasContext
        const gameData = this.currentGameData
        if (ctx && gameData) {
            gameData.draw(ctx, this.props.myId)
            this.updateCanvasSizeIfChanged(gameData)
        }

        this.requestAnimationFrameHandler = window.requestAnimationFrame(this.onAnimationFrame)
    }

    private updateCanvasSizeIfChanged(gameData: ClientGameData): void {
        if (this.canvasHeight != gameData.canvasHeight || this.canvasWidth != gameData.canvasWidth) {
            const canvas = this.canvasRef.current
            if (canvas) {
                canvas.width = gameData.canvasWidth
                canvas.height = gameData.canvasHeight
                this.canvasWidth = gameData.canvasWidth
                this.canvasHeight = gameData.canvasHeight
            }
        }
    }
}

export default withSnackbar(GameView)