import Vector from "./Vector.js";
export default class Point {
    constructor(_x, _y) {
        this._x = _x;
        this._y = _y;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    set x(newX) {
        this._x = newX;
    }
    set y(newY) {
        this._y = newY;
    }
    static distance(p1, p2) {
        return (new Vector(p1, p2)).magnitude;
    }
    static within(p, maxX, maxY, minX = 0, minY = 0) {
        if (p instanceof Point) {
            return minX <= p.x && p.x <= maxX && minY <= p.y && p.y <= maxY;
        }
        return minX <= p[0] && p[0] <= maxX && minY <= p[1] && p[1] <= maxY;
    }
}
