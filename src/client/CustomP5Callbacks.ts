export default interface CustomP5Callbacks {
    setup(): void
    draw(): void
    onKeyPressed(event: KeyboardEvent): void
    onKeyReleased(event: KeyboardEvent): void
}