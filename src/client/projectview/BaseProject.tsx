import React, {ChangeEvent, createRef} from 'react'
import Utils from "../../shared/Utils"
import p5 from "p5"
import Slider from '@material-ui/lab/Slider'
import {Button} from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import CustomP5Methods from "../CustomP5Methods"
import CustomP5Callbacks from "../CustomP5Callbacks"

interface State {
    sliderAttributes?: SliderAttributes
    sliderValue: number
    buttonAttributes?: ButtonAttributes
    debugText?: string
}

interface SliderAttributes {
    min: number
    max: number
    step: number
}

interface ButtonAttributes {
    text: string
    clickCallback: () => void
}

export default abstract class BaseProject<P = {}, S extends State = State> extends React.Component<P, State>
    implements CustomP5Methods, CustomP5Callbacks {

    // framerate 관련 변수들
    private fps = 60
    private now = 0
    private then = Date.now()
    private interval = 1000 / this.fps
    private delta: number = 0

    private readonly canvasRef = createRef<HTMLCanvasElement>()
    private canvasContext: CanvasRenderingContext2D | null = null
    private requestAnimationFrameHandler: number | null = null

    // 주기적인 clearRect에서 참조하므로 따로 멤버 변수로 선언
    width = 150
    height = 150

    private looping = true

    constructor(props: P) {
        super(props)
        this.state = { sliderValue: 0 }
        this.onAnimationFrame = this.onAnimationFrame.bind(this)
        this.onSliderChanged = this.onSliderChanged.bind(this)
        this.drawNextFrame = this.drawNextFrame.bind(this)
        this.onKeyPressed = this.onKeyPressed.bind(this)
        this.onKeyReleased = this.onKeyReleased.bind(this)
    }

    render() {
        const { sliderAttributes, sliderValue, buttonAttributes, debugText } = this.state
        return (
            <div style={{width: "100vh", height: "100vh", margin: "auto", position: "relative"}}>
                <canvas ref={this.canvasRef} width={this.width} height={this.height}
                        style={{width: "100%", height: "100%", display: "block", border: '1px solid black'}}
                >
                    Fallback text for old browsers.
                </canvas>
                { sliderAttributes ?
                    <Slider value={sliderValue} min={sliderAttributes.min} max={sliderAttributes.max}
                            step={sliderAttributes.step} onChange={this.onSliderChanged}
                            style={{position: "absolute", width: "50%", bottom: "10%", left: "50%", transform: "translate(-50%, -50%)"}} />
                    : null
                }
                { buttonAttributes ?
                    <Button variant="contained" onClick={buttonAttributes.clickCallback} disableRipple={true}
                            style={{position: "absolute", top: "10%", right: "5%", transform: "translate(-50%, -50%)"}} >
                        {buttonAttributes.text}
                    </Button>
                    : null
                }
                { debugText ?
                    <Typography variant="body2"
                                style={{position: "absolute", top: "10%", left: "5%", whiteSpace: "pre-line"}}
                    >{debugText}</Typography>
                    : null
                }
            </div>
        )
    }

    private onSliderChanged(event: ChangeEvent<{}>, value: number): void {
        this.setState({ sliderValue: value })

        this.drawNextFrame()
    }

    componentDidMount() {
        const canvas = this.canvasRef.current
        this.canvasContext = canvas && canvas.getContext('2d')
        if (this.canvasContext) {
            this.setup()
            this.requestAnimationFrame()

            document.addEventListener('keydown', this.onKeyPressed)
            document.addEventListener('keyup', this.onKeyReleased)
        }
    }

    componentWillUnmount() {
        this.canvasContext = null
        this.cancelRequestAnimationFrame()

        document.removeEventListener('keydown', this.onKeyPressed)
        document.removeEventListener('keyup', this.onKeyReleased)
    }

    onKeyPressed(event: KeyboardEvent): void {

    }

    onKeyReleased(event: KeyboardEvent): void {

    }

    private onAnimationFrame() {
        const context = this.canvasContext
        if (context) {
            // framerate 관련 로직
            this.now = Date.now()
            this.delta = this.now - this.then

            if (this.delta > this.interval) {
                this.then = this.now - (this.delta % this.interval)

                p5.prototype.noiseSeed(Utils.randInt(0, 1000))
                // clear canvas
                context.clearRect(0, 0, this.width, this.height)
                context.save()
                this.draw()
                context.restore()
            }

            if (this.looping) {
                this.requestAnimationFrame()
            } else {
                this.cancelRequestAnimationFrame()
            }
        }
    }

    private requestAnimationFrame() {
        this.requestAnimationFrameHandler = window.requestAnimationFrame(this.onAnimationFrame)
    }

    private cancelRequestAnimationFrame() {
        if (this.requestAnimationFrameHandler) {
            window.cancelAnimationFrame(this.requestAnimationFrameHandler)
            this.requestAnimationFrameHandler = null
        }
    }

    /* Processing Methods */

    size(width: number, height: number) {
        const canvas = this.canvasRef.current
        if (canvas) {
            canvas.width = width
            canvas.height = height
            this.width = width
            this.height = height
        }
    }

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
        this.looping = false
    }

    loop() {
        this.looping = true
        this.drawNextFrame()
    }

    drawNextFrame() {
        if (!this.requestAnimationFrameHandler) {
            this.requestAnimationFrame()
        }
    }

    createSlider(min: number, max: number, defaultVal: number, step: number) {
        this.setState({ sliderValue: defaultVal, sliderAttributes: {min, max, step} })
    }

    getSliderValue(): number {
        return this.state.sliderValue
    }

    createButton(text: string, clickCallback: () => void) {
        this.setState({ buttonAttributes: {text, clickCallback}})
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
        this.setState({debugText: text})
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

    rect(x1: number, y1: number, x2: number, y2: number): void {
        const context = this.canvasContext
        if (context) {
            context.fillRect(x1, y1, x2, y2)
            context.strokeRect(x1, y1, x2, y2)
        }
    }

    abstract setup(): void
    abstract draw(): void
}
