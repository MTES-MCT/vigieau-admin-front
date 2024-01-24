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
const accountOpened = ref(false);

const logout = function () {
  authStore.logout();
  navigateTo('/api/auth/logout', { external: true });
};

const a11yCompliance: string = 'Non conforme';
const accountOptions = (icon: boolean) => [
  {
    text: 'Utilisateurs',
    onclick: () => {
      navigateTo('/utilisateurs');
    },
    icon: icon ? 'ri-group-line' : null,
  },
  {
    text: "Paramètres d'affichage",
    onclick: () => {
      modalSchemeOpened.value = true;
    },
    icon: icon ? 'ri-sun-fill' : null,
  },
  {
    text: 'Déconnexion',
    onclick: logout,
    icon: icon ? 'ri-logout-box-r-line' : null,
  },
];
const quickLinks = (await authStore.isAuthenticated)
  ? [
      {
        label: 'Gestion des arrêtés cadre',
        to: '/arrete-cadre',
      },
      {
        label: 'Gestion des arrêtés de restriction',
        to: '/arrete-restriction',
      },
      {
        label: 'Mon compte',
        icon: 'ri-account-circle-fill',
        to: '#',
        onclick: ($event) => {
          $event?.preventDefault();
          accountOpened.value = !accountOpened.value;
          setTimeout(() => {
            const buttons = document.querySelector('.fr-header .fr-btns-group');
            const menu = document.querySelector('.fr-header__menu-list-link');
            const menuWidth = menu?.getElementsByClassName('fr-menu__list')[0].getBoundingClientRect().width;
            if(!buttons || !menu || !menuWidth) {
              return;
            }
            menu.style['right'] = (document.body.clientWidth - buttons.getBoundingClientRect().right + menuWidth) + 'px';            
          });
        },
      },
    ]
  : [];
const navItems = (await authStore.isAuthenticated)
  ? [
    {
      text: 'Gestion des arrêtés cadre',
      to: '/arrete-cadre',
    },
    {
      text: 'Gestion des arrêtés de restriction',
      to: '/arrete-restriction',
    },
    {
      title: 'Mon compte',
      links: accountOptions(false),
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

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    accountOpened.value = false;
  }
};

const onDocumentClick = (e: MouseEvent) => {
  handleElementClick(e.target as HTMLElement);
};

const handleElementClick = (el: HTMLElement) => {
  if (el === document.getElementById('account-menu-list')) {
    return;
  }

  if (!el?.parentNode) {
    accountOpened.value = false;
    return;
  }

  handleElementClick(el.parentNode as HTMLElement);
};

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeyDown);
});
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <DsfrHeader
    :service-title="serviceTitle"
    :logo-text="logoText"
    :quickLinks="quickLinks"
    :show-beta="runTimeConfig.domainName !== 'regleau.beta.gouv.fr'"
    home-to="/arrete-cadre"
  >
    <template #mainnav>
      <DsfrNavigation
        :nav-items="navItems"
      />
    </template>
  </DsfrHeader>
  <div v-show="accountOpened" id="account-menu-list" class="fr-header__menu-list-link">
    <div class="fr-menu">
      <ul class="fr-menu__list">
        <template v-for="action of accountOptions(true)">
          <li>
            <a
              class="fr-nav__link"
              @click="
                          action.onclick();
                          accountOpened = false;
                        "
            >
              <VIcon :name="action.icon" class="fr-mr-1w"/>
              {{ action.text }}
            </a>
          </li>
        </template>
      </ul>
    </div>
  </div>
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

<style lang="scss">
.fr-header__menu-list-link {
  z-index: 1000;
  position: absolute;
  top: 100px;
  right: -1000px;

  ul {
    list-style-type: none;

    li {
      padding: 0;
    }
  }

  a:not([href]) {
    color: inherit;

    &:hover {
      background-color: var(--hover-tint);
      --underline-hover-width: var(--underline-max-width);
    }
  }
}

@media (min-width: 62em) {
  .fr-header {
    .fr-nav {
      display: none;
    }
  }  
}
@media (max-width: 62em) {
  .fr-header {
    .fr-header__menu-links {
      display: none;
    }
  }
}
</style>
