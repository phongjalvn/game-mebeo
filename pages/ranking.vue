<script lang="ts" setup>
import { capitalize } from '~/utils/str'

// composable
const { t } = useLang()

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
        <div class="">asdads</div>
      </PageSection>
      <PageSection>
        <PageSectionTitle text="Hard" class="capitalize" />
        <div class="">asdads</div>
      </PageSection>
    </PageBody>
  </PageWrapper>
</template>
