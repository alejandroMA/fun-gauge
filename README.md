# Double Gauge

## Basic usage

```javascript
var g1 = DGauge({
    domNode: document.querySelector('#canvas1'),
    title: 'Title',
    value: 40
})
```

## default options

```javascript
{
    domNode: document.createElement('canvas'),
    title: '',
    value: 0,
    range: [0, 100]

    colorSelectors: [
        {color: '#F44336', min: 0, max: 30},
        {color: '#FFEB3B', min: 30, max: 60},
        {color: '#4CAF50', min: 60, max: 100}
    ]

    animation: {
        duration: 750, // miliseconds
        textRender: (value, range) => {
            return Math.round(value * (range[1] - range[0]) + range[0]) + '%'
        },
        animateText: true,
        easeFunc: (t) => { return --t * t * ((0.5 + 1) * t + 0.5) + 1; }
    },
    bgcolor: '#ECECEC',
    lineWidth: 0.095
}
```

## API

```javascript
g1.setValue(13)
```

```javascript
g1.changeConfig(/* options */) // dosen't tiger re-render
```

```javascript
g1.update() // trigers re-reder
```
