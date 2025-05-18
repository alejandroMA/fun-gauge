# Fun Gauge

![Fun gauge](https://raw.githubusercontent.com/alejandroMA/fun-gauge/refs/heads/main/assets/fun-gauge.gif)

[fun-gauge.dev](https://fun-gauge.dev)

## Basic usage

```sh
npm install @fun-gauge/core
```

```javascript
import Gauge from '@fun-gauge/core'

var gauge = Gauge({
    canvasElement: document.querySelector('#canvas1'),
    value: 40,
})
```

## Default options

```typescript
import { backOutEase } from '@fun-gauge/core'

export const defaultProps = {
    canvasElement: document.createElement('canvas'),
    width: 0,
    value: 0,
    colorSelectors: [
        { color: '#F44336', min: 0, max: 33 },
        { color: '#FFC107', min: 33, max: 66 },
        { color: '#4CAF50', min: 66, max: 100 },
    ],
    animation: {
        duration: 750,
        animateCounter: true,
        easeFunc: backOutEase,
    },
    theme: {
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
    },
    firstRenderDelay: 0,
}
```

## API

```javascript
gauge.animateTo(13)
```

```javascript
gauge.updateProps(/* new props */) // doesn't tiger re-render
```

```javascript
gauge.forceRender()
```

```javascript
gauge.getCanvasElement()
```

```javascript
gauge.updateWidth(300)
```

# Examples

![Fun gauge](https://raw.githubusercontent.com/alejandroMA/fun-gauge/refs/heads/main/assets/fun-gauge-examples.gif)
