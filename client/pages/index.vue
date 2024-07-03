<script setup lang="ts">
definePageMeta({
  layout: 'basic',
});

useHead({
  title: `Accueil - ${useRuntimeConfig().public.appName}`,
});
</script>

<template>
  <div class="accueil">
    <h1 class="text-align-center">Bienvenue sur VigiEau Admin</h1>
    <AccueilCardsLink />
    <div class="fr-mt-2w">
      <AccueilMap />
    </div>
    <div class="fr-mt-2w">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12 fr-col-lg-8">
          <AccueilStatsConsultation />
        </div>
        <div class="fr-col-12 fr-col-lg-4">
          <AccueilStatsFeedback />
        </div>
      </div>
    </div>
    <div class="fr-mt-2w">
      <AccueilLinks />
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

  h2 {
    font-size: 1rem;
    line-height: 1.2rem;
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