<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Consultation arrêté cadre - ${useRuntimeConfig().public.appName}`,
});
</script>

<template>
  <ArreteCadreFormWrapper />
</template>
