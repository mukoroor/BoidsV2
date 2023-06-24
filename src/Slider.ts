import Point from "./Point.js"

export default class Slider {
    private _data: {thumb: HTMLElement, track: HTMLElement, value: HTMLElement}
    private _container: HTMLElement
    private _value: number = 0
    private _step: number
    private _unit: string
    private _dragging = false

    constructor(private _min: number,private _max: number, options?: {step?: number, initialValue?: number, name?: string, unit?: string}) {
        this._step = options?.step || 1
        this._unit = options?.unit ?? ''

        this._container =  document.createElement("div")

        const thumb = document.createElement("div")
        const track = document.createElement("div")
        track.append(thumb)

        const value = document.createElement("div")
        const label = document.createElement("div")
        label.textContent = options?.name ?? ''

        this._container.append(track, value, label)
        thumb.classList.add("thumb")
        track.classList.add("track") 
        label.classList.add("label")
        this._container.classList.add("slider")

        const _slider = this
        thumb.addEventListener("mousedown", (e) => _slider.dragStart(e))
        track.addEventListener("mousemove", (e) => _slider.drag(e))
        thumb.addEventListener("mouseup", () => _slider.dragEnd())
        track.addEventListener("mouseleave", () => _slider.dragEnd())
        track.addEventListener("click", (e) => _slider.jump(e))

        this._data = {thumb, track, value}

        this.updateValue(options?.initialValue ?? this._min)
    }

    initThumb(): void {
        console.log("a")
        this._data.thumb.style.setProperty("--x", `${((this.value - this._min) / this._step) *  (this._data.track.clientWidth / this.divisions())}px`)
    }

    updateValue(newVal: number): void {
        this._value = newVal >= this._min && newVal <= this._max ? newVal : newVal > this.value ? this._max : this._min
        this._data.value.textContent = this._value + ' ' + (this._unit || "")
    }

    dragStart(e: MouseEvent): void {
        this._dragging = true
    }

    drag(e: MouseEvent): void {
        let relX = e.pageX - (this._data.track.getBoundingClientRect().left + window.scrollX)
        if (this._dragging) {
            let length = this._data.track.clientWidth / this.divisions()
            let f;
            if (e.movementX > 0) {
                f  = Math.ceil((relX + e.movementX) / length)
            } else if (e.movementX < 0) {
                f = Math.floor((relX + e.movementX) / length)
            } else return
            this.updateValue(this._min + f * this._step)
            f *= length
            if (f <= this._data.track.clientWidth && f >= 0) this._data.thumb.style.setProperty("--x", `${f}px`)
        }
    }

    dragEnd(): void {
        this._dragging = false
    }

    jump(e: MouseEvent): void {
        if (this._dragging) return
        let relX = e.pageX - (this._data.track.getBoundingClientRect().left + window.scrollX)
        let length = this._data.track.clientWidth / this.divisions()
        let f = Math.round(relX / length)
        this.updateValue(this._min + f * this._step)
        this._data.thumb.style.setProperty("--x", `${f * length}px`)
    }

    private divisions(): number {
        return (this._max - this._min) / this._step
    }

    get container(): HTMLElement {
        return this._container
    }

    get value(): number {
        return this._value
    }
}