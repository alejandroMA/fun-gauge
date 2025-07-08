import {
    type FunGauge,
    type GaugeThemeProps,
    type GaugeAnimationProps,
    type ColorSelector,
    defaultProps
} from '@fun-gauge/core'
import Gauge from '@fun-gauge/core'
import throttle from 'throttleit'

export function createHomeGauge(options: {
    canvasElement: HTMLCanvasElement
    value: number
    colorSelectors?: ColorSelector[]
    animation?: GaugeAnimationProps
    lightTheme: GaugeThemeProps
    darkTheme: GaugeThemeProps
}): FunGauge {
    let { colorSelectors = defaultProps.colorSelectors, animation = defaultProps.animation } = options
    let themeName = document.documentElement.dataset.theme
    let initialTheme = themeName === 'light' ? options.lightTheme : options.darkTheme

    let gauge = Gauge({
        canvasElement: options.canvasElement,
        value: options.value,
        colorSelectors: colorSelectors,
        animation: animation,
        theme: initialTheme
    })

    // React to changes in system color scheme.
    let themeSelect = document.querySelector('starlight-theme-select')
    themeSelect?.querySelector('select')?.addEventListener('change', handleThemeChange)
    matchMedia('(prefers-color-scheme: light)').addEventListener('change', handleThemeChange)

    function handleThemeChange(): void {
        setTimeout(() => {
            // get starlight theme after dom update
            let updatedThemeName = document.documentElement.dataset.theme
            let theme = updatedThemeName === 'light' ? options.lightTheme : options.darkTheme
            if (theme) {
                gauge.updateProps({ theme: theme })
                gauge.forceRender()
            }
        }, 0)
    }

    // bind resize observer
    let container = gauge.getCanvasElement()?.parentElement
    if (container) {
        let resizeGauge = throttle((width) => {
            gauge.updateWidth(Math.floor(width))
            gauge.forceRender()
        }, 48)
        let observer = new ResizeObserver((entries) => {
            let width = entries[0].contentRect.width
            resizeGauge(width)
        })
        observer.observe(container)
    }

    return gauge
}

export function randSetInterval(callback: () => void, min: number, max: number) {
    setTimeout(timeoutFunc, randInt(min, max))

    function timeoutFunc() {
        callback()

        setTimeout(timeoutFunc, randInt(min, max))
    }
}

export function randInt(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min))
}

export function randFloat(min: number, max: number): number {
    return min + Math.random() * (max - min)
}
