export default class Utils {

    static randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    static numberToHexString(num: number): string {
        let hex = Number(num).toString(16)
        if (hex.length < 2) {
            hex = '0' + hex
        }

        return hex
    }
}