import BaseProject from "./BaseProject"
import p5 from "p5"

interface Props {
    socket: SocketIOClient.Emitter
}

const TWO_PI = Math.PI * 2
const p5p = p5.prototype

export default class Project01 extends BaseProject<Props> {

    setup(): void {
        this.size(500, 500)
        this.createSlider(0, 10, 0, 1)
        // this.createButton('Next Frame', this.drawNextFrame)
        this.maxFrameRate(10)
    }

    draw(): void {
        let noiseMax = this.getSliderValue()

        this.translate(this.width / 4, this.height / 2)
        this.stroke(0)
        this.strokeWeight(2)
        this.beginShape()
        for (let a = 0; a < TWO_PI; a += 0.1) {
            let r
            if (noiseMax === 0) {
                r = 50
            } else {
                r = p5p.map(Math.random(), 0, 1, 40, 80)
                if (r < 50) {
                    r = 50
                }
            }
            let x = r * Math.cos(a)
            let y = r * Math.sin(a)
            this.vertex(x, y)
        }
        this.endShape()

        this.translate(this.width / 2, 0)
        this.beginShape()
        for (let a = 0; a < TWO_PI; a += 0.1) {
            let r
            if (noiseMax === 0) {
                r = 50
            } else {
                const xoff = p5p.map(Math.cos(a), -1, 1, 0, noiseMax)
                const yoff = p5p.map(Math.sin(a), -1, 1, 0, noiseMax)
                r = p5p.map(p5p.noise(xoff, yoff), 0, 1, 40, 80)
                if (r < 50) {
                    r = 50
                }
            }
            let x = r * Math.cos(a)
            let y = r * Math.sin(a)
            this.vertex(x, y)
        }
        this.endShape()
        // this.noLoop()
    }

}