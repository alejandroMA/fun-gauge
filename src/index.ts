import { merge } from 'ts-deepmerge'
import hclColorInterpolator from './hclColorInterpolator'
import { RoundedArc, RoundedArcBGLeft, RoundedArcBGRight } from './roundedArc.js'

const DEFAULT_LINE_WIDTH_MULT = 0.095
const DEFAULT_COUNTER_WIDTH_MULT = 0.23
const DEFAULT_CAP_RADIUS_RATIO = 3

const MARKERS_WIDTH_MULT = 1.5
const BACKGROUND_WIDTH_MULT = 1.2

/**
 * ColorSelector
 * @typedef ColorSelector
 * @property color hexcolor
 * @property min
 * @property max inclusive
 */
export type ColorSelector = {
    color: string // hexcolor
    min: number
    max: number
}

/**
 * FunGaugeProps
 */
export type FunGaugeProps = {
    canvasElement?: HTMLCanvasElement
    width?: number // pixels
    value?: number
    colorSelectors?: ColorSelector[]
    animation?: {
        duration?: number // ms
        animateCounter?: boolean
        easeFunc?: (t: number) => number
    }
    theme?: {
        bgColor?: string // hex color
        lineWidthFunc?: (width: number) => number
        counterRenderFunc?: (currentValue: number) => string
        counterFontFunc?: (width: number) => string
        labelsFontFunc?: (width: number) => string
    }
    firstRenderDelay?: number // ms
}

export type FunGauge = {
    getCanvasElement: () => HTMLCanvasElement
    animateTo: (newValue: number) => void
    setValue: (newValue: number) => void
    forceRender: () => void
    updateProps: (newProps: FunGaugeProps) => void
}

/**
 * FunGauge
 *
 * @param props configuration options
 * @returns {FunGauge}
 */
export default function FunGauge(initialProps: FunGaugeProps): FunGauge {
    let props: FunGaugeProps = {
        canvasElement: document.createElement('canvas'),
        width: 0,
        value: 0,
        colorSelectors: [
            { color: '#F44336', min: 0, max: 33 },
            { color: '#FFC107', min: 33, max: 66 },
            { color: '#4CAF50', min: 66, max: 100 }
        ],
        animation: {
            duration: 750,
            animateCounter: true,
            easeFunc: backOutEase
        },
        theme: {
            bgColor: '#ECECEC',
            lineWidthFunc: (width: number) => Math.floor(width * DEFAULT_LINE_WIDTH_MULT),
            counterRenderFunc: (val: number): string => `${Math.round(val)}%`,
            counterFontFunc: (width: number): string =>
                `bold ${Math.floor(width * DEFAULT_COUNTER_WIDTH_MULT)}px arial`,
            labelsFontFunc: (width: number): string => `${Math.floor((width * DEFAULT_LINE_WIDTH_MULT) / 2)}px arial`
        },
        firstRenderDelay: 0
    }
    let canvas = document.createElement('canvas')
    let ctx: CanvasRenderingContext2D | null
    let W = 0
    let H = 0

    let value = 0
    let renderedValue = 0
    let oldValue = 0

    let color = props.colorSelectors![0].color
    let renderedColor = props.colorSelectors![0].color

    let renderingLoopID = 0

    init()

    function init(): void {
        updateProps(initialProps)

        canvas = props.canvasElement ?? canvas
        ctx = canvas.getContext('2d')
        value = props.value || 0

        color = props.colorSelectors![0].color
        renderedColor = props.colorSelectors![0].color

        const ratio = window.devicePixelRatio

        if (props.width && props.width > 0) {
            W = props.width
        } else {
            W = canvas.getBoundingClientRect().width
        }
        H = W / 2 + Math.round(W * 0.15)

        canvas.width = W * ratio
        canvas.height = H * ratio
        canvas.style.width = `${W}px`
        canvas.style.height = `${H}px`
        if (ctx) {
            ctx.scale(ratio, ratio)
        }

        renderedValue = 0
        renderedColor = props.colorSelectors![0].color

        renderingLoopID = requestAnimationFrame(() => render(renderedValue, renderedColor))
        if (!props.firstRenderDelay || props.firstRenderDelay <= 0) {
            animateTo(value)
        } else {
            setTimeout(() => {
                animateTo(value)
            }, props.firstRenderDelay)
        }
    }

    function updateProps(newProps: FunGaugeProps): void {
        props = merge.withOptions({ mergeArrays: false }, props, newProps)
    }

    function animateTo(value: number): void {
        cancelAnimationFrame(renderingLoopID)

        oldValue = renderedValue
        let difference = value - oldValue

        color = getColor(value, props.colorSelectors!)
        let colorInterpolator = hclColorInterpolator(renderedColor, color)
        let startTime: DOMHighResTimeStamp | null = null

        function animation(now: DOMHighResTimeStamp) {
            if (!startTime) {
                startTime = now
            }

            let animationProgress = (now - startTime) / props.animation?.duration!
            let easeFunc = props.animation?.easeFunc!
            // console.log("animationDuration", animationDuration);

            if (animationProgress >= 1) {
                renderedValue = value
                renderedColor = getColor(value, props.colorSelectors!)

                render(renderedValue, renderedColor)
                cancelAnimationFrame(renderingLoopID)
                return
            }

            renderedColor = colorInterpolator(easeFunc(animationProgress))
            renderedValue = oldValue + difference * easeFunc(animationProgress)
            render(renderedValue, renderedColor)

            renderingLoopID = requestAnimationFrame(animation)
        }

        requestAnimationFrame(animation)
    }

    function render(renderedValue: number, renderedColor: string): void {
        if (!ctx) {
            return
        }
        let lineWidth = props.theme?.lineWidthFunc!(W) ?? Math.floor(W * DEFAULT_LINE_WIDTH_MULT)

        // Clear the canvas every time a chart is drawn
        ctx.clearRect(0, 0, W, H)

        let radius = W / 2 - (lineWidth * MARKERS_WIDTH_MULT) / 2

        // rescale value to 0 to 1
        let { min, max } = getMinMax(props.colorSelectors!)
        let valueToRender = Math.max(renderedValue, min)
        let valueRadians = (1 + (valueToRender - min) / (max - min)) * Math.PI

        // first color marker
        let selector = props.colorSelectors![0]
        let startAngle = Math.PI + Math.PI * ((selector.min - min) / (max - min))
        let endAngle = Math.PI + Math.PI * ((selector.max - min) / (max - min))
        // only one color selector
        if (props.colorSelectors!.length === 1) {
            startAngle = Math.PI
            endAngle = Math.PI * MARKERS_WIDTH_MULT
        }
        RoundedArcBGLeft({
            ctx: ctx,
            bgColor: selector.color,
            x: W / 2,
            y: H - lineWidth,
            lineWidth: lineWidth * MARKERS_WIDTH_MULT,
            radius: radius,
            startAngle: startAngle,
            endAngle: endAngle,
            capRadiusRatio: DEFAULT_CAP_RADIUS_RATIO,
            capOffset: 0.5 / 3
        })

        // last color marker
        selector = props.colorSelectors![props.colorSelectors!.length - 1]
        startAngle = Math.PI + Math.PI * ((selector.min - min) / (max - min))
        endAngle = Math.PI + Math.PI * ((selector.max - min) / (max - min))
        // only one color selector
        if (props.colorSelectors!.length === 1) {
            startAngle = Math.PI * 1.5
            endAngle = Math.PI * 2
        }
        RoundedArcBGRight({
            ctx: ctx,
            bgColor: selector.color,
            x: W / 2,
            y: H - lineWidth,
            lineWidth: lineWidth * MARKERS_WIDTH_MULT,
            radius: radius,
            startAngle: startAngle,
            endAngle: endAngle,
            capRadiusRatio: DEFAULT_CAP_RADIUS_RATIO,
            capOffset: 0.5 / 3
        })

        // color markers
        for (let i = 1; i < props.colorSelectors!.length - 1; i++) {
            let selector = props.colorSelectors![i]
            let startAngle = Math.PI + Math.PI * ((selector.min - min) / (max - min))
            let endAngle = Math.PI + Math.PI * ((selector.max - min) / (max - min))

            ctx.beginPath()
            ctx.strokeStyle = selector.color
            ctx.lineWidth = lineWidth * MARKERS_WIDTH_MULT
            ctx.lineCap = 'butt'
            ctx.arc(W / 2, H - lineWidth, radius, startAngle, endAngle, false)
            ctx.stroke()
        }

        // Background arc
        RoundedArcBGLeft({
            ctx: ctx,
            bgColor: props.theme?.bgColor!,
            x: W / 2,
            y: H - lineWidth,
            lineWidth: lineWidth * BACKGROUND_WIDTH_MULT,
            radius: radius,
            startAngle: Math.PI,
            endAngle: Math.PI * 1.5,
            capRadiusRatio: DEFAULT_CAP_RADIUS_RATIO,
            capOffset: 0.075
        })

        RoundedArcBGRight({
            ctx: ctx,
            bgColor: props.theme?.bgColor!,
            x: W / 2,
            y: H - lineWidth,
            lineWidth: lineWidth * BACKGROUND_WIDTH_MULT,
            radius: radius,
            startAngle: Math.PI * 1.5,
            endAngle: Math.PI * 2,
            capRadiusRatio: DEFAULT_CAP_RADIUS_RATIO,
            capOffset: 0.075
        })

        // Gauge arc
        RoundedArc({
            ctx: ctx,
            bgColor: renderedColor,
            x: W / 2,
            y: H - lineWidth,
            lineWidth: lineWidth,
            radius: radius,
            startAngle: Math.PI,
            endAngle: valueRadians,
            capRadiusRatio: DEFAULT_CAP_RADIUS_RATIO
        })

        let textWidth = 0
        let text = ''

        // Counter
        let textValue = props.animation?.animateCounter ? renderedValue : value
        textValue = clampCounterValue(textValue, oldValue, value)
        text = props.theme?.counterRenderFunc!(textValue) ?? ''
        ctx.fillStyle = '#fff'
        ctx.font = props.theme?.counterFontFunc!(W) ?? '10px arial'
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, W / 2 - textWidth / 2, H - lineWidth)

        // 0 label
        ctx.fillStyle = '#BDBDBD'
        ctx.font = props.theme?.labelsFontFunc!(W) ?? '2px arial'
        text = `${min}`
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, Math.round((lineWidth * MARKERS_WIDTH_MULT) / 2 - textWidth / 2), H)

        // 100 label
        ctx.fillStyle = '#BDBDBD'
        ctx.font = props.theme?.labelsFontFunc!(W) ?? '2px arial'
        text = `${max}`
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, Math.round(W - (lineWidth * MARKERS_WIDTH_MULT) / 2 - textWidth / 2), H)

        // ctx.restore();
    }

    function getColor(value: number, selectors: ColorSelector[]): string {
        let color = ''

        for (let i = 0; i < selectors.length; i++) {
            let selector = selectors[i]
            if (value >= selector.min && value <= selector.max) {
                color = selector.color
                break
            }
        }

        if (color === '') {
            let minSelector = selectors[0]
            let maxSelector = selectors[selectors.length - 1]
            if (value < minSelector.min) {
                color = minSelector.color
            }
            if (value > maxSelector.max) {
                color = maxSelector.color
            }
        }

        return color
    }

    function getMinMax(selectors: ColorSelector[]): { min: number; max: number } {
        // first color marker
        let min = selectors[0].min
        let max = selectors[selectors.length - 1].max

        return { min, max }
    }

    function clampCounterValue(currentValue: number, oldValue: number, newValue: number): number {
        if (oldValue <= newValue) {
            return clamp(currentValue, oldValue, newValue)
        }
        return clamp(currentValue, newValue, oldValue)
    }

    function clamp(num: number, min: number, max: number): number {
        return Math.min(Math.max(num, min), max)
    }

    // function startRenderingLoop() {
    //     render(renderedValue, renderedColor)
    //     renderingLoopID = requestAnimationFrame(startRenderingLoop)
    // }

    // function stopRenderingLoop() {
    //     cancelAnimationFrame(renderingLoopID)
    //     requestAnimationFrame(() => render(renderedValue, renderedColor))
    // }

    return {
        getCanvasElement(): HTMLCanvasElement {
            return canvas
        },
        animateTo(newValue: number): void {
            if (newValue === value) return

            value = newValue
            animateTo(value)
        },
        setValue(newValue: number): void {
            value = newValue
            oldValue = renderedValue
            renderedValue = newValue

            color = getColor(value, props.colorSelectors!)
            renderedColor = color

            renderingLoopID = requestAnimationFrame(() => {
                render(renderedValue, renderedColor)
            })
        },

        forceRender(): void {
            renderingLoopID = requestAnimationFrame(() => render(renderedValue, renderedColor))
        },
        updateProps(newProps: FunGaugeProps): void {
            updateProps(newProps)
        }
    } as FunGauge
}

/**
 *
 * @param t time animation progress from 0 to 1
 * @returns eased t
 */
export function backOutEase(t: number): number {
    const s = 1
    // biome-ignore lint/style/noParameterAssign: just
    return --t * t * ((s + 1) * t + s) + 1
}

/**
 *
 * @param t time animation progress from 0 to 1
 * @returns t
 */
export function linearEase(t: number): number {
    return t
}

// let easeFunc = (t) => t;
// easeFunc = d3.easePolyOut.exponent(4);
// easeFunc = d3.easeBackOut.overshoot(0.5);
// easeFunc = d3.easeElasticOut.amplitude(0.8).period(0.6);
// easeFunc = d3.easeBounceOut;
// easeFunc = d3.easeCubicOut;
