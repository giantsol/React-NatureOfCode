import BaseProject from "./BaseProject"
import p5 from "p5"

interface Props {
    socket: SocketIOClient.Emitter
}

const TWO_PI = Math.PI * 2
const p5p = p5.prototype

export default class Project01 extends BaseProject<Props, any> {

    setup(): void {
        this.size(500, 500)
    }

    draw(): void {
        this.translate(this.width / 4, this.height / 2)
        this.stroke(0)
        this.strokeWeight(2)
        this.beginShape()
        for (let a = 0; a < TWO_PI; a += 0.1) {
            let r = 50
            let x = r * Math.cos(a)
            let y = r * Math.sin(a)
            this.vertex(x, y)
        }
        this.endShape()

        this.translate(this.width / 2, 0)
        this.beginShape()
        for (let a = 0; a < TWO_PI; a += 0.1) {
            let xoff = p5p.map(Math.cos(a), -1, 1, 0, 2)
            let yoff = p5p.map(Math.sin(a), -1, 1, 0, 2)
            let r = p5p.map(p5p.noise(xoff, yoff), 0, 1, 40, 60)
            let x = r * Math.cos(a)
            let y = r * Math.sin(a)
            this.vertex(x, y)
        }
        this.endShape()
    }

}