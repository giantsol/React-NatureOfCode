import BaseProject, {ProcessingMethods} from "./BaseProject"
import * as p5 from "p5"

const p5p = p5.prototype
const HALF_PI = Math.PI / 2

export default class Project04 extends BaseProject {
    private ship!: Ship

    setup(): void {
        this.size(800, 800)
        this.ship = new Ship(this)
    }

    draw(): void {
        this.ship.update()
        this.ship.render()
    }

    onKeyPressed(event: KeyboardEvent): void {
        if (event.code === 'ArrowRight') {
            this.ship.setRotation(0.1)
        } else if (event.code === 'ArrowLeft') {
            this.ship.setRotation(-0.1)
        } else if (event.code === 'ArrowUp') {
            this.ship.boosting(true)
        }
    }

    onKeyReleased(event: KeyboardEvent): void {
        const code = event.code
        if (code === 'ArrowRight' || code === 'ArrowLeft') {
            this.ship.setRotation(0)
        } else if (code === 'ArrowUp') {
            this.ship.boosting(false)
        }
    }
}

class Ship {
    private readonly p5: ProcessingMethods
    private pos: p5.Vector
    private radius = 20
    private heading = 0
    private rotation = 0
    private velocity = p5p.createVector(0, 0)
    private acceleration = p5p.createVector(0, 0)
    private boostingForce = p5p.createVector(0, 0)
    private isBoosting = false

    constructor(p5: ProcessingMethods) {
        this.p5 = p5
        this.pos = p5p.createVector(p5.width / 2, p5.height / 2)
    }

    render(): void {
        const p5 = this.p5
        const r = this.radius
        p5.translate(this.pos.x, this.pos.y)
        p5.rotate(this.heading + HALF_PI)
        p5.noFill()
        p5.stroke(0)
        p5.triangle(-r, r, r, r, 0, -r)

        p5.setDebugText(
            `Force x: ${Number(this.boostingForce.x.toPrecision(2))}, y: ${Number(this.boostingForce.y.toPrecision(2))}
            Acceleration x: ${Number(this.acceleration.x.toPrecision(2))}, y: ${Number(this.acceleration.y.toPrecision(2))}
            Velocity x: ${Number(this.velocity.x.toPrecision(2))}, y: ${Number(this.velocity.y.toPrecision(2))}
            `
        )

        this.acceleration.mult(0)
    }

    setRotation(a: number): void {
        this.rotation = a
    }

    update(): void {
        this.heading += this.rotation

        if (this.isBoosting) {
            this.boostingForce = this.getBoostingForce()
        } else {
            this.boostingForce.mult(0)
        }
        this.acceleration.add(this.boostingForce)
        this.velocity.add(this.acceleration)
        this.pos.add(this.velocity)

        this.edges()
    }

    boosting(b: boolean): void {
        this.isBoosting = b
    }

    getBoostingForce(): p5.Vector {
        return p5.Vector.mult(p5.Vector.fromAngle(this.heading), 0.1)
    }

    edges(): void {
        const pos = this.pos
        const r = this.radius
        const width = this.p5.width
        const height = this.p5.height

        if (pos.x > width + r) {
            pos.x = -r
        } else if (pos.x < -r) {
            pos.x = width + r
        }

        if (pos.y > height + r) {
            pos.y = -r
        } else if (pos.y < -r) {
            pos.y = height + r
        }
    }
}

