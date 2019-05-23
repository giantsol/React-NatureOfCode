import React, {createRef} from 'react'
import Victor from 'victor'

interface Props {
    socket: SocketIOClient.Emitter
}

export default class Project01 extends React.Component<Props, any> {
    private readonly canvasRef = createRef<HTMLCanvasElement>()
    private canvasContext: CanvasRenderingContext2D | null = null
    private requestAnimationFrameHandler: number | null = null

    private readonly canvasWidth = 500
    private readonly canvasHeight = 500

    private readonly position = new Victor(100, 100)
    private readonly velocity = new Victor(2.5, 5)

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
        }
    }

    private onAnimationFrame = () => {
        const ctx = this.canvasContext

        if (ctx) {
            ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

            const position = this.position
            const velocity = this.velocity

            position.add(velocity)

            if ((position.x > this.canvasWidth) || (position.x < 0)) {
                velocity.x = velocity.x * -1
            } else if ((position.y > this.canvasHeight) || (position.y < 0)) {
                velocity.y = velocity.y * -1
            }

            ctx.strokeStyle = 'rgb(0,0,0)'
            ctx.fillStyle = 'rgb(175, 175, 175)'

            ctx.beginPath()
            ctx.arc(position.x, position.y, 16, 0, 360)
            ctx.fill()

            this.requestAnimationFrameHandler = window.requestAnimationFrame(this.onAnimationFrame)
        }
    }

    componentWillUnmount(): void {
        this.canvasContext = null
        if (this.requestAnimationFrameHandler) {
            window.cancelAnimationFrame(this.requestAnimationFrameHandler)
        }
    }
}