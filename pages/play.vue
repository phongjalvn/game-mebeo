<script lang="ts" setup>
import { SMALL_CLASS_NAMES, BIG_CLASS_NAMES } from '../utils/class_names'
import { IPointer, IScore } from '@/types/common'
import { capitalize } from '~/utils/str'
import { TFModel } from '~~/utils/model'

// composable
const { t } = useLang()

const { $fabric, $TFModel, $disposeTFVariables } = useNuxtApp()

const { data: config } = await useFetch('/api/config')

// console.log(config, playersData)

// compiler macro
definePageMeta({
  layout: 'page',
})

useHead(() => ({
  title: capitalize(t('pages.play.title')),
  meta: [
    {
      name: 'description',
      content: t('pages.play.description'),
    },
  ],
}))

// Game constant
const maxGame = config?.value?.data?.maxGame || 6
const time = config?.value?.data?.time || 20
// More detectionThreshold = more strict, 1 is max
const detectionThreshold = config?.value?.data?.detectionThreshold || 0.5
// @ts-ignore
let canvas: fabric.Canvas
let smallModel: TFModel
let bigModel: TFModel
const smallModelURL = '/small_model/model.json'
const bigModelURL = '/big_model/model.json'

const container = ref(null)
const { width: containerWidth, height: containerHeight } =
  useElementSize(container)

const difficulty = ref('easy')
const step = ref(0)
const currentDrawClass = ref('')
const currentGame = ref(1)
const playing = ref(false)
const timeRemaining = ref(time)
const audioPlayer = ref<HTMLAudioElement | null>(null)
const dingPlayer = ref<HTMLAudioElement | null>(null)
const score = ref(0)
const gameTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const submitTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const userName = ref('')
const hasUserName = ref(false)
const showSuccessModal = ref(false)
const startTime = ref(0)
const endTime = ref(0)
const timeTaken = computed(() => endTime.value - startTime.value)

// Game canvas refs
const loadingModelOver = ref(false)
const rawPredictions = ref([])
const mousePressed = ref(false)
const coords = ref<IPointer[]>([])
// const smallRanking = ref([])
// const bigRanking = ref([])
const brushWidth = ref(20)
const imagesData = ref<IScore[]>([])

// Voice
const voice = ref<SpeechSynthesisVoice>(
  undefined as unknown as SpeechSynthesisVoice
)
const textVoice = ref('')

const speech = useSpeechSynthesis(textVoice, {
  voice,
})

let synth: SpeechSynthesis
const voices = ref<SpeechSynthesisVoice[]>([])

const playVoice = () => {
  if (speech.status.value === 'pause') {
    window.speechSynthesis.resume()
  } else {
    speech.speak()
  }
}

// const pauseVoice = () => {
//   window.speechSynthesis.pause()
// }

const stopVoice = () => {
  window.speechSynthesis.cancel()
}

const findIndicesOfMax = computed<number[]>(() => {
  const outp = []
  for (let i = 0; i < rawPredictions.value.length; i++) {
    outp.push(i) // add index to output array
    if (outp.length > 5) {
      const pred = rawPredictions.value
      outp.sort(function (a, b) {
        return pred[b] - pred[a]
      }) // descending sort the output array
      outp.pop() // remove the last index (index of smallest element in output array)
    }
  }
  return outp
})

// const findTopValues = computed(() => {
//   const outp = new Array([])
//   const indices = findIndicesOfMax.value
//   // show greatest score only if match > 0.3
//   for (let i = 0; i < indices.length; i++) {
//     if (rawPredictions.value[indices[i]] > 0.3)
//       outp[i] = rawPredictions.value[indices[i]]
//   }
//   return outp
// })

const getTopClassNames = computed(() => {
  const outp = []
  const indices = findIndicesOfMax.value
  for (let i = 0; i < indices.length; i++) {
    if (rawPredictions.value[indices[i]] > detectionThreshold)
      outp[i] = getClassNames.value[indices[i]]
  }
  return outp
})

const getTopClassName = computed(() => {
  return getTopClassNames.value.find((item) => item === currentDrawClass.value)
})

const getClassNames = computed(() => {
  if (difficulty.value === 'easy') {
    return SMALL_CLASS_NAMES
  } else {
    return BIG_CLASS_NAMES
  }
})

const getLengthNames = (mode: string) => {
  if (mode === 'easy') {
    return SMALL_CLASS_NAMES.length
  } else {
    return BIG_CLASS_NAMES.length
  }
}

const randomQuestion = () => {
  // random class name from classNames
  currentDrawClass.value =
    getClassNames.value[Math.floor(Math.random() * getClassNames.value.length)]
  timeRemaining.value = time
  dingPlayer.value?.play()
}

const startCountDown = () => {
  gameTimer.value = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      dingPlayer.value?.play()
      // @ts-ignore
      clearInterval(gameTimer.value)
      nextGame()
    }
    if (timeRemaining.value <= 5) {
      audioPlayer.value?.play()
    }
  }, 1000)
}

const initCanvas = () => {
  setTimeout(() => {
    $fabric.Object.prototype.selectable = false
    canvas = new $fabric.Canvas('c', {
      isDrawingMode: true,
    })
    if (!canvas) return
    canvas.backgroundColor = '#FFFFFF'
    canvas.freeDrawingBrush.width = 20
    canvas.renderAll()
    canvas.on('mouse:down', () => {
      mousePressed.value = true
    })
    canvas.on('mouse:up', () => {
      submitCanvas()
      mousePressed.value = false
    })
    // @ts-ignore
    canvas.on('mouse:move', (e: MouseEvent) => {
      recordCoor(e)
    })
  }, 1000)
}

const startGame = (mode: any) => {
  difficulty.value = mode || difficulty.value
  step.value = 1
  currentDrawClass.value = ''
  currentGame.value = 1
  playing.value = false
  timeRemaining.value = time
  score.value = 0
  imagesData.value = []
  showSuccessModal.value = false
  startTime.value = Date.now()
  endTime.value = 0
  randomQuestion()
}

const playCurrentGame = () => {
  playing.value = true
  canvas.isDrawingMode = true
  startCountDown()
}

const nextGame = () => {
  // @ts-ignore
  clearInterval(gameTimer.value)
  submitDrawing()
  if (currentGame.value < maxGame) {
    playing.value = false
    currentGame.value++
    randomQuestion()
  } else {
    step.value = 2
    playing.value = false
    endTime.value = Date.now()
  }
}

const recordCoor = (e: MouseEvent) => {
  // @ts-ignore
  const pointer = canvas.getPointer(event.e)
  const posX = pointer.x
  const posY = pointer.y
  if (posX >= 0 && posY >= 0 && mousePressed.value) {
    coords.value.push(pointer)
  }
}

const getMinBox = () => {
  const coorX = coords.value.map(function (p) {
    return p.x
  })
  const coorY = coords.value.map(function (p) {
    return p.y
  })
  const minCoords = {
    x: Math.min.apply(null, coorX) - brushWidth.value / 2,
    y: Math.min.apply(null, coorY) - brushWidth.value / 2,
  }
  const maxCoords = {
    x: Math.max.apply(null, coorX) + brushWidth.value / 2,
    y: Math.max.apply(null, coorY) + brushWidth.value / 2,
  }
  return {
    min: minCoords,
    max: maxCoords,
  }
}

const submitCanvas = () => {
  if (getTopClassName.value) return
  const inputImg = getImageData()
  if (difficulty.value === 'easy') {
    // @ts-ignore
    rawPredictions.value = smallModel.predictClass(inputImg)
  } else {
    // @ts-ignore
    rawPredictions.value = bigModel.predictClass(inputImg)
  }
}

const clearCanvas = () => {
  /**
   * Resets the canvas
   */
  canvas.clear()
  canvas.backgroundColor = '#FFFFFF'
  rawPredictions.value = []
  coords.value = []
}

const submitDrawing = () => {
  canvas.isDrawingMode = false
  // @ts-ignore
  clearTimeout(submitTimer.value)
  const winClass = getTopClassName.value
  let isWin = false
  if (winClass) {
    isWin = true
    score.value++
  } else {
    textVoice.value = `Sorry, I cannot find ${currentDrawClass.value}`
    playVoice()
  }
  const imgData = getImageDataUrl()
  if (imgData) {
    imagesData.value.push({ imgData, isWin, class: currentDrawClass.value })
  }
  clearCanvas()
}

const getImageData = () => {
  /**
   * Get image data in canvas
   */
  try {
    const mbb = getMinBox()
    const dpi = window.devicePixelRatio
    // @ts-ignore
    const imgData = canvas.contextContainer.getImageData(
      mbb.min.x * dpi,
      mbb.min.y * dpi,
      (mbb.max.x - mbb.min.x) * dpi,
      (mbb.max.y - mbb.min.y) * dpi
    )
    return imgData
  } catch (error) {
    return false
  }
}

const getImageDataUrl = () => {
  try {
    const mbb = getMinBox()
    const options = {
      left: mbb.min.x === Infinity ? 0 : mbb.min.x,
      top: mbb.min.y === Infinity ? 0 : mbb.min.y,
      width: mbb.max.x - mbb.min.x === -Infinity ? 280 : mbb.max.x - mbb.min.x,
      height: mbb.max.y - mbb.min.y === -Infinity ? 280 : mbb.max.y - mbb.min.y,
    }
    // @ts-ignore
    const imgData = canvas.toDataURL(options)
    return imgData
  } catch (error) {
    // console.log(error)
    return false
  }
}

const checkUserName = () => {
  if (userName.value) {
    hasUserName.value = true
  } else {
    alert('Please enter your name')
  }
}

onMounted(() => {
  loadingModelOver.value = false

  smallModel = new $TFModel()
  bigModel = new $TFModel()
  Promise.all([
    smallModel.loadModel(smallModelURL),
    bigModel.loadModel(bigModelURL),
  ]).then(() => {
    loadingModelOver.value = true
  })

  initCanvas()

  if (speech.isSupported.value) {
    // load at last
    setTimeout(() => {
      synth = window.speechSynthesis
      voices.value = synth.getVoices()
      // @ts-ignore
      voice.value = voices.value.find((v) => v.lang === 'en-US')
    })
  }
})

watch(
  () => brushWidth.value,
  (val) => {
    if (canvas) {
      canvas.freeDrawingBrush.width = val
    }
  }
)

watch(
  () => getTopClassNames.value,
  (val) => {
    stopVoice()
    if (val && val.length > 0) {
      setTimeout(() => {
        // @ts-ignore
        clearTimeout(submitTimer.value)
        const match = val.find((v) => v === currentDrawClass.value)
        if (match) {
          textVoice.value = `Oh, I got it, it's ${getTopClassName.value}`
          canvas.isDrawingMode = false
          submitTimer.value = setTimeout(() => {
            nextGame()
          }, 3000)
        } else {
          textVoice.value = `I see`
          val.forEach((v, i) => {
            if (i === 0) {
              textVoice.value += ` ${v}`
            } else {
              textVoice.value += `, or ${v}`
            }
          })
        }
        playVoice()
      }, 100)
    }
  }
)

onBeforeUnmount(() => {
  $disposeTFVariables()
})

const submitGameToServer = async () => {
  if (loadingModelOver.value === false) return
  if (userName.value === '') return alert('Please enter your name')
  const body = {
    score: score.value,
    imagesData: imagesData.value,
    userName: userName.value,
    mode: difficulty.value,
    time: timeTaken.value,
  }
  loadingModelOver.value = false
  const { data: submitResult } = await useFetch('/api/saveGame', {
    method: 'POST',
    body,
  })
  loadingModelOver.value = true
  if (submitResult.value?.success) {
    showSuccessModal.value = true
  }
  // console.log(submitResult)
}
</script>

<template>
  <div
    ref="container"
    class="min-h-[calc(100vh_-_48px)] w-full bg-blue-300 handWritten text-3xl lg:text-6xl relative flex-1 overflow-hidden"
  >
    <audio ref="audioPlayer" src="/assets/click.mp3" />
    <audio ref="dingPlayer" src="/assets/ding.mp3" />
    <canvas
      id="c"
      class="h-full w-full"
      :width="containerWidth"
      :height="containerHeight"
    ></canvas>
    <Transition name="slide-fade">
      <div
        v-if="step === 0"
        class="absolute bg-blue-300 inset-0 flex flex-col justify-center items-center"
      >
        <div v-if="!hasUserName" class="mb-6 text-2xl min-w-80">
          <label
            for="name"
            class="block mb-2 font-medium text-gray-900 dark:text-white"
            >Your name</label
          >
          <input
            id="name"
            v-model="userName"
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Please enter your name"
            required
            @keypress.enter="checkUserName"
          />
          <Button class="my-4" size="xl" @click="checkUserName">OK</Button>
        </div>
        <template v-else>
          <span>Start game in</span>
          <Button
            class="my-10"
            size="xl"
            type="secondary"
            @click="startGame('easy')"
            >Easy mode ({{ getLengthNames('easy') }})</Button
          >
          <Button size="xl" @click="startGame('easy')"
            >Hard mode ({{ getLengthNames('hard') }})</Button
          >
        </template>
      </div>
    </Transition>
    <Transition name="slide-fade">
      <div
        v-if="step === 1"
        class="absolute bg-yellow-300 flex flex-col justify-center items-center transition-all duration-500 ease-in-out text-center"
        :class="playing ? 'inset-x-0 top-0 h-20 md:h-1/20' : 'inset-0 h-full'"
      >
        <template v-if="!playing">
          <span class="mb-4">{{ currentGame }}/{{ maxGame }}</span>
          <span>Draw</span>
          <strong class="my-4 lg:my-8">{{ currentDrawClass }}</strong>
          <span>in under {{ timeRemaining }} seconds</span>
          <Button size="lg" class="mt-10" @click="playCurrentGame"
            >Got it!</Button
          >
        </template>
        <template v-else>
          <div class="flex w-full text-base px-2">
            <div class="flex-1 flex items-center mr-4">
              <span>Draw:</span>
              <strong class="text-lg ml-2">{{ currentDrawClass }}</strong>
            </div>
            <Button class="flex-0" size="sm">
              <span>00:</span
              ><strong class="text-lg">{{ timeRemaining }}</strong>
            </Button>
            <div class="flex-1 flex justify-end items-center space-x-2">
              <Button size="sm" @click="clearCanvas">
                <icon-mdi:eraser />
              </Button>
              <Button size="sm" @click="nextGame">
                <icon-mdi:chevron-double-right />
              </Button>
            </div>
          </div>
        </template>
      </div>
    </Transition>
    <Transition name="slide-fade">
      <div
        v-if="step === 2"
        class="absolute inset-0 flex flex-col justify-center items-center bg-green-400 z-10"
      >
        <div class="my-8">
          Your score: <strong class="text-red-700">{{ score }}</strong>
        </div>
        <div
          class="grid grid-cols-1 md:grid-cols-3 text-center overflow-auto flex-1"
        >
          <div
            v-for="(image, index) in imagesData"
            :key="index"
            class="flex flex-col justify-center items-center"
          >
            <img :src="image.imgData" class="w-1/2 mx-auto my-4" />
            <div class="text-xl flex justify-center items-center">
              {{ image.class }}
              <icon-mdi:check v-if="image.isWin" class="text-green-700" />
              <icon-mdi:close v-else class="text-red-700" />
            </div>
          </div>
        </div>
        <Button size="lg" class="my-8" @click="submitGameToServer">
          Submit <icon-mdi:loading v-if="!loadingModelOver" class="ml-2" />
        </Button>
      </div>
    </Transition>
    <div
      v-if="playing && step === 1"
      class="absolute inset-x-0 bottom-10 pointer-events-none text-2xl px-8"
    >
      <span v-if="!getTopClassName">
        <span v-if="getTopClassNames.length > 0">
          I see
          <strong
            v-for="(topName, index) in getTopClassNames"
            :key="topName"
            class="text-red-400"
            >{{ topName }}
            <span v-if="index < getTopClassNames.length - 1">,</span>
          </strong>
        </span>
        <span v-else>Not sure what you draw</span>
      </span>
      <span v-else class="text-green-600"
        >Oh, I got it, it's {{ getTopClassName }}</span
      >
    </div>
    <div
      v-if="showSuccessModal"
      class="absolute inset-0 z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      ></div>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <div
            class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          >
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                >
                  <icon-mdi:check-circle class="text-green-600" />
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3
                    id="modal-title"
                    class="text-lg font-medium leading-6 text-gray-900"
                  >
                    Thank you for playing
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Your score:
                      <strong class="text-red-700">{{ score }}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-4"
            >
              <button
                type="button"
                class="flex-1 cursor-pointer inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                @click="startGame('easy')"
              >
                Play again!
              </button>
              <NuxtLink
                class="flex-1 mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                to="/ranking"
              >
                View ranking
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Transition name="slide-fade">
      <div
        v-if="!loadingModelOver"
        class="absolute inset-0 flex flex-col justify-center items-center bg-red-400 z-20 opacity-75"
      >
        <icon-mdi:loading class="animate-spin text-light-100" />
      </div>
    </Transition>
  </div>
</template>
