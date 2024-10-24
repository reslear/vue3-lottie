import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
// import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    Vue(),
    //cssInjectedByJsPlugin(),
    libInjectCss(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: false,
      cleanVueFileName: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'vue3-lottie',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'lottie-web/build/player/lottie_light.min.js', '@reslear/dotlottie-player-core'],
      output: {
        exports: 'named',
       // chunkFileNames: 'chunks/[name].[hash].[extname]',
        assetFileNames: 'assets/[name][extname]',
       // entryFileNames: '[name].[extname]',
      },
    },
  },
})
