var _a, _b;
import Boid from "./Boid.js";
import Vector from "./Vector.js";
import Point from "./Point.js";
import Canvas from "./Canvas.js";
function updateCursor(e) {
    const mouseLocation = new Point(e.x - medium.offsetLeft, e.y - medium.offsetTop);
    cursorPos.location.x = medium.width * mouseLocation.x / medium.offsetWidth;
    cursorPos.location.y = medium.height * mouseLocation.y / medium.offsetHeight;
}
function drawPreview() {
    if (!contextP)
        return;
    contextP.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    contextP.save();
    contextP.translate(previewBoid.location.x, previewBoid.location.y);
    contextP.rotate(-Math.PI / 2);
    contextP.beginPath();
    const radian = (Boid.params.cone.value * Math.PI / 180);
    contextP.arc(0, 0, Boid.params.range.value, -radian, radian);
    contextP.lineTo(0, 0);
    contextP.closePath();
    contextP.fillStyle = "rgba(100, 150, 255, 0.25)";
    contextP.fill();
    contextP.restore();
    data.updateBoid(previewBoid);
    drawBoid(contextP, previewBoid);
}
function start(count) {
    if (medium) {
        Boid.BoidMap.clear();
        medium.width = medium.clientWidth * 6;
        medium.height = medium.clientHeight * 6;
        Boid.canvas = new Canvas(medium.width, medium.height);
    }
    const { length, breadth } = data.getDimesions();
    const color = data.getColor();
    for (let i = 0; i < count; i++) {
        const loc = new Point(Math.random() * ((medium === null || medium === void 0 ? void 0 : medium.width) || 0), Math.random() * ((medium === null || medium === void 0 ? void 0 : medium.height) || 0));
        const d = new Point(Math.random() * 2 - 1, Math.random() * 2 - 1);
        const direc = new Vector(d);
        new Boid(loc, direc, { length, breadth }, color).addToCanvas();
    }
    pausePlay = boidClick();
    if (context = medium.getContext("2d")) {
        window.cancelAnimationFrame(currFrame);
        currFrame = window.requestAnimationFrame(draw);
    }
}
function draw() {
    pausable = false;
    context === null || context === void 0 ? void 0 : context.clearRect(0, 0, (medium === null || medium === void 0 ? void 0 : medium.width) || 0, (medium === null || medium === void 0 ? void 0 : medium.height) || 0);
    Boid.BoidMap.forEach((v, k) => {
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
        if (context)
            drawBoid(context, k);
    });
    pausable = true;
    currFrame = window.requestAnimationFrame(draw);
}
function drawStatic(boidsSet) {
    pausable = false;
    context === null || context === void 0 ? void 0 : context.clearRect(0, 0, (medium === null || medium === void 0 ? void 0 : medium.width) || 0, (medium === null || medium === void 0 ? void 0 : medium.height) || 0);
    Boid.BoidMap.forEach((v, k) => {
        if (!context)
            return;
        if (boidsSet.has(k))
            data.updateBoid(k);
        drawBoid(context, k);
    });
    pausable = true;
    pauseFrame = window.requestAnimationFrame(() => drawStatic(boidsSet));
}
function drawBoid(context, boid) {
    if (!context)
        return;
    if (currMode == MODE.GLOBAL) {
        data.updateBoid(boid);
    }
    let { length, breadth } = boid.dimensions;
    length /= 2;
    breadth /= 2;
    context.save();
    context.translate(boid.location.x, boid.location.y);
    context.rotate(boid.direction.angle);
    context.beginPath();
    if (selectedShape == SHAPE.TRIANGLE) {
        context.lineTo(-length, -breadth);
        context.lineTo(length, 0);
        context.lineTo(-length, breadth);
    }
    else if (selectedShape == SHAPE.ARROW) {
        context.moveTo(0, 0);
        context.lineTo(-length, -breadth);
        context.lineTo(length, 0);
        context.lineTo(-length, breadth);
    }
    else if (selectedShape == SHAPE.CIRCLE) {
        context.ellipse(0, 0, length, breadth, 0, 0, 2 * Math.PI);
    }
    else {
        context.roundRect(-length, -breadth, length * 2, breadth * 2, Math.min(length, breadth) / 10);
    }
    context.closePath();
    context.fillStyle = boid.color;
    context.fill();
    context.restore();
}
const medium = document.getElementById("medium");
let context;
const previewCanvas = document.querySelector(".preview canvas");
let contextP = previewCanvas === null || previewCanvas === void 0 ? void 0 : previewCanvas.getContext("2d");
let pausePlay;
let currFrame = 0;
let pauseFrame = 0;
let pausable = true;
const select = document.querySelector(".select");
const preview = document.querySelector(".preview");
const options = (select === null || select === void 0 ? void 0 : select.children) || [];
const data = {
    color: document.getElementById("color"),
    length: document.getElementById("length"),
    breadth: document.getElementById("breadth"),
    getDimesions() {
        return { length: +data.length.value, breadth: +data.breadth.value };
    },
    getColor() {
        return data.color.value;
    },
    updateBoid(b) {
        b.dimensions = this.getDimesions();
        b.color = this.getColor();
    }
};
var SHAPE;
(function (SHAPE) {
    SHAPE[SHAPE["TRIANGLE"] = 0] = "TRIANGLE";
    SHAPE[SHAPE["ARROW"] = 1] = "ARROW";
    SHAPE[SHAPE["CIRCLE"] = 2] = "CIRCLE";
    SHAPE[SHAPE["SQUARE"] = 3] = "SQUARE";
})(SHAPE || (SHAPE = {}));
let selectedShape = SHAPE.TRIANGLE;
var MODE;
(function (MODE) {
    MODE[MODE["GLOBAL"] = 0] = "GLOBAL";
    MODE[MODE["LOCAL"] = 1] = "LOCAL";
})(MODE || (MODE = {}));
let currMode = MODE.LOCAL;
const modeToggle = document.getElementById("dataMode");
modeToggle === null || modeToggle === void 0 ? void 0 : modeToggle.addEventListener("input", () => {
    if (modeToggle.checked)
        currMode = MODE.GLOBAL;
    else
        currMode = MODE.LOCAL;
});
const previewBoid = new Boid(new Point(previewCanvas.width / 2, previewCanvas.height / 2), new Vector(new Point(0, -1)), data.getDimesions(), "black");
let curr;
const cursorPos = {
    location: new Point(-1, -1),
    valid() {
        return this.location.x >= 0 && this.location.y >= 0;
    },
    reset() {
        this.location = new Point(-1, -1);
    }
};
Object.keys(Boid.params).forEach(e => {
    var _a;
    if ((_a = preview === null || preview === void 0 ? void 0 : preview.lastElementChild) === null || _a === void 0 ? void 0 : _a.previousElementSibling)
        preview.lastElementChild.previousElementSibling.append(Boid.params[e].container);
    Boid.params[e].initThumb();
});
function boidClick() {
    let clicked = false;
    const clickedBoids = new Set();
    return () => {
        var _a;
        const b = (_a = Boid.canvas) === null || _a === void 0 ? void 0 : _a.searchLocationBFS(cursorPos.location, 100);
        if (clicked) {
            clickedBoids.clear();
            window.cancelAnimationFrame(pauseFrame);
            currFrame = window.requestAnimationFrame(draw);
        }
        else {
            if (!b || !(clickedBoids.size + 1))
                return;
            clickedBoids.add(b);
            window.cancelAnimationFrame(currFrame);
            pauseFrame = window.requestAnimationFrame(() => drawStatic(clickedBoids));
        }
        clicked = !clicked;
    };
}
document.addEventListener("keydown", (e) => { if (e.key == ' ')
    pausePlay(); });
medium.addEventListener("mousedown", () => {
    new Promise(res => {
        while (!pausable) {
            continue;
        }
        res(null);
    }).then(() => {
        pausePlay();
    });
});
medium.addEventListener("mousemove", updateCursor);
medium.addEventListener("mouseout", () => cursorPos.reset());
for (const option of options) {
    option.addEventListener("click", () => {
        var _a;
        curr === null || curr === void 0 ? void 0 : curr.classList.toggle("clicked");
        curr = option;
        curr === null || curr === void 0 ? void 0 : curr.classList.toggle("clicked");
        selectedShape = +((_a = option === null || option === void 0 ? void 0 : option.getAttribute("shape")) !== null && _a !== void 0 ? _a : 0);
        window.requestAnimationFrame(drawPreview);
    });
}
document.addEventListener("sliderValChange", () => window.requestAnimationFrame(drawPreview));
document.querySelectorAll(".preview input").forEach(e => {
    e.addEventListener("input", () => {
        window.requestAnimationFrame(drawPreview);
    });
});
(select === null || select === void 0 ? void 0 : select.firstElementChild).click();
(_a = document.getElementById("submit")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    var _a;
    start(+((_a = document.getElementById("count")) === null || _a === void 0 ? void 0 : _a.value));
});
const body = document.querySelector("body");
(_b = document.querySelector(".mode")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
    body === null || body === void 0 ? void 0 : body.classList.toggle("dark");
    body === null || body === void 0 ? void 0 : body.classList.toggle("light");
});
