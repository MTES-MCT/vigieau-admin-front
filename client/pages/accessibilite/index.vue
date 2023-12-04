<script setup lang="ts">
import type { Ref } from 'vue'

definePageMeta({
  layout: 'basic',
})

useHead({
  title: `Accessibilité - ${useRuntimeConfig().public.appName}`,
})

const links: Ref<any[]> = ref([{ to: '/', text: 'Accueil' }, { text: 'Accessibilité' }])
</script>

<template>
  <DsfrBreadcrumb :links="links" />
  <div>
    <h1>Déclaration d’accessibilité</h1>
  </div>
</template>
