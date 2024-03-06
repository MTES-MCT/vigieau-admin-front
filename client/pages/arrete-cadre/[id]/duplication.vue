<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Duplication arrêté cadre - ${useRuntimeConfig().public.appName}`,
});

const breadcrumb = [
  {
    to: "/arrete-cadre",
    text: "Arrêtes cadre"
  }, {
    text: "Duplication"
  }
];
</script>

<template>
  <DsfrBreadcrumb :links="breadcrumb" />
  <ArreteCadreForm :duplicate="true" />
</template>
