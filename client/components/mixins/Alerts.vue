<script setup lang="ts">
import { useAlertStore } from "~/stores/alert";

const alertStore = useAlertStore();

onUnmounted(() => {
  alertStore.clearAll();
});
</script>

<template>
  <template v-for="alert of alertStore.alerts">
    <DsfrAlert
      v-if="alert"
      :type="alert.type"
      :title="alert.title"
      :description="alert.description"
      :small="!alert.title"
      :closeable="true"
      @close="alertStore.clearAlert(alert.description)"
    />
  </template>
</template>