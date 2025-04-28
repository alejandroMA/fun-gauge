/**
 * Base on d3-interpolate
 * https://github.com/d3/d3-interpolate
 */
// import { hcl as colorHcl } from 'd3-color/src/lab'
import { hcl as colorHcl } from 'd3-color'

export default function hclInterpolator(start: string, end: string): (t: number) => string {
    let startHCl = colorHcl(start)
    let endHCL = colorHcl(end)
    let h = hue(startHCl.h, endHCL.h)
    let c = color(startHCl.c, endHCL.c)
    let l = color(startHCl.l, endHCL.l)
    let opacity = color(startHCl.opacity, endHCL.opacity)

    return (t: number): string => {
        startHCl.h = h(t)
        startHCl.c = c(t)
        startHCl.l = l(t)
        startHCl.opacity = opacity(t)
        return `${startHCl}`
    }
}

function color(a: number, b: number): (t: number) => number {
    let d = b - a
    return d ? linear(a, d) : constant(Number.isNaN(a) ? b : a)
}

function constant(x: number): () => number {
    return (): number => x
}
function linear(a: number, d: number): (t: number) => number {
    return (t: number): number => a + t * d
}

function hue(a: number, b: number): (t: number) => number {
    let d = b - a
    return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(Number.isNaN(a) ? b : a)
}
