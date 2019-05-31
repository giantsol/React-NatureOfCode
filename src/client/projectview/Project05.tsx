import BaseProject from "./BaseProject"
import * as p5 from "p5"
import CustomP5Methods from "../CustomP5Methods"
import {Constants} from "../../shared/Constants"

const p5p = p5.prototype
const airStartY = 500

export default class Project05 extends BaseProject {
    private ship!: Ship

    setup(): void {
        this.size(800, 800)
        this.ship = new Ship(this)
    }

    draw(): void {
        this.save()
        this.fill(0, 125, 125, 0.3)
        this.noStroke()
        this.rect(0, airStartY, 800, 300)
        this.restore()

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
        } else if (event.code === 'Space') {
            this.ship.fireBullet()
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
    private readonly p5: CustomP5Methods
    private pos: p5.Vector
    private radius = 20
    private heading = 0
    private rotation = 0
    private velocity = p5p.createVector(0, 0)
    private acceleration = p5p.createVector(0, 0)
    private boostingForce = p5p.createVector(0, 0)
    private isBoosting = false

    private bulletHeading = 0
    private readonly bulletPos = p5p.createVector(-100, -100)
    private readonly bulletVelocity = p5p.createVector(0, 0)
    private readonly bulletAcceleration = p5p.createVector(0, 0)
    private readonly bulletFirePower = 40

    private readonly airResistanceConstant = 0.01

    constructor(p5: CustomP5Methods) {
        this.p5 = p5
        this.pos = p5p.createVector(p5.width / 2, p5.height / 2)
    }

    render(): void {
        const p5 = this.p5
        const r = this.radius
        p5.save()
        p5.translate(this.pos.x, this.pos.y)
        p5.rotate(this.heading + Constants.HALF_PI)
        p5.noFill()
        p5.stroke(0)
        p5.triangle(-r, r, r, r, 0, -r)
        p5.restore()

        p5.save()
        p5.translate(this.bulletPos.x, this.bulletPos.y)
        p5.rotate(this.bulletHeading)
        p5.noFill()
        p5.stroke(255, 0, 0)
        p5.strokeWeight(4)
        p5.line(0, -5, 0, 5)
        p5.restore()

        p5.setDebugText(
            `Force x: ${Number(this.boostingForce.x.toPrecision(2))}, y: ${Number(this.boostingForce.y.toPrecision(2))}
            Acceleration x: ${Number(this.acceleration.x.toPrecision(2))}, y: ${Number(this.acceleration.y.toPrecision(2))}
            Velocity x: ${Number(this.velocity.x.toPrecision(2))}, y: ${Number(this.velocity.y.toPrecision(2))}
            `
        )

        this.acceleration.mult(0)
        this.bulletAcceleration.mult(0)
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

        if (this.pos.y > airStartY) {
            // apply air resistance force
            const speed = this.velocity.mag()
            const dragMag = this.airResistanceConstant * speed * speed
            const dragForce = this.velocity.copy()
            dragForce.mult(-1).normalize().mult(dragMag)
            this.acceleration.add(dragForce)
        }

        this.velocity.add(this.acceleration)
        this.pos.add(this.velocity)

        // bullet
        if (this.bulletPos.y > airStartY) {
            const speed = this.bulletVelocity.mag()
            const dragMag = this.airResistanceConstant * speed * speed
            const dragForce = this.bulletVelocity.copy()
            dragForce.mult(-1).normalize().mult(dragMag)
            this.bulletAcceleration.add(dragForce)
        }
        this.bulletVelocity.add(this.bulletAcceleration)
        this.bulletPos.add(this.bulletVelocity)

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

        if (pos.y > height) {
            pos.y = height
            this.velocity.y = 0
        } else if (pos.y < 0) {
            pos.y = 0
            this.velocity.y = 0
        }

        // bullet
        const bulletPos = this.bulletPos
        if (bulletPos.x > width + 20 || bulletPos.x < -20 || bulletPos.y > height + 20 || bulletPos.y < -20) {
            this.bulletVelocity.mult(0)
        }
    }

    fireBullet(): void {
        this.bulletHeading = this.heading + Constants.HALF_PI
        this.bulletPos.set(this.pos.x, this.pos.y)
        this.bulletAcceleration.add(p5.Vector.mult(p5.Vector.fromAngle(this.heading), this.bulletFirePower))
    }
}

