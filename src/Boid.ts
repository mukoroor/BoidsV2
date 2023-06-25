import Vector from "./Vector.js"
import Point from "./Point.js";
import Canvas from "./Canvas.js";
import Slider from "./Slider.js";

export default class Boid {
    
    private _color: string
    static canvas: Canvas;
    static BoidMap: Map<Boid, Vector> = new Map();
    static params: {[key: string]: Slider} = {
        speed: new Slider(0 , 20, {step: 0.5, initialValue: 5, name: "speed", unit: "unit(s) / frame"}),
        range: new Slider(0, 1024, {step: 1, initialValue: 128, name: "range", unit: "unit(s)"}),
        agility: new Slider(0, 2, {step: 0.01, initialValue: 0.1, name: "agility / acceleration"}),
        align: new Slider(0, 5, {step: 0.25, initialValue: 1, name: "align  power"}),
        avoid: new Slider(0, 5, {step: 0.25, initialValue: 1, name: "avoid  power"}),
        flock: new Slider(0, 5, {step: 0.25, initialValue: 1, name: "flock  power"}),
        cursor: new Slider(0, 10, {step: 0.25, initialValue: 5, name: "cursor power"})
    }

    constructor(
        private _location: Point,
        private _direction: Vector,
        options?: {color?: string, external?: false},
        private _neighbors: Map<Boid, number> = new Map()) {
            this._color = options?.color ?? ''
            if (!(options?.external ?? true)) return
            Boid.BoidMap.set(this, new Vector())
            Boid.canvas.setBoidLocation(this)
    }

    
    incrementPositon(): void {
        const normal = this._direction.normalized;
        const speed = Boid.params.speed.value;
        const canvasWidth = Boid.canvas.width;
        const canvasHeight = Boid.canvas.height;
        if (Point.within(this._location, canvasWidth, canvasHeight)) {
            Boid.canvas.clearBoidLocation(this)
        }
        this._location.x = ((this._location.x + speed * normal.x + 100) % (canvasWidth + 200) + (canvasWidth + 200)) % (canvasWidth + 200) - 100;
        this._location.y = ((this._location.y + speed * normal.y + 100) % (canvasHeight + 200) + (canvasHeight + 200)) % (canvasHeight + 200) - 100;

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

    avoidNeighbors(): Vector | null {
        if (!this._neighbors.size) return null
        const avoid: [number, number] = [...this._neighbors.entries()].reduce((a, [b, dist]) => {
            a[0] -= (b._location.x - this._location.x) / (dist * dist); 
            a[1] -= (b._location.y - this._location.y) / (dist * dist);
            return a 
        }, [0, 0])
        const destination = new Point(...avoid);
        return new Vector(destination)
    }

    alignWithNeigbors(): Vector | null {
        if (!this._neighbors.size) return null
        const avgDirection: [number, number] = [...this._neighbors.entries()].reduce((a, [b, dist]) => {
            let normal = b._direction.normalized
            a[0] += normal.x; 
            a[1] += normal.y;
            return a
        }, [0, 0])
        const destination = new Point(avgDirection[0] / this._neighbors.size || 0, avgDirection[1] / this._neighbors.size || 0);
        return new Vector(destination)
    }

    flockWithNeigbor(): Vector | null {
        if (!this._neighbors.size) return null
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

    get color(): string {
        return this._color
    }

    set color(newColor: string) {
        this._color = newColor
    }

    set direction(newDirection: Vector) {
        this._direction = newDirection
    }
}