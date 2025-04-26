export type RoundedArcProps = {
    ctx: CanvasRenderingContext2D
    bgColor: string // hex color
    x: number // arc center pixels
    y: number // arc center pixels
    lineWidth: number // pixels
    radius: number // pixels
    startAngle: number // radians
    endAngle: number // radians
    capRadiusRatio: number // from 2 to infinity
}

export function RoundedArcBoth(props: RoundedArcProps) {
    let ctx = props.ctx
    let capRadius = props.capRadiusRatio || 3

    // todo: calc offset not 0
    let startAngleArc = props.startAngle + (Math.asin((props.lineWidth * 1.09) / capRadius / props.radius) + 0)
    startAngleArc = Math.min(startAngleArc, props.endAngle)

    // todo: calc offset not 0
    let endAngleArc = props.endAngle - (Math.asin((props.lineWidth * 1.09) / capRadius / props.radius) + 0)
    endAngleArc = Math.max(endAngleArc, startAngleArc)

    // Gauge arc
    ctx.beginPath()
    ctx.strokeStyle = props.bgColor
    ctx.lineWidth = props.lineWidth
    ctx.lineCap = 'butt'
    ctx.arc(props.x, props.y, props.radius, startAngleArc, endAngleArc, false)
    ctx.stroke()
    ctx.closePath()

    // Cap left
    let XLeft = props.x - props.radius * Math.cos(props.startAngle - Math.PI)
    let YLeft = props.y - props.radius * Math.sin(props.startAngle - Math.PI)
    let rotationLeft = props.startAngle

    RoundedCapLeft({
        ctx: ctx,
        bgColor: props.bgColor,
        // bgColor: '#f00',
        x: XLeft,
        y: YLeft,
        width: props.lineWidth,
        radius: props.lineWidth / capRadius,
        rotation: rotationLeft
    })

    // Cap right
    let XRight = props.x - props.radius * Math.cos(props.endAngle - props.startAngle)
    let YRight = props.y - props.radius * Math.sin(props.endAngle - props.startAngle)
    let rotation = props.endAngle - props.startAngle

    RoundedCapRight({
        ctx: ctx,
        bgColor: props.bgColor,
        // bgColor: '#f00',
        x: XRight,
        y: YRight,
        width: props.lineWidth,
        radius: props.lineWidth / capRadius,
        rotation: rotation
    })
}

export function RoundedArcRight(props: RoundedArcProps) {
    let ctx = props.ctx
    let capRadius = 3

    // todo: calc offset not 0
    let endAngleArc = props.endAngle - (Math.asin((props.lineWidth * 1.09) / capRadius / props.radius) + 0)
    endAngleArc = Math.max(endAngleArc, props.startAngle)

    // Gauge arc
    ctx.beginPath()
    ctx.strokeStyle = props.bgColor
    ctx.lineWidth = props.lineWidth
    ctx.lineCap = 'butt'
    ctx.arc(props.x, props.y, props.radius, props.startAngle, endAngleArc, false)
    ctx.stroke()
    ctx.closePath()

    // Cap
    let X = props.x - props.radius * Math.cos(props.endAngle - Math.PI)
    let Y = props.y - props.radius * Math.sin(props.endAngle - Math.PI)
    let rotation = props.endAngle - Math.PI

    RoundedCapRight({
        ctx: ctx,
        bgColor: props.bgColor,
        // bgColor: '#f00',
        x: X,
        y: Y,
        width: props.lineWidth,
        radius: props.lineWidth / capRadius,
        rotation: rotation
    })
}

export function RoundedArcLeft(props: RoundedArcProps) {
    let ctx = props.ctx
    let capRadius = 3

    // todo: calc offset not 0
    let startAngleArc = props.startAngle + (Math.asin((props.lineWidth * 1.09) / capRadius / props.radius) + 0)
    startAngleArc = Math.min(startAngleArc, props.endAngle)

    // Gauge arc
    ctx.beginPath()
    ctx.strokeStyle = props.bgColor
    ctx.lineWidth = props.lineWidth
    ctx.lineCap = 'butt'
    ctx.arc(props.x, props.y, props.radius, startAngleArc, props.endAngle, false)
    ctx.stroke()
    ctx.closePath()

    // Cap
    let X = props.x - props.radius * Math.cos(props.startAngle - Math.PI)
    let Y = props.y - props.radius * Math.sin(props.startAngle - Math.PI)
    let rotation = props.startAngle

    RoundedCapLeft({
        ctx: ctx,
        bgColor: props.bgColor,
        // bgColor: '#f00',
        x: X,
        y: Y,
        width: props.lineWidth,
        radius: props.lineWidth / capRadius,
        rotation: rotation
    })
}

type RoundedCapProps = {
    ctx: CanvasRenderingContext2D
    bgColor: string // hex color
    x: number // pixels
    y: number // pixels
    width: number // pixels
    radius: number // pixels
    rotation: number // radians
}

function RoundedCapRight(props: RoundedCapProps) {
    let ctx = props.ctx

    ctx.translate(props.x, props.y)
    ctx.rotate(props.rotation)
    ctx.translate(-1 * props.x, -1 * props.y)

    ctx.strokeStyle = props.bgColor
    ctx.fillStyle = props.bgColor
    ctx.lineWidth = 0.01

    const xCorrection = 0.5 // todo: calc correction offset

    ctx.beginPath()
    // left arc
    ctx.arc(
        props.x - props.width / 2 + xCorrection + props.radius,
        props.y + props.radius,
        props.radius,
        Math.PI,
        0,
        false
    )
    // right arc
    ctx.arc(
        props.x + props.width / 2 + xCorrection - props.radius,
        props.y + props.radius,
        props.radius,
        Math.PI,
        0,
        false
    )

    // top rect
    ctx.rect(
        props.x - props.width / 2 + xCorrection + props.radius,
        props.y,
        props.width - props.radius * 2,
        props.radius
    )

    ctx.fill()
    ctx.stroke()
    ctx.closePath()

    // bottom triangle base
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.moveTo(props.x + xCorrection + props.width / 2, props.y + props.radius)
    ctx.lineTo(props.x + xCorrection - props.width / 2, props.y + props.radius)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()

    // bottom triangle base
    ctx.lineWidth = 0.01
    ctx.beginPath()
    ctx.moveTo(props.x + xCorrection + props.width / 2, props.y + props.radius)
    ctx.lineTo(props.x + xCorrection - props.width / 2, props.y + props.radius)
    ctx.lineTo(props.x + xCorrection - props.width / 2, props.y + props.radius + 3) // todo: calc offset not 3
    ctx.lineTo(props.x + xCorrection + props.width / 2, props.y + props.radius)
    ctx.fill()
    ctx.closePath()

    // Reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const scale = window.devicePixelRatio
    ctx.scale(scale, scale)

    // debug
    // ctx.moveTo(0, 0)
    // ctx.lineTo(props.x, props.y)
    // ctx.lineWidth = 2
    // ctx.strokeStyle = '#000000'
    // ctx.stroke()
}

function RoundedCapLeft(props: RoundedCapProps) {
    let ctx = props.ctx

    ctx.translate(props.x, props.y)
    ctx.rotate(props.rotation)
    ctx.translate(-1 * props.x, -1 * props.y)

    ctx.strokeStyle = props.bgColor
    ctx.fillStyle = props.bgColor
    ctx.lineWidth = 0.01

    const xCorrection = -0.5 // todo: calc correction offset

    ctx.beginPath()
    // left arc
    ctx.arc(
        props.x - props.width / 2 + xCorrection + props.radius,
        props.y + props.radius,
        props.radius,
        Math.PI,
        0,
        false
    )
    // right arc
    ctx.arc(
        props.x + props.width / 2 + xCorrection - props.radius,
        props.y + props.radius,
        props.radius,
        Math.PI,
        0,
        false
    )

    // top rect
    ctx.rect(
        props.x - props.width / 2 + xCorrection + props.radius,
        props.y,
        props.width - props.radius * 2,
        props.radius
    )

    ctx.fill()
    ctx.stroke()
    ctx.closePath()

    // bottom triangle base
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.moveTo(props.x + xCorrection - props.width / 2, props.y + props.radius)
    ctx.lineTo(props.x + xCorrection + props.width / 2, props.y + props.radius)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()

    // bottom triangle base
    ctx.lineWidth = 0.01
    ctx.beginPath()
    ctx.moveTo(props.x + xCorrection - props.width / 2, props.y + props.radius)
    ctx.lineTo(props.x + xCorrection + props.width / 2, props.y + props.radius)
    ctx.lineTo(props.x + xCorrection + props.width / 2, props.y + props.radius + 3) // todo: calc offset not 3
    ctx.lineTo(props.x + xCorrection - props.width / 2, props.y + props.radius)
    ctx.fill()
    ctx.closePath()

    // Reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const scale = window.devicePixelRatio
    ctx.scale(scale, scale)

    // debug
    // ctx.moveTo(0, 0)
    // ctx.lineTo(props.x, props.y)
    // ctx.lineWidth = 2
    // ctx.strokeStyle = '#000000'
    // ctx.stroke()
}
