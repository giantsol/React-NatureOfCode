import React, {ChangeEvent, createRef} from 'react'
import Utils from "../../shared/Utils"
import p5 from "p5"
import Slider from '@material-ui/lab/Slider'
import {Button} from "@material-ui/core"

interface State {
    sliderAttributes?: SliderAttributes
    sliderValue: number
    buttonAttributes?: ButtonAttributes
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

export default abstract class BaseProject<P = {}, S extends State = State> extends React.Component<P, State> {

    private readonly canvasRef = createRef<HTMLCanvasElement>()
    private canvasContext: CanvasRenderingContext2D | null = null
    private requestAnimationFrameHandler: number | null = null

    // 주기적인 clearRect에서 참조하므로 따로 멤버 변수로 선언
    protected width = 150
    protected height = 150

    private looping = true

    constructor(props: P) {
        super(props)
        this.onAnimationFrame = this.onAnimationFrame.bind(this);
        this.state = { sliderValue: 0 }

        this.drawNextFrame = this.drawNextFrame.bind(this)
    }

    render() {
        const { sliderAttributes, sliderValue, buttonAttributes } = this.state
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
            </div>
        )
    }

    private onSliderChanged = (event: ChangeEvent<{}>, value: number) => {
        this.setState({ sliderValue: value })

        this.drawNextFrame()
    }

    componentDidMount() {
        const canvas = this.canvasRef.current
        this.canvasContext = canvas && canvas.getContext('2d')
        if (this.canvasContext) {
            this.setup()
            this.requestAnimationFrame()
        }
    }

    private onAnimationFrame() {
        const context = this.canvasContext
        if (context) {
            // clear canvas
            context.clearRect(0, 0, this.width, this.height)
            p5.prototype.noiseSeed(Utils.randInt(0, 1000))
            context.save()
            this.draw()
            context.restore()

            if (this.looping) {
                this.requestAnimationFrame()
            } else {
                this.cancelRequestAnimationFrame()
            }
        }
    }

    componentWillUnmount() {
        this.canvasContext = null
        this.cancelRequestAnimationFrame()
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

    protected size(width: number, height: number) {
        const canvas = this.canvasRef.current
        if (canvas) {
            canvas.width = width
            canvas.height = height
            this.width = width
            this.height = height
        }
    }

    protected background(color: number): void;
    protected background(r: number, g: number, b: number): void;
    protected background(r: number, g: number, b: number, a: number): void;
    protected background(r: number, g?: number, b?: number, a: number = 1.0) {
        const context = this.canvasContext
        if (context) {
            const prevFillStyle = context.fillStyle

            if (g && b) {
                context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
            } else {
                context.fillStyle = `rgba(${r}, ${r}, ${r}, ${a})`
            }
            context.fillRect(0, 0, this.width, this.height)

            context.fillStyle = prevFillStyle
        }
    }

    protected stroke(color: number) {
        const context = this.canvasContext
        if (context) {
            context.strokeStyle = `rgb(${color}, ${color}, ${color})`
        }
    }

    protected strokeWeight(weight: number) {
        const context = this.canvasContext
        if (context) {
            context.lineWidth = weight
        }
    }

    protected fill(color: number) {
        const context = this.canvasContext
        if (context) {
            context.fillStyle = `rgb(${color}, ${color}, ${color})`
        }
    }

    protected ellipse(x: number, y: number, width: number, height: number) {
        const context = this.canvasContext
        if (context) {
            context.beginPath()
            context.ellipse(x, y, width / 2, height / 2, 0, 0, 360)
            context.stroke()
            context.fill()
        }
    }

    protected getWidth(): number {
        return this.width
    }

    protected getHeight(): number {
        return this.height
    }

    protected translate(x: number, y: number) {
        const context = this.canvasContext
        if (context) {
            context.translate(x, y)
        }
    }

    protected rotate(radian: number) {
        const context = this.canvasContext
        if (context) {
            context.rotate(radian)
        }
    }

    protected line(x1: number, y1: number, x2: number, y2: number) {
        const context = this.canvasContext
        if (context) {
            context.beginPath()
            context.moveTo(x1, y1)
            context.lineTo(x2, y2)
            context.stroke()
        }
    }

    protected beginShape() {
        const context = this.canvasContext
        if (context) {
            context.beginPath()
        }
    }

    protected endShape() {
        const context = this.canvasContext
        if (context) {
            context.closePath()
            context.stroke()
        }
    }

    protected vertex(x: number, y: number) {
        const context = this.canvasContext
        if (context) {
            context.lineTo(x, y)
        }
    }

    protected noLoop() {
        this.looping = false
    }

    protected loop() {
        this.looping = true
        this.drawNextFrame()
    }

    protected drawNextFrame() {
        if (!this.requestAnimationFrameHandler) {
            this.requestAnimationFrame()
        }
    }

    protected createSlider(min: number, max: number, defaultVal: number, step: number) {
        this.setState({ sliderValue: defaultVal, sliderAttributes: {min, max, step} })
    }

    protected getSliderValue(): number {
        return this.state.sliderValue
    }

    protected createButton(text: string, clickCallback: () => void) {
        this.setState({ buttonAttributes: {text, clickCallback}})
    }

    abstract setup(): void
    abstract draw(): void
}
