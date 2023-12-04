<script setup lang="ts">
import type { Ref } from 'vue'

definePageMeta({
  layout: 'basic',
})

useHead({
  title: `Cookies - ${useRuntimeConfig().public.appName}`,
})

const links: Ref<any[]> = ref([{ to: '/', text: 'Accueil' }, { text: 'Cookies' }])
</script>

<template>
  <DsfrBreadcrumb :links="links" />
  <div>
    <h1>Cookies et mesure d'audience</h1>
  </div>
</template>
