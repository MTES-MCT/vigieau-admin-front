<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Zones d'alerte - ${useRuntimeConfig().public.appName}`,
});
</script>

<template>
  <ZoneAlerteDepartementList />
</template>
