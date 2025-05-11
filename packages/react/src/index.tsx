import { useRef, useEffect, useCallback } from 'react'
import throttle from 'throttleit'
import GaugeCore, {
    defaultProps,
    type FunGauge as FunGaugeCore,
    type ColorSelector,
    type GaugeThemeProps,
    type GaugeAnimationProps
} from '@fun-gauge/core'

export type Props = {
    value: number
    colorSelectors?: ColorSelector[]
    animation?: GaugeAnimationProps
    theme?: GaugeThemeProps
    firstRenderDelay?: number
}

export default function FunGauge(props: Props) {
    const {
        value = defaultProps.value,
        colorSelectors = defaultProps.colorSelectors,
        animation = defaultProps.animation,
        theme = defaultProps.theme,
        firstRenderDelay = defaultProps.firstRenderDelay
    } = props

    let canvasRef = useRef<HTMLCanvasElement>(null)
    let gaugeCoreRef = useRef<FunGaugeCore>(null)
    let prevValueRef = useRef<number>(value)

    let reRenderGauge = useCallback(
        throttle((value: number) => {
            if (gaugeCoreRef.current === null) {
                return
            }

            if (value !== prevValueRef.current) {
                prevValueRef.current = value
                gaugeCoreRef.current.animateTo(value)
            } else {
                gaugeCoreRef.current.forceRender()
            }
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

            console.log(canvasRef.current?.parentElement?.getBoundingClientRect())
        }

        gaugeCoreRef.current.updateProps({ colorSelectors, animation, theme, firstRenderDelay })

        reRenderGauge(value)

        // console.log('updated')
    }, [value, colorSelectors, animation, theme, firstRenderDelay, reRenderGauge])

return <canvas ref={canvasRef} />
}
