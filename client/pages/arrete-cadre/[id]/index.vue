<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Consultation arrêté cadre - ${useRuntimeConfig().public.appName}`,
});

const breadcrumb = [
  {
    to: "/arrete-cadre",
    text: "Retour à la liste"
  }, {
    text: "Consultation"
  }
];
</script>

<template>
  <DsfrBreadcrumb :links="breadcrumb" />
  <ArreteCadreConsultation />
</template>
