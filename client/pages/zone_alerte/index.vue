<script setup lang="ts">
definePageMeta({
  layout: 'basic',
})

const runTimeConfig = useRuntimeConfig().public

useHead({
  title: `Zones d'alerte - ${runTimeConfig.appName}`,
})
</script>

<template>
  <div>
    <h1 class="fr-mt-4w">
      Zones d'alerte
    </h1>
    <ZoneAlerteList />
  </div>
</template>
