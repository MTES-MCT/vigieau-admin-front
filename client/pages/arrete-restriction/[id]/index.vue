<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Consultation arrêté de restriction - ${useRuntimeConfig().public.appName}`,
});
</script>

<template>
  <ArreteRestrictionConsultation />
</template>
