<script setup lang="ts">
import type { Ref } from 'vue'

definePageMeta({
  layout: 'basic',
})

useHead({
  title: `Zones d'alerte - ${useRuntimeConfig().public.appName}`,
})
const links: Ref<any[]> = ref([{ text: 'Zones d\'alerte' }])
</script>

<template>
  <DsfrBreadcrumb :links="links" />
  <ZoneAlerteList />
</template>
