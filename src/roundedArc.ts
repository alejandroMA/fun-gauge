export type RoundedArcProps = {
    ctx: CanvasRenderingContext2D
    bgColor: string
    x: number
    y: number
    lineWidth: number
    radius: number
    startAngle: number
    endAngle: number
}

export default function RoundedArc(props: RoundedArcProps) {
    let ctx = props.ctx
    let capRadius = 4

    let endAngleArc = props.endAngle - (Math.asin(props.lineWidth / capRadius / props.radius) + 0) // todo: calc offset

    // Gauge arc
    ctx.beginPath()
    ctx.strokeStyle = props.bgColor
    ctx.lineWidth = props.lineWidth
    ctx.lineCap = 'square'
    ctx.arc(
        props.x,
        props.y,
        props.radius,
        props.startAngle,
        endAngleArc,
        false
    )
    ctx.stroke()
    ctx.closePath()

    // Cap
    let X = props.x - props.radius * Math.cos(props.endAngle - props.startAngle)
    let Y = props.y - props.radius * Math.sin(props.endAngle - props.startAngle)
    X = X + (props.lineWidth / 2) * Math.sin(props.endAngle - props.startAngle)
    Y = Y - (props.lineWidth / 2) * Math.cos(props.endAngle - props.startAngle)
    let rotation = props.endAngle - props.startAngle

    RoundedCap({
        ctx: ctx,
        // bgColor: props.bgColor,
        bgColor: '#f00',
        x: X,
        y: Y,
        width: props.lineWidth,
        radius: props.lineWidth / capRadius,
        rotation: rotation
    })
}

export type RoundedCapProps = {
    ctx: CanvasRenderingContext2D
    bgColor: string // hex color
    x: number // pixels
    y: number // pixels
    width: number // pixels
    radius: number // pixels
    rotation: number // radians
}

export function RoundedCap(props: RoundedCapProps) {
    let ctx = props.ctx

    let Y = props.y - props.radius / 2

    ctx.translate(props.x, props.y)
    ctx.rotate(props.rotation)
    ctx.translate(-1 * props.x, -1 * props.y)

    ctx.strokeStyle = props.bgColor
    ctx.fillStyle = props.bgColor
    ctx.lineWidth = 0.01

    const xCorrection = -0.5 // todo: calc correction offset

    ctx.beginPath()
    // left arc
    ctx.arc(props.x + xCorrection - props.radius, Y + props.radius * 1.5, props.radius, Math.PI, 0, false)
    // right arc
    ctx.arc(props.x + xCorrection + props.radius, Y + props.radius * 1.5, props.radius, Math.PI, 0, false)

    // top rect
    ctx.rect(props.x + xCorrection - props.radius, Y + props.radius / 2, props.width - props.radius * 2, props.radius)

    ctx.fill()
    ctx.stroke()
    ctx.closePath()

    // bottom triangle
    ctx.beginPath()
    ctx.moveTo(props.x + xCorrection + props.radius * 2, props.y + props.radius)
    ctx.lineTo(props.x + xCorrection - props.radius * 2, props.y + props.radius)
    ctx.lineTo(props.x + xCorrection - props.radius * 2, props.y + props.radius + 3) // todo: calc offset not 3
    ctx.fill()
    ctx.closePath()

    // Reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const scale = window.devicePixelRatio
    ctx.scale(scale, scale)


    // ctx.moveTo(0, 0)
    // ctx.lineTo(props.x, props.y)
    // // ctx.lineTo(X + props.width / 2, Y + props.radius / 2)
    // ctx.lineWidth = 2
    // ctx.strokeStyle = '#000000'
    // ctx.stroke()
}
