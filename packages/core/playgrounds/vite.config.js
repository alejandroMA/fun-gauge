import { resolve } from 'node:path'

export default {
    alias: {
        '/@src/': resolve(__dirname, '../src')
    }
}
