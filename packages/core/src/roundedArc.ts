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
    capOffset?: number // how far out
}

export function RoundedArc(props: RoundedArcProps) {
    let ctx = props.ctx
    let capRadius = props.capRadiusRatio || 3

    // todo: calc offset not 0
    // todo: use props.capOffset
    // todo: 1.09?
    let angleOffset = Math.asin((props.lineWidth * 1.09) / capRadius / props.radius) + 0

    let startAngleArc = props.startAngle + angleOffset
    // let startAngleArc = props.startAngle
    let endAngleArc = props.endAngle - angleOffset
    // let endAngleArc = props.endAngle

    // Gauge arc
    ctx.beginPath()
    ctx.strokeStyle = props.bgColor
    ctx.lineWidth = props.lineWidth
    ctx.lineCap = 'butt'
    ctx.arc(props.x, props.y, props.radius, startAngleArc, Math.max(endAngleArc, startAngleArc), false)
    ctx.stroke()
    ctx.closePath()

    let capWidth = props.lineWidth
    if (startAngleArc > endAngleArc) {
        let shrinkFactor = 1 - (startAngleArc - endAngleArc) / angleOffset / 2
        shrinkFactor = Math.max(shrinkFactor, 0.001)
        capWidth = props.lineWidth * shrinkFactor
    }

    // Cap left
    let XLeft = props.x - props.radius * Math.cos(props.startAngle - Math.PI)
    let YLeft = props.y - props.radius * Math.sin(props.startAngle - Math.PI)
    let rotationLeft = props.startAngle - Math.PI

    RoundedCap({
        ctx: ctx,
        bgColor: props.bgColor,
        // bgColor: '#f00',
        x: XLeft,
        y: YLeft,
        width: capWidth,
        parentRadius: props.radius,
        radius: capWidth / capRadius,
        rotation: rotationLeft,
        triangleSide: 'l'
    })

    // Cap right
    let XRight = props.x - props.radius * Math.cos(props.endAngle - props.startAngle)
    let YRight = props.y - props.radius * Math.sin(props.endAngle - props.startAngle)
    let rotation = props.endAngle - props.startAngle - Math.PI

    RoundedCap({
        ctx: ctx,
        bgColor: props.bgColor,
        // bgColor: '#f00',
        x: XRight,
        y: YRight,
        width: capWidth,
        parentRadius: props.radius,
        radius: capWidth / capRadius,
        rotation: rotation,
        triangleSide: 'r'
    })
}

export function RoundedArcBGRight(props: RoundedArcProps) {
    let ctx = props.ctx
    let capRadius = props.capRadiusRatio || 3
    let capOffset = props.capOffset || 0.1 // todo: how to handle this better?

    // todo: 1.3?
    let endAngleArc = props.endAngle - Math.asin((props.lineWidth * (1.3 - capOffset)) / capRadius / props.radius / 2)
    endAngleArc = Math.max(endAngleArc, props.startAngle)
    // endAngleArc = props.endAngle

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
    X = X - props.lineWidth * capOffset * Math.sin(props.endAngle - Math.PI)
    Y = Y - props.lineWidth * capOffset * Math.cos(props.endAngle - Math.PI)
    let rotation = props.endAngle - Math.PI * 2

    RoundedCap({
        ctx: ctx,
        bgColor: props.bgColor,
        // bgColor: '#f00',
        x: X,
        y: Y,
        width: props.lineWidth,
        parentRadius: props.radius,
        radius: props.lineWidth / capRadius,
        rotation: rotation,
        triangleSide: 'r'
    })
}

export function RoundedArcBGLeft(props: RoundedArcProps) {
    let ctx = props.ctx
    let capRadius = props.capRadiusRatio || 3
    let capOffset = props.capOffset || 0.1 // todo: how to handle this better?

    // todo: calc offset not 0
    // todo: use props.capOffset
    // todo: 1.12?
    let startAngleArc =
        props.startAngle + Math.asin((props.lineWidth * (1.3 - capOffset)) / capRadius / props.radius / 2)
    startAngleArc = Math.min(startAngleArc, props.endAngle)
    // startAngleArc = props.startAngle

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
    X = X + props.lineWidth * capOffset * Math.sin(props.startAngle - Math.PI)
    Y = Y + props.lineWidth * capOffset * Math.cos(props.startAngle - Math.PI)
    let rotation = props.startAngle - Math.PI

    RoundedCap({
        ctx: ctx,
        bgColor: props.bgColor,
        // bgColor: '#f00',
        x: X,
        y: Y,
        width: props.lineWidth,
        parentRadius: props.radius,
        radius: props.lineWidth / capRadius,
        rotation: rotation,
        triangleSide: 'l'
    })
}

type RoundedCapProps = {
    ctx: CanvasRenderingContext2D
    bgColor: string // hex color
    x: number // pixels
    y: number // pixels
    width: number // pixels
    radius: number // pixels
    parentRadius: number
    rotation: number // radians
    triangleSide: 'l' | 'r' // left or right
}

function RoundedCap(props: RoundedCapProps) {
    let ctx = props.ctx

    ctx.translate(props.x, props.y)
    ctx.rotate(props.rotation)
    ctx.translate(-1 * props.x, -1 * props.y)

    ctx.strokeStyle = props.bgColor
    ctx.fillStyle = props.bgColor
    ctx.lineWidth = 0.01

    let triangleHeight = props.radius / 4

    // todo: take into account triangle height to calc diff x correction of base and top
    let xCorrection = 0
    if (props.triangleSide === 'l') {
        xCorrection = props.width * 0.009
    } else if (props.triangleSide === 'r') {
        xCorrection = -(props.width * 0.009)
    }
    // xCorrection = 0

    ctx.beginPath()
    // left arc
    ctx.arc(
        props.x - props.width / 2 + props.radius + xCorrection,
        props.y - props.radius,
        props.radius,
        0,
        Math.PI,
        false
    )
    // right arc
    ctx.arc(
        props.x + props.width / 2 - props.radius + xCorrection,
        props.y - props.radius,
        props.radius,
        0,
        Math.PI,
        false
    )

    // top rect
    ctx.rect(
        props.x - props.width / 2 + props.radius + xCorrection,
        props.y - props.radius,
        props.width - props.radius * 2,
        props.radius
    )

    ctx.fill()
    // ctx.stroke()
    ctx.closePath()

    // ctx.fillStyle = "#f00"
    if (props.triangleSide === 'l') {
        // bottom triangle base
        ctx.beginPath()
        ctx.lineWidth = 1
        ctx.moveTo(props.x + props.width / 2 - xCorrection, props.y - props.radius)
        ctx.lineTo(props.x - props.width / 2 + xCorrection, props.y - props.radius)
        ctx.stroke()
        ctx.fill()
        ctx.closePath()

        // bottom triangle
        ctx.lineWidth = 0.01
        ctx.beginPath()
        ctx.moveTo(props.x + props.width / 2 + xCorrection, props.y - props.radius)
        ctx.lineTo(props.x - props.width / 2 + xCorrection, props.y - props.radius)
        ctx.lineTo(props.x - props.width / 2 + xCorrection * 2, props.y - props.radius - triangleHeight)
        ctx.lineTo(props.x + props.width / 2 - xCorrection, props.y - props.radius)
        ctx.fill()
        ctx.closePath()
    } else if (props.triangleSide === 'r') {
        // bottom triangle base
        ctx.beginPath()
        ctx.lineWidth = 1
        ctx.moveTo(props.x - props.width / 2 - xCorrection, props.y - props.radius)
        ctx.lineTo(props.x + props.width / 2 + xCorrection, props.y - props.radius)
        ctx.stroke()
        ctx.fill()
        ctx.closePath()

        // bottom triangle base
        ctx.lineWidth = 0.01
        ctx.beginPath()
        ctx.moveTo(props.x - props.width / 2 + xCorrection, props.y - props.radius)
        ctx.lineTo(props.x + props.width / 2 + xCorrection, props.y - props.radius)
        ctx.lineTo(props.x + props.width / 2 + xCorrection * 2, props.y - props.radius - triangleHeight)
        ctx.lineTo(props.x - props.width / 2 - xCorrection, props.y - props.radius)
        ctx.fill()
        ctx.closePath()
    }

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
