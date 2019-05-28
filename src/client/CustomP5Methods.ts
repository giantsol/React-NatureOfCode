export default interface CustomP5Methods {
    width: number
    height: number
    size(width: number, height: number): void
    background(color: number): void
    background(r: number, g: number, b: number): void
    background(r: number, g: number, b: number, a: number): void
    stroke(color: number): void
    stroke(r: number, g: number, b: number): void
    stroke(r: number, g: number, b: number, a: number): void
    strokeWeight(weight: number): void
    fill(color: number): void
    fill(r: number, g: number, b: number): void
    fill(r: number, g: number, b: number, a: number): void
    noFill(): void
    ellipse(x: number, y: number, width: number, height: number): void
    translate(x: number, y: number): void
    rotate(radian: number): void
    line(x1: number, y1: number, x2: number, y2: number): void
    beginShape(): void
    endShape(): void
    vertex(x: number, y: number): void
    noLoop(): void
    loop(): void
    drawNextFrame(): void
    createSlider(min: number, max: number, defaultVal: number, step: number): void
    getSliderValue(): number
    createButton(text: string, clickCallback: () => void): void
    getImageData(left: number, top: number, width: number, height: number): ImageData | null
    updateImageData(imageData: ImageData, left: number, top: number): void
    maxFrameRate(fps: number): void
    triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void
    setDebugText(text: string): void
    save(): void
    restore(): void
    scale(amount: number): void
}

