import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { minify } from 'uglify-es'
import uglify from 'rollup-plugin-uglify'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default [
    // browser-friendly UMD build
    {
        input: 'src/index.js',
        name: 'funGauge',
        plugins: [
            resolve(), // so Rollup can find `ms`
            commonjs(), // so Rollup can convert `ms` to an ES module
            babel({
                // babelrc: false,
                exclude: [],
                include: ['./src/**', './node_modules/**']
            }),
            uglify(
                {
                    ie8: false,
                    toplevel: true,
                    output: {
                        ecma: 5
                    }
                },
                minify
            )
        ],
        output: {
            file: pkg.browser,
            format: 'umd'
        }
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // the `targets` option which can specify `dest` and `format`)
    {
        input: 'src/index.js',
        external: ['ms'],
        plugins: [
            // resolve(), // so Rollup can find `ms`
            // commonjs(), // so Rollup can convert `ms` to an ES module
            babel({
                exclude: [],
                include: ['./src/**', './node_modules/**']
            })
        ],
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' }
        ]
    }
]
