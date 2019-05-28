export default class Utils {

    // min&max inclusive
    // min and max must be integers!
    static randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    // min inclusive, max exclusive
    // min and max must be integers!
    static randFloat(min: number, max: number): number {
        return Math.random() * (max - min + 1) + min
    }

    static getPixelColorIndicesForCoord(x: number, y: number, width: number): Array<number> {
        const red = y * (width * 4) + x * 4
        return [red, red + 1, red + 2, red + 3]
    }

    static numberToHexString(num: number): string {
        let hex = Number(num).toString(16)
        if (hex.length < 2) {
            hex = '0' + hex
        }

        return hex
    }

    static updateArrayData<E, N>(es: E[], ns: N[],
                                 comparator: (e: E, n: N) => boolean,
                                 updater: (e: E, n: N) => void,
                                 creator: (n: N) => E): void {
        let i = es.length
        while (i--) {
            const e = es[i]
            const ni = ns.findIndex(n => comparator(e, n))
            if (ni < 0) {
                es.splice(i, 1)
            } else {
                const n = ns[ni]
                updater(e, n)
                ns.splice(ni, 1)
            }
        }

        for (let n of ns) {
            es.push(creator(n))
        }
    }

    static pickRandom<A>(as: A[]): A | null {
        if (as.length <= 0) {
            return null
        } else {
            const randIndex = Utils.randInt(0, as.length - 1)
            return as[randIndex]
        }
    }

    static map(value: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
        return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
    }

    static distance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.hypot(x2-x1, y2-y1)
    }
    // returns true iff the line from (x11, y11)->(x12, y12) intersects with (x21, y21)->(x22, y22)
    static intersects(x11: number, y11: number, x12: number, y12: number, x21: number, y21: number, x22: number, y22: number) {
        let det, gamma, lambda
        det = (x12 - x11) * (y22 - y21) - (x22 - x21) * (y12 - y11)
        if (det === 0) {
            return false
        } else {
            lambda = ((y22 - y21) * (x22 - x11) + (x21 - x22) * (y22 - y11)) / det
            gamma = ((y11 - y12) * (x22 - x11) + (x12 - x11) * (y22 - y11)) / det
            return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)
        }
    }

}