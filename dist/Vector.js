import Point from "./Point.js";
export default class Vector {
    constructor(_destination = new Point(0, 0), _origin = new Point(0, 0)) {
        this._destination = _destination;
        this._origin = _origin;
    }
    get magnitude() {
        const delX = this.xDisplacement;
        const delY = this.yDisplacement;
        return Math.sqrt(delX * delX + delY * delY);
    }
    get angle() {
        const delX = this.xDisplacement;
        const delY = this.yDisplacement;
        return Math.atan2(delY, delX);
    }
    get xDisplacement() {
        return this._destination.x - this._origin.x;
    }
    get yDisplacement() {
        return this._destination.y - this._origin.y;
    }
    get normalized() {
        const mag = this.magnitude;
        return { x: this.xDisplacement / mag || 0, y: this.yDisplacement / mag || 0 };
    }
    toString() {
        return this.xDisplacement + ", " + this.yDisplacement;
    }
}
