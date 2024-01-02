<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Arrêtés Restriction - ${useRuntimeConfig().public.appName}`,
});
</script>

<template>
  <ArreteRestrictionList />
</template>
