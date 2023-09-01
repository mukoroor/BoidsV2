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
    contextP.save()
    contextP.translate(previewBoid.location.x, previewBoid.location.y)
    contextP.rotate(-Math.PI / 2)
    contextP.beginPath();
    const radian = (Boid.params.cone.value * Math.PI / 180)
    contextP.arc(0, 0, Boid.params.range.value, -radian, radian);
    contextP.lineTo(0, 0)
    contextP.closePath()
    contextP.fillStyle = "rgba(100, 150, 255, 0.25)"
    contextP.fill()
    contextP.restore()
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
        new Boid(loc, direc, {length, breadth}, color).addToCanvas()
    }

    pausePlay = boidClick()
    if (context = medium.getContext("2d")) {
        window.cancelAnimationFrame(currFrame)
        currFrame = window.requestAnimationFrame(draw)
    } 
}
function draw() {
    console.time('overall')
    
    pausable = false
    context?.clearRect(0, 0, medium?.width || 0, medium?.height || 0)
    console.time('neigh')
    Boid.BoidMap.forEach( (v, k) => {
        k.findNeighbors()
    })
    console.timeEnd('neigh')
    let s = Boid.params.agility.value
    console.time('vect')
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
    console.timeEnd('vect')
    out = [];
    console.time('update')
    Boid.BoidMap.forEach((v, k) => {
        k.direction = v
        k.incrementPositon()
        if (context)
        drawBoid(context, k)
        out.push((2 * k.location.x / Boid.canvas.width) - 1, (2 * k.location.y / Boid.canvas.height) - 1);
    })
    console.timeEnd('update')
    // console.log(out)
    pausable = true
    console.timeEnd('overall')
    currFrame = window.requestAnimationFrame(draw)
}

function drawStatic(boidsSet: Set<Boid>) {
    pausable = false
    context?.clearRect(0, 0, medium?.width || 0, medium?.height || 0)
    Boid.BoidMap.forEach((v, k) => {
        if (!context) return 
        if (boidsSet.has(k)) data.updateBoid(k)
        drawBoid(context, k)
    })
    pausable = true
    pauseFrame = window.requestAnimationFrame(() => drawStatic(boidsSet))
}

function drawBoid(context: CanvasRenderingContext2D, boid: Boid) {
    if (!context) return
    if (currMode == MODE.GLOBAL) {
        data.updateBoid(boid)
    } 
    let {length , breadth} = boid.dimensions
    length /= 2
    breadth /= 2
    context.save();
    context.translate(boid.location.x, boid.location.y);
    context.rotate(boid.direction.angle);
    context.beginPath();
    if (selectedShape == SHAPE.TRIANGLE) {
        context.lineTo(-length, -breadth);
        context.lineTo(length, 0);
        context.lineTo(-length, breadth);
    } else if (selectedShape == SHAPE.ARROW) {
        context.moveTo(0, 0);
        context.lineTo(-length, -breadth);
        context.lineTo(length, 0);
        context.lineTo(-length, breadth);
    } else if (selectedShape == SHAPE.ELLIPSE) {
        context.ellipse(0, 0, length, breadth, 0, 0, 2 * Math.PI);
    } else {
        context.roundRect(-length, -breadth, length * 2, breadth * 2, Math.min(length, breadth) / 10)
    }
    context.closePath();
    context.fillStyle = boid.color
    context.fill();
    context.restore();
}

const medium = document.getElementById("medium") as HTMLCanvasElement
let context: CanvasRenderingContext2D | null;

const previewCanvas = document.querySelector(".preview canvas") as HTMLCanvasElement
let contextP = previewCanvas?.getContext("2d")


let pausePlay: Function
let currFrame = 0
let pauseFrame = 0
let pausable = true;


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

enum SHAPE {TRIANGLE, ARROW, ELLIPSE, SQUARE}
let selectedShape = SHAPE.TRIANGLE

enum MODE {GLOBAL, LOCAL}
let currMode = MODE.LOCAL
const modeToggle = document.getElementById("dataMode") as HTMLInputElement
modeToggle?.addEventListener("input", () => {
   if (modeToggle.checked) currMode = MODE.GLOBAL
   else currMode = MODE.LOCAL
})


const previewBoid = new Boid(new Point(previewCanvas.width / 2, previewCanvas.height / 2), new Vector(new Point(0, -1)), 
    data.getDimesions(), "black")
let curr: Element;

const cursorPos = {
    location: new Point(-1, -1),

    valid(): boolean {
        return this.location.x >= 0 && this.location.y >= 0
    },
    
    reset() {
        this.location = new Point(-1, -1)
    }
}

Object.keys(Boid.params).forEach(e => {
    if (preview?.lastElementChild?.previousElementSibling)
    preview.lastElementChild.previousElementSibling.append(Boid.params[e].container)
    Boid.params[e].initThumb()
})

function boidClick(): Function {
    let clicked = false
    const clickedBoids: Set<Boid> = new Set()

    return () => {
        const b = Boid.canvas?.searchLocationBFS(cursorPos.location, 100)
        if (clicked) {
            clickedBoids.clear()
            window.cancelAnimationFrame(pauseFrame)
            currFrame = window.requestAnimationFrame(draw)
        } else {
            if (!b || !(clickedBoids.size + 1)) return
            clickedBoids.add(b)
            window.cancelAnimationFrame(currFrame)
            pauseFrame = window.requestAnimationFrame(() => drawStatic(clickedBoids))
        }
        clicked = !clicked
    }
}

document.addEventListener("keydown", (e) => {if (e.key == ' ')pausePlay()})

medium.addEventListener("mousedown", () => {
    new Promise(res => {
        while(!pausable) {
            continue
        }
        res(null)
    }).then(() => {
        pausePlay()
    })
})

medium.addEventListener("mousemove", updateCursor)
medium.addEventListener("mouseout", () => cursorPos.reset())

for (const option of options) {
    option.addEventListener("click", () => {
        curr?.classList.toggle("clicked")
        curr = option
        curr?.classList.toggle("clicked")
        selectedShape = +(option?.getAttribute("shape") ?? 0)
        window.requestAnimationFrame(drawPreview)
    })
}

document.addEventListener("sliderValChange", () => window.requestAnimationFrame(drawPreview))

document.querySelectorAll(".preview input").forEach(e => {
    e.addEventListener("input", () => {
        window.requestAnimationFrame(drawPreview)
    })
});

(select?.firstElementChild as HTMLButtonElement).click()

document.getElementById("submit")?.addEventListener("click", () => {
    start(+(document.getElementById("count") as HTMLInputElement)?.value)
})


const body  = document.querySelector("body")
document.querySelector(".mode")?.addEventListener("click", () => {
    body?.classList.toggle("dark")
    body?.classList.toggle("light")
})