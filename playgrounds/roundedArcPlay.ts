import RoundedArc, { RoundedCap } from '../src/roundedArc'

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

    RoundedArc({
        ctx: ctx,
        bgColor: '#fff',
        x: 310,
        y: 310,
        lineWidth: 50,
        radius: 250,
        startAngle: Math.PI,
        endAngle: Math.PI * 2
    })

    RoundedArc({
        ctx: ctx,
        bgColor: '#f0f',
        x: 310,
        y: 310,
        lineWidth: 40,
        radius: 250,
        startAngle: Math.PI,
        endAngle: Math.PI * 1.02
    })

}
