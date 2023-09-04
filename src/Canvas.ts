import Boid from "./Boid.js"
import Point from "./Point.js";

export default class Canvas {
    private _canvasArray: (Boid | null)[][]
    private _canvasMap: Map<string, Boid[]>
    private _width: number
    private _height: number
    static offCanvasBuffer = 100

    constructor(_width: number,_height: number) {
        this._width = _width + 2 * Canvas.offCanvasBuffer
        this._height = _height + 2 * Canvas.offCanvasBuffer
        this._canvasArray = Array.from({ length: this.width }, () =>
            Array(this.height).fill(null)
        )
        this._canvasMap = new Map();
    }

    setBoidLocation(b: Boid): void {
        this._canvasArray[Math.floor(b.location.x)][Math.floor(b.location.y)] = b;
    }

    clearBoidLocation(b: Boid): void {
        this._canvasArray[Math.floor(b.location.x)][Math.floor(b.location.y)] = null;
    }

    searchLocationBFS(p: Point, maxDistance: number): Boid | null {
        type BFSEntry = {x: number, y:number, type: 'o' | 'c' | 's' | 'e', dist: number, dir: [number, number]}
        const queue: BFSEntry[] = [{x: p.x, y: p.y, type: 'o', dist: -1, dir: [0, 0]}]

        let out = []
        while(queue.length) {
            let curr = queue.shift()
            if (!curr || curr.dist >= maxDistance) continue
            if (!Point.within([curr.x, curr.y], this._width, this._height)) continue
            let check = this._canvasArray[curr.x][curr.y]
            if (check) {
                return check
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
        return null
    }

    distributeBoids(divisions: number): void {

        Boid.BoidMap.forEach(b => {

        });
    }

    get canvasArray(): (Boid | null)[][] {
        return this._canvasArray;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

}