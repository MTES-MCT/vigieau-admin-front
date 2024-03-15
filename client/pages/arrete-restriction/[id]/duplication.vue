<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Duplication arrêté de restriction - ${useRuntimeConfig().public.appName}`,
});

const breadcrumb = [
  {
    to: "/arrete-restriction",
    text: "Retour à la liste"
  }, {
    text: "Duplication"
  }
];
</script>

<template>
  <DsfrBreadcrumb :links="breadcrumb" />
  <ArreteRestrictionForm :duplicate="true" />
</template>
