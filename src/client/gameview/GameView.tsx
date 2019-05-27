import React, {createRef} from 'react'
import {ClientSocketEventsHelper} from "../ClientSocketEventsHelper"
import {GameDataDTO, PlayerDTO, PlayerInputDTO} from "../../shared/DTOs"
import {ClientGameData} from "../ClientModels"
import {withSnackbar} from 'notistack'
import {WithSnackbarProps} from "notistack/build"
import LogInView from "./LogInView"
import CustomP5Methods from "../CustomP5Methods"

interface Props extends WithSnackbarProps {
    socket: SocketIOClient.Emitter
}

interface State {
    myId: string | null
}

class GameView extends React.Component<Props, State> implements CustomP5Methods {
    private static readonly inputProcessingInterval = 1000 / 60

    private readonly canvasRef = createRef<HTMLCanvasElement>()
    private canvasContext: CanvasRenderingContext2D | null = null
    private requestAnimationFrameHandler: number | null = null

    // for fast access
    width = 0
    height = 0

    private currentGameData: ClientGameData = new ClientGameData()

    private readonly playerInput: PlayerInputDTO = {
        left: false,
        right: false,
        up: false,
        fire: false
    }
    private inputProcessingLoopHandler: NodeJS.Timeout | null = null

    // framerate 관련 변수들
    private fps = 60
    private now = 0
    private then = Date.now()
    private interval = 1000 / this.fps
    private delta: number = 0

    constructor(props: Props) {
        super(props)
        this.state = { myId: null }
    }

    render() {
        return (
            <div style={{width: "100vw", height: "100vh", backgroundColor: "black"}}>
                <div style={{width: "100vh", height: "100vh", margin: "auto", position: "relative"}}>
                    <canvas ref={this.canvasRef} width={this.width} height={this.height}
                            style={{width: "100%", height: "100%", display: "block", border: '2px solid white'}}>
                        Fallback text for old browsers.
                    </canvas>
                    { this.state.myId
                        ? null : <LogInView socket={this.props.socket} onLoggedIn={this.onLoggedIn} />
                    }
                </div>
            </div>
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

            // send user inputs to server 60 frames per sec
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
                    case 'Space':
                        this.playerInput.fire = true
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
                    case 'Space':
                        this.playerInput.fire = false
                        break
                }
            })
        }
    }

    private onNewPlayerJoinedEvent = (player: PlayerDTO) => {
        this.props.enqueueSnackbar(`New Player ${player.name} joined!`,
            { variant: 'success', autoHideDuration: 2000 })
    }

    private onGameDataEvent = (gameData: GameDataDTO) => {
        this.currentGameData.update(gameData, this)
    }

    private onPlayerLeftEvent = (playerDTO: PlayerDTO) => {
        this.props.enqueueSnackbar(`Player Left ${playerDTO.name}`,
            { variant: 'error', autoHideDuration: 2000 })
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
        ClientSocketEventsHelper.stopReceivingGameData(socket)
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
            // framerate 관련 로직
            this.now = Date.now()
            this.delta = this.now - this.then

            if (this.delta > this.interval) {
                this.then = this.now - (this.delta % this.interval)

                ctx.save()
                gameData.draw(ctx, this.state.myId)
                ctx.restore()

                this.updateCanvasSizeIfChanged(gameData)
            }
        }

        this.requestAnimationFrameHandler = window.requestAnimationFrame(this.onAnimationFrame)
    }

    private updateCanvasSizeIfChanged(gameData: ClientGameData): void {
        if (this.height !== gameData.canvasHeight || this.width !== gameData.canvasWidth) {
            const canvas = this.canvasRef.current
            if (canvas) {
                canvas.width = gameData.canvasWidth
                canvas.height = gameData.canvasHeight
                this.width = gameData.canvasWidth
                this.height = gameData.canvasHeight
            }
        }
    }

    size(width: number, height: number) { }

    background(color: number): void;
    background(r: number, g: number, b: number): void;
    background(r: number, g: number, b: number, a: number): void;
    background(r: number, g?: number, b?: number, a: number = 1.0) {
        const context = this.canvasContext
        if (context) {
            const prevFillStyle = context.fillStyle

            if (g !== undefined && b !== undefined) {
                context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
            } else {
                context.fillStyle = `rgba(${r}, ${r}, ${r}, ${a})`
            }
            context.fillRect(0, 0, this.width, this.height)

            context.fillStyle = prevFillStyle
        }
    }

    stroke(color: number): void;
    stroke(r: number, g: number, b: number): void;
    stroke(r: number, g: number, b: number, a: number): void;
    stroke(r: number, g?: number, b?: number, a: number = 1.0) {
        const context = this.canvasContext
        if (context) {
            if (g !== undefined && b !== undefined) {
                context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`
            } else {
                context.strokeStyle = `rgba(${r}, ${r}, ${r}, ${a})`
            }
        }
    }

    strokeWeight(weight: number) {
        const context = this.canvasContext
        if (context) {
            context.lineWidth = weight
        }
    }

    fill(color: number): void;
    fill(r: number, g: number, b: number): void;
    fill(r: number, g: number, b: number, a: number): void;
    fill(r: number, g?: number, b?: number, a: number = 1.0) {
        const context = this.canvasContext
        if (context) {
            if (g !== undefined && b !== undefined) {
                context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
            } else {
                context.fillStyle = `rgba(${r}, ${r}, ${r}, ${a})`
            }
        }
    }

    noFill() {
        const context = this.canvasContext
        if (context) {
            context.fillStyle = 'rgba(0,0,0,0)'
        }
    }

    ellipse(x: number, y: number, width: number, height: number) {
        const context = this.canvasContext
        if (context) {
            context.beginPath()
            context.ellipse(x, y, width / 2, height / 2, 0, 0, 360)
            context.stroke()
            context.fill()
        }
    }

    translate(x: number, y: number) {
        const context = this.canvasContext
        if (context) {
            context.translate(x, y)
        }
    }

    rotate(radian: number) {
        const context = this.canvasContext
        if (context) {
            context.rotate(radian)
        }
    }

    line(x1: number, y1: number, x2: number, y2: number) {
        const context = this.canvasContext
        if (context) {
            context.beginPath()
            context.moveTo(x1, y1)
            context.lineTo(x2, y2)
            context.stroke()
        }
    }

    beginShape() {
        const context = this.canvasContext
        if (context) {
            context.beginPath()
        }
    }

    endShape() {
        const context = this.canvasContext
        if (context) {
            context.closePath()
            context.stroke()
            context.fill()
        }
    }

    vertex(x: number, y: number) {
        const context = this.canvasContext
        if (context) {
            context.lineTo(x, y)
        }
    }

    noLoop() {

    }

    loop() {

    }

    drawNextFrame() {

    }

    createSlider(min: number, max: number, defaultVal: number, step: number) {

    }

    getSliderValue(): number {
        return 0
    }

    createButton(text: string, clickCallback: () => void) {

    }

    getImageData(left: number, top: number, width: number, height: number): ImageData | null {
        const context = this.canvasContext
        if (context) {
            return context.getImageData(left, top, width, height)
        } else {
            return null
        }
    }

    updateImageData(imageData: ImageData, left: number, top: number) {
        const context = this.canvasContext
        if (context) {
            context.putImageData(imageData, left, top)
        }
    }

    maxFrameRate(fps: number) {
        this.fps = fps
        this.interval = 1000 / fps
    }

    triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
        const context = this.canvasContext
        if (context) {
            context.beginPath()
            context.moveTo(x1, y1)
            context.lineTo(x2, y2)
            context.lineTo(x3, y3)
            context.closePath()
            context.stroke()
            context.fill()
        }
    }

    setDebugText(text: string): void {

    }

    restore(): void {
        const context = this.canvasContext
        if (context) {
            context.restore()
        }
    }

    save(): void {
        const context = this.canvasContext
        if (context) {
            context.save()
        }
    }

}

export default withSnackbar(GameView)