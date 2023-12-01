<script setup lang="ts">
import { useScheme } from "@gouvminint/vue-dsfr";
import { useAuthStore } from "~/stores/auth";

const runTimeConfig = useRuntimeConfig().public;
const authStore = useAuthStore();
const serviceTitle = <string>runTimeConfig.appName;
const logoText = ["Ministère", "de la transition", "écologique", "et de la cohésion", "des territoires"];

const logout = function() {
  authStore.logout();
  navigateTo('/api/auth/logout', { external: true })
}

const a11yCompliance: string = 'Non conforme';
const quickLinks = await authStore.isAuthenticated ? [
  {
    label: "AC",
    to: "/arrete_cadre",
    icon: "ri-article-line"
  },
  {
    label: "Utilisateurs",
    to: "/utilisateurs",
    icon: "ri-group-line"
  },
  {
    label: "Déconnexion",
    onclick: logout,
    to: '/',
    icon: "ri-logout-box-r-line"
  }
] : [];
const mandatoryLinks: any[] = [{
  label: `Accessibilité : ${a11yCompliance}`,
  to: '/accessibilite',
}, {
  label: 'Mentions légales',
  to: '/mentions-legales',
}, {
  label: 'Données personnelles',
  to: '/donnees-personnelles',
}, {
  label: 'Cookies',
  to: '/cookies',
}];
const ecosystemLinks: any[] = [
  {
    "label": "beta.gouv.fr",
    "href": "https://beta.gouv.fr"
  },
  {
    "label": "gouvernement.fr",
    "href": "https://gouvernement.fr"
  },
  {
    "label": "data.gouv.fr",
    "href": "https://data.gouv.fr"
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
  <DsfrFooter :logo-text="logoText"
              :mandatoryLinks="mandatoryLinks"
              :ecosystemLinks="ecosystemLinks">
  </DsfrFooter>
</template>
