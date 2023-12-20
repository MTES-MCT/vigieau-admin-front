<script setup lang="ts">
import type { Ref } from 'vue';

definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Mentions légales - ${useRuntimeConfig().public.appName}`,
});

const links: Ref<any[]> = ref([{ to: '/', text: 'Accueil' }, { text: 'Mentions légales' }]);
</script>

<template>
  <DsfrBreadcrumb :links="links" />
  <div>
    <h1>Mentions légales</h1>
  </div>
</template>
