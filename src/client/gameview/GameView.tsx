import React, {createRef} from 'react'
import {ClientSocketEventsHelper} from "../ClientSocketEventsHelper"
import {GameDataDTO, PlayerDTO, PlayerInputDTO} from "../../shared/DTOs"
import {ClientGameData} from "../ClientModels"
import {withSnackbar} from 'notistack'
import {WithSnackbarProps} from "notistack/build"
import LogInView from "./LogInView"
import CustomP5Methods from "../CustomP5Methods"
import './GameView.css'

interface Props extends WithSnackbarProps {
    socket: SocketIOClient.Emitter
}

interface State {
    myId: string | null
    canvasFitHeight: boolean
}

class GameView extends React.Component<Props, State> implements CustomP5Methods {
    private static readonly sendInputInterval = 1000 / 60

    private readonly canvasRef = createRef<HTMLCanvasElement>()
    private canvasContext: CanvasRenderingContext2D | null = null
    private requestAnimationFrameHandler: number | null = null

    // for fast access
    width = 0
    height = 0

    private currentGameData: ClientGameData = new ClientGameData(this)

    private readonly playerInput: PlayerInputDTO = {
        left: false,
        right: false,
        up: false,
        fire: false
    }
    private sendInputLoopHandler: NodeJS.Timeout | null = null

    // framerate 관련 변수들
    private fps = 60
    private now = 0
    private then = Date.now()
    private interval = 1000 / this.fps
    private delta: number = 0

    private prevLoggedInName: string | null = null

    constructor(props: Props) {
        super(props)
        this.state = { myId: null, canvasFitHeight: true }
    }

    render() {
        const divStyle = this.state.canvasFitHeight ? "fitHeight" : "fitWidth"
        return (
            <div style={{width: "100vw", height: "100vh", backgroundColor: "black"}}>
                <div className={divStyle} style={{position: "relative"}}>
                    <canvas ref={this.canvasRef} width={this.width} height={this.height}
                            style={{width: "100%", height: "100%", display: "block", border: '2px solid white'}}>
                        Fallback text for old browsers.
                    </canvas>
                    { this.state.myId
                        ? null : <LogInView socket={this.props.socket} prevName={this.prevLoggedInName} onLoggedIn={this.onLoggedIn} />
                    }
                </div>
            </div>
        )
    }

    private onLoggedIn = (id: string, name: string) => {
        this.setState({myId: id})
        this.prevLoggedInName = name
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
            ClientSocketEventsHelper.subscribeKilledByAsteroidEvent(socket, this.onKilledByAsteroidEvent)
            ClientSocketEventsHelper.subscribeOtherPlayerKilledByAsteroidEvent(socket, this.onOtherPlayerKilledByAsteroidEvent)
            ClientSocketEventsHelper.subscribeKilledByPlayerEvent(socket, this.onKilledByPlayerEvent)
            ClientSocketEventsHelper.subscribeOtherPlayerKilledByPlayerEvent(socket, this.onOtherPlayerKilledByPlayerEvent)

            // send user inputs to server 60 frames per sec
            this.sendInputLoopHandler = setTimeout(this.sendInputLoop, GameView.sendInputInterval)
            document.addEventListener('keydown', this.onKeyDownEvent)
            document.addEventListener('keyup', this.onKeyUpEvent)
            window.addEventListener('resize', this.onWindowResizeEvent)
        }
    }

    componentWillUnmount(): void {
        this.canvasContext = null
        const socket = this.props.socket
        ClientSocketEventsHelper.sendPlayerLeavingGameEvent(socket)
        ClientSocketEventsHelper.stopReceivingGameData(socket)
        ClientSocketEventsHelper.unsubscribeNewPlayerJoinedEvent(socket, this.onNewPlayerJoinedEvent)
        ClientSocketEventsHelper.unsubscribeGameDataEvent(socket, this.onGameDataEvent)
        ClientSocketEventsHelper.unsubscribePlayerLeftEvent(socket, this.onPlayerLeftEvent)
        ClientSocketEventsHelper.unsubscribeKilledByAsteroidEvent(socket, this.onKilledByAsteroidEvent)
        ClientSocketEventsHelper.unsubscribeOtherPlayerKilledByAsteroidEvent(socket, this.onOtherPlayerKilledByAsteroidEvent)
        ClientSocketEventsHelper.unsubscribeKilledByPlayerEvent(socket, this.onKilledByPlayerEvent)
        ClientSocketEventsHelper.unsubscribeOtherPlayerKilledByPlayerEvent(socket, this.onOtherPlayerKilledByPlayerEvent)

        document.removeEventListener('keydown', this.onKeyDownEvent)
        document.removeEventListener('keyup', this.onKeyUpEvent)
        window.removeEventListener('resize', this.onWindowResizeEvent)

        if (this.requestAnimationFrameHandler) {
            window.cancelAnimationFrame(this.requestAnimationFrameHandler)
        }
        if (this.sendInputLoopHandler) {
            clearTimeout(this.sendInputLoopHandler)
        }
    }

    private onKeyDownEvent = (event: KeyboardEvent) => {
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
    }

    private onKeyUpEvent = (event: KeyboardEvent) => {
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
    }

    private onWindowResizeEvent = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        const fitHeight = w >= h
        if (this.state.canvasFitHeight !== fitHeight) {
            this.setState({canvasFitHeight: fitHeight})
        }
    }

    private onNewPlayerJoinedEvent = (player: PlayerDTO) => {
        this.props.enqueueSnackbar(`${player.name} 가 참여했습니다`,
            { variant: 'success', autoHideDuration: 1500 })
    }

    private onGameDataEvent = (gameData: GameDataDTO) => {
        this.currentGameData.update(gameData, this)
    }

    private onPlayerLeftEvent = (playerDTO: PlayerDTO) => {
        this.props.enqueueSnackbar(`${playerDTO.name} 가 떠났습니다`,
            { variant: 'success', autoHideDuration: 1500 })
    }

    private onKilledByAsteroidEvent = (player: PlayerDTO) => {
        this.setState({myId: null})
    }

    private onOtherPlayerKilledByAsteroidEvent = (player: PlayerDTO) => {
        this.props.enqueueSnackbar(`\u2604 \u2694 ${player.name}`,
            { variant: 'info', autoHideDuration: 1500 })
    }

    private onKilledByPlayerEvent = (killer: PlayerDTO, killed: PlayerDTO) => {
        this.setState({myId: null})
    }

    private onOtherPlayerKilledByPlayerEvent = (killer: PlayerDTO, killed: PlayerDTO) => {
        this.props.enqueueSnackbar(`${killer.name} \u2694 ${killed.name}`,
            { variant: 'info', autoHideDuration: 1500 })
    }

    private sendInputLoop = () => {
        // send user input to the server
        ClientSocketEventsHelper.sendPlayerInput(this.props.socket, this.playerInput)
        this.sendInputLoopHandler = setTimeout(this.sendInputLoop, GameView.sendInputInterval)
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

                ctx.clearRect(0, 0, this.width, this.height)
                ctx.save()
                ctx.translate(0.5, 0.5)
                gameData.draw(this.state.myId)
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

    scale(amount: number): void {
        const context = this.canvasContext
        if (context) {
            context.scale(amount, amount)
        }
    }

    text(text: string, x: number, y: number, size: number): void {
        const context = this.canvasContext
        if (context) {
            context.font = `${size}px roboto`
            context.textAlign = 'center'
            context.fillText(text, x, y)
        }
    }

    rect(x1: number, y1: number, w: number, h: number): void {
        const context = this.canvasContext
        if (context) {
            context.fillRect(x1, y1, w, h)
            context.strokeRect(x1, y1, w, h)
        }
    }

    noStroke(): void {
        const context = this.canvasContext
        if (context) {
            context.strokeStyle = 'rgba(0,0,0,0)'
        }
    }

}

export default withSnackbar(GameView)