<script setup lang="ts">
definePageMeta({
  layout: 'basic',
})

useHead({
  title: `Vérification zones d'alerte - ${useRuntimeConfig().public.appName}`,
})
</script>

<template>
  <ZoneAlerteVerification />
</template>
