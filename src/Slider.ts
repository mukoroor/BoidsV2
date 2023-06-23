import Point from "./Point.js"

export default class Slider {
    private _data: {thumb: HTMLElement, track: HTMLElement, value: HTMLElement}
    private _container: HTMLElement
    private _value: number = 0
    private _step: number
    private _unit: string
    private _dragging = false

    constructor(private _min: number,private _max: number, options?: {step?: number, initialValue?: number, name?: string, unit?: string}) {
        this._step = options?.step ?? 1
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
        track.addEventListener("mouseover", (e) => _slider.drag(e))
        thumb.addEventListener("mouseup", () => _slider.dragEnd())
        track.addEventListener("mouseleave", () => _slider.dragEnd())

        this._data = {thumb, track, value}

        this.updateValue(options?.initialValue ?? this._min)
    }

    updateValue(newVal: number): void {
        this._value = newVal >= this._min && newVal <= this._max ? newVal : newVal > this.value ? this._max : this._min
        this._data.value.textContent = this._value + (this._unit || "")
    }

    dragStart(e: MouseEvent): void {
        // if (e.offsetX >= this._data.thumb.offsetLeft && e.offsetX <= this._data.thumb.offsetLeft + this._data.thumb.clientHeight) 
        this._dragging = true
    }

    drag(e: MouseEvent): void {
        // if (!this._dragging) return
        gsap.to(this._data.thumb, {x: e.offsetX, duration:0})
    }

    dragEnd(): void {
        this._dragging = false
    }

    get container(): HTMLElement {
        return this._container
    }

    get value(): number {
        return this._value
    }
}