export default class Canvas {
    constructor(private _width: number, private _height: number) {
    }

    get width(): number {
        return this._width
    }

    get height(): number {
        return this._height
    }

}