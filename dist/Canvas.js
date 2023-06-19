export default class Canvas {
    constructor(_width, _height, _canvasMap = []) {
        this._width = _width;
        this._height = _height;
        this._canvasMap = _canvasMap;
        for (let i = 0; i < this._width; i++) {
            let col = [];
            for (let k = 0; k < this.height; k++) {
                col.push(null);
            }
            this._canvasMap.push(col);
        }
    }
    updateMapLocation(b) {
        this._canvasMap[Math.floor(b.location.x)][Math.floor(b.location.y)] = b;
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
