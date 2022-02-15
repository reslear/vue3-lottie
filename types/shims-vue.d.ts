declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue3-lottie' {
  interface LottieProps {
    animationData?: any
    animationLink?: string
    loop?: boolean | number
    autoPlay?: boolean
    rendererSettings?: any
    width?: number | string
    height?: number | string
    speed?: number
    delay?: number
    direction?: string
    pauseOnHover?: boolean
    playOnHover?: boolean
    backgroundColor?: string
    pauseAnimation?: boolean
  }
}
