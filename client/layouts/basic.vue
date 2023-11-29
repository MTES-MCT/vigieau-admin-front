<script setup lang="ts">
import { useScheme } from "@gouvminint/vue-dsfr";

const runTimeConfig = useRuntimeConfig().public;
const serviceTitle = <string>runTimeConfig.appName;
const logoText = ["Ministère", "de la transition", "écologique", "et de la cohésion", "des territoires"];

const quickLinks = [
  {
    label: "Home",
    to: "/",
    icon: "ri-home-2-line"
  },
  {
    label: "Connexion",
    to: "/connexion",
    icon: "ri-flag-line"
  }
];

const preferences = reactive({
  theme: undefined,
  scheme: undefined
});

onMounted(() => {
  const { theme, scheme, setScheme } = <any>useScheme();
  preferences.theme = theme.value;
  preferences.scheme = scheme.value;
  // preferences.scheme = 'light';

  watchEffect(() => {
    preferences.theme = theme.value;
  });

  watchEffect(() => setScheme(preferences.scheme));
});

</script>

<template>
  <DsfrHeader
    :service-title="serviceTitle"
    :logo-text="logoText"
    :quick-links="quickLinks"
    :show-beta="runTimeConfig.domainName !== 'vigieau.gouv.fr'"
  />
  <main>
    <div class="fr-container">
      <slot />      
    </div>
  </main>
</template>
