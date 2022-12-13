<script lang="ts" setup>
import { capitalize } from '~/utils/str'

// composable
const { t } = useLang()

// compiler macro
definePageMeta({
  layout: 'page',
})
useHead(() => ({
  title: capitalize(t('pages.rules.title')),
  meta: [
    {
      name: 'description',
      content: t('pages.rules.description'),
    },
  ],
}))
</script>

<template>
  <PageContentRenderer
    path="/page/rules"
    :page-title="$t('pages.rules.title')"
  />
</template>
