/*
    Base on d3-interpolate
    https://github.com/d3/d3-interpolate
 */
import { hcl as colorHcl } from 'd3-color/src/lab'

function hcl(hue) {
    return function(start, end) {
        let h = hue((start = colorHcl(start)).h, (end = colorHcl(end)).h),
            c = color(start.c, end.c),
            l = color(start.l, end.l),
            opacity = color(start.opacity, end.opacity)
        return function(t) {
            start.h = h(t)
            start.c = c(t)
            start.l = l(t)
            start.opacity = opacity(t)
            return start + ''
        }
    }
}

export default hcl(hue)
export let hclLong = hcl(color)

function color(a, b) {
    let d = b - a
    return d ? linear(a, d) : constant(isNaN(a) ? b : a)
}

function constant(x) {
    return function() {
        return x
    }
}
function linear(a, d) {
    return function(t) {
        return a + t * d
    }
}

function hue(a, b) {
    let d = b - a
    return d
        ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d)
        : constant(isNaN(a) ? b : a)
}
