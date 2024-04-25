<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Accueil - ${useRuntimeConfig().public.appName}`,
});

const authStore = useAuthStore();
const departementCode = authStore.user?.role === 'departement' ? authStore.user.roleDepartement : null;
const iframeSrc = departementCode ? `https://${useRuntimeConfig().public.domainName}/carte/?depCode=${departementCode}`
  : `https://${useRuntimeConfig().public.domainName}/carte/`;
const cartes = [
  {
    title: 'Prenez facilement l’outil en main',
    description: 'Accéder aux contenus de formation',
    img: '/accueil_1.png',
    link: {
      label: 'Accéder au pas à pas',
      href: 'https://aide.vigieau.beta.gouv.fr',
      external: true,
    },
  },
  {
    title: 'Gestion des arrêtés cadre',
    description: 'Créer, modifier et abroger les arrêtés cadre départementaux et interdépartementaux',
    img: '/accueil_2.png',
    link: {
      label: 'Les arrêtés cadres',
      to: '/arrete-cadre',
    },
  },
  {
    title: 'Gestion des arrêtés de restriction',
    description: 'Créer, abroger et remplacer les arrêtés de restriction.',
    img: '/accueil_3.png',
    link: {
      label: 'Les arrêtés de restriction',
      to: '/arrete-restriction',
    },
  },
];

const liensUtiles = [
  {
    label: 'Etat étiage (visualiser facilement l\'état des cours d’eau) :',
    labelHref: 'https://www.etat-etiage.fr',
    href: 'https://www.etat-etiage.fr',
  },
  {
    label: 'MétéoFrance (accéder aux données hydro-climatiques utiles pour la gestion sécheresse) :',
    labelHref: 'Météo-France Pro',
    href: 'https://pro.meteofrance.com/',
  },
  {
    label: 'Bulletin de situation hydrologique (suivre l\'évolution mensuelle des ressources en eau) :',
    labelHref: 'Bulletins de situation hydrologique | Eaufrance',
    href: 'https://www.eaufrance.fr/publications/bsh',
  },
  {
    label: 'SANDRE (se renseigner sur le référentiel des zones d’alerte) :',
    labelHref: 'https://www.sandre.eaufrance.fr/atlas/srv/fre/catalog.search#/metadata/0391a8b8-c850-45c7-a372-1f95bd204159',
    href: 'https://www.sandre.eaufrance.fr/atlas/srv/fre/catalog.search#/metadata/0391a8b8-c850-45c7-a372-1f95bd204159',
  },
  {
    label: 'Guide circulaire sécheresse :',
    labelHref: 'https://www.ecologie.gouv.fr/sites/default/files/Guide circulaire secheresse-conforme1605.pdf',
    href: 'https://www.ecologie.gouv.fr/sites/default/files/Guide circulaire secheresse-conforme1605.pdf',
  },
];
</script>

<template>
  <div class="accueil">
    <h1 class="text-align-center">Bienvenue sur VigiEau Admin</h1>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-4" v-for="carte of cartes">
        <div class="fr-card fr-card--horizontal fr-enlarge-link fr-card--sm">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <h3 class="fr-card__title">
                <template v-if="carte.link.external">
                  <a :href="carte.link.href" target="_blank">{{ carte.title }}</a>
                </template>
                <template v-else>
                  <nuxt-link :to="carte.link.to">{{ carte.title }}</nuxt-link>
                </template>
              </h3>
              <p class="fr-card__desc">
                {{ carte.description }}
              </p>
            </div>
          </div>
          <div class="fr-card__header">
            <div class="fr-card__img">
              <img class="fr-responsive-img" :src="carte.img" alt="Image d'illustration" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fr-mt-2w">
      <div class="fr-card fr-pt-2w">
        <iframe width="100%" height="600px" :src="iframeSrc"></iframe>
      </div>
    </div>
    <div class="fr-mt-2w">
      <div class="fr-card fr-p-2w">
        <h2>Liens utiles</h2>
        <ul>
          <li v-for="lien in liensUtiles" class="fr-mb-2w">
            {{ lien.label }}<br />
            <a class="fr-link" :href="lien.href" target="_blank">{{ lien.labelHref }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.accueil {
  position: relative;

  &:before {
    content: '';
    position: absolute;
    height: calc(100% + 4rem);
    width: 100vw;
    top: -2rem;
    left: -1.5rem;
    background: linear-gradient(var(--blue-france-950-100), var(--grey-975-75));
    z-index: -1;
  }
}

@media (min-width: 78em) {
  .accueil {
    &:before {
      left: calc((78rem - 100vw) / 2 - 1.5rem);
    }
  }
}
</style>