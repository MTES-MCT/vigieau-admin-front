<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Edition arrêté de restriction - ${useRuntimeConfig().public.appName}`,
});


const route = useRoute();
const breadcrumb = [
  {
    to: "/arrete-restriction",
    text: "Retour à la liste"
  }, {
    text: route.params.id === 'nouveau' ? 'Création' : 'Edition'
  }
];
</script>

<template>
  <DsfrBreadcrumb :links="breadcrumb" />
  <ArreteRestrictionForm />
</template>
