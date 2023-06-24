export default class Slider {
    constructor(_min, _max, options) {
        var _a, _b, _c;
        this._min = _min;
        this._max = _max;
        this._value = 0;
        this._dragging = false;
        this._step = (options === null || options === void 0 ? void 0 : options.step) || 1;
        this._unit = (_a = options === null || options === void 0 ? void 0 : options.unit) !== null && _a !== void 0 ? _a : '';
        this._container = document.createElement("div");
        const thumb = document.createElement("div");
        const track = document.createElement("div");
        track.append(thumb);
        const value = document.createElement("div");
        const label = document.createElement("div");
        label.textContent = (_b = options === null || options === void 0 ? void 0 : options.name) !== null && _b !== void 0 ? _b : '';
        this._container.append(track, value, label);
        thumb.classList.add("thumb");
        track.classList.add("track");
        label.classList.add("label");
        this._container.classList.add("slider");
        const _slider = this;
        thumb.addEventListener("mousedown", (e) => _slider.dragStart(e));
        track.addEventListener("mousemove", (e) => _slider.drag(e));
        thumb.addEventListener("mouseup", () => _slider.dragEnd());
        track.addEventListener("mouseleave", () => _slider.dragEnd());
        track.addEventListener("click", (e) => _slider.jump(e));
        this._data = { thumb, track, value };
        this.updateValue((_c = options === null || options === void 0 ? void 0 : options.initialValue) !== null && _c !== void 0 ? _c : this._min);
    }
    initThumb() {
        console.log("a");
        this._data.thumb.style.setProperty("--x", `${((this.value - this._min) / this._step) * (this._data.track.clientWidth / this.divisions())}px`);
    }
    updateValue(newVal) {
        this._value = newVal >= this._min && newVal <= this._max ? newVal : newVal > this.value ? this._max : this._min;
        this._data.value.textContent = this._value + ' ' + (this._unit || "");
    }
    dragStart(e) {
        this._dragging = true;
    }
    drag(e) {
        let relX = e.pageX - (this._data.track.getBoundingClientRect().left + window.scrollX);
        if (this._dragging) {
            let length = this._data.track.clientWidth / this.divisions();
            let f;
            if (e.movementX > 0) {
                f = Math.ceil((relX + e.movementX) / length);
            }
            else if (e.movementX < 0) {
                f = Math.floor((relX + e.movementX) / length);
            }
            else
                return;
            this.updateValue(this._min + f * this._step);
            f *= length;
            if (f <= this._data.track.clientWidth && f >= 0)
                this._data.thumb.style.setProperty("--x", `${f}px`);
        }
    }
    dragEnd() {
        this._dragging = false;
    }
    jump(e) {
        if (this._dragging)
            return;
        let relX = e.pageX - (this._data.track.getBoundingClientRect().left + window.scrollX);
        let length = this._data.track.clientWidth / this.divisions();
        let f = Math.round(relX / length);
        this.updateValue(this._min + f * this._step);
        this._data.thumb.style.setProperty("--x", `${f * length}px`);
    }
    divisions() {
        return (this._max - this._min) / this._step;
    }
    get container() {
        return this._container;
    }
    get value() {
        return this._value;
    }
}
