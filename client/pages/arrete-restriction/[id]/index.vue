<script setup lang="ts">
definePageMeta({
  layout: "basic"
});

useHead({
  title: `Consultation arrêté de restriction - ${useRuntimeConfig().public.appName}`
});

const breadcrumb = [
  {
    to: "/arrete-restriction",
    text: "Retour à la liste"
  }, {
    text: "Consultation"
  }
];
</script>

<template>
  <DsfrBreadcrumb :links="breadcrumb" />
  <ArreteRestrictionConsultation />
</template>
