import Boid from "./Boid.js"
import Vector from "./Vector.js"
import Point from "./Point.js"
import Canvas from "./Canvas.js"

const range: (HTMLInputElement | null )[] = [...document.querySelectorAll("input")]
const medium = document.getElementById("medium") as HTMLCanvasElement
let context: CanvasRenderingContext2D | null;

range.forEach(v => {
    if (v) inputListener(v, v.id)
})

function inputListener(element: HTMLInputElement, ObjKey: string): void {
    if (Boid.params.get(ObjKey)) {
        element.addEventListener("input", () => {
            Boid.params.set(ObjKey, Number.parseFloat(element?.value || "0"))
            element?.setAttribute("value", `${Boid.params.get(ObjKey)}`)
        })
    }
}

function start(count: number) {
    if (medium) {
        Boid.BoidMap.clear()
        medium.width = 4 * window.innerWidth
        medium.height = 4 * window.innerHeight
        Boid.canvas = new Canvas(medium.width, medium.height)
    }

    for(let i = 0; i < count; i++) {
        const loc = new Point(Math.random() * ( medium?.width || 0),Math.random() * (medium?.height || 0))
        const d = new Point(Math.random() * 2 - 1, Math.random() * 2 - 1)
        const direc = new Vector(d)
        new Boid(loc, direc)
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
        drawBoid(context, k, +data.length?.value, +data.reach?.value)
        k.findNeighbors()
    })
    let s = Boid.params.get("sharpness") || 0
    Boid.BoidMap.forEach((val, key, t) => {
        let v0 = key.alignWithNeigbors().normalized
        let v1 = key.avoidNeighbors().normalized
        let v2 = key.flockWithNeigbor().normalized
        let og = key.direction.normalized


        let al = Boid.params.get("align") || 0
        let av = Boid.params.get("avoid") || 0
        let f = Boid.params.get("flock") || 0
        let dest = new Point(
            og.x + al * s * v0.x + av * s * v1.x + f * s * v2.x,
            og.y + al * s * v0.y + av * s * v1.y + f * s * v2.y
        )

        t.set(key, new Vector(dest))
    })
    Boid.BoidMap.forEach((v, k) => {
        k.direction = v
        k.incrementPositon()
    })
    window.requestAnimationFrame(draw)
}

function drawBoid(context: CanvasRenderingContext2D, boid: Boid, fullLength: number, tailReach: number) {
    if (context) {
        context.save();
        context.translate(boid.location.x, boid.location.y);
        context.rotate(boid.direction.angle);
        context.beginPath();
        if (selectedMode == "0") {
            context.lineTo(-fullLength /2, -tailReach / 2);
            context.lineTo(fullLength / 2, 0);
            context.lineTo(-fullLength / 2, tailReach / 2);
        } else if (selectedMode == "1") {
            context.moveTo(0, 0);
            context.lineTo(-fullLength / 2, -tailReach / 2);
            context.lineTo(fullLength / 2, 0);
            context.lineTo(-fullLength / 2, tailReach / 2);
        } else if (selectedMode == "2") {
            context.ellipse(0, 0, fullLength / 2, tailReach / 2, 0, 0, 2 * Math.PI);
        } else {
            context.roundRect(-fullLength / 2, -tailReach / 2, fullLength, tailReach, Math.min(tailReach, fullLength) / 20)
        }
        context.closePath();
        context.fillStyle = (document.getElementById("color") as HTMLInputElement)?.value
        context.lineWidth = Math.min(tailReach, fullLength) / 10 
        context.fill();
        context.stroke();
        context.restore();
    }
}

const select = document.querySelector(".select")
const options = select?.children || []
const previewCanvas = document.querySelector(".preview canvas") as HTMLCanvasElement
let contextP = previewCanvas?.getContext("2d")
const data = {
    color: document.getElementById("color") as HTMLInputElement,
    length:  document.getElementById("length") as HTMLInputElement,
    reach: document.getElementById("reach") as HTMLInputElement
}
let selectedMode = "0";
let previewBoid = new Boid(new Point(previewCanvas.width / 2, previewCanvas.height / 2), new Vector(new Point(0, -1)))
Boid.BoidMap.delete(previewBoid)
for (const option of options) {
    option.addEventListener("mouseenter", () => {
        selectedMode = option?.getAttribute("mode") || "0"
        window.requestAnimationFrame(drawPreview)
        // option.classList.toggle("curr")
    })
    // option.addEventListener("mouseleave", () => option.classList.toggle("curr"))
}
document.querySelectorAll(".preview input").forEach(e => {
    e.addEventListener("input", () => {
        window.requestAnimationFrame(drawPreview)
    })
})

document.getElementById("submit")?.addEventListener("click", () => {
    start(+(document.getElementById("count") as HTMLInputElement)?.value)
})

function drawPreview() {
    contextP?.clearRect(0 , 0, previewCanvas.width, previewCanvas.height)
    if (contextP) drawBoid(contextP, previewBoid, 20 * +data.length?.value, 20 * +data.reach?.value)
}
