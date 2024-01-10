<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Duplication arrêté cadre - ${useRuntimeConfig().public.appName}`,
});
</script>

<template>
  <ArreteCadreFormWrapper :duplicate="true" />
</template>
