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

    toString(): string {
        return this._x + ", " + this._y
    }

    static distance(p1: Point, p2: Point): number {
        return (new Vector(p1, p2)).magnitude
    }

    static within(p: Point | [number, number], maxX: number, maxY: number, minX = 0, minY = 0): boolean {
        if (p instanceof Point) {
            return minX <= p.x  && p.x <= maxX &&  minY <= p.y  && p.y <= maxY;
        }
        return minX <= p[0]  && p[0] < maxX &&  minY <= p[1]  && p[1] < maxY;
    }
}