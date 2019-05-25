import Victor from 'victor'
import BaseProject from "./BaseProject"

interface Props {
    socket: SocketIOClient.Emitter
}

export default class Project01 extends BaseProject<Props, any> {
    private readonly position = new Victor(100, 100)
    private readonly velocity = new Victor(2.5, 5)

    setup(): void {
        this.size(500, 500)
    }

    draw(): void {
        const position = this.position
        const velocity = this.velocity

        position.add(velocity)

        if ((position.x > this.width) || (position.x < 0)) {
            velocity.x = velocity.x * -1
        } else if ((position.y > this.height) || (position.y < 0)) {
            velocity.y = velocity.y * -1
        }

        this.stroke(0)
        this.fill(175)
        this.ellipse(position.x, position.y, 16, 16)
    }

}