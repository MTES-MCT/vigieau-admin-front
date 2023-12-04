<script setup lang="ts">
import type { Ref } from 'vue'

definePageMeta({
  layout: 'basic',
})

useHead({
  title: `Données personnelles - ${useRuntimeConfig().public.appName}`,
})

const links: Ref<any[]> = ref([{ to: '/', text: 'Accueil' }, { text: 'Données personnelles' }])
</script>

<template>
  <DsfrBreadcrumb :links="links" />
  <div>
    <h1>Politique de confidentialité</h1>
  </div>
</template>
