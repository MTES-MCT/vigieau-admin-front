<script setup lang="ts">
const cartes = [
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
</script>

<template>
  <div class="fr-grid-row fr-grid-row--gutters">
    <div class="fr-col-12 fr-col-lg-7">
      <div class="fr-card fr-enlarge-link fr-card--sm">
        <div class="fr-card__body">
          <div class="fr-card__content">
            <h3 class="fr-card__title">
              <a href="https://aide.vigieau.beta.gouv.fr" target="_blank">Prenez facilement l’outil en main</a>
            </h3>
            <p class="fr-card__desc">
              Accéder au pas à pas
            </p>
          </div>
        </div>
        <div class="fr-card__header">
          <div class="fr-card__img fr-card__img-no-ratio">
            <img class="fr-responsive-img" src="/accueil_1.png" alt="Image d'illustration" />
          </div>
        </div>
      </div>
    </div>
    <div class="fr-col-12 fr-col-lg-5">
      <template v-for="carte of cartes">
        <div class="fr-card fr-enlarge-link fr-card--horizontal fr-card--sm fr-mb-2w">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <h3 class="fr-card__title">
                <nuxt-link :to="carte.link.to">{{ carte.title }}</nuxt-link>
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
      </template>
    </div>
  </div>
</template>