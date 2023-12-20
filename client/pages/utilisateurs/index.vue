<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Utilisateurs - ${useRuntimeConfig().public.appName}`,
});
</script>

<template>
  <UserList />
</template>
