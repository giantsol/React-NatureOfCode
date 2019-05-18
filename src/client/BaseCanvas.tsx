import React, {createRef} from 'react'
import './BaseCanvas.css'

export default abstract class BaseCanvas extends React.Component {

    private readonly canvasRef = createRef<HTMLCanvasElement>()
    private canvasContext: CanvasRenderingContext2D | null = null

    // 주기적인 clearRect에서 참조하므로 따로 멤버 변수로 선언
    private width = 150
    private height = 150

    constructor(props: any) {
        super(props)
        // js의 this 문제때문에 필요 (window.requestAnimationFrame)
        this.onAnimationFrame = this.onAnimationFrame.bind(this);
    }

    render() {
        return (
            <div>
                <canvas ref={this.canvasRef} width={this.width} height={this.height}>
                    Fallback text for old browsers.
                </canvas>
            </div>
        )
    }

    componentDidMount() {
        const canvas = this.canvasRef.current
        // ts에서는 optional chaining이 안되므로 이런 식으로..
        this.canvasContext = canvas && canvas.getContext('2d')
        if (this.canvasContext) {
            this.setup()
            window.requestAnimationFrame(this.onAnimationFrame)
        }
    }

    private onAnimationFrame() {
        const context = this.canvasContext
        if (context) {
            // clear canvas
            context.clearRect(0, 0, this.width, this.height)
            context.save()
            this.draw()
            context.restore()
            window.requestAnimationFrame(this.onAnimationFrame)
        }
    }

    componentWillUnmount() {
        this.canvasContext = null
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

    protected drawCanvasBorder(draw: boolean) {
        const canvas = this.canvasRef.current
        if (canvas) {
            if (draw) {
                canvas.style.border = '1px solid black'
            } else {
                canvas.style.border = '0px'
            }
        }
    }

    abstract setup(): void
    abstract draw(): void
}
