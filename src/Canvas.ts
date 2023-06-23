import Boid from "./Boid.js"

export default class Canvas {
    private _canvasMap: (Boid | null)[][]

    constructor(private _width: number, private _height: number) {
        this._canvasMap = Array(this.width).fill(Array(this.height).fill(null))
        console.log(this._canvasMap)
    }

    setBoidLocation(b: Boid): void {
        this._canvasMap[Math.floor(b.location.x)][Math.floor(b.location.y)] = b;
    }

    clearBoidLocation(b: Boid): void {
        this._canvasMap[Math.floor(b.location.x)][Math.floor(b.location.y)] = null;
    }

    get canvasMap(): (Boid | null)[][] {
        return this._canvasMap;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

}