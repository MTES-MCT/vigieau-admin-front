<script setup lang="ts">
definePageMeta({
  layout: 'basic',
})

const runTimeConfig = useRuntimeConfig().public

useHead({
  title: `Utilisateurs - ${runTimeConfig.appName}`,
})
</script>

<template>
  <div>
    <h1 class="fr-mt-4w">
      Utilisateurs
    </h1>
    <UserList />
  </div>
</template>
