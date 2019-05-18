import BaseCanvas from "./BaseCanvas"

export default class SimpleRotatingBaton extends BaseCanvas {

    private angle = 0
    private aVelocity = 0
    private aAcceleration = 0.001

    setup() {
        this.size(750, 150)
    }

    draw() {
        this.background(255)

        this.fill(127)
        this.stroke(0)
        this.translate(this.getWidth()/2, this.getHeight()/2)
        this.rotate(this.angle)
        this.line(-50, 0, 50, 0)
        this.stroke(0)
        this.strokeWeight(2)
        this.fill(127)
        this.ellipse(50, 0, 16, 16)
        this.ellipse(-50, 0, 16, 16)

        this.aVelocity += this.aAcceleration
        this.angle += this.aVelocity
    }

}