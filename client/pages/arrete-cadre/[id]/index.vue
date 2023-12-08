<script setup lang="ts">

definePageMeta({
  layout: 'basic',
})

useHead({
  title: `Consultation arrêté cadre - ${useRuntimeConfig().public.appName}`,
})

const route = useRoute()
console.log(route.params)
</script>

<template>
  <ArreteCadreFormWrapper />
</template>