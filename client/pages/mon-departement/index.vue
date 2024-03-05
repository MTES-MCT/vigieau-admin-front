<script setup lang="ts">
import type { Ref } from "vue";

definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Mon département - ${useRuntimeConfig().public.appName}`,
});

const tabTitles = [
  {title: 'Paramètres'},
  {title: 'Utilisateurs'}
];
const selectedTabIndex: Ref<number> = ref(0);
</script>

<template>
  <MixinsAlerts class="fr-mb-2w" />
  <DsfrTabs :tab-titles="tabTitles"
            :initial-selected-index="selectedTabIndex"
            @select-tab="selectedTabIndex = $event">
    <DsfrTabContent
      panel-id="tab-content-0"
      tab-id="tab-0"
      :selected="selectedTabIndex === 0">
      <MonDepartement />
    </DsfrTabContent>
    <DsfrTabContent
      panel-id="tab-content-1"
      tab-id="tab-1"
      :selected="selectedTabIndex === 1">
      <UserList />
    </DsfrTabContent>
  </DsfrTabs>
</template>
