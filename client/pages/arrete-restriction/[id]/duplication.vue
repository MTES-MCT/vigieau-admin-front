<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Duplication arrêté de restriction - ${useRuntimeConfig().public.appName}`,
});
</script>

<template>
  <ArreteRestrictionForm :duplicate="true" />
</template>
