import React, {createRef} from 'react'
import {ClientSocketEventsHelper} from "../ClientSocketEventsHelper"
import {GameDataDTO, PlayerDTO, PlayerInputDTO} from "../../shared/DTOs"
import {ClientGameData} from "../ClientModels"
import {withSnackbar} from 'notistack'
import {WithSnackbarProps} from "notistack/build"
import LogInView from "./LogInView"

interface Props extends WithSnackbarProps {
    socket: SocketIOClient.Emitter
}

interface State {
    myId: string | null
}

class GameView extends React.Component<Props, State> {
    private static readonly inputProcessingInterval = 1000 / 60

    private readonly canvasRef = createRef<HTMLCanvasElement>()
    private canvasContext: CanvasRenderingContext2D | null = null
    private requestAnimationFrameHandler: number | null = null

    // for fast access
    private canvasWidth = 0
    private canvasHeight = 0

    private currentGameData: ClientGameData = new ClientGameData()

    private readonly playerInput: PlayerInputDTO = {
        left: false,
        right: false,
        up: false,
        down: false
    }
    private inputProcessingLoopHandler: NodeJS.Timeout | null = null

    constructor(props: Props) {
        super(props)
        this.state = { myId: null }
    }

    render() {
        return (
            <React.Fragment>
                <canvas ref={this.canvasRef} width={this.canvasWidth} height={this.canvasHeight}
                        style={{width: "auto", height: "100vh", display: "block", margin: "auto"}}>
                    Fallback text for old browsers.
                </canvas>
                { this.state.myId
                    ? null : <LogInView socket={this.props.socket} onLoggedIn={this.onLoggedIn} />
                }
            </React.Fragment>
        )
    }

    private onLoggedIn = (id: string) => {
        this.setState({myId: id})
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

            // listen for user inputs 60 frames per sec
            this.inputProcessingLoopHandler = setTimeout(this.processInputLoop, GameView.inputProcessingInterval)
            document.addEventListener('keydown', event => {
                switch (event.code) {
                    case "ArrowLeft":
                        this.playerInput.left = true
                        break
                    case "ArrowRight":
                        this.playerInput.right = true
                        break
                    case "ArrowUp":
                        this.playerInput.up = true
                        break
                    case "ArrowDown":
                        this.playerInput.down = true
                        break
                }
            })
            document.addEventListener('keyup', event => {
                switch (event.code) {
                    case "ArrowLeft":
                        this.playerInput.left = false
                        break
                    case "ArrowRight":
                        this.playerInput.right = false
                        break
                    case "ArrowUp":
                        this.playerInput.up = false
                        break
                    case "ArrowDown":
                        this.playerInput.down = false
                        break
                }
            })
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

    private processInputLoop = () => {
        // send user input to the server
        ClientSocketEventsHelper.sendPlayerInput(this.props.socket, this.playerInput)
        this.inputProcessingLoopHandler = setTimeout(this.processInputLoop, GameView.inputProcessingInterval)
    }

    componentWillUnmount(): void {
        this.canvasContext = null
        if (this.requestAnimationFrameHandler) {
            window.cancelAnimationFrame(this.requestAnimationFrameHandler)
        }

        const socket = this.props.socket
        ClientSocketEventsHelper.sendPlayerLeavingGameEvent(socket)
        ClientSocketEventsHelper.stopReceivingFrameData(socket)
        ClientSocketEventsHelper.unsubscribeNewPlayerJoinedEvent(socket, this.onNewPlayerJoinedEvent)
        ClientSocketEventsHelper.unsubscribeGameDataEvent(socket, this.onGameDataEvent)
        ClientSocketEventsHelper.unsubscribePlayerLeftEvent(socket, this.onPlayerLeftEvent)

        if (this.inputProcessingLoopHandler) {
            clearTimeout(this.inputProcessingLoopHandler)
        }
    }

    private onAnimationFrame = () => {
        const ctx = this.canvasContext
        const gameData = this.currentGameData
        if (ctx && gameData) {
            gameData.draw(ctx, this.state.myId)
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