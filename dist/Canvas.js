export default class Canvas {
    constructor(_width, _height) {
        this._width = _width;
        this._height = _height;
        this._canvasMap = Array(this.width).fill(Array(this.height).fill(null));
    }
    setBoidLocation(b) {
        this._canvasMap[Math.floor(b.location.x)][Math.floor(b.location.y)] = b;
    }
    clearBoidLocation(b) {
        this._canvasMap[Math.floor(b.location.x)][Math.floor(b.location.y)] = null;
    }
    get canvasMap() {
        return this._canvasMap;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
}
