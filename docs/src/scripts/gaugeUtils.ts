import type { FunGauge } from '@fun-gauge/core'
import throttle from 'throttleit'

export function bindResizeObserver(gauge: FunGauge, containerElement: HTMLElement): void {
    // resize observer
    // let containerElement = gauge.getCanvasElement().parentElement?.parentElement
    if (containerElement) {
        let resizeGauge = throttle((width) => {
            gauge.updateWidth(Math.floor(width))
            gauge.forceRender()
        }, 48)
        let observer = new ResizeObserver((entries) => {
            let width = entries[0].contentRect.width
            resizeGauge(width)
        })
        observer.observe(containerElement)
    }
}

export function bindThemeChange(gauge: FunGauge, onThemeChange: (theme: string) => void): void {
    // React to changes in system color scheme.
    let themeSelectElement = document.querySelector('starlight-theme-select')
    themeSelectElement?.querySelector('select')?.addEventListener('change', handleThemeChange)
    matchMedia('(prefers-color-scheme: light)').addEventListener('change', handleThemeChange)

    function handleThemeChange() {
        setTimeout(() => {
            // get starlight theme after dom update
            let theme = document.documentElement.dataset.theme
            if (theme) {
                onThemeChange(theme)
            }
        }, 0)
    }
}

export function rand(min: number, max: number): number {
    return Math.round(min + Math.random() * (max - min))
}
