<script setup lang="ts">
definePageMeta({
  layout: 'basic',
})

const runTimeConfig = useRuntimeConfig().public

useHead({
  title: `Connexion - ${runTimeConfig.appName}`,
})

const loginGoogle = () => {
  navigateTo('/api/auth/login', { external: true })
}
</script>

<template>
  <div class="fr-px-md-0 fr-py-10v fr-py-md-14v">
    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
      <div class="fr-col-12 fr-col-md-9 fr-col-lg-8"><h1>Connexion à {{ runTimeConfig.appName }}</h1>
        <div class="fr-mb-6v">
          <h2>Se connecter avec AgentConnect</h2>
          <div class="fr-connect-group">
            <button class="fr-connect">
              <span class="fr-connect__login">S’identifier avec</span>
              <span class="fr-connect__brand">AgentConnect</span>
            </button>
            <p>
              <a href="https://agentconnect.gouv.fr/"
                 target="_blank"
                 rel="noopener"
                 title="Qu’est ce qu'AgentConnect ? - nouvelle fenêtre">Qu’est ce qu'AgentConnect ?</a>
            </p>
          </div>
          <div class="fr-mb-6v">
            <h2>Se connecter avec Google (DEV Only)</h2>
            <DsfrButton label="Se connecter avec Google"
                        @click="loginGoogle()"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
// Couleurs d'AgentConnect
button.fr-connect {
  background-color: #0A76F6;

  &:hover {
    background-color: #2E94FA;
  }
}

:root[data-fr-theme=dark] button.fr-connect {
  background-color: white;

  &:hover {
    background-color: #F5F5F5;
  }
}
</style>
