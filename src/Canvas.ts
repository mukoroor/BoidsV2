import Boid from "./Boid.js"

export default class Canvas {
    constructor(private _width: number, private _height: number, private _canvasMap: (Boid | null)[][] = []) {
        for (let i = 0; i < this._width; i++) {
            let col = [];
            for (let k = 0; k < this.height; k++) {
                col.push(null);
            }
            this._canvasMap.push(col);
        }
    }

    updateMapLocation(b: Boid): void {
        this._canvasMap[Math.floor(b.location.x)][Math.floor(b.location.y)] = b;
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