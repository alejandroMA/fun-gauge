import Gauge from '@fun-gauge/react'

type Props = {
    title?: string
    value?: number
}

export default function MyGauge(props: Props) {
    const { title = 'Hello Gauge', value = 60 } = props

    return (
        <div className='flex flex-col items-center bg-[#eff1f5]'>
            <h4 className='text-[#222]'>{title}</h4>
            <Gauge value={value} />
        </div>
    )
}
