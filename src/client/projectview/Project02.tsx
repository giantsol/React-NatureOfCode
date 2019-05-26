import BaseProject from "./BaseProject"
import Utils from "../../shared/Utils"
import * as p5 from "p5"

export default class Project02 extends BaseProject {
    private readonly increment = 0.02
    private xoff = 0.0

    setup(): void {
        this.size(800, 800)
    }

    draw(): void {
        p5.prototype.noiseSeed(0)
        const leftHalf = this.getImageData(50, 250, 300, 300)
        const rightHalf = this.getImageData(450, 250, 300, 300)
        if (!leftHalf || !rightHalf) {
            return
        }

        const leftHalfPixels = leftHalf.data
        const rightHalfPixels = rightHalf.data

        let xoff = this.xoff
        const increment = this.increment
        for (let x = 0; x < 300; x++) {
            xoff += increment
            let yoff = 0.0
            for (let y = 0; y < 300; y++) {
                yoff += increment

                const randBrightness = Utils.randFloat(0, 255)
                const noiseBrightness = p5.prototype.noise(xoff, yoff) * 255

                const [r, g, b, a] = Utils.getPixelColorIndicesForCoord(x, y, 300)
                leftHalfPixels[r] = randBrightness
                leftHalfPixels[g] = randBrightness
                leftHalfPixels[b] = randBrightness
                leftHalfPixels[a] = 255
                rightHalfPixels[r] = noiseBrightness
                rightHalfPixels[g] = noiseBrightness
                rightHalfPixels[b] = noiseBrightness
                rightHalfPixels[a] = 255
            }
        }

        this.updateImageData(leftHalf, 50, 250)
        this.updateImageData(rightHalf, 450, 250)
        this.xoff += increment
    }
}