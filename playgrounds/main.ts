import Gauge from '../src/index'
import throttle from 'throttleit'
import Hammer from 'hammerjs'

let dg1 = Gauge({
    canvasElement: document.querySelector('#g1') as HTMLCanvasElement,
    value: 40
})

let dg2 = Gauge({
    canvasElement: document.querySelector('#g2') as HTMLCanvasElement,
    value: 80,
    animation: {
        duration: 500,
        animateText: false
        // easeFunc: function(t) {
        //     return t * t
        // }
    },
    colorSelectors: [{ color: '#607D8B', min: 0, max: 100 }],
    lineWidth: 0.08
    // bgcolor: '#CFD8DC'
})

setInterval(() => {
    // random value
    dg1.animateTo(rand())
    dg2.animateTo(rand())
}, 4000)

function rand() {
    return Math.round(Math.random() * 100)
}

/* setTimeout(() => {
    animateTo(10);
}, 1000);
setTimeout(() => {
    animateTo(90);
}, 1400); */

// easeFunc = d3.easeBackOut.overshoot(0.5);
// easeFunc = d3.easeElasticOut.amplitude(0.8).period(0.6);
// easeFunc = d3.easePolyOut.exponent(4);
// easeFunc = d3.easeBounceOut;
// easeFunc = d3.easeCubicOut;

let gauge3Value = 65
let gauge3 = Gauge({
    canvasElement: document.querySelector('#gauge3') as HTMLCanvasElement,
    value: gauge3Value,
    colorSelectors: [
        { color: '#F44336', min: 0, max: 26 },
        { color: '#FFC107', min: 26, max: 33 },
        { color: '#4CAF50', min: 33, max: 66 },
        { color: '#FFC107', min: 66, max: 73 },
        // { color: "#F44336", min: 73, max: 90 },
        { color: '#6e40aa', min: 73, max: 100 }
    ]
    // colorSelectors: [
    //   { color: "#F44336", min: 0, max: 50 },
    //   { color: "#6e40aa", min: 50, max: 100 },
    // ],
    // colorSelectors: [
    //   { color: "#6e40aa", min: 0, max: 20 },
    //   { color: "#ff5e63", min: 20, max: 40 },
    //   { color: "#aff05b", min: 40, max: 60 },
    //   { color: "#1ac7c2", min: 60, max: 80 },
    //   { color: "#6e40aa", min: 80, max: 100 },
    // ],
})

let slider = document.querySelector('#rangeSlider') as HTMLInputElement
slider.value = gauge3Value.toString()
slider?.addEventListener(
    'input',
    throttle(() => {
        gauge3Value = Math.round(Number.parseFloat(slider?.value) * 100) / 100
        gauge3.animateTo(gauge3Value)
    }, 82)
)

let hammerSlider = new Hammer(slider)
hammerSlider.on('panstart', () => {
    gauge3.updateProps({ animation: { duration: 300 } })
    console.log('panstart')
})
hammerSlider.on('panend', () => {
    gauge3.updateProps({ animation: { duration: 750 } })
    console.log('panend')
})

let gauge3DomRect = gauge3.getCanvasElement().getBoundingClientRect()

let throttleHandlePan = throttle((event: HammerInput) => {
    let mouseX = event.center.x

    let canvasStartX = gauge3DomRect.x
    let canvasWidth = gauge3DomRect.width
    let canvasEndX = canvasStartX + canvasWidth

    let newValue = 0

    if (mouseX >= canvasStartX && mouseX <= canvasEndX) {
        newValue = Math.round(((mouseX - canvasStartX) / canvasWidth) * 10_000) / 100
        // newValue =
        // Math.round(((mouseX - canvasStartX) / canvasWidth) * 10_000) / 100;
        console.log(newValue)
    } else if (mouseX < canvasStartX) {
        newValue = 0
    } else if (mouseX > canvasEndX) {
        newValue = 100
    }

    gauge3Value = newValue
    gauge3.animateTo(gauge3Value)
    // 4 frames behind
}, 76)

let hammerGauge = new Hammer(gauge3.getCanvasElement())
hammerGauge.on('panstart', () => {
    gauge3DomRect = gauge3.getCanvasElement().getBoundingClientRect()
    gauge3.updateProps({ animation: { duration: 300 } })
    console.log('panstart')
})
hammerGauge.on('pan', (event) => {
    throttleHandlePan(event)
})
hammerGauge.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL })
hammerGauge.on('panend', () => {
    gauge3.updateProps({ animation: { duration: 750 } })
    console.log('panend')
    slider.value = gauge3Value.toString()
})

hammerGauge.on('tap', (event) => {
    throttleHandlePan(event)
})

// let gaugue2 = Gauge({
//   domNode: document.querySelector("#gauge2"),
//   value: 40,
//   colorSelectors: [
//     { color: "#6e40aa", min: 0, max: 20 },
//     { color: "#ff5e63", min: 20, max: 40 },
//     { color: "#aff05b", min: 40, max: 60 },
//     { color: "#1ac7c2", min: 60, max: 80 },
//     { color: "#6e40aa", min: 80, max: 100 },
//   ],
// });

// let gaugue3 = Gauge({
//   domNode: document.querySelector("#gauge3"),
//   value: 70,
// });
