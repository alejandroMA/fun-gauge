import invariant from 'tiny-invariant'
import { merge } from 'ts-deepmerge'
import hclColorInterpolator from './hclColorInterpolator'
import { RoundedArc, RoundedArcBGLeft, RoundedArcBGRight } from './roundedArc'

const DEFAULT_LINE_WIDTH_MULT = 0.095
const DEFAULT_COUNTER_WIDTH_MULT = 0.23
const DEFAULT_CAP_RADIUS_RATIO = 3

const MARKERS_WIDTH_MULT = 1.5
const BACKGROUND_WIDTH_MULT = 1.2

export type FunGauge = {
    getCanvasElement: () => HTMLCanvasElement
    animateTo: (newValue: number) => void
    updateProps: (newProps: FunGaugeProps) => void
    updateWidth: (newWidth: number) => void
    forceRender: () => void
}

export type FunGaugeProps = {
    canvasElement?: HTMLCanvasElement
    /** pixels */
    width?: number
    value?: number
    colorSelectors?: ColorSelector[]
    animation?: GaugeAnimationProps
    theme?: GaugeThemeProps
    firstRenderDelay?: number // ms
}

export type ColorSelector = {
    /** hexcolor ex. '#ffffff' */
    color: string
    min: number
    max: number
}

export type GaugeAnimationProps = {
    /** milliseconds defaults to 750 */
    duration?: number
    /** defaults to true */
    animateCounter?: boolean
    /** function that maps time animation progress from 0 to 1, defaults to backOutEase */
    easeFunc?: (t: number) => number
}

export type GaugeThemeProps = {
    /** hexcolor defaults to '#ECECEC' */
    backgroundArcColor?: string
    /** function that takes the canvas width and returns the line width for the gauge */
    lineWidthFunc?: (width: number) => number
    counter?: ThemeCounterProps
    labels?: ThemeLabelsProps
}

export type ThemeCounterProps = {
    /** hexcolor defaults to '#2A2A2A' */
    color?: string
    /** function that takes the canvas width and returns ctx.font to be used on the canvas */
    fontFunc?: (width: number) => string
    /** function that takes the current value of the gauge and returns a string to display on the canvas */
    renderFunc?: (currentValue: number) => string
}

export type ThemeLabelsProps = {
    /** hexcolor defaults to '#3A3A3A' */
    color?: string
    /** function that takes the canvas width and returns ctx.font to be used on the canvas */
    fontFunc?: (width: number) => string
    /** function that takes the current value of the label and returns a string to display on the canvas */
    renderFunc?: (currentValue: number) => string
}

export const defaultProps: Required<FunGaugeProps> = {
    // canvasElement: document.createElement('canvas') as HTMLCanvasElement,
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
    } as Required<GaugeAnimationProps>,
    theme: {
        backgroundArcColor: '#ECECEC',
        lineWidthFunc: (width: number) => Math.floor(width * DEFAULT_LINE_WIDTH_MULT),
        counter: {
            color: '#2A2A2A',
            fontFunc: (width: number): string => `bold ${Math.floor(width * DEFAULT_COUNTER_WIDTH_MULT)}px arial`,
            renderFunc: (val: number): string => `${Math.round(val)}%`
        } as Required<ThemeCounterProps>,
        labels: {
            color: '#3A3A3A',
            fontFunc: (width: number): string => `${Math.floor((width * DEFAULT_LINE_WIDTH_MULT) / 2)}px arial`,
            renderFunc: (val: number): string => `${val}`
        } as Required<ThemeLabelsProps>
    } as Required<GaugeThemeProps>,
    firstRenderDelay: 0
} as Required<FunGaugeProps>

/**
 * FunGauge
 *
 * @param initialProps configuration options
 * @returns the gauge object
 */
export default function FunGauge(initialProps: FunGaugeProps): FunGauge {
    let props: Required<FunGaugeProps> = merge(defaultProps as FunGaugeProps) as Required<FunGaugeProps>
    let canvas = document.createElement('canvas')
    let ctx: CanvasRenderingContext2D | null
    let W = 0
    let H = 0

    let value = 0
    let renderedValue = 0
    let oldValue = 0

    let color = props.colorSelectors[0].color
    let renderedColor = props.colorSelectors[0].color

    let renderingLoopID = 0
    let isAnimating = false

    init()

    function init(): void {
        _updateProps(initialProps)

        canvas = props.canvasElement ?? canvas
        ctx = canvas.getContext('2d')
        value = props.value || 0

        color = props.colorSelectors[0].color
        renderedColor = props.colorSelectors[0].color

        _updateWidth(props.width)

        renderedValue = 0
        renderedColor = props.colorSelectors[0].color

        renderingLoopID = requestAnimationFrame(() => render(renderedValue, renderedColor))
        if (!props.firstRenderDelay || props.firstRenderDelay <= 0) {
            animateTo(value)
        } else {
            setTimeout(() => {
                animateTo(value)
            }, props.firstRenderDelay)
        }
    }

    function _updateProps(newProps: FunGaugeProps): void {
        if (process.env.NODE_ENV !== 'production') {
            if (newProps.colorSelectors) {
                invariant(newProps.colorSelectors.length > 0, 'FunGauge: colorSelectors must not be an empty array')

                for (let i = 0; i < newProps.colorSelectors.length; i++) {
                    const selector = newProps.colorSelectors[i]
                    invariant(
                        selector.max >= selector.min,
                        'FunGauge: Selector max must be greater than or equal to selector min'
                    )
                }
            }
        }
        props = merge.withOptions({ mergeArrays: false }, props as FunGaugeProps, newProps) as Required<FunGaugeProps>
    }

    function _updateWidth(newWidth: number): void {
        const ratio = window.devicePixelRatio

        if (newWidth && newWidth > 0) {
            W = newWidth
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
    }

    function animateTo(value: number): void {
        cancelAnimationFrame(renderingLoopID)

        oldValue = renderedValue
        let difference = value - oldValue

        color = getColor(value, props.colorSelectors)
        let colorInterpolator = hclColorInterpolator(renderedColor, color)
        let startTime: DOMHighResTimeStamp | null = null

        function animation(now: DOMHighResTimeStamp): void {
            if (!startTime) {
                startTime = now
            }

            let animationProps = props.animation as Required<GaugeAnimationProps>
            let animationProgress = (now - startTime) / animationProps.duration
            let easeFunc = animationProps.easeFunc

            if (animationProgress >= 1) {
                renderedValue = value
                renderedColor = getColor(value, props.colorSelectors)

                render(renderedValue, renderedColor)
                cancelAnimationFrame(renderingLoopID)
                isAnimating = false
            } else {
                renderedValue = oldValue + difference * easeFunc(animationProgress)
                renderedColor = colorInterpolator(easeFunc(animationProgress))

                render(renderedValue, renderedColor)
                renderingLoopID = requestAnimationFrame(animation)
                isAnimating = true
            }
        }

        if (oldValue !== value) {
            requestAnimationFrame(animation)
        } else {
            if (!isAnimating) {
                renderingLoopID = requestAnimationFrame(() => {
                    renderedValue = value
                    renderedColor = getColor(value, props.colorSelectors)

                    render(renderedValue, renderedColor)
                })
            }
        }
    }

    function render(renderedValue: number, renderedColor: string): void {
        if (!ctx) {
            return
        }
        let themeProps = props.theme as Required<GaugeThemeProps>
        let lineWidth = themeProps.lineWidthFunc(W)

        // Clear the canvas every time a chart is drawn
        ctx.clearRect(0, 0, W, H)

        let radius = W / 2 - (lineWidth * MARKERS_WIDTH_MULT) / 2

        // rescale value to 0 to 1
        let { min, max } = getMinMax(props.colorSelectors)
        let valueToRender = Math.max(renderedValue, min)
        let valueRadians = (1 + (valueToRender - min) / (max - min)) * Math.PI

        // first color marker
        let selector = props.colorSelectors[0]
        let startAngle = Math.PI + Math.PI * ((selector.min - min) / (max - min))
        let endAngle = Math.PI + Math.PI * ((selector.max - min) / (max - min))
        // only one color selector
        if (props.colorSelectors.length === 1) {
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
        selector = props.colorSelectors[props.colorSelectors.length - 1]
        startAngle = Math.PI + Math.PI * ((selector.min - min) / (max - min))
        endAngle = Math.PI + Math.PI * ((selector.max - min) / (max - min))
        // only one color selector
        if (props.colorSelectors.length === 1) {
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
        for (let i = 1; i < props.colorSelectors.length - 1; i++) {
            let selector = props.colorSelectors[i]
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
            bgColor: themeProps.backgroundArcColor,
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
            bgColor: themeProps.backgroundArcColor,
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
        let themeCounterProps = themeProps.counter as Required<ThemeCounterProps>
        let textValue = props.animation?.animateCounter ? renderedValue : value
        textValue = clampCounterValue(textValue, oldValue, value)
        text = themeCounterProps.renderFunc(textValue)
        ctx.fillStyle = themeCounterProps.color
        ctx.font = themeCounterProps.fontFunc(W)
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, W / 2 - textWidth / 2, H - lineWidth)

        let themeLabelsProps = themeProps.labels as Required<ThemeLabelsProps>

        // 0 label
        ctx.fillStyle = themeLabelsProps.color
        ctx.font = themeLabelsProps.fontFunc(W)
        text = themeLabelsProps.renderFunc(min)
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, Math.round((lineWidth * MARKERS_WIDTH_MULT) / 2 - textWidth / 2), H)

        // 100 label
        ctx.fillStyle = themeLabelsProps.color
        ctx.font = themeLabelsProps.fontFunc(W)
        text = themeLabelsProps.renderFunc(max)
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

    return {
        getCanvasElement(): HTMLCanvasElement {
            return canvas
        },
        animateTo(newValue: number): void {
            value = newValue
            animateTo(value)
        },
        updateProps(newProps: FunGaugeProps): void {
            if (process.env.NODE_ENV !== 'production') {
                invariant(
                    newProps.value === undefined,
                    'FunGauge: value is not supported in gauge.updateProps(),' +
                        ' use gauge.renderValue() or gauge.animateTo() instead'
                )
                invariant(newProps.canvasElement === undefined, 'FunGauge: updating canvasElement is not supported')
                invariant(
                    newProps.width === undefined,
                    'FunGauge: width is not supported in gauge.updateProps(),' + ' use gauge.updateWidth() insted'
                )
            }

            _updateProps(newProps)
        },
        updateWidth(newWidth: number): void {
            _updateWidth(newWidth)
        },
        forceRender(): void {
            renderingLoopID = requestAnimationFrame(() => render(renderedValue, renderedColor))
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
