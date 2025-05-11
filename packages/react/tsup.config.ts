import { defineConfig, type Options } from 'tsup'
import path from 'node:path'

export default defineConfig((options: Options) => ({
    treeshake: true,
    splitting: true,
    // target: 'es2020',
    format: ['cjs', 'esm'],
    entry: ['./src/index.tsx'],
    skipNodeModulesBundle: true,
    minify: false,
    bundle: false,
    clean: true,
    dts: true,
    outDir: 'dist',
    tsconfig: path.resolve(__dirname, './tsconfig.app.json'),
    external: ['react'],
    ...options
}))
