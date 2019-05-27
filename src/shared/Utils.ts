export default class Utils {

    // min&max inclusive
    static randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    // min inclusive, max exclusive
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
}