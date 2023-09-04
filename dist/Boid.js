import Vector from "./Vector.js";
import Point from "./Point.js";
import Slider from "./Slider.js";
class Boid {
    constructor(_location, _direction, _dimensions, color) {
        this._location = _location;
        this._direction = _direction;
        this._dimensions = _dimensions;
        this._color = 'black';
        this._name = 'N/A';
        this._neighbors = new Map();
        if (color)
            this._color = color;
    }
    addToCanvas() {
        Boid.BoidMap.set(this, new Vector());
        Boid.canvas.setBoidLocation(this);
    }
    incrementPositon() {
        // console.time("o")
        const normal = this._direction.normalized;
        const speed = Boid.params.speed.value;
        Boid.canvas.clearBoidLocation(this);
        this._location.x = ((this._location.x + speed * normal.x) % Boid.canvas.width + Boid.canvas.width) % Boid.canvas.width;
        this._location.y = ((this._location.y + speed * normal.y) % Boid.canvas.height + Boid.canvas.height) % Boid.canvas.height;
        Boid.canvas.setBoidLocation(this);
        // console.timeEnd("o")
    }
    findNeighbors() {
        const found = new Map();
        const maxDistance = Boid.params.range.value;
        Boid.BoidMap.forEach((v, k) => {
            if (k === this)
                return;
            const relativeAngle = k.direction.angle - new Vector(k.location, this.location).angle;
            let dist = Point.distance(k._location, this._location);
            if (dist < maxDistance && Math.abs(relativeAngle) <= (Boid.params.cone.value * Math.PI / 180)) {
                found.set(k, dist);
            }
        });
        this._neighbors = found;
    }
    findNeigborsBFS() {
        const queue = [{ x: Math.floor(this._location.x), y: Math.floor(this._location.y), type: 'o', dist: -1, dir: [0, 0] }];
        let out = [];
        while (queue.length) {
            let curr = queue.shift();
            if (!curr || curr.dist >= Boid.params.range.value)
                continue;
            if (!Point.within([curr.x, curr.y], Boid.canvas.width, Boid.canvas.height))
                continue;
            let check = Boid.canvas.canvasArray[curr.x][curr.y];
            if (check) {
                out.push(check);
            }
            curr.dist++;
            if (curr.type == 'e') {
                continue;
            }
            else if (curr.type == 'c') {
                curr.x += curr.dir[0];
                curr.y += curr.dir[1];
                for (let i = 1; i < curr.dist + 1; i++) {
                    queue.push({ x: curr.x - i * curr.dir[0], y: curr.y, type: 'e', dist: curr.dist, dir: curr.dir });
                    queue.push({ x: curr.x, y: curr.y - i * curr.dir[1], type: 'e', dist: curr.dist, dir: curr.dir });
                }
                queue.push({ x: curr.x, y: curr.y, type: curr.type, dist: curr.dist, dir: curr.dir });
            }
            else if (curr.type == 's') {
                queue.push({ x: curr.x + curr.dir[0], y: curr.y + curr.dir[1], type: curr.type, dist: curr.dist, dir: curr.dir });
            }
            else {
                queue.push({ x: curr.x - 1, y: curr.y, type: 's', dist: curr.dist, dir: [-1, 0] });
                queue.push({ x: curr.x + 1, y: curr.y, type: 's', dist: curr.dist, dir: [1, 0] });
                queue.push({ x: curr.x, y: curr.y + 1, type: 's', dist: curr.dist, dir: [0, 1] });
                queue.push({ x: curr.x, y: curr.y - 1, type: 's', dist: curr.dist, dir: [0, -1] });
                queue.push({ x: curr.x - 1, y: curr.y - 1, type: 'c', dist: curr.dist, dir: [-1, -1] });
                queue.push({ x: curr.x - 1, y: curr.y + 1, type: 'c', dist: curr.dist, dir: [-1, 1] });
                queue.push({ x: curr.x + 1, y: curr.y - 1, type: 'c', dist: curr.dist, dir: [1, -1] });
                queue.push({ x: curr.x + 1, y: curr.y + 1, type: 'c', dist: curr.dist, dir: [1, 1] });
            }
        }
        return out;
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
    get dimensions() {
        return this._dimensions;
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
    get name() {
        return this._name;
    }
    set color(newColor) {
        this._color = newColor;
    }
    set name(newName) {
        this._name = newName;
    }
    set dimensions(newDimensions) {
        this._dimensions = Object.assign({}, newDimensions);
    }
    set direction(newDirection) {
        this._direction = newDirection;
    }
    toString() {
        return `Name: ${this._name}\nColor: ${this._color}\nLocation: ${this._location.toString()}\nDirection: ${this._direction.toString()}\nDimesions: ${this._dimensions.length}, ${this._dimensions.breadth}`;
    }
}
Boid.BoidMap = new Map();
Boid.params = {
    speed: new Slider(0, 20, { step: 0.5, initialValue: 5, name: "speed", unit: "unit(s) / frame" }),
    range: new Slider(0, 6400, { step: 1, initialValue: 256, name: "range", unit: "unit(s)" }),
    cone: new Slider(0, 180, { step: 1, initialValue: 20, name: "visual cone", unit: "°" }),
    agility: new Slider(0, 2, { step: 0.01, initialValue: 0.1, name: "agility / acceleration" }),
    align: new Slider(0, 5, { step: 0.05, initialValue: 1, name: "align  power" }),
    avoid: new Slider(0, 5, { step: 0.05, initialValue: 1, name: "avoid  power" }),
    flock: new Slider(0, 5, { step: 0.05, initialValue: 1, name: "flock  power" }),
    cursor: new Slider(0, 10, { step: 0.05, initialValue: 5, name: "cursor power" })
};
export default Boid;
