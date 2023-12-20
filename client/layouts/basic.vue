<script setup lang="ts">
import { useScheme } from '@gouvminint/vue-dsfr';
import { useAuthStore } from '~/stores/auth';
import type { Ref } from 'vue';

const runTimeConfig = useRuntimeConfig().public;
const authStore = useAuthStore();
const serviceTitle = <string>runTimeConfig.appName;
const logoText = ['Ministère', 'de la transition', 'écologique', 'et de la cohésion', 'des territoires'];
const modalSchemeOpened = ref(false);
const schemeFormRef = ref(null);
const { theme, scheme, setScheme } = <any>useScheme();

const logout = function () {
  authStore.logout();
  navigateTo('/api/auth/logout', { external: true });
};

const a11yCompliance: string = 'Non conforme';
const quickLinks = (await authStore.isAuthenticated)
  ? [
      {
        label: 'AC',
        to: '/arrete-cadre',
        icon: 'ri-article-line',
      },
      {
        label: 'ZA',
        to: '/zone-alerte',
        icon: 'gi-france',
      },
      {
        label: 'Utilisateurs',
        to: '/utilisateurs',
        icon: 'ri-group-line',
      },
      {
        label: 'Déconnexion',
        onclick: logout,
        button: true,
        icon: 'ri-logout-box-r-line',
      },
      {
        label: "Paramètres d'affichage",
        onclick: () => {
          modalSchemeOpened.value = true;
        },
        button: true,
        icon: 'ri-sun-fill',
      },
    ]
  : [];
const mandatoryLinks: any[] = [
  {
    label: `Accessibilité : ${a11yCompliance}`,
    to: '/accessibilite',
  },
  {
    label: 'Mentions légales',
    to: '/mentions-legales',
  },
  {
    label: 'Données personnelles',
    to: '/donnees-personnelles',
  },
  {
    label: 'Cookies',
    to: '/cookies',
  },
];
const ecosystemLinks: any[] = [
  {
    label: 'beta.gouv.fr',
    href: 'https://beta.gouv.fr',
  },
  {
    label: 'gouvernement.fr',
    href: 'https://gouvernement.fr',
  },
  {
    label: 'data.gouv.fr',
    href: 'https://data.gouv.fr',
  },
];
const closeModal = () => {
  modalSchemeOpened.value = false;
};
const saveScheme = () => {
  preferences.scheme = schemeFormRef.value?.currentScheme;
  closeModal();
};
const modalActions: Ref<any[]> = ref([
  {
    label: 'Enregistrer',
    onClick: saveScheme,
  },
  {
    label: 'Annuler',
    onClick: closeModal,
    secondary: true,
  },
]);

const preferences = reactive({
  theme: undefined,
  scheme: undefined,
});

onMounted(() => {
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
    home-to="/arrete-cadre"
  />
  <main>
    <div class="fr-container fr-my-4w">
      <slot />
    </div>
  </main>
  <DsfrFooter :logo-text="logoText" :mandatoryLinks="mandatoryLinks" :ecosystemLinks="ecosystemLinks" home-link="/arrete-cadre" />
  <DsfrModal :opened="modalSchemeOpened" title="Paramètres d'affichage" :actions="modalActions" @close="closeModal">
    <SchemeForm ref="schemeFormRef" />
  </DsfrModal>
</template>
