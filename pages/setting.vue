<script lang="ts" setup>
import {
  TabGroup,
  TabList,
  Tab as HeadlessUiTab,
  TabPanels,
  TabPanel,
} from '@headlessui/vue'
import { capitalize } from '~/utils/str'
import { Size } from '~/composables/useScreen'

const { data: config } = await useFetch('/api/config')

// composable
const { t } = useLang()
const screen = useScreen()

// compiler macro
definePageMeta({
  layout: 'page',
})
useHead(() => ({
  title: capitalize(t('pages.setting.title')),
  meta: [
    {
      name: 'description',
      content: t('pages.setting.description'),
    },
  ],
}))

const saveConfig = async () => {
  const { data: submitResult } = await useFetch('/api/config', {
    method: 'POST',
    // @ts-ignore
    body: config.value.data,
  })
  if (submitResult.value?.success) {
    alert('Saved!')
  }
}
</script>

<template>
  <PageWrapper>
    <PageHeader>
      <PageTitle :text="$t('pages.setting.title')" class="capitalize" />
    </PageHeader>
    <PageBody>
      <PageSection>
        <TabGroup
          as="div"
          class="flex flex-col md:flex-row md:space-x-4"
          :vertical="screen.higherThan(Size.MEDIUM)"
        >
          <TabList class="w-full md:w-1/6 flex md:flex-col rounded-lg mb-2">
            <HeadlessUiTab v-slot="{ selected }" as="template">
              <button
                :class="[
                  'md:w-full text-left px-3 py-1.5 rounded py-2.5 text-sm leading-5 transition-all hover:bg-gray-200 hover:text-slate-900 dark:hover:bg-white/[0.12] dark:hover:text-white',
                  selected
                    ? 'font-extrabold'
                    : 'text-slate-800 dark:text-gray-400',
                ]"
              >
                General
              </button>
            </HeadlessUiTab>
          </TabList>
          <TabPanels class="flex-1">
            <TabPanel>
              <Card class="mb-4">
                <CardContent>
                  <CardTitle class="capitalize" text="General settings" />
                  <p class="mb-2">Max games:</p>
                  <div class="flex mb-4">
                    <FormTextInput
                      v-model.number="config.data.maxGame"
                      class="w-full md:w-1/3"
                    >
                    </FormTextInput>
                  </div>
                  <p class="mb-2">Time per draw:</p>
                  <div class="flex mb-4">
                    <FormTextInput
                      v-model.number="config.data.time"
                      class="w-full md:w-1/3"
                    >
                    </FormTextInput>
                  </div>
                  <p class="mb-2">Detection Threadhold (Max 1):</p>
                  <div class="flex mb-4">
                    <FormTextInput
                      v-model.number="config.data.detectionThreshold"
                      class="w-full md:w-1/3"
                    >
                    </FormTextInput>
                  </div>
                  <p class="mb-2">Brush size (Half on mobile):</p>
                  <div class="flex mb-4">
                    <FormTextInput
                      v-model.number="config.data.brushWidth"
                      class="w-full md:w-1/3"
                    >
                    </FormTextInput>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    class="w-full md:w-auto"
                    @click="
                      () => {
                        saveConfig()
                      }
                    "
                    >Save</Button
                  >
                </CardFooter>
              </Card>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </PageSection>
    </PageBody>
  </PageWrapper>
</template>
