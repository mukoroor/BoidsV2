import Vector from "./Vector.js"
import Point from "./Point.js";
import Canvas from "./Canvas.js";
import Slider from "./Slider.js";

export default class Boid {
    

    static canvas: Canvas;
    static BoidMap: Map<Boid, Vector> = new Map();
    static params: {[key: string]: Slider} = {
        speed: new Slider(0 , 20, {step: 0.5, initialValue: 1, name: "speed", unit: "px/s"}),
        range: new Slider(0, 1024, {step: 1, initialValue: 28, name: "range", unit: "px"}),
        sharpness: new Slider(0, 2, {step: 0.01, initialValue: 0.1, name: "sharpness"}),
        align: new Slider(0, 5, {step: 0.25, initialValue: 1, name: "align"}),
        avoid: new Slider(0, 5, {step: 0.25, initialValue: 1, name: "avoid"}),
        flock: new Slider(0, 5, {step: 0.25, initialValue: 1, name: "flock"})
    }

    constructor(
        private _location: Point,
        private _direction: Vector,
        options?: {color?: string, external?: boolean},
        private _neighbors: Map<Boid, number> = new Map()) {
            if (!(options?.external ?? true)) return
            Boid.BoidMap.set(this, new Vector())
            Boid.canvas.setBoidLocation(this)
    }

    
    incrementPositon(): void {
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
            Boid.canvas.clearBoidLocation(this)
        }
        this._location.x = ((this._location.x + speed * normal.x + 100) % (canvasWidth + 200) + (canvasWidth + 200)) % (canvasWidth + 200) - 100;
        this._location.y = ((this._location.y + speed * normal.y + 100) % (canvasHeight + 200) + (canvasHeight + 200)) % (canvasHeight + 200) - 100;
        // this._location.y = (this._location.y + speed * normal.y + 100) % (canvasHeight + 200) - 100;

        if (Point.within(this._location, canvasWidth, canvasHeight)) {
            Boid.canvas.setBoidLocation(this)
        }
    }

    findNeighbors(): void {
        const found: Map<Boid, number> = new Map()
        Boid.BoidMap.forEach((v, k) => {
            let dist = Point.distance(k._location, this._location)
            if (k !== this && dist < Boid.params.range.value) {
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