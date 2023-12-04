<script setup lang="ts">
import type { Ref } from 'vue'

definePageMeta({
  layout: 'basic',
})

useHead({
  title: `Arrêtés Cadre - ${useRuntimeConfig().public.appName}`,
})
const links: Ref<any[]> = ref([{ text: 'Arrêtés Cadre' }])
</script>

<template>
  <DsfrBreadcrumb :links="links" />
  <ArreteCadreList />
</template>
