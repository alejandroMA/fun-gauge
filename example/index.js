import DGauge from '../src/index'

let dg1 = DGauge({
    domNode: document.querySelector('#g1'),
    title: 'Title',
    value: 40
})

let dg2 = DGauge({
    domNode: document.querySelector('#g2'),
    title: 'Title2',
    value: 80,
    animation: {
        duration: 500,
        animateText: false,
        easeFunc: function(t) {
            return t * t
        }
    },
    colorSelectors: [{ color: '#607D8B', min: 0, max: 100 }],
    lineWidth: 0.08,
    bgcolor: '#CFD8DC'
})

setInterval(() => {
    // random value
    dg1.setValue(rand())
    dg2.setValue(rand())
}, 4000)

setTimeout(() => {
    dg2.changeConfig({ title: 'wop' })
    dg2.update()
}, 5100)

function rand() {
    return Math.round(Math.random() * 100)
}

/* setTimeout(() => {
    animateTo(10);
}, 1000);
setTimeout(() => {
    animateTo(90);
}, 1400); */
