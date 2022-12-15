<script lang="ts" setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  DisclosureButton,
  DisclosurePanel,
  Disclosure,
} from '@headlessui/vue'
import { capitalize } from '~/utils/str'
import supabase from '~~/libs/supabase'

// composable
const { t } = useLang()

const { data: playersData, refresh: refreshPlayersData } = await useFetch(
  '/api/savedGameData'
)

supabase
  .channel('schema-db-changes')
  .on('postgres_changes', { event: '*', schema: 'public' }, () =>
    refreshPlayersData()
  )
  .subscribe()

// compiler macro
definePageMeta({
  layout: 'page',
})
useHead(() => ({
  title: capitalize(t('pages.ranking.title')),
  meta: [
    {
      name: 'description',
      content: t('pages.ranking.description'),
    },
  ],
}))

const formatTime = (time: number) => {
  return useDateFormat(time, 'mm:ss').value
}

const isOpen = ref(false)
const currentImage = ref('')
const currentImageClass = ref('')

function closeModal() {
  isOpen.value = false
}
</script>

<template>
  <PageWrapper>
    <PageHeader>
      <PageTitle :text="$t('pages.ranking.title')" class="capitalize" />
    </PageHeader>
    <PageBody>
      <PageSection>
        <PageSectionTitle text="Easy" class="capitalize" />
        <div class="flex justify-between my-4 font-bold px-4">
          <div class="w-10 md:w-20">Rank</div>
          <div class="w-10 md:w-20 text-center">Score</div>
          <div class="w-20 md:w-40 text-center">Time</div>
          <div class="w-auto md:w-1/2 flex-1">Name</div>
        </div>
        <div
          v-for="(player, index) in playersData.easyPlayersData"
          :key="index"
          class="shadow-md my-4 rounded overflow-hidden"
        >
          <Disclosure>
            <DisclosureButton
              as="div"
              class="flex justify-between items-start font-bold py-6 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-2xl shadow-md cursor-pointer"
            >
              <div class="w-10 md:w-20">{{ index + 1 }}</div>
              <div class="w-10 md:w-20 text-center">{{ player.score }}</div>
              <div class="w-24 md:w-40 text-center">
                {{ formatTime(player.time) }}
              </div>
              <div class="w-auto md:w-1/2 flex-1">{{ player.userName }}</div>
            </DisclosureButton>
            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0 scale-y-0"
              enter-to-class="transform scale-100 opacity-100 scale-y-100"
              leave-active-class="transition duration-75 ease-out"
              leave-from-class="transform scale-y-100 opacity-100"
              leave-to-class="transform scale-0 opacity-0"
            >
              <DisclosurePanel
                class="bg-white grid grid-cols-2 md:grid-cols-6 gap-4 p-4"
              >
                <div
                  v-for="(imageData, imageindex) in player.imagesData"
                  :key="imageindex"
                  class="hover:animate-zoom-in shadow-lg rounded-lg relative overflow-hidden bg-no-repeat bg-cover flex justify-center items-center aspect-square cursor-pointer"
                  style="background-position: 50%"
                  @click="
                    () => {
                      isOpen = true
                      currentImage = imageData.imgData
                      currentImageClass = imageData.class
                    }
                  "
                >
                  <img
                    :src="imageData.imgData"
                    class="max-h-32 max-w-32 transition duration-300 ease-linear align-middle my-4"
                  />
                  <div
                    class="absolute top-0 right-0 bottom-0 left-0 w-full h-full overflow-hidden bg-fixed"
                  >
                    <div class="flex justify-start items-end h-full">
                      <h5
                        class="text-lg font-bold text-green-500/75 m-2 flex justify-between items-center"
                        :class="
                          imageData.isWin
                            ? 'text-green-500/75'
                            : 'text-red-500/75'
                        "
                      >
                        <icon-mdi:check-circle
                          v-if="imageData.isWin"
                          class="text-green-500/75"
                        />
                        <icon-mdi:close-circle v-else class="text-red-500/75" />
                        <span class="ml-2">{{ imageData.class }}</span>
                      </h5>
                    </div>
                  </div>
                </div>
              </DisclosurePanel>
            </transition>
          </Disclosure>
        </div>
      </PageSection>
      <PageSection>
        <PageSectionTitle text="Hard" class="capitalize" />
        <div class="flex justify-between my-4 font-bold px-4">
          <div class="w-10 md:w-20">Rank</div>
          <div class="w-10 md:w-20 text-center">Score</div>
          <div class="w-20 md:w-40 text-center">Time</div>
          <div class="w-auto md:w-1/2 flex-1">Name</div>
        </div>
        <div
          v-for="(player, index) in playersData.hardPlayersData"
          :key="index"
          class="shadow-md my-4 rounded overflow-hidden"
        >
          <Disclosure>
            <DisclosureButton
              as="div"
              class="flex justify-between items-start font-bold py-6 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-2xl shadow-md cursor-pointer"
            >
              <div class="w-10 md:w-20">{{ index + 1 }}</div>
              <div class="w-10 md:w-20 text-center">{{ player.score }}</div>
              <div class="w-24 md:w-40 text-center">
                {{ formatTime(player.time) }}
              </div>
              <div class="w-auto md:w-1/2 flex-1">{{ player.userName }}</div>
            </DisclosureButton>
            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0 scale-y-0"
              enter-to-class="transform scale-100 opacity-100 scale-y-100"
              leave-active-class="transition duration-75 ease-out"
              leave-from-class="transform scale-y-100 opacity-100"
              leave-to-class="transform scale-0 opacity-0"
            >
              <DisclosurePanel
                class="bg-white grid grid-cols-2 md:grid-cols-6 gap-4 p-4"
              >
                <div
                  v-for="(imageData, imageindex) in player.imagesData"
                  :key="imageindex"
                  class="hover:animate-zoom-in shadow-lg rounded-lg relative overflow-hidden bg-no-repeat bg-cover flex justify-center items-center aspect-square cursor-pointer"
                  style="background-position: 50%"
                  @click="
                    () => {
                      isOpen = true
                      currentImage = imageData.imgData
                      currentImageClass = imageData.class
                    }
                  "
                >
                  <img
                    :src="imageData.imgData"
                    class="max-h-32 max-w-32 transition duration-300 ease-linear align-middle my-4"
                  />
                  <div
                    class="absolute top-0 right-0 bottom-0 left-0 w-full h-full overflow-hidden bg-fixed"
                  >
                    <div class="flex justify-start items-end h-full">
                      <h5
                        class="text-lg font-bold text-green-500/75 m-2 flex justify-between items-center"
                        :class="
                          imageData.isWin
                            ? 'text-green-500/75'
                            : 'text-red-500/75'
                        "
                      >
                        <icon-mdi:check-circle
                          v-if="imageData.isWin"
                          class="text-green-500/75"
                        />
                        <icon-mdi:close-circle v-else class="text-red-500/75" />
                        <span class="ml-2">{{ imageData.class }}</span>
                      </h5>
                    </div>
                  </div>
                </div>
              </DisclosurePanel>
            </transition>
          </Disclosure>
        </div>
      </PageSection>
    </PageBody>
    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" class="relative z-10" @close="closeModal">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-4 text-center"
          >
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-4xl font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  <span class="flex-1">{{ currentImageClass }}</span>
                  <button @click="closeModal">
                    <icon-mdi:close-box class="w-8 h-8" />
                  </button>
                </DialogTitle>
                <div class="mt-2">
                  <div
                    class="text-sm text-gray-500 w-80vw md:w-40vw max-h-[70vh] aspect-square flex justify-center items-center"
                  >
                    <img
                      :src="currentImage"
                      class="object-contain w-4/5 aspect-square"
                    />
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </PageWrapper>
</template>
