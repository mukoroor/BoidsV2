import Vector from "./Vector.js";
import Point from "./Point.js";
import Slider from "./Slider.js";
class Boid {
    constructor(_location, _direction, options, _neighbors = new Map()) {
        var _a;
        this._location = _location;
        this._direction = _direction;
        this._neighbors = _neighbors;
        if (!((_a = options === null || options === void 0 ? void 0 : options.external) !== null && _a !== void 0 ? _a : true))
            return;
        Boid.BoidMap.set(this, new Vector());
        Boid.canvas.setBoidLocation(this);
    }
    incrementPositon() {
        const normal = this._direction.normalized;
        const speed = Boid.params.speed.value;
        const canvasWidth = Boid.canvas.width;
        const canvasHeight = Boid.canvas.height;
        // this._location.x += speed * normal.x;
        // if (this.location.x >= Boid.canvas.width + 100) this._location.x = -100;
        // else if (this.location.x <=  -100) this._location.x = Boid.canvas.width + 100;
        // this._location.y += speed * normal.y;
        // if (this.location.y >= Boid.canvas.height + 100) this._location.y = -100;
        // else if (this.location.y <= -100) this._location.y = Boid.canvas.height + 100;
        if (Point.within(this._location, canvasWidth, canvasHeight)) {
            Boid.canvas.clearBoidLocation(this);
        }
        this._location.x = ((this._location.x + speed * normal.x + 100) % (canvasWidth + 200) + (canvasWidth + 200)) % (canvasWidth + 200) - 100;
        this._location.y = ((this._location.y + speed * normal.y + 100) % (canvasHeight + 200) + (canvasHeight + 200)) % (canvasHeight + 200) - 100;
        // this._location.y = (this._location.y + speed * normal.y + 100) % (canvasHeight + 200) - 100;
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
        const avoid = [...this._neighbors.entries()].reduce((a, [b, dist]) => {
            a[0] -= (b._location.x - this._location.x) / (dist * dist);
            a[1] -= (b._location.y - this._location.y) / (dist * dist);
            return a;
        }, [0, 0]);
        const destination = new Point(...avoid);
        return new Vector(destination);
    }
    alignWithNeigbors() {
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
    set direction(newDirection) {
        this._direction = newDirection;
    }
}
Boid.BoidMap = new Map();
Boid.params = {
    speed: new Slider(0, 20, { step: 0.5, initialValue: 1, name: "speed", unit: "px/s" }),
    range: new Slider(0, 1024, { step: 1, initialValue: 28, name: "range", unit: "px" }),
    sharpness: new Slider(0, 2, { step: 0.01, initialValue: 0.1, name: "sharpness" }),
    align: new Slider(0, 5, { step: 0.25, initialValue: 1, name: "align" }),
    avoid: new Slider(0, 5, { step: 0.25, initialValue: 1, name: "avoid" }),
    flock: new Slider(0, 5, { step: 0.25, initialValue: 1, name: "flock" })
};
export default Boid;
