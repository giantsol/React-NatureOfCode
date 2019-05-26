import React, {createRef} from 'react'
import Utils from "../../shared/Utils"
import p5 from "p5"

export default abstract class BaseProject<P = {}, S = {}> extends React.Component<P, S> {

    private readonly canvasRef = createRef<HTMLCanvasElement>()
    private canvasContext: CanvasRenderingContext2D | null = null
    private requestAnimationFrameHandler: number | null = null

    // 주기적인 clearRect에서 참조하므로 따로 멤버 변수로 선언
    protected width = 150
    protected height = 150

    constructor(props: any) {
        super(props)
        this.onAnimationFrame = this.onAnimationFrame.bind(this);
    }

    render() {
        return (
            <React.Fragment>
                <canvas ref={this.canvasRef} width={this.width} height={this.height}
                        style={{width: "auto", height: "100vh", display: "block", margin: "auto", border: '1px solid black'}}
                >
                    Fallback text for old browsers.
                </canvas>
            </React.Fragment>
        )
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
            this.requestAnimationFrame()
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

    abstract setup(): void
    abstract draw(): void
}
