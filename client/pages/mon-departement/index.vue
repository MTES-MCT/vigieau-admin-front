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
const utils = useUtils();
</script>

<template>
  <MixinsAlerts class="fr-mb-2w" />
  <h1 class="fr-mb-2w">
    Mon département
  </h1>
  <DsfrTabs :tab-titles="tabTitles"
            :initial-selected-index="selectedTabIndex"
            @select-tab="selectedTabIndex = $event; utils.scrollToTop()">
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
