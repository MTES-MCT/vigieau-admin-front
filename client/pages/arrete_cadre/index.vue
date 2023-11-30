<script setup lang="ts">
definePageMeta({
  layout: 'basic',
})

const runTimeConfig = useRuntimeConfig().public

useHead({
  title: `Arrêtés Cadre - ${runTimeConfig.appName}`,
})
</script>

<template>
  <div>
    <h1 class="fr-mt-4w">
      Arrêtés Cadre
    </h1>
  </div>
</template>
