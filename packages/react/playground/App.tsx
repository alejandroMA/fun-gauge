import { useState } from 'react'
import FunGauge from '../src'

function App() {
    const [value, setValue] = useState(90)

    function updateValue() {
        const newVal = Math.floor(Math.random() * 100)
        setValue(newVal)
    }

    return (
        <>
            <h1>Vite + React</h1>
            <div className='card'>
                <div>
                    <FunGauge
                        value={value}
                        colorSelectors={[
                            { min: 0, max: 14.28, color: '#6e40aa' },
                            { min: 14.28, max: 28.56, color: '#ee4395' },
                            { min: 28.56, max: 42.84, color: '#ff8c38' },
                            { min: 42.84, max: 57.12, color: '#aff05b' },
                            { min: 57.12, max: 71.4, color: '#28ea8d' },
                            { min: 71.4, max: 85.68, color: '#2f96e0' },
                            { min: 85.68, max: 100, color: '#6e40aa' }
                        ]}
                        animation={{
                            duration: 750
                        }}
                        theme={{
                            backgroundArcColor: '#eee'
                        }}
                    />
                </div>

                {/* <div>
                    <canvas style={{width: '100%'}} / >
                </div> */}

                <input
                    className='slider'
                    type='range'
                    min='0'
                    max='100'
                    step='0.01'
                    value={value}
                    onChange={(ev) => {
                        setValue(Number.parseInt(ev.target.value))
                    }}
                />
                <br />
                <button onClick={updateValue} type='button'>
                    count is {value}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
        </>
    )
}

export default App
