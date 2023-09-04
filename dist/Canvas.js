import Boid from "./Boid.js";
import Point from "./Point.js";
class Canvas {
    constructor(_width, _height) {
        this._width = _width + 2 * Canvas.offCanvasBuffer;
        this._height = _height + 2 * Canvas.offCanvasBuffer;
        this._canvasArray = Array.from({ length: this.width }, () => Array(this.height).fill(null));
        this._canvasMap = new Map();
    }
    setBoidLocation(b) {
        this._canvasArray[Math.floor(b.location.x)][Math.floor(b.location.y)] = b;
    }
    clearBoidLocation(b) {
        this._canvasArray[Math.floor(b.location.x)][Math.floor(b.location.y)] = null;
    }
    searchLocationBFS(p, maxDistance) {
        const queue = [{ x: p.x, y: p.y, type: 'o', dist: -1, dir: [0, 0] }];
        let out = [];
        while (queue.length) {
            let curr = queue.shift();
            if (!curr || curr.dist >= maxDistance)
                continue;
            if (!Point.within([curr.x, curr.y], this._width, this._height))
                continue;
            let check = this._canvasArray[curr.x][curr.y];
            if (check) {
                return check;
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
        return null;
    }
    distributeBoids() {
        console.time('distribution');
        const enclosureLen = Boid.params.range.value * Math.cos(Math.PI / 4);
        const x = Math.ceil(this._width / enclosureLen) || 1;
        const y = Math.ceil(this._height / enclosureLen) || 1;
        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                const key = `${i}${j}`;
                this._canvasMap.set(key, []);
            }
        }
        Boid.BoidMap.forEach((v, k) => {
            var _a;
            const xDiv = Math.floor(k.location.x / enclosureLen);
            const yDiv = Math.floor(k.location.y / enclosureLen);
            (_a = this._canvasMap.get(`${xDiv}${yDiv}`)) === null || _a === void 0 ? void 0 : _a.push(k);
        });
        console.timeEnd('distribution');
    }
    get canvasArray() {
        return this._canvasArray;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
}
Canvas.offCanvasBuffer = 100;
export default Canvas;
