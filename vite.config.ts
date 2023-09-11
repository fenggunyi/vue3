import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default {
    base: './',
    build: {
        minify: 'terser',
        terserOptions: {
            toplevel: true,
            compress: {
                drop_console: true,
                dead_code: true,
                passes: 2
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            comp: resolve(__dirname, 'src/components'),
            utils: resolve(__dirname, 'src/utils'),
        }
    },
    plugins: [
        vue(),
        vueJsx(),
    ],
    server: {
        open: true,
        host: '0.0.0.0'
    }
}
