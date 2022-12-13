<script lang="ts" setup>
import { capitalize } from '~/utils/str'
import supabase from '~~/libs/supabase'

// composable
const { t } = useLang()

const { data: playersData, refresh: refreshPlayersData } = await useFetch(
  '/api/savedGameData'
)

supabase
  .channel('schema-db-changes')
  .on('postgres_changes', { event: '*', schema: 'public' }, (payload) =>
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
</script>

<template>
  <PageWrapper>
    <PageHeader>
      <PageTitle :text="$t('pages.ranking.title')" class="capitalize" />
    </PageHeader>
    <PageBody>
      <PageSection>
        <PageSectionTitle text="Easy" class="capitalize" />
        <div class="">
          <table width="100%" class="border text-center border-green-200">
            <thead class="border-b border-green-200">
              <tr>
                <th class="border-r px-6 py-4 bg-green-100 border-green-200">
                  Rank
                </th>
                <th class="border-r px-6 py-4 bg-green-100 border-green-200">
                  Name
                </th>
                <th class="border-r px-6 py-4 bg-green-100 border-green-200">
                  Score
                </th>
                <!-- <th class="border-r px-6 py-4 bg-green-100 border-green-200">
                  Images
                </th> -->
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, index) in playersData.easyPlayersData"
                :key="index"
                class="border-b border-green-200"
              >
                <td class="border-r border-green-200 px-6 py-4">
                  {{ index + 1 }}
                </td>
                <td class="border-r border-green-200 px-6 py-4">
                  {{ player.userName }}
                  <a href="#">Images</a>
                </td>
                <td class="border-r border-green-200 px-6 py-4">
                  {{ player.score }}
                </td>
                <!-- <td class="border-r border-green-200 px-6 py-4">
                  <div class="flex justify-between py-4">

                    <img
                      v-for="(imageData, imageindex) in player.imagesData"
                      :key="imageindex"
                      :src="imageData.imgData"
                      class="w-32"
                    />
                  </div>
                </td> -->
              </tr>
            </tbody>
          </table>
        </div>
      </PageSection>
      <PageSection>
        <PageSectionTitle text="Hard" class="capitalize" />
        <div class="">
          <table width="100%">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Images</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, index) in playersData.hardPlayersData"
                :key="index"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ player.userName }}</td>
                <td>{{ player.score }}</td>
                <td>
                  <div class="flex justify-between py-4">
                    <img
                      v-for="(imageData, imageindex) in player.imagesData"
                      :key="imageindex"
                      :src="imageData.imgData"
                      class="w-32"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </PageSection>
    </PageBody>
  </PageWrapper>
</template>
