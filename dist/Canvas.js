export default class Canvas {
    constructor(_width, _height) {
        this._width = _width;
        this._height = _height;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
}
