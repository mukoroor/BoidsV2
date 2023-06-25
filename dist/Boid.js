import Vector from "./Vector.js";
import Point from "./Point.js";
import Slider from "./Slider.js";
class Boid {
    constructor(_location, _direction, options, _neighbors = new Map()) {
        var _a, _b;
        this._location = _location;
        this._direction = _direction;
        this._neighbors = _neighbors;
        this._color = (_a = options === null || options === void 0 ? void 0 : options.color) !== null && _a !== void 0 ? _a : '';
        if (!((_b = options === null || options === void 0 ? void 0 : options.external) !== null && _b !== void 0 ? _b : true))
            return;
        Boid.BoidMap.set(this, new Vector());
        Boid.canvas.setBoidLocation(this);
    }
    incrementPositon() {
        const normal = this._direction.normalized;
        const speed = Boid.params.speed.value;
        const canvasWidth = Boid.canvas.width;
        const canvasHeight = Boid.canvas.height;
        if (Point.within(this._location, canvasWidth, canvasHeight)) {
            Boid.canvas.clearBoidLocation(this);
        }
        this._location.x = ((this._location.x + speed * normal.x + 100) % (canvasWidth + 200) + (canvasWidth + 200)) % (canvasWidth + 200) - 100;
        this._location.y = ((this._location.y + speed * normal.y + 100) % (canvasHeight + 200) + (canvasHeight + 200)) % (canvasHeight + 200) - 100;
        if (Point.within(this._location, canvasWidth, canvasHeight)) {
            Boid.canvas.setBoidLocation(this);
        }
    }
    findNeighbors() {
        const found = new Map();
        Boid.BoidMap.forEach((v, k) => {
            let dist = Point.distance(k._location, this._location);
            if (k !== this && dist < Boid.params.range.value) {
                found.set(k, dist);
            }
        });
        this._neighbors = found;
    }
    avoidNeighbors() {
        if (!this._neighbors.size)
            return null;
        const avoid = [...this._neighbors.entries()].reduce((a, [b, dist]) => {
            a[0] -= (b._location.x - this._location.x) / (dist * dist);
            a[1] -= (b._location.y - this._location.y) / (dist * dist);
            return a;
        }, [0, 0]);
        const destination = new Point(...avoid);
        return new Vector(destination);
    }
    alignWithNeigbors() {
        if (!this._neighbors.size)
            return null;
        const avgDirection = [...this._neighbors.entries()].reduce((a, [b, dist]) => {
            let normal = b._direction.normalized;
            a[0] += normal.x;
            a[1] += normal.y;
            return a;
        }, [0, 0]);
        const destination = new Point(avgDirection[0] / this._neighbors.size || 0, avgDirection[1] / this._neighbors.size || 0);
        return new Vector(destination);
    }
    flockWithNeigbor() {
        if (!this._neighbors.size)
            return null;
        const avgPos = [...this._neighbors.entries()].reduce((a, [b, dist]) => {
            a[0] += b._location.x;
            a[1] += b._location.y;
            return a;
        }, [0, 0]);
        const destination = new Point(avgPos[0] / this._neighbors.size || 0, avgPos[1] / this._neighbors.size || 0);
        return new Vector(destination, this._location);
    }
    followCursor(cursorLocation) {
        return new Vector(cursorLocation, this._location);
    }
    get location() {
        return this._location;
    }
    get direction() {
        return this._direction;
    }
    get color() {
        return this._color;
    }
    set color(newColor) {
        this._color = newColor;
    }
    set direction(newDirection) {
        this._direction = newDirection;
    }
}
Boid.BoidMap = new Map();
Boid.params = {
    speed: new Slider(0, 20, { step: 0.5, initialValue: 5, name: "speed", unit: "unit(s) / frame" }),
    range: new Slider(0, 1024, { step: 1, initialValue: 128, name: "range", unit: "unit(s)" }),
    agility: new Slider(0, 2, { step: 0.01, initialValue: 0.1, name: "agility / acceleration" }),
    align: new Slider(0, 5, { step: 0.25, initialValue: 1, name: "align  power" }),
    avoid: new Slider(0, 5, { step: 0.25, initialValue: 1, name: "avoid  power" }),
    flock: new Slider(0, 5, { step: 0.25, initialValue: 1, name: "flock  power" }),
    cursor: new Slider(0, 10, { step: 0.25, initialValue: 5, name: "cursor power" })
};
export default Boid;
