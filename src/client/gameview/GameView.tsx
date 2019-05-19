import React, {createRef} from 'react'

interface Props {
    socket: SocketIOClient.Emitter
}

export default class GameView extends React.Component<Props, any> {
    private readonly canvasRef = createRef<HTMLCanvasElement>()
    private canvasContext: CanvasRenderingContext2D | null = null

    static readonly drawWidth = 300
    static readonly drawHeight = 300

    render() {
        return (
            <React.Fragment>
                <canvas ref={this.canvasRef} width={GameView.drawWidth} height={GameView.drawHeight}
                        style={{width: "aut", height: "100vh", display: "block"}}>
                    Fallback text for old browsers.
                </canvas>
            </React.Fragment>
        )
    }

    componentDidMount(): void {
        const canvas = this.canvasRef.current
        // ts에서는 optional chaining이 안되므로 이런 식으로..
        this.canvasContext = canvas && canvas.getContext('2d')
        if (this.canvasContext) {
            // this.setup()
            window.requestAnimationFrame(this.onAnimationFrame)
        }
    }

    componentWillUnmount(): void {
        this.canvasContext = null
    }

    private onAnimationFrame = () => {
        const ctx = this.canvasContext
        if (ctx) {
            ctx.fillRect(50, 50, 50, 50)
            window.requestAnimationFrame(this.onAnimationFrame)
        }
    }
}