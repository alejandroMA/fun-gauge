import Gauge from '@fun-gauge/react'

type Props = {
    title?: string
    value?: number
}

export default function MyGauge(props: Props) {
    const { title = 'Hello Gauge', value = 60 } = props

    return (
        <div>
            <h4>{title}</h4>
            <Gauge value={value} />
        </div>
    )
}
