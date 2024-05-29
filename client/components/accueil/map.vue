<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const departementCode = authStore.user?.role === 'departement' ? authStore.user.roleDepartement : null;
const iframeSrc = departementCode ? `https://${useRuntimeConfig().public.domainName}/carte/?depCode=${departementCode}`
  : `https://${useRuntimeConfig().public.domainName}/carte/`;
</script>

<template>
  <div class="fr-card fr-pt-2w">
    <iframe width="100%" height="600px" :src="iframeSrc"></iframe>
  </div>
</template>