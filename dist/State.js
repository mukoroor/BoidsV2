var _a, _b;
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
medium.addEventListener("mousedown", (e) => {
    var _a;
    const l = (_a = Boid.canvas) === null || _a === void 0 ? void 0 : _a.searchLocationBFS(cursorPos.location, 100);
    if (l)
        l.color = "red";
});
medium.addEventListener("mousemove", updateCursor);
function updateCursor(e) {
    const mouseLocation = new Point(e.x - medium.offsetLeft, e.y - medium.offsetTop);
    cursorPos.location.x = medium.width * mouseLocation.x / medium.offsetWidth;
    cursorPos.location.y = medium.height * mouseLocation.y / medium.offsetHeight;
}
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
    let s = Boid.params.agility.value;
    Boid.BoidMap.forEach((val, key, t) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        let v0 = (_a = key.alignWithNeigbors()) === null || _a === void 0 ? void 0 : _a.normalized;
        let v1 = (_b = key.avoidNeighbors()) === null || _b === void 0 ? void 0 : _b.normalized;
        let v2 = (_c = key.flockWithNeigbor()) === null || _c === void 0 ? void 0 : _c.normalized;
        let v3;
        if (cursorPos.valid() && Point.distance(cursorPos.location, key.location) < Boid.params.range.value) {
            v3 = key.followCursor(cursorPos.location).normalized;
        }
        let og = key.direction.normalized;
        let al = Boid.params.align.value;
        let av = Boid.params.avoid.value;
        let fl = Boid.params.flock.value;
        let cu = Boid.params.cursor.value;
        let dest = new Point(og.x
            + al * s * ((_d = v0 === null || v0 === void 0 ? void 0 : v0.x) !== null && _d !== void 0 ? _d : 0)
            + av * s * ((_e = v1 === null || v1 === void 0 ? void 0 : v1.x) !== null && _e !== void 0 ? _e : 0)
            + fl * s * ((_f = v2 === null || v2 === void 0 ? void 0 : v2.x) !== null && _f !== void 0 ? _f : 0)
            + cu * s * ((_g = v3 === null || v3 === void 0 ? void 0 : v3.x) !== null && _g !== void 0 ? _g : 0), og.y
            + al * s * ((_h = v0 === null || v0 === void 0 ? void 0 : v0.y) !== null && _h !== void 0 ? _h : 0)
            + av * s * ((_j = v1 === null || v1 === void 0 ? void 0 : v1.y) !== null && _j !== void 0 ? _j : 0)
            + fl * s * ((_k = v2 === null || v2 === void 0 ? void 0 : v2.y) !== null && _k !== void 0 ? _k : 0)
            + cu * s * ((_l = v3 === null || v3 === void 0 ? void 0 : v3.y) !== null && _l !== void 0 ? _l : 0));
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
        context.fillStyle = boid.color || ((_a = document.getElementById("color")) === null || _a === void 0 ? void 0 : _a.value);
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
const body = document.querySelector("body");
(_b = document.querySelector(".mode")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
    body === null || body === void 0 ? void 0 : body.classList.toggle("dark");
    body === null || body === void 0 ? void 0 : body.classList.toggle("light");
});
