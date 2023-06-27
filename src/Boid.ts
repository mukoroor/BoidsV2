import Vector from "./Vector.js"
import Point from "./Point.js";
import Canvas from "./Canvas.js";
import Slider from "./Slider.js";

export default class Boid {
    private _color: string = 'black'
    private _name: string = 'N/A'
    private _neighbors: Map<Boid, number> = new Map()
    static canvas: Canvas;
    static BoidMap: Map<Boid, Vector> = new Map();
    static params: {[key: string]: Slider} = {
        speed: new Slider(0 , 20, {step: 0.5, initialValue: 5, name: "speed", unit: "unit(s) / frame"}),
        range: new Slider(0, 1024, {step: 1, initialValue: 256, name: "range", unit: "unit(s)"}),
        cone: new Slider(0, 180, {step: 1, initialValue: 20, name: "visual cone", unit: "°"}),
        agility: new Slider(0, 2, {step: 0.01, initialValue: 0.1, name: "agility / acceleration"}),
        align: new Slider(0, 5, {step: 0.05, initialValue: 1, name: "align  power"}),
        avoid: new Slider(0, 5, {step: 0.05, initialValue: 1, name: "avoid  power"}),
        flock: new Slider(0, 5, {step: 0.05, initialValue: 1, name: "flock  power"}),
        cursor: new Slider(0, 10, {step: 0.05, initialValue: 5, name: "cursor power"})
    }

    constructor(
        private _location: Point,
        private _direction: Vector,
        private _dimensions: {length: number, breadth: number},
        color?: string) {
            if (color) this._color = color
    }

    addToCanvas() {
        Boid.BoidMap.set(this, new Vector())
        Boid.canvas.setBoidLocation(this)
    }

    
    incrementPositon(): void {
        const normal = this._direction.normalized;
        const speed = Boid.params.speed.value;
        let canvasWidth = Boid.canvas.width;
        let canvasHeight = Boid.canvas.height;
        if (Point.within(this._location, canvasWidth, canvasHeight)) {
            Boid.canvas.clearBoidLocation(this)
        }
        const offset = Canvas.offCanvasBuffer
        canvasHeight += offset
        canvasWidth += offset
        this._location.x = ((this._location.x + speed * normal.x + offset) % (canvasWidth) + (canvasWidth)) % (canvasWidth) - offset;
        this._location.y = ((this._location.y + speed * normal.y + offset) % (canvasHeight) + (canvasHeight)) % (canvasHeight) - offset;

        if (Point.within(this._location, canvasWidth, canvasHeight)) {
            Boid.canvas.setBoidLocation(this)
        }
    }

    findNeighbors(): void {
        const found: Map<Boid, number> = new Map()
        const maxDistance = Boid.params.range.value
        Boid.BoidMap.forEach((v, k) => {
            if (k === this) return
            const relativeAngle = k.direction.angle - new Vector(k.location, this.location).angle
            let dist = Point.distance(k._location, this._location)
        if (dist < maxDistance && Math.abs(relativeAngle) <= (Boid.params.cone.value * Math.PI / 180) ) {
                found.set(k, dist)
            }
        })
        this._neighbors = found
    }

    findNeigborsBFS(): Boid[] {
        type BFSEntry = {x: number, y:number, type: 'o' | 'c' | 's' | 'e', dist: number, dir: [number, number]}
        const queue: BFSEntry[] = [{x: Math.floor(this._location.x), y: Math.floor(this._location.y), type: 'o', dist: -1, dir: [0, 0]}]

        let out = []
        while(queue.length) {
            let curr = queue.shift()
            if (!curr || curr.dist >= Boid.params.range.value) continue
            if (!Point.within([curr.x, curr.y], Boid.canvas.width, Boid.canvas.height)) continue
            let check = Boid.canvas.canvasMap[curr.x][curr.y]
            if (check) {
                out.push(check)
            }
            curr.dist++
            if (curr.type == 'e') {
                continue
            } else if (curr.type == 'c') {
                curr.x += curr.dir[0]
                curr.y += curr.dir[1]
                for (let i = 1; i < curr.dist + 1; i++) {
                    queue.push({x: curr.x - i * curr.dir[0], y: curr.y, type: 'e', dist: curr.dist, dir: curr.dir})
                    queue.push({x: curr.x, y: curr.y - i * curr.dir[1], type: 'e', dist: curr.dist, dir: curr.dir})
                }
                queue.push({x: curr.x, y: curr.y, type: curr.type, dist: curr.dist, dir: curr.dir})
            } else if (curr.type == 's') {
                queue.push({x: curr.x + curr.dir[0], y: curr.y + curr.dir[1], type: curr.type, dist: curr.dist, dir: curr.dir})
            } else {
                queue.push({x: curr.x - 1, y: curr.y, type: 's', dist: curr.dist, dir: [-1, 0]})
                queue.push({x: curr.x + 1, y: curr.y, type: 's', dist: curr.dist, dir: [1, 0]})
                queue.push({x: curr.x, y: curr.y + 1, type: 's', dist: curr.dist, dir: [0, 1]})
                queue.push({x: curr.x, y: curr.y - 1, type: 's', dist: curr.dist, dir: [0, -1]})
                queue.push({x: curr.x - 1, y: curr.y - 1, type: 'c', dist: curr.dist, dir: [-1, -1]})
                queue.push({x: curr.x - 1, y: curr.y + 1, type: 'c', dist: curr.dist, dir: [-1, 1]})
                queue.push({x: curr.x + 1, y: curr.y - 1, type: 'c', dist: curr.dist, dir: [1, -1]})
                queue.push({x: curr.x + 1, y: curr.y + 1, type: 'c', dist: curr.dist, dir: [1, 1]})
            }
        }
        return out
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

    get dimensions(): {length: number, breadth: number} {
        return this._dimensions
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

    get name(): string {
        return this._name
    }

    set color(newColor: string) {
        this._color = newColor
    }

    set name(newName: string) {
        this._name = newName
    }

    set dimensions(newDimensions: {length: number, breadth: number}) {
        this._dimensions = {...newDimensions}
    }

    set direction(newDirection: Vector) {
        this._direction = newDirection
    }

    toString(): string {
        return `Name: ${this._name}\nColor: ${this._color}\nLocation: ${this._location.toString()}\nDirection: ${this._direction.toString()}\nDimesions: ${this._dimensions.length}, ${this._dimensions.breadth}`
    }
}