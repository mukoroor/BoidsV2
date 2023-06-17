import Point from "./Point.js";

export default class Vector {

    constructor(
        private _destination: Point = new Point(0, 0),
        private _origin: Point = new Point(0, 0)) {
    }
    

    get magnitude(): number {
        const delX = this.xDisplacement
        const delY = this.yDisplacement
        return Math.sqrt(delX * delX + delY * delY);
    }

    get angle(): number {
        const delX = this.xDisplacement
        const delY = this.yDisplacement
        return Math.atan2(delY, delX);
    }

    get xDisplacement(): number {
        return this._destination.x - this._origin.x;
    }

    get yDisplacement(): number {
        return this._destination.y - this._origin.y;
    }

    get normalized(): {x: number, y: number} {
        const mag = this.magnitude
        return {x: this.xDisplacement / mag || 0, y: this.yDisplacement / mag || 0};
    }
}