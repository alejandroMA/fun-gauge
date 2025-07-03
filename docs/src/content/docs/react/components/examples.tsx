import { useState } from 'react'
import Gauge, { linearEase } from '@fun-gauge/react'
import numeral from 'numeral'

export function Default() {
    return <Gauge value={60} />
}

export function Interactive() {
    let [value, setValue] = useState(55)

    return (
        <div>
            <Gauge
                value={value}
                animation={{
                    duration: 350
                }}
            />
            <input
                className='w-full'
                type='range'
                min='0'
                max='100'
                step='0.01'
                value={value}
                onChange={(ev) => {
                    setValue(Number.parseInt(ev.target.value))
                }}
            />
        </div>
    )
}

export function ColorSelectors() {
    return (
        <Gauge
            value={80}
            colorSelectors={[
                { color: '#F44336', min: 0, max: 26 },
                { color: '#FFC107', min: 26, max: 33 },
                { color: '#4CAF50', min: 33, max: 66 },
                { color: '#FFC107', min: 66, max: 73 },
                { color: '#6e40aa', min: 73, max: 100 }
            ]}
        />
    )
}

export function CustomCounter() {
    return (
        <Gauge
            value={68.46}
            theme={{
                counter: {
                    renderFunc: (val: number) => numeral(val).format('0.00'),
                    fontFunc: (width: number) => `bold ${Math.round(width * 0.2)}px arial`
                }
            }}
        />
    )
}

export function ThinStyle() {
    return (
        <Gauge
            value={800}
            colorSelectors={[{ color: '#607D8B', min: 200, max: 1000 }]}
            animation={{
                duration: 500,
                animateCounter: false,
                easeFunc: linearEase
            }}
            theme={{
                backgroundArcColor: '#CFD8DC',
                lineWidthFunc: (width: number) => Math.floor(width * 0.04),
                counter: {
                    color: '#44545c',
                    fontFunc: (width: number) => `${Math.round(width * 0.24)}px courier`,
                    renderFunc: (val: number) => `${Math.round(val)}`
                },
                labels: {
                    color: '#3A3A3A',
                    fontFunc: (width: number) => `${Math.floor((width * 0.05) / 2)}px arial`
                }
            }}
        />
    )
}

export function KitchenSink() {
    let [value, setValue] = useState(65)

    return (
        <div>
            <Gauge
                value={value}
                colorSelectors={[
                    { color: '#F44336', min: 0, max: 26 },
                    { color: '#FFC107', min: 26, max: 33 },
                    { color: '#4CAF50', min: 33, max: 66 },
                    { color: '#FFC107', min: 66, max: 73 },
                    { color: '#9160d1', min: 73, max: 100 }
                ]}
                theme={{
                    backgroundArcColor: '#525354',
                    labels: {
                        color: '#2A2A2A',
                        fontFunc: (width: number): string => `${Math.floor((width * 0.095) / 2)}px courier`
                    },
                    counter: {
                        color: '#2A2A2A',
                        renderFunc: (val: number) => `${numeral(val).format('0.00')}%`,
                        fontFunc: (width: number) => `bold ${Math.round(width * 0.17)}px courier`
                    }
                }}
            />
            <input
                className='w-full'
                type='range'
                min='0'
                max='100'
                step='0.01'
                value={value}
                onChange={(ev) => {
                    setValue(Number.parseInt(ev.target.value))
                }}
            />
        </div>
    )
}
