'use client'

import { useRef, useEffect, useCallback } from 'react'
import throttle from 'throttleit'
import GaugeCore, {
    defaultProps,
    backOutEase,
    linearEase,
    type FunGauge as FunGaugeCore,
    type ColorSelector,
    type GaugeThemeProps,
    type GaugeAnimationProps,
    type ThemeCounterProps,
    type ThemeLabelsProps
} from '@fun-gauge/core'

export { backOutEase, linearEase }

export type { ColorSelector, GaugeThemeProps, GaugeAnimationProps, ThemeCounterProps, ThemeLabelsProps }

export type Props = {
    value: number
    colorSelectors?: ColorSelector[]
    theme?: GaugeThemeProps
    animation?: GaugeAnimationProps
    firstRenderDelay?: number

    containerClassName?: string
    canvasClassName?: string
}

export default function FunGauge(props: Props) {
    const {
        value = defaultProps.value,
        colorSelectors = defaultProps.colorSelectors,
        animation = defaultProps.animation,
        theme = defaultProps.theme,
        firstRenderDelay = defaultProps.firstRenderDelay,

        containerClassName = '',
        canvasClassName = '',

        ...restProps
    } = props

    let containerRef = useRef<HTMLElement>(null)
    let canvasRef = useRef<HTMLCanvasElement>(null)
    let gaugeCoreRef = useRef<FunGaugeCore>(null)
    let resizeObserverRef = useRef<ResizeObserver>(null)

    // render gauge
    let reRenderGauge = useCallback(
        throttle((value: number) => {
            if (gaugeCoreRef.current === null) {
                return
            }
            gaugeCoreRef.current.animateTo(value)
        }, 51),
        []
    )
    useEffect(() => {
        if (gaugeCoreRef.current === null) {
            gaugeCoreRef.current = GaugeCore({
                canvasElement: canvasRef.current!,
                value,
                colorSelectors,
                animation,
                theme,
                firstRenderDelay
            })
        }

        gaugeCoreRef.current.updateProps({ colorSelectors, animation, theme, firstRenderDelay })
        reRenderGauge(value)
    }, [value, colorSelectors, animation, theme, firstRenderDelay, reRenderGauge])

    // ResizeObserver responsive design
    let resizeGauge = useCallback(
        throttle((width: number) => {
            if (gaugeCoreRef.current === null) {
                return
            }

            gaugeCoreRef.current.updateWidth(Math.floor(width))
            gaugeCoreRef.current.forceRender()
        }, 48),
        []
    )
    useEffect(() => {
        if (containerRef.current?.parentElement) {
            resizeObserverRef.current = new ResizeObserver((entries) => {
                let width = entries[0].contentRect.width
                resizeGauge(width)
            })
            resizeObserverRef.current.observe(containerRef.current.parentElement)
        }

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect()
            }
        }
    }, [resizeGauge])

    return (
        <article className={containerClassName} ref={containerRef} style={{ width: '100%' }}>
            <canvas className={canvasClassName} ref={canvasRef} {...restProps} />
        </article>
    )
}
