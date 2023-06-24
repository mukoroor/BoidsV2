var _a;
import Boid from "./Boid.js";
import Vector from "./Vector.js";
import Point from "./Point.js";
import Canvas from "./Canvas.js";
const medium = document.getElementById("medium");
let context;
const cursorPos = { location: new Point(-1, -1), valid() {
        return this.location.x >= 0 && this.location.y >= 0;
    } };
const preview = document.querySelector(".preview");
Object.keys(Boid.params).forEach(e => {
    preview === null || preview === void 0 ? void 0 : preview.insertBefore(Boid.params[e].container, preview.lastElementChild);
    Boid.params[e].initThumb();
});
document.addEventListener("mousemove", (e) => {
    const mouseLocation = new Point(e.x - medium.offsetLeft, e.y - medium.offsetTop);
    if (Point.within(mouseLocation, medium.width, medium.height)) {
        cursorPos.location.x = medium.width * mouseLocation.x / medium.offsetWidth;
        cursorPos.location.y = medium.height * mouseLocation.y / medium.offsetHeight;
        // const locationVal = Boid.canvas?.canvasMap[Math.floor(mouseLocation.x)][Math.floor(mouseLocation.y)]
    }
    else {
        cursorPos.location.x = -1;
        cursorPos.location.y = -1;
    }
});
function start(count) {
    if (medium) {
        Boid.BoidMap.clear();
        medium.width = medium.clientWidth * 5;
        medium.height = medium.clientHeight * 5;
        Boid.canvas = new Canvas(medium.width, medium.height);
    }
    for (let i = 0; i < count; i++) {
        const loc = new Point(Math.random() * ((medium === null || medium === void 0 ? void 0 : medium.width) || 0), Math.random() * ((medium === null || medium === void 0 ? void 0 : medium.height) || 0));
        const d = new Point(Math.random() * 2 - 1, Math.random() * 2 - 1);
        const direc = new Vector(d);
        new Boid(loc, direc);
    }
    if (medium === null || medium === void 0 ? void 0 : medium.getContext("2d")) {
        context = medium.getContext("2d");
        if (context)
            window.requestAnimationFrame(draw);
    }
}
function draw() {
    context === null || context === void 0 ? void 0 : context.clearRect(0, 0, (medium === null || medium === void 0 ? void 0 : medium.width) || 0, (medium === null || medium === void 0 ? void 0 : medium.height) || 0);
    Boid.BoidMap.forEach((v, k) => {
        var _a, _b;
        if (context)
            drawBoid(context, k, +((_a = data.length) === null || _a === void 0 ? void 0 : _a.value), +((_b = data.reach) === null || _b === void 0 ? void 0 : _b.value));
        k.findNeighbors();
    });
    let s = Boid.params.sharpness.value;
    Boid.BoidMap.forEach((val, key, t) => {
        var _a, _b;
        let v0 = key.alignWithNeigbors().normalized;
        let v1 = key.avoidNeighbors().normalized;
        let v2 = key.flockWithNeigbor().normalized;
        let v3;
        if (cursorPos.valid() && Point.distance(cursorPos.location, key.location) < Boid.params.range.value) {
            v3 = key.followCursor(cursorPos.location).normalized;
            // console.log(v3)
        }
        let og = key.direction.normalized;
        let al = Boid.params.align.value;
        let av = Boid.params.avoid.value;
        let fl = Boid.params.flock.value;
        let cu = Boid.params.cursor.value;
        let dest = new Point(og.x + al * s * v0.x + av * s * v1.x + fl * s * v2.x + cu * s * ((_a = v3 === null || v3 === void 0 ? void 0 : v3.x) !== null && _a !== void 0 ? _a : 0), og.y + al * s * v0.y + av * s * v1.y + fl * s * v2.y + cu * s * ((_b = v3 === null || v3 === void 0 ? void 0 : v3.y) !== null && _b !== void 0 ? _b : 0));
        t.set(key, new Vector(dest));
    });
    Boid.BoidMap.forEach((v, k) => {
        k.direction = v;
        k.incrementPositon();
    });
    window.requestAnimationFrame(draw);
}
function drawBoid(context, boid, fullLength, tailReach) {
    var _a;
    if (context) {
        context.save();
        context.translate(boid.location.x, boid.location.y);
        context.rotate(boid.direction.angle);
        context.beginPath();
        if (selectedMode == "0") {
            context.lineTo(-fullLength / 2, -tailReach / 2);
            context.lineTo(fullLength / 2, 0);
            context.lineTo(-fullLength / 2, tailReach / 2);
        }
        else if (selectedMode == "1") {
            context.moveTo(0, 0);
            context.lineTo(-fullLength / 2, -tailReach / 2);
            context.lineTo(fullLength / 2, 0);
            context.lineTo(-fullLength / 2, tailReach / 2);
        }
        else if (selectedMode == "2") {
            context.ellipse(0, 0, fullLength / 2, tailReach / 2, 0, 0, 2 * Math.PI);
        }
        else {
            context.roundRect(-fullLength / 2, -tailReach / 2, fullLength, tailReach, Math.min(tailReach, fullLength) / 20);
        }
        context.closePath();
        context.fillStyle = (_a = document.getElementById("color")) === null || _a === void 0 ? void 0 : _a.value;
        context.fill();
        context.stroke();
        context.restore();
    }
}
const select = document.querySelector(".select");
const options = (select === null || select === void 0 ? void 0 : select.children) || [];
const previewCanvas = document.querySelector(".preview canvas");
let contextP = previewCanvas === null || previewCanvas === void 0 ? void 0 : previewCanvas.getContext("2d");
const data = {
    color: document.getElementById("color"),
    length: document.getElementById("length"),
    reach: document.getElementById("reach")
};
let selectedMode = "0";
let previewBoid = new Boid(new Point(previewCanvas.width / 2, previewCanvas.height / 2), new Vector(new Point(0, -1)), { external: false });
let curr;
for (const option of options) {
    option.addEventListener("click", () => {
        curr === null || curr === void 0 ? void 0 : curr.classList.toggle("clicked");
        curr = option;
        curr === null || curr === void 0 ? void 0 : curr.classList.toggle("clicked");
        selectedMode = (option === null || option === void 0 ? void 0 : option.getAttribute("mode")) || "0";
        window.requestAnimationFrame(drawPreview);
    });
}
(select === null || select === void 0 ? void 0 : select.firstElementChild).click();
document.querySelectorAll(".preview input").forEach(e => {
    e.addEventListener("input", () => {
        window.requestAnimationFrame(drawPreview);
    });
});
(_a = document.getElementById("submit")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    var _a;
    start(+((_a = document.getElementById("count")) === null || _a === void 0 ? void 0 : _a.value));
});
function drawPreview() {
    var _a, _b;
    contextP === null || contextP === void 0 ? void 0 : contextP.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    if (contextP)
        drawBoid(contextP, previewBoid, 5 * +((_a = data.length) === null || _a === void 0 ? void 0 : _a.value), 5 * +((_b = data.reach) === null || _b === void 0 ? void 0 : _b.value));
}
