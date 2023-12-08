<script setup lang="ts">

definePageMeta({
  layout: 'basic',
})

useHead({
  title: `Arrêtés Cadre - ${useRuntimeConfig().public.appName}`,
})
</script>

<template>
  <ArreteCadreList />
</template>
