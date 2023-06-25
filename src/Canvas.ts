import Boid from "./Boid.js"
import Point from "./Point.js";

export default class Canvas {
    private _canvasMap: (Boid | null)[][]

    constructor(private _width: number, private _height: number) {
        this._canvasMap = Array.from({ length: this.width }, () =>
            Array(this.height).fill(null)
        )
    }

    setBoidLocation(b: Boid): void {
        this._canvasMap[Math.floor(b.location.x)][Math.floor(b.location.y)] = b;
    }

    clearBoidLocation(b: Boid): void {
        this._canvasMap[Math.floor(b.location.x)][Math.floor(b.location.y)] = null;
    }

    searchLocationBFS(p: Point, maxDistance: number): Boid | null {
        type BFSEntry = {x: number, y:number, type: 'o' | 'c' | 's' | 'e', dist: number, dir: [number, number]}
        const queue: BFSEntry[] = [{x: p.x, y: p.y, type: 'o', dist: -1, dir: [0, 0]}]

        let out = []
        while(queue.length) {
            let curr = queue.shift()
            if (!curr || curr.dist >= maxDistance) continue
            if (!Point.within([curr.x, curr.y], this._width, this._height)) continue
            let check = this._canvasMap[curr.x][curr.y]
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

    get canvasMap(): (Boid | null)[][] {
        return this._canvasMap;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

}