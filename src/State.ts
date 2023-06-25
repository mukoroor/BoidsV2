import Boid from "./Boid.js"
import Vector from "./Vector.js"
import Point from "./Point.js"
import Canvas from "./Canvas.js"

function updateCursor(e : MouseEvent) {
    const mouseLocation = new Point(e.x - medium.offsetLeft, e.y - medium.offsetTop)
    cursorPos.location.x = medium.width * mouseLocation.x / medium.offsetWidth 
    cursorPos.location.y = medium.height * mouseLocation.y / medium.offsetHeight
}

function drawPreview() {
    if (!contextP) return
    contextP.clearRect(0 , 0, previewCanvas.width, previewCanvas.height)
    data.updateBoid(previewBoid)
    drawBoid(contextP, previewBoid)
}

function start(count: number) {
    if (medium) {
        Boid.BoidMap.clear()
        medium.width = medium.clientWidth * 6
        medium.height = medium.clientHeight * 6
        Boid.canvas = new Canvas(medium.width, medium.height)
    }

    const {length, breadth} = data.getDimesions()
    const color = data.getColor()
    for(let i = 0; i < count; i++) {
        const loc = new Point(Math.random() * ( medium?.width || 0),Math.random() * (medium?.height || 0))
        const d = new Point(Math.random() * 2 - 1, Math.random() * 2 - 1)
        const direc = new Vector(d)
        const boid = new Boid(loc, direc, {length, breadth})
        boid.color = color
    }

    if (medium?.getContext("2d")) {
        context = medium.getContext("2d");
        if (context) window.requestAnimationFrame(draw)
    }
    
}

function draw() {
    context?.clearRect(0, 0, medium?.width || 0, medium?.height || 0)
    Boid.BoidMap.forEach( (v, k) => {
        if (context)
        drawBoid(context, k)
        k.findNeighbors()
        // k.findNeigborsBFS()
    })
    let s = Boid.params.agility.value
    Boid.BoidMap.forEach((val, key, t) => {
        let v0 = key.alignWithNeigbors()?.normalized
        let v1 = key.avoidNeighbors()?.normalized
        let v2 = key.flockWithNeigbor()?.normalized
        let v3;
        if (cursorPos.valid() && Point.distance(cursorPos.location, key.location) < Boid.params.range.value) {
            v3 = key.followCursor(cursorPos.location).normalized
        }
        let og = key.direction.normalized


        let al = Boid.params.align.value
        let av = Boid.params.avoid.value
        let fl = Boid.params.flock.value
        let cu = Boid.params.cursor.value
        let dest = new Point(
            
            og.x 
            + al * s * (v0?.x ?? 0) 
            + av * s * (v1?.x ?? 0) 
            + fl * s * (v2?.x ?? 0) 
            + cu * s * (v3?.x ?? 0),
            
            og.y 
            + al * s * (v0?.y ?? 0) 
            + av * s * (v1?.y ?? 0) 
            + fl * s * (v2?.y ?? 0) 
            + cu * s * (v3?.y ?? 0)
        )

        t.set(key, new Vector(dest))
    })
    Boid.BoidMap.forEach((v, k) => {
        k.direction = v
        k.incrementPositon()
    })
    window.requestAnimationFrame(draw)
}

function drawBoid(context: CanvasRenderingContext2D, boid: Boid) {
    if (!context) return
    const {length , breadth} = boid.dimensions
    context.save();
    context.translate(boid.location.x, boid.location.y);
    context.rotate(boid.direction.angle);
    context.beginPath();
    if (selectedMode == Mode.Triangle) {
        context.lineTo(-length /2, -breadth / 2);
        context.lineTo(length / 2, 0);
        context.lineTo(-length / 2, breadth / 2);
    } else if (selectedMode == Mode.Arrow) {
        context.moveTo(0, 0);
        context.lineTo(-length / 2, -breadth / 2);
        context.lineTo(length / 2, 0);
        context.lineTo(-length / 2, breadth / 2);
    } else if (selectedMode == Mode.Circle) {
        context.ellipse(0, 0, length / 2, breadth / 2, 0, 0, 2 * Math.PI);
    } else {
        context.roundRect(-length / 2, -breadth / 2, length, breadth, Math.min(length, breadth) / 20)
    }
    context.closePath();
    context.fillStyle = boid.color || 'black'
    context.fill();
    context.stroke();
    context.restore();
}

const medium = document.getElementById("medium") as HTMLCanvasElement
let context: CanvasRenderingContext2D | null;
const previewCanvas = document.querySelector(".preview canvas") as HTMLCanvasElement
let contextP = previewCanvas?.getContext("2d")

const select = document.querySelector(".select")
const preview = document.querySelector(".preview")
const options = select?.children || []

const data = {
    color: document.getElementById("color") as HTMLInputElement,
    length:  document.getElementById("length") as HTMLInputElement,
    breadth: document.getElementById("breadth") as HTMLInputElement,

    getDimesions(): {length: number, breadth: number} {
        return {length: +data.length.value, breadth: +data.breadth.value}
    },

    getColor(): string {
        return data.color.value
    },

    updateBoid(b : Boid): void {
        b.dimensions = this.getDimesions()
        b.color = this.getColor()
    }
}

enum Mode {Triangle, Arrow, Circle, Square}
let selectedMode = Mode.Triangle

const previewBoid = new Boid(new Point(previewCanvas.width / 2, previewCanvas.height / 2), new Vector(new Point(0, -1)), 
    data.getDimesions(), {external: false})
let curr: Element;

const cursorPos = {location: new Point(-1, -1), valid(): boolean {
    return this.location.x >= 0 && this.location.y >= 0
} }

Object.keys(Boid.params).forEach(e => {
    preview?.insertBefore(Boid.params[e].container, preview.lastElementChild)
    Boid.params[e].initThumb()
})

medium.addEventListener("mousedown", (e) => {
    const clickedBoid = Boid.canvas?.searchLocationBFS(cursorPos.location, 100)
    if (!clickedBoid) return
    data.updateBoid(clickedBoid)
})

medium.addEventListener("mousemove", updateCursor)

for (const option of options) {
    option.addEventListener("click", () => {
        curr?.classList.toggle("clicked")
        curr = option
        curr?.classList.toggle("clicked")
        selectedMode = +(option?.getAttribute("mode") ?? 0)
        window.requestAnimationFrame(drawPreview)
    })
}

(select?.firstElementChild as HTMLButtonElement).click()

document.querySelectorAll(".preview input").forEach(e => {
    e.addEventListener("input", () => {
        window.requestAnimationFrame(drawPreview)
    })
})

document.getElementById("submit")?.addEventListener("click", () => {
    start(+(document.getElementById("count") as HTMLInputElement)?.value)
})



const body  = document.querySelector("body")
document.querySelector(".mode")?.addEventListener("click", () => {
    body?.classList.toggle("dark")
    body?.classList.toggle("light")
})