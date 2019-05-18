import BaseCanvas from "./BaseCanvas"

export default class SimpleBouncingBall extends BaseCanvas {

    private x = 100
    private y = 100
    private xspeed = 2.5
    private yspeed = 2

    setup() {
        this.size(800, 400)
    }

    draw() {
        this.background(255)

        this.x = this.x + this.xspeed
        this.y = this.y + this.yspeed

        const width = this.getWidth()
        const height = this.getHeight()
        if ((this.x > width) || (this.x < 0)) {
            this.xspeed = this.xspeed * -1
        }
        if ((this.y > height) || (this.y < 0)) {
            this.yspeed = this.yspeed * -1
        }

        this.stroke(0)
        this.strokeWeight(2)
        this.fill(127)
        this.ellipse(this.x, this.y, 48, 48)
    }

}