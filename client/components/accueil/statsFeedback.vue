<script setup lang="ts">

import type { Ref } from 'vue';

const feedbacks: Ref<any[]> = ref([]);

const api = useApi();
const utils = useUtils();
const router = useRouter();
const { data, error } = await api.usageFeedback.list();
if (data.value) {
  feedbacks.value = data.value;
}

</script>

<template>
  <div class="fr-card fr-p-2w feedbacks-wrapper">
    <h2 class="text-align-center">Restrictions non comprise par les usagers (sur VigiEau)</h2>
    <div class="fr-grid-row">
      <div class="fr-col-12 feedback-card fr-mb-1w" v-for="feedback of feedbacks">
        <div>
        Le {{ utils.formatDate(feedback.createdAt) }}<br />
        La restriction <b>{{ feedback.usage.nom }}</b> n'est pas comprise.          
        </div>
        <DsfrButton v-if="feedback.usage?.restriction?.arreteRestriction?.id"
                    tertiary 
                    class="fr-mt-1w"
                    @click="router.push(`/arrete-restriction/${feedback.usage.restriction.arreteRestriction.id}`)">
          Voir l'arrêté de restriction
        </DsfrButton>
      </div>
      <div class="fr-col-12 feedback-card" v-if="feedbacks.length < 1">
        Aucune restriction non comprise.
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.feedback-card {
  background-color: var(--blue-france-950-100);
  padding: 1rem;
}

.feedbacks-wrapper {
  max-height: 50vh;
  overflow-y: scroll;
}
</style>