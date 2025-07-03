import { defineConfig } from 'tsup'
import path from 'node:path'

export default defineConfig([
    {
        treeshake: true,
        format: ['cjs', 'esm', 'iife'],
        entry: ['./src/index.ts'],
        minify: false,
        clean: true,
        dts: true,
        outDir: 'dist',
        tsconfig: path.resolve(__dirname, './tsconfig.json')
    }
])
