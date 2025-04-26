import mergeOptions from 'merge-options'
import hclInterpolator from './hclInterpolator.js'
import { RoundedArcBoth, RoundedArcBGLeft, RoundedArcBGRight } from '../src/roundedArc'

export default function FunGauge(props) {
    let canvas = document.createElement('canvas')
    let ctx
    let W = 0
    let H = 0
    let lineWidth = 0.095
    let bgColor = '#ECECEC'
    let animationDuration = 750
    let easeFunc = backOut

    let colorSelectors = [
        { color: '#F44336', min: 0, max: 33 },
        { color: '#FFEB3B', min: 33, max: 66 },
        { color: '#4CAF50', min: 66, max: 100 }
    ]
    let textRender = textRenderFunc
    let animateText = true

    let title = ''

    let value = 0
    let renderedValue = 0
    let oldValue = 0

    let color = colorSelectors[0].color
    let renderedColor = colorSelectors[0].color

    let renderingLoopID

    init()

    function init() {
        updateProps(props)

        canvas = props.domNode
        ctx = canvas.getContext('2d')
        value = props.value

        let devicePixelRatio = window.devicePixelRatio || 1
        let backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.backingStorePixelRatio || 1
        let ratio = devicePixelRatio / backingStoreRatio

        if (props.width > 0) {
            W = props.width
        } else {
            W = canvas.getBoundingClientRect().width
            W = parseInt(W, 10)
        }
        H = W / 2 + Math.round(W * 0.25)
        lineWidth = Math.round(W * props.lineWidth)

        canvas.width = W * ratio
        canvas.height = H * ratio
        canvas.style.width = W + 'px'
        canvas.style.height = H + 'px'
        ctx.scale(ratio, ratio)

        renderedValue = 0
        renderedColor = colorSelectors[0].color

        renderingLoopID = requestAnimationFrame(() => render(renderedValue, renderedColor))
        if (props.firstRenderDelay <= 0) {
            animateTo(value)
        } else {
            setTimeout(() => {
                animateTo(value)
            }, props.firstRenderDelay)
        }
    }

    function updateProps(newProps) {
        let oldProps = {
            domNode: canvas,
            width: W,
            title: title,
            value: value,
            colorSelectors: colorSelectors,
            animation: {
                duration: animationDuration,
                textRender: textRender,
                animateText: animateText,
                easeFunc: easeFunc
            },
            bgColor: bgColor,
            lineWidth: lineWidth,
            firstRenderDelay: props.firstRenderDelay
        }
        props = mergeOptions({}, oldProps, newProps)

        title = props.title
        colorSelectors = props.colorSelectors
        bgColor = props.bgColor
        animationDuration = props.animation.duration
        textRender = props.animation.textRender
        animateText = props.animation.animateText
        easeFunc = props.animation.easeFunc
        // todo: fix lineWidth bug
        // lineWidth = props.lineWidth;
        // lineWidth = Math.round(W * props.lineWidth);
    }

    function animateTo(value) {
        cancelAnimationFrame(renderingLoopID)

        oldValue = renderedValue
        let difference = value - oldValue

        color = getColor(value)
        let colorInterpolator = hclInterpolator(renderedColor, color)
        let startTime = null

        function animation(now) {
            if (!startTime) {
                startTime = now
            }

            let animationProgress = (now - startTime) / animationDuration
            // console.log("animationDuration", animationDuration);

            if (animationProgress >= 1) {
                renderedValue = value
                renderedColor = getColor(value)

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

    function render(renderedValue, renderedColor) {
        let radius = W / 2 - (lineWidth * 1.5) / 2
        // todo: get min and max from colorSelectors
        // rescale value to 0 to 1
        let valueToRender = Math.max(renderedValue, 0.1)
        // valueToRender = Math.min(valueToRender, 100.1);
        let valueRadians = (1 + valueToRender / 100) * Math.PI

        // Clear the canvas everytime a chart is drawn
        ctx.clearRect(0, 0, W, H)
        // ctx.save();

        // Color maker cap 1
        // let selector = colorSelectors[0]
        // ctx.beginPath()
        // ctx.strokeStyle = selector.color
        // ctx.lineWidth = lineWidth * 1.5
        // ctx.lineCap = 'round'
        // ctx.arc(
        //     W / 2,
        //     H - lineWidth / 0.75,
        //     radius,
        //     Math.PI,
        //     Math.PI + 0.001,
        //     false
        // )
        // ctx.stroke()

        let selector = colorSelectors[0]
        RoundedArcBGLeft({
            ctx: ctx,
            bgColor: selector.color,
            x: W / 2,
            y: H - lineWidth / 0.75,
            lineWidth: lineWidth * 1.5,
            radius: radius,
            startAngle: Math.PI,
            endAngle: Math.PI + 0.001,
            capRadiusRatio: 3,
            capOffset: 0.5 / 3
        })

        // Color maker cap 2
        // selector = colorSelectors[colorSelectors.length - 1]
        // ctx.beginPath()
        // ctx.strokeStyle = selector.color
        // ctx.lineWidth = lineWidth * 1.5
        // ctx.lineCap = 'round'
        // ctx.arc(W / 2, H - lineWidth / 0.75, radius, Math.PI * 2, (Math.PI + 0.001) * 2, false)
        // ctx.stroke()

        selector = colorSelectors[colorSelectors.length - 1]
        RoundedArcBGRight({
            ctx: ctx,
            bgColor: selector.color,
            x: W / 2,
            y: H - lineWidth / 0.75,
            lineWidth: lineWidth * 1.5,
            radius: radius,
            startAngle: Math.PI * 2,
            endAngle: (Math.PI + 0.001) * 2,
            capRadiusRatio: 3,
            capOffset: 0.5 / 3
        })

        // Color marker arcs
        for (let i = 0; i < colorSelectors.length; i++) {
            let selector = colorSelectors[i]
            ctx.beginPath()
            ctx.strokeStyle = selector.color
            ctx.lineWidth = lineWidth * 1.5
            ctx.lineCap = 'butt'
            let startAngle = Math.PI + Math.PI * (selector.min / 100)
            let endAngle = Math.PI + Math.PI * (selector.max / 100)
            ctx.arc(W / 2, H - lineWidth / 0.75, radius, startAngle, endAngle, false)
            ctx.stroke()
        }

        // Background arc
        // ctx.beginPath()
        // ctx.strokeStyle = bgColor
        // ctx.lineWidth = lineWidth * 1.2
        // ctx.lineCap = 'round'
        // ctx.arc(
        //     W / 2,
        //     H - lineWidth / 0.75,
        //     radius,
        //     Math.PI,
        //     Math.PI * 2,
        //     false
        // )
        // ctx.stroke()

        RoundedArcBGLeft({
            ctx: ctx,
            bgColor: bgColor,
            x: W / 2,
            y: H - lineWidth / 0.75,
            lineWidth: lineWidth * 1.2,
            radius: radius,
            startAngle: Math.PI,
            endAngle: Math.PI * 1.5,
            capRadiusRatio: 3,
            capOffset: 0.075
        })

        RoundedArcBGRight({
            ctx: ctx,
            bgColor: bgColor,
            x: W / 2,
            y: H - lineWidth / 0.75,
            lineWidth: lineWidth * 1.2,
            radius: radius,
            startAngle: Math.PI * 1.5,
            endAngle: Math.PI * 2,
            capRadiusRatio: 3,
            capOffset: 0.075
        })

        // Gauge arc
        // ctx.beginPath()
        // ctx.strokeStyle = renderedColor
        // ctx.lineWidth = lineWidth
        // ctx.lineCap = 'round'
        // ctx.arc(
        //     W / 2,
        //     H - lineWidth / 0.75,
        //     radius,
        //     Math.PI,
        //     Math.PI + 0.001,
        //     false
        // )
        // ctx.stroke()

        // ctx.beginPath()
        // ctx.strokeStyle = bgColor
        // ctx.lineWidth = lineWidth
        // ctx.lineCap = 'butt'
        // ctx.arc(
        //     W / 2,
        //     H - lineWidth / 0.75,
        //     radius,
        //     Math.PI + 0.01,
        //     Math.PI * 2,
        //     false
        // )
        // ctx.stroke()

        // ctx.beginPath()
        // ctx.strokeStyle = renderedColor
        // ctx.lineWidth = lineWidth
        // ctx.lineCap = 'butt'
        // // todo: get max
        // if (value >= 100) {
        //     ctx.lineCap = 'round'
        // }
        // ctx.arc(
        //     W / 2,
        //     H - lineWidth / 0.75,
        //     radius,
        //     Math.PI,
        //     valueRadians,
        //     false
        // )
        // ctx.stroke()

        let capRadiusRatio = 3

        if (value < 6) {
            capRadiusRatio = 3 * (7 - value)
        }

        RoundedArcBoth({
            ctx: ctx,
            bgColor: renderedColor,
            x: W / 2,
            y: H - lineWidth / 0.75,
            lineWidth: lineWidth,
            radius: radius,
            startAngle: Math.PI,
            endAngle: valueRadians,
            capRadiusRatio: capRadiusRatio
        })

        let textWidth = 0
        let text = ''

        // Counter
        let textValue = animateText ? renderedValue : value
        text = textRender(textValue, oldValue, value)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold ' + Math.round(W * 0.25) + 'px arial'
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, W / 2 - textWidth / 2, H - lineWidth / 0.9)

        // Title
        ctx.fillStyle = '#9E9E9E'
        ctx.font = `bold ${Math.round(W * 0.1)}px arial`
        text = title
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, Math.round(W / 2 - textWidth / 2), Math.round(W * 0.1))

        // 0 label
        ctx.fillStyle = '#BDBDBD'
        ctx.font = Math.round(lineWidth / 2) + 'px arial'
        text = '0'
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, Math.round(lineWidth / 2 - textWidth / 2), H)

        // 100 label
        ctx.fillStyle = '#BDBDBD'
        ctx.font = Math.round(lineWidth / 2) + 'px arial'
        text = '100'
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, Math.round(W - lineWidth / 2 - textWidth / 2), H)

        // ctx.restore();
    }

    function getColor(value, selectors = colorSelectors) {
        value = Math.round(value)
        let color = undefined

        for (let i = 0; i < selectors.length; i++) {
            let selector = selectors[i]
            if (value >= selector.min && value <= selector.max) {
                color = selector.color
                break
            }
        }

        if (color === undefined) {
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

    function startRenderingLoop() {
        render(renderedValue, renderedColor)
        renderingLoopID = requestAnimationFrame(startRenderingLoop)
    }

    function stopRenderingLoop() {
        cancelAnimationFrame(renderingLoopID)
        requestAnimationFrame(() => render(renderedValue, renderedColor))
    }

    return {
        getDomNode() {
            return canvas
        },
        animateTo: function(newValue) {
            if (newValue === value) return

            value = newValue
            animateTo(value)
            // 5 frames behind
        },
        setValue(newValue) {
            value = newValue
            oldValue = renderedValue
            renderedValue = newValue

            color = getColor(value)
            renderedColor = color

            renderingLoopID = requestAnimationFrame(() => {
                render(renderedValue, renderedColor)
            })
        },

        forceRender() {
            renderingLoopID = requestAnimationFrame(() => render(renderedValue, renderedColor))
        },
        updateProps(newProps) {
            updateProps(newProps)

            // lineWidth = Math.round(W * props.lineWidth);
        }
    }
}

export function backOut(t) {
    const s = 1
    return --t * t * ((s + 1) * t + s) + 1
}

function textRenderFunc(currentValue, oldValue, newValue) {
    let min = 0
    let max = 100

    if (oldValue <= newValue) {
        min = oldValue
        max = newValue
    } else {
        min = newValue
        max = oldValue
    }

    let clampedValue = Math.round(clamp(currentValue, min, max))
    return `${clampedValue}%`
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max)
}

// let easeFunc = (t) => t;
// easeFunc = d3.easePolyOut.exponent(4);
// easeFunc = d3.easeBackOut.overshoot(0.5);
// easeFunc = d3.easeElasticOut.amplitude(0.8).period(0.6);
// easeFunc = d3.easeBounceOut;
// easeFunc = d3.easeCubicOut;
