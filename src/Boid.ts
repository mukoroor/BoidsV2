import Vector from "./Vector.js"
import Point from "./Point.js";
import Canvas from "./Canvas.js";

export default class Boid {
    
    static canvas: Canvas;
    static BoidMap: Map<Boid, Vector> = new Map();
    static params = new Map([
        ["range", 256],
        ["speed", 1],
        ["avoid", 1],
        ["align", 1],
        ["flock", 1],
        ["sharpness", 1]])

    constructor(
        private _location: Point,
        private _direction: Vector,
        private _color?: string,
        private _neighbors: Map<Boid, number> = new Map()) {
            Boid.BoidMap.set(this, new Vector())
            Boid.canvas.updateMapLocation(this)
    }

    
    incrementPositon(): void {
        const normal = this._direction.normalized;
        const speed = Boid.params.get("speed") || 0
        const canvasWidth = Boid.canvas.width;
        const canvasHeight = Boid.canvas.height;
        // this._location.x += speed * normal.x;
        // if (this.location.x >= Boid.canvas.width + 100) this._location.x = -100
        // else if (this.location.x <=  -100) this._location.x = Boid.canvas.width + 100
        // this._location.y += speed * normal.y;
        // if (this.location.y >= Boid.canvas.height + 100) this._location.y = -100
        // else if (this.location.y <= -100) this._location.y = Boid.canvas.height + 100
        this._location.x = (this._location.x + speed * normal.x + 100) % (canvasWidth + 200) - 100;
        this._location.y = (this._location.y + speed * normal.y + 100) % (canvasHeight + 200) - 100;

        if (Point.within(this._location, canvasWidth, canvasHeight)) {
            Boid.canvas.updateMapLocation(this)
        }
    }

    findNeighbors(): void {
        const found: Map<Boid, number> = new Map()
        Boid.BoidMap.forEach((v, k) => {
            let dist = Point.distance(k._location, this._location)
            if (k !== this && dist < (Boid.params.get("range") || 0)) {
                found.set(k, dist)
            }
        })
        this._neighbors = found
    }

    avoidNeighbors(): Vector {
        const avoid: [number, number] = [...this._neighbors.entries()].reduce((a, [b, dist]) => {
            a[0] -= (b._location.x - this._location.x) / (dist * dist); 
            a[1] -= (b._location.y - this._location.y) / (dist * dist);
            return a 
        }, [0, 0])
        const destination = new Point(...avoid);
        return new Vector(destination)
    }

    alignWithNeigbors(): Vector {
        const avgDirection: [number, number] = [...this._neighbors.entries()].reduce((a, [b, dist]) => {
            let normal = b._direction.normalized
            a[0] += normal.x; 
            a[1] += normal.y;
            return a 
        }, [0, 0])
        const destination = new Point(avgDirection[0] / this._neighbors.size || 0, avgDirection[1] / this._neighbors.size || 0);
        return new Vector(destination)
    }

    flockWithNeigbor(): Vector {
        const avgPos: [number, number] = [...this._neighbors.entries()].reduce((a, [b, dist]) => {
            a[0] += b._location.x; 
            a[1] += b._location.y;
            return a 
        }, [0, 0])
        const destination = new Point(avgPos[0] / this._neighbors.size || 0, avgPos[1] / this._neighbors.size || 0);
        return new Vector(destination, this._location)
    }

    followCursor(cursorLocation: Point): Vector {
        return new Vector(cursorLocation, this._location)
    }

    get location(): Point {
        return this._location
    }

    get direction(): Vector {
        return this._direction
    }

    set direction(newDirection: Vector) {
        this._direction = newDirection
    }
}