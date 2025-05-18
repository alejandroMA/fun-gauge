# Fun Gauge React

![Fun gauge](https://raw.githubusercontent.com/alejandroMA/fun-gauge/refs/heads/main/assets/fun-gauge.gif)

[fun-gauge.dev](https://fun-gauge.dev)

## Basic usage

```sh
npm install @fun-gauge/react
```

```javascript
import Gauge from '@fun-gauge/react'

function MyGauge(props) {
    const { title, value } = props

    return (
        <div>
            <h3>{title}</h3>
            <Gauge value={value} />
        </div>
    )
}
```

## Default options

```typescript
import FunGauge, { backOutEase } from '@fun-gauge/react'

function MyGauge() {
    return (
        <div>
            <FunGauge
                value={0}
                colorSelectors={[
                    { color: '#F44336', min: 0, max: 33 },
                    { color: '#FFC107', min: 33, max: 66 },
                    { color: '#4CAF50', min: 66, max: 100 },
                ]}
                animation={{
                    duration: 750,
                    animateCounter: true,
                    easeFunc: backOutEase,
                }}
                theme={{
                    backgroundArcColor: '#ECECEC',
                    lineWidthFunc: (width: number) => Math.floor(width * 0.095),
                    counter: {
                        color: '#2A2A2A',
                        fontFunc: (width: number): string => `bold ${Math.floor(width * 0.23)}px arial`,
                        renderFunc: (val: number): string => `${Math.round(val)}%`,
                    },
                    labels: {
                        color: '#3A3A3A',
                        fontFunc: (width: number): string => `${Math.floor((width * 0.095) / 2)}px arial`,
                        renderFunc: (val: number): string => `${val}`,
                    },
                }}
                firstRenderDelay={0}
            />
        </div>
    )
}
```

## Examples

![Fun gauge](https://raw.githubusercontent.com/alejandroMA/fun-gauge/refs/heads/main/assets/fun-gauge-examples.gif)
