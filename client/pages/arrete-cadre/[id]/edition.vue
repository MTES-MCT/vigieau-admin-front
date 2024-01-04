<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Edition arrêté cadre - ${useRuntimeConfig().public.appName}`,
});
</script>

<template>
  <ArreteCadreFormWrapper />
</template>
