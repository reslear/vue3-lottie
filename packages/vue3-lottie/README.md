# Vue 3 Lottie

fork of [vue3-lottie](https://github.com/megasanjay/vue3-lottie) 

Changes: 
- `.lottie` support 
- used lighter version of lottie [Lottie-Light](https://github.com/airbnb/lottie-web/wiki/Lottie-Light).
- Breaking changes in events names

## Migration guide

### Upgrade to v3.x

1. remove `vue3-lottie` and install `@reslear/vue3-lottie`
2. Remove importing styles

```diff
- import 'vue3-lottie/dist/style.css'
```

3. Rename events names, also need remove `on` prefix:

   | 2.x                  | 3.x                 |
   | -------------------- | ------------------- |
   | `@onComplete`        | `@complete`         |
   | `@onLoopComplete`    | `@loop-complete`    |
   | `@onEnterFrame`      | `@enter-frame`      |
   | `@onSegmentStart`    | `@segment-start`    |
   | `@onAnimationLoaded` | `@animation-loaded` |

   ```diff
   - <Vue3Lottie :animationData="AstronautJSON" @onComplete="onComplete" />
   + <Vue3Lottie :animationData="AstronautJSON"  @complete="onComplete" />
   ```

## Usage

You can use one of the strategies:

### Basic assets usage

Bundle as assets your animation data with your application and import it into your component.

You app will be bigger (any json files bundled in to you script files and so we get a larger size because of internal optimizations for support in different browsers)

Recommended this strategy if you need to quickly load and render animation, for example in places where you want to see it first - dashboards, welcome screen, the first slide, etc.

```vue
<template>
  <Vue3Lottie :animationData="AstronautJSON" :height="200" :width="200" />
</template>

<script script="setup" lang="ts">
import { Vue3Lottie } from '@reslear/vue3-lottie'
import AstronautJSON from '../assets/astronaut.json'
</script>
```

### Using Lottie Animation URL

Load animation data from URL, but you will have problems with CORS and slow loading animation data, recommend host animation data on your `public` folder and set `animationLink` to relative path.

```vue
<template>
  <Vue3Lottie
    animationLink="https://assets10.lottiefiles.com/packages/lf20_soCRuE.json"
    :height="200"
    :width="200"
  />

  <Vue3Lottie animationLink="/animation-data.json" :height="200" :width="200" />
</template>
```

### Using Lottie Animation URL with dotLottie

Same as above, but with support for [dotLottie](https://dotlottie.io/) `.lottie` file format, preferred way to load animation data from URL. Fetching a small compressed format animation in the browser is unpacked and render on the fly.

We use own tiny powerful engine [dotlottie-player-core](https://github.com/reslear/dotlottie-player-core) to prepare data.

For converting `.json` to `.lottie` use [dotlottie-web-converter](https://dotlottie.io/resources/json-to-dotLottie/).

Recommended in all other cases where you do not need a strategy with assets import.

```vue
<template>
  <Vue3Lottie
    animationLink="https://assets10.lottiefiles.com/packages/lf20_soCRuE.lottie"
    :height="200"
    :width="200"
  />
</template>
```

### Comparison of strategies

| **Strategy**         | **Fast painting** | **Fast bundling** | **Not bundled** | **Compressed** | **No CORS problems** |
| -------------------- | ----------------- | ----------------- | --------------- | -------------- | -------------------- |
| Assets               | ✅                | ❌                | ❌              | ❌             | ✅                   |
| fetch .json          | ⚠️                | ✅                | ✅              | ❌             | ✅                   |
| fetch external .json | ⚠️                | ✅                | ✅              | ❌             | ⚠️                   |
| fetch .lottie        | ⚠️                | ✅                | ✅              | ✅             | ✅                   |
| fetch external .json | ⚠️                | ✅                | ✅              | ✅             | ⚠️                   |

## Props and options

| **Prop**         | **Type**          | **Default Value** | **Description**                                                                                                                                                 |
| ---------------- | ----------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| animationData    | Object/String     | ""                | The lottie animation data provided as a JSON or String JSON                                                                                                     |
| animationLink    | String            | ""                | A URL link to the Lottie animation data (eg: `Lottie Animation URL` on lottiefiles.com also support [dotLottie](https://dotlottie.io/) `.lottie` ) file format. |
| width            | Number/String     | 100%              | Width of the lottie animation container (Numbers correspond to pixel values)                                                                                    |
| height           | Number/String     | 100%              | Height of the lottie animation container (Numbers correspond to pixel values)                                                                                   |
| speed            | Number            | 1                 | Speed of the lottie animation                                                                                                                                   |
| direction        | String            | "forward"         | Animation play direction                                                                                                                                        |
| loop             | Number or Boolean | true              | The number of instances that the lottie animation should run (true is infinite)                                                                                 |
| autoPlay         | Boolean           | true              | Start animation on component load                                                                                                                               |
| delay            | Number            | 0                 | Delay the animation play state by some milliseconds                                                                                                             |
| pauseAnimation   | Boolean           | false             | Prop to pass reactive variables so that you can control animation pause and play                                                                                |
| pauseOnHover     | Boolean           | false             | Whether to pause the animation on hover                                                                                                                         |
| playOnHover      | Boolean           | false             | Whether to play the animation when you hover                                                                                                                    |
| backgroundColor  | String            | transparent       | Background color of the container                                                                                                                               |
| renderer         | String            | "svg"             | Set the renderer                                                                                                                                                |
| rendererSettings | Object            | {}                | Options for if you want to use an existing canvas to draw (can be ignored on most cases)                                                                        |

We can use `LottieProps` to define options interface.

```ts
import type { LottieProps } from '@reslear/vue3-lottie'
```

## Events

A few events are emitted from the component. Look at the [Demos](#Demos) for examples.

- `@complete`
  - If your animation has a finite amount of loops you can use this event to know when the animation has completed.
- `@loop-complete`
  - If your animation has a finite amount of loops you can use this event to know when the animation has completed a loop.
- `@enter-frame`
  - This event is fired every frame of the animation. There will be 60 events fired per second if your lottie animation runs at 60fps.
- `@segment-start`
  - This event is fired when the animation enters a segment.
- `@animation-loaded`
  - This event is fired when the animation has loaded. This should let you know when you can start referencing the methods for the component.

Example:

```vue
<Vue3Lottie animationLink="anim.json" @loop-complete="log('loop complete 1')" />
```

## Methods

You can control the animation with the following methods. These methods can be called by assigning a `ref` value to the `@reslear/vue3-lottie` component. Look at the [Demos](#Demos) for examples.

- play
  - Plays the animation
- pause
  - Pauses the animation
- stop
  - Stops the animation. This will also reset the animation to the first frame. Look at the demo for some examples.
- destroy
  - You can call this method to destroy the animation. It will remove the animation from the DOM.
- setSpeed(speed)
  - You can call this method to change the speed of your animation.
- setDirection(direction)
  - You can call this method to change the direction of your animation.
- getDuration(inFrames)
  - You can call this method to get the duration of your animation.
- goToAndStop(frameNumber, isFrames)
  - You can call this method to go to a specific frame of your animation. The animation will be stopped at the end of this call.
- goToAndPlay(frameNumber, isFrames)
  - You can call this method to go to a specific frame of your animation. The animation will be played from this frame.
- playSegments(segments, forceFlag)
  - You can call this method to play a specific segment of your animation.
- setSubFrame(subFrame)
  - You can call this method to set the subframe value.
- updateDocumentData(documentData, index)
  - This method updates text on text layers. Refer to the [official docs](https://github.com/airbnb/lottie-web/wiki/TextLayer.updateDocumentData) for how to use this method.
