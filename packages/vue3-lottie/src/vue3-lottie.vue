<template>
  <div
    ref="root"
    class="lottie-animation-container"
    :style="getCurrentStyle"
    @mouseenter="hoverStarted"
    @mouseleave="hoverEnded"
  ></div>
</template>

<script lang="ts" setup>
import {
  ref,
  onMounted,
  computed,
  watch,
  shallowRef,
  onUnmounted,
} from 'vue'

// @ts-ignore
import Lottie from 'lottie-web/build/player/lottie_light.min.js'

import { parseData } from './utils'
import { fetchLottie } from '@reslear/dotlottie-player-core'

import type {
  AnimationDirection,
  AnimationItem,
  LottieProps,
} from './types'

const props = withDefaults(defineProps<LottieProps>(), {
  animationData: '',
  animationLink: '',
  loop: true,
  autoPlay: true,
  rendererSettings: null,
  width: '100%',
  height: '100%',
  speed: 1,
  delay: 0,
  direction: 'forward',
  pauseOnHover: false,
  playOnHover: false,
  backgroundColor: 'transparent',
  pauseAnimation: false,
  fetchOptions: undefined,
  renderer: 'svg',
})

const emit = defineEmits<{
  (event: 'complete'): void
  (event: 'loop-complete'): void
  (event: 'enter-frame'): void
  (event: 'segment-start'): void
  (event: 'animation-loaded'): void
}>()


let lottieAnimation: AnimationItem | null = null
const root = ref<HTMLElement | null>(null)

let direction: AnimationDirection = 1
const animationData = shallowRef<null | object>(null)

const loadLottie = async (element: Element) => {
  let autoPlay = props.autoPlay

  if (props.playOnHover) {
    autoPlay = false
  }

  let loop = props.loop

  // drop the loop by one
  if (typeof loop === 'number') {
    if (loop > 0) {
      loop = loop - 1
    }
  }

  if (props.delay > 0) {
    autoPlay = false
  }

  const lottieAnimationConfig: any = {
    container: element,
    renderer: props.renderer,
    rendererSettings: props.rendererSettings,
    loop: loop,
    autoplay: autoPlay,
    animationData: animationData.value,
  }

  // actually load the animation
  lottieAnimation = Lottie.loadAnimation(lottieAnimationConfig)

  if (!lottieAnimation) {
    return
  }

  setTimeout(() => {
    if (!lottieAnimation) return
    autoPlay = props.autoPlay

    if (props.playOnHover) {
      lottieAnimation.pause()
    } else {
      if (autoPlay) {
        lottieAnimation.play()
      } else {
        lottieAnimation.pause()
      }
    }

    /**
     * Emit an `onAnimationLoaded` event when the animation is loaded
     * This should help with times where you want to run functions on the ref of the element
     */
    if (!!props.onAnimationLoaded) {
      emit('animation-loaded')
    }
  }, props.delay)

  lottieAnimation.setSpeed(props.speed)

  if (props.direction === 'reverse') {
    lottieAnimation.setDirection(-1)
  }
  if (props.direction === 'normal') {
    lottieAnimation.setDirection(1)
  }

  if (props.pauseAnimation) {
    lottieAnimation.pause()
  } else {
    if (props.playOnHover) {
      lottieAnimation.pause()
    }
  }

  attachEvents()
}

function attachEvents() {
  if (!lottieAnimation) return

  // set the emit events
  if (!!props.onLoopComplete) {
    lottieAnimation.addEventListener('loopComplete', () => {
      if (!lottieAnimation) return

      if (props.direction === 'alternate') {
        lottieAnimation.stop()
        direction = direction === -1 ? 1 : -1 //invert direction
        lottieAnimation.setDirection(direction)
        lottieAnimation.play()
      }

      emit('loop-complete')
    })
  }

  if (!!props.onComplete) {
    lottieAnimation.addEventListener('complete', () => {
      emit('complete')
    })
  }

  if (!!props.onEnterFrame) {
    lottieAnimation.addEventListener('enterFrame', () => {
      emit('enter-frame')
    })
  }

  if (!!props.onSegmentStart) {
    lottieAnimation.addEventListener('segmentStart', () => {
      emit('segment-start')
    })
  }
}

// generate the css variables for width, height and background color
const getCurrentStyle: any = computed(() => {
  let width = props.width
  let height = props.height

  // set to px values if a number is passed
  if (typeof props.width === 'number') {
    width = `${props.width}px`
  }

  if (typeof props.height === 'number') {
    height = `${props.height}px`
  }

  let cssVariables = {
    '--lottie-animation-container-width': width,
    '--lottie-animation-container-height': height,
    '--lottie-animation-container-background-color': props.backgroundColor,
  }

  return cssVariables
})

// function to check if the container is being hovered
const hoverStarted = () => {
  if (lottieAnimation && props.pauseOnHover) {
    lottieAnimation.pause()
  }

  if (lottieAnimation && props.playOnHover) {
    lottieAnimation.play()
  }
}

// function to check if the container is no longer being hovered
const hoverEnded = () => {
  if (lottieAnimation && props.pauseOnHover) {
    lottieAnimation.play()
  }
  if (lottieAnimation && props.playOnHover) {
    lottieAnimation.pause()
  }
}

// watch for changes in props.pauseAnimation
watch(
  () => props.pauseAnimation,
  () => {
    // error if pauseAnimation is true and pauseOnHover is also true or playOnHover is also true
    if ((props.pauseOnHover || props.playOnHover) && props.pauseAnimation) {
      console.error(
        'If you are using pauseAnimation prop for Vue3-Lottie, please remove the props pauseOnHover and playOnHover',
      )
      return
    }

    // control the animation play state
    if (lottieAnimation) {
      if (props.pauseAnimation) {
        lottieAnimation.pause()
      } else {
        lottieAnimation.play()
      }
    }
  },
)

const destroy = () => {
  if (!lottieAnimation) return

  lottieAnimation.destroy()
  lottieAnimation = null
}

const setupLottie = () => {
  if (props.pauseOnHover && props.playOnHover) {
    throw new Error(
      'You cannot set pauseOnHover and playOnHover for Vue3-Lottie at the same time.',
    )
  }

  if (root.value) {
    loadLottie(root.value)
  }
}

/**
 * Prepare the animation data
 */
async function prepareAnimationData({
  data,
  link,
}: {
  data: any
  link: string
}) {
  // parse or fetch data
  const json = data
    ? parseData(data)
    : await fetchLottie(link, props.fetchOptions)

  if (!json) {
    throw new Error('You must provide correct animationLink or animationData')
  }

  animationData.value = json
}

watch(
  () => [props.animationData, props.animationLink],
  ([data, link]) => {
    prepareAnimationData({ link, data })
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  watch(
    () => animationData.value,
    (value, oldValue) => {
      if (value && value !== oldValue) {
        destroy()
        setupLottie()
      }
    },
    {
      immediate: true,
    },
  )
})

onUnmounted(() => {
  destroy()
})
</script>

<style>
.lottie-animation-container {
  width: var(--lottie-animation-container-width);
  height: var(--lottie-animation-container-height);
  background-color: var(--lottie-animation-container-background-color);
  overflow: hidden;
  margin: 0 auto;
}
</style>
