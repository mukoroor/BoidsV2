import Vector from "./Vector.js"

export default class Point {

    constructor(
        private _x: number,
        private _y: number) {
    }

    get x() {
        return this._x
    }

    get y() {
        return this._y
    }

    set x(newX: number) {
        this._x = newX
    }

    set y(newY: number) {
        this._y = newY
    }

    static distance(p1: Point, p2: Point): number {
        return (new Vector(p1, p2)).magnitude
    }

    static within(p: Point, maxX: number, maxY: number, minX = 0, minY = 0): boolean {
        return minX <= p.x  && p.x <= maxX &&  minY <= p.y  && p.y <= maxY;
    }
}