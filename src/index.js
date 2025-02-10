import mergeOptions from 'merge-options'
import interpolateHcl from './interpolateHcl'

export default function Gauge(options) {
    let canvas = document.createElement('canvas')
    let ctx
    let W = 0
    let H = 0

    let lineWidthPersent = 0.095
    let lineWidth = 0
    let bgColor = '#ECECEC'
    let animationDuration = 750
    let easeFunc = backOut

    let range = [0, 100]
    let colorSelectors = [
        { color: '#F44336', min: 0, max: 30 },
        { color: '#FFEB3B', min: 30, max: 60 },
        { color: '#4CAF50', min: 60, max: 100 }
    ]
    let textRender = (value, range) => {
        return Math.round(value * (range[1] - range[0]) + range[0]) + '%'
    }
    let animateText = true

    let title = ''

    let value = 0
    let renderedColor = colorSelectors[0].color
    // from 0 to 1
    let renderedValue = 0

    let renderingLoopID

    init()

    function init() {
        updateOptions(options)

        canvas = options.domNode
        ctx = canvas.getContext('2d')
        value = options.value

        let devicePixelRatio = window.devicePixelRatio || 1
        let backingStoreRatio =
            ctx.webkitBackingStorePixelRatio || ctx.backingStorePixelRatio || 1
        let ratio = devicePixelRatio / backingStoreRatio

        if (options.width > 0) {
            W = options.width
        } else {
            W = window.getComputedStyle(canvas, null).getPropertyValue('width')
            W = parseInt(W, 10)
        }
        H = Math.round(W * 0.8)
        lineWidth = Math.round(W * lineWidthPersent)

        canvas.width = W * ratio
        canvas.height = H * ratio
        canvas.style.width = W + 'px'
        canvas.style.height = H + 'px'
        ctx.scale(ratio, ratio)

        renderedValue = 0
        renderedColor = colorSelectors[0].color

        requestAnimationFrame(render)
        if (options.firstRenderDelay <= 0) {
            animateTo(value)
        } else {
            setTimeout(() => {
                animateTo(value)
            }, options.firstRenderDelay)
        }
    }

    function updateOptions(opts) {
        let defualtOptions = {
            domNode: canvas,
            width: 0,
            title: title,
            value: value,
            range: range,
            colorSelectors: colorSelectors,
            animation: {
                duration: animationDuration,
                textRender: textRender,
                animateText: animateText,
                easeFunc: easeFunc
            },
            bgColor: bgColor,
            lineWidth: lineWidthPersent,
            firstRenderDelay: 0
        }
        options = mergeOptions(defualtOptions, opts)

        title = options.title
        range = options.range
        colorSelectors = options.colorSelectors
        bgColor = options.bgColor
        lineWidthPersent = options.lineWidth
        animationDuration = options.animation.duration
        textRender = options.animation.textRender
        animateText = options.animation.animateText
        easeFunc = options.animation.easeFunc
    }

    function render() {
        let radius = W / 2 - lineWidth / 2
        let valueToRender = Math.max(renderedValue, 0.01)
        valueToRender = Math.min(valueToRender, 1.01)
        let radians = (1 + valueToRender) * Math.PI

        // Clear the canvas everytime a chart is drawn
        ctx.clearRect(0, 0, W, H)
        ctx.save()

        // Background arc
        ctx.beginPath()
        ctx.strokeStyle = bgColor
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.arc(W / 2, H - lineWidth * 1.5, radius, Math.PI, Math.PI * 2, false)
        ctx.stroke()

        // Gauge arc
        ctx.beginPath()
        ctx.strokeStyle = renderedColor
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.arc(W / 2, H - lineWidth * 1.5, radius, Math.PI, radians, false)
        ctx.stroke()

        let textWidth = 0
        let text = ''

        // Conter
        let textValue = renderedValue
        text = textRender(textValue, range)
        ctx.fillStyle = '#000'
        ctx.font = 'bold ' + Math.round(W * 0.27) + 'px arial'
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, W / 2 - textWidth / 2, H - lineWidth * 1.5)

        // Title
        ctx.fillStyle = '#9E9E9E'
        ctx.font = `bold ${Math.round(W * 0.1)}px arial`
        text = title
        textWidth = ctx.measureText(text).width
        ctx.fillText(
            text,
            Math.round(W / 2 - textWidth / 2),
            Math.round(W * 0.1)
        )

        // 0 label
        ctx.fillStyle = '#BDBDBD'
        ctx.font = Math.round(lineWidth) + 'px arial'
        text = range[0]
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, Math.round(lineWidth * 0.2), H)

        // 100 label
        ctx.fillStyle = '#BDBDBD'
        ctx.font = Math.round(lineWidth) + 'px arial'
        text = range[1]
        textWidth = ctx.measureText(text).width
        ctx.fillText(text, Math.round(W - textWidth), H)

        ctx.restore()
    }

    function animateTo(value) {
        cancelAnimationFrame(renderingLoopID)

        let oldValue = renderedValue
        let difference = (value - range[0]) / (range[1] - range[0]) - oldValue

        let startTime = null

        let colorScale = interpolateHcl(renderedColor, getColor(value))

        function animation(now) {
            if (!startTime) startTime = now

            renderingLoopID = requestAnimationFrame(animation)
            let animationProgress = (now - startTime) / animationDuration

            if (animationProgress >= 1) {
                renderedValue = (value - range[0]) / (range[1] - range[0])
                renderedColor = getColor(value)

                render()
                cancelAnimationFrame(renderingLoopID)
                return
            }

            renderedColor = colorScale(easeFunc(animationProgress))
            renderedValue = oldValue + difference * easeFunc(animationProgress)

            render()
        }
        requestAnimationFrame(animation)
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
        render()
        renderingLoopID = requestAnimationFrame(startRenderingLoop)
    }

    function stopRenderingLoop() {
        cancelAnimationFrame(renderingLoopID)
        requestAnimationFrame(render)
    }

    return {
        getDomNode() {
            return canvas
        },
        setValue(newValue) {
            if (newValue === value) return

            value = newValue
            animateTo(value)
        },
        update() {
            requestAnimationFrame(render)
        },
        changeConfig(newOpts) {
            updateOptions(newOpts)

            renderedValue = (value - range[0]) / (range[1] - range[0])
            lineWidth = Math.round(W * lineWidthPersent)
        }
    }
}

function backOut(t) {
    const s = 0.5
    return --t * t * ((s + 1) * t + s) + 1
}

// let easeFunc = (t) => t;
// easeFunc = d3.easePolyOut.exponent(4);
// easeFunc = d3.easeBackOut.overshoot(0.5);
// easeFunc = d3.easeElasticOut.amplitude(0.8).period(0.6);
// easeFunc = d3.easeBounceOut;
// easeFunc = d3.easeCubicOut;
