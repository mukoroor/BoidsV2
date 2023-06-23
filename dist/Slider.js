export default class Slider {
    constructor(_min, _max, options) {
        var _a, _b, _c, _d;
        this._min = _min;
        this._max = _max;
        this._value = 0;
        this._dragging = false;
        this._step = (_a = options === null || options === void 0 ? void 0 : options.step) !== null && _a !== void 0 ? _a : 1;
        this._unit = (_b = options === null || options === void 0 ? void 0 : options.unit) !== null && _b !== void 0 ? _b : '';
        this._container = document.createElement("div");
        const thumb = document.createElement("div");
        const track = document.createElement("div");
        track.append(thumb);
        const value = document.createElement("div");
        const label = document.createElement("div");
        label.textContent = (_c = options === null || options === void 0 ? void 0 : options.name) !== null && _c !== void 0 ? _c : '';
        this._container.append(track, value, label);
        thumb.classList.add("thumb");
        track.classList.add("track");
        label.classList.add("label");
        this._container.classList.add("slider");
        const _slider = this;
        thumb.addEventListener("mousedown", (e) => _slider.dragStart(e));
        track.addEventListener("mouseover", (e) => _slider.drag(e));
        thumb.addEventListener("mouseup", () => _slider.dragEnd());
        track.addEventListener("mouseleave", () => _slider.dragEnd());
        this._data = { thumb, track, value };
        this.updateValue((_d = options === null || options === void 0 ? void 0 : options.initialValue) !== null && _d !== void 0 ? _d : this._min);
    }
    updateValue(newVal) {
        this._value = newVal >= this._min && newVal <= this._max ? newVal : newVal > this.value ? this._max : this._min;
        this._data.value.textContent = this._value + (this._unit || "");
    }
    dragStart(e) {
        // if (e.offsetX >= this._data.thumb.offsetLeft && e.offsetX <= this._data.thumb.offsetLeft + this._data.thumb.clientHeight) 
        this._dragging = true;
    }
    drag(e) {
        // if (!this._dragging) return
        gsap.to(this._data.thumb, { x: e.offsetX, duration: 0 });
    }
    dragEnd() {
        this._dragging = false;
    }
    get container() {
        return this._container;
    }
    get value() {
        return this._value;
    }
}
