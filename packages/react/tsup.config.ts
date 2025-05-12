import { defineConfig, type Options } from 'tsup'
import path from 'node:path'

export default defineConfig([
    {
        treeshake: false,
        splitting: true,
        // target: 'es2020',
        format: ['cjs', 'esm'],
        entry: ['./src/index.tsx'],
        skipNodeModulesBundle: true,
        minify: true,
        bundle: false,
        clean: true,
        dts: true,
        outDir: 'dist',
        tsconfig: path.resolve(__dirname, './tsconfig.app.json'),
        external: ['react']
    }
])
