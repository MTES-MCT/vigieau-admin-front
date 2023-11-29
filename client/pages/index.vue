<script setup lang="ts">
definePageMeta({
  layout: 'basic',
})

useHead({
  title: `Accueil - ${useRuntimeConfig().public.appName}`,
})
</script>

<template>
  <div>
    <h1 class="fr-mt-4w">
      Accueil
    </h1>
  </div>
</template>
