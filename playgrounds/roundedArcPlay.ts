import { RoundedArcBoth, RoundedArcRight, RoundedArcLeft } from '../src/roundedArc'

let canvas = document.getElementById('g1') as HTMLCanvasElement
let ctx = canvas?.getContext('2d')

if (canvas && ctx) {
    console.log('roundedCap')

    // Set display size (css pixels).
    canvas.style.width = `${canvas.getBoundingClientRect().width}px`
    canvas.style.height = `${canvas.getBoundingClientRect().height}px`

    // Set actual size in memory (scaled to account for extra pixel density).
    const scale = window.devicePixelRatio // Change to 1 on retina screens to see blurry canvas.
    canvas.width = Math.floor(canvas.getBoundingClientRect().width * scale)
    canvas.height = Math.floor(canvas.getBoundingClientRect().height * scale)

    // Normalize coordinate system to use CSS pixels.
    ctx.scale(scale, scale)

    ctx.beginPath()
    ctx.strokeStyle = '#f00'
    ctx.lineWidth = 60
    ctx.lineCap = 'butt'
    ctx.arc(310, 310, 250, Math.PI, Math.PI * 1.5, false)
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.strokeStyle = '#0f0'
    ctx.lineWidth = 60
    ctx.lineCap = 'butt'
    ctx.arc(310, 310, 250, Math.PI * 1.5, Math.PI * 2, false)
    ctx.stroke()
    ctx.closePath()

    RoundedArcLeft({
        ctx: ctx,
        bgColor: '#fff',
        x: 310,
        y: 310,
        lineWidth: 50,
        radius: 250,
        startAngle: Math.PI,
        endAngle: Math.PI * 1.5
    })

    RoundedArcRight({
        ctx: ctx,
        bgColor: '#aaa',
        x: 310,
        y: 310,
        lineWidth: 50,
        radius: 250,
        startAngle: Math.PI * 1.5,
        endAngle: Math.PI * 2
    })

    // RoundedArcBoth({
    //     ctx: ctx,
    //     bgColor: '#fff',
    //     x: 310,
    //     y: 310,
    //     lineWidth: 50,
    //     radius: 250,
    //     startAngle: Math.PI,
    //     endAngle: Math.PI * 2
    // })

    RoundedArcBoth({
        ctx: ctx,
        bgColor: '#f0f',
        x: 310,
        y: 310,
        lineWidth: 40,
        radius: 250,
        startAngle: Math.PI,
        endAngle: Math.PI * 1.5
    })

    // ctx.beginPath()
    // ctx.strokeStyle = '#fff'
    // ctx.lineWidth = 2
    // ctx.lineCap = 'square'
    // ctx.moveTo(310, 0)
    // ctx.lineTo(310, 310)
    // ctx.stroke()
    // ctx.closePath()

    // ctx.beginPath()
    // ctx.strokeStyle = '#fff'
    // ctx.lineWidth = 2
    // ctx.lineCap = 'square'
    // ctx.moveTo(0, 310)
    // ctx.lineTo(310 * 2, 310)
    // ctx.stroke()
    // ctx.closePath()

    // ctx.beginPath()
    // ctx.strokeStyle = '#f00'
    // ctx.lineWidth = 2
    // ctx.lineCap = 'square'
    // ctx.moveTo(310, 310)
    // ctx.lineTo(310, 310 + 40)
    // ctx.stroke()
    // ctx.closePath()

    // ctx.beginPath()
    // ctx.strokeStyle = '#f00'
    // ctx.lineWidth = 2
    // ctx.lineCap = 'square'
    // ctx.moveTo(0, 310 + 20)
    // ctx.lineTo(310 * 2, 310 + 20)
    // ctx.stroke()
    // ctx.closePath()
}
