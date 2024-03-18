<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import { Parametres } from '~/dto/parametres.dto';
import type { Ref } from 'vue';

const props = defineProps<{
  parametres: Parametres
}>();

const rules = computed(() => {
  return {
    superpositionCommune: {
      required: helpers.withMessage('La règle de gestion au niveau communale est obligatoire.', required),
    },
  };
});

const utils = useUtils();

const regleGestionSuperpositionCommuneOptions = [
  {
    label:
      'Nous ne sommes pas concernés car une commune ne peut pas être traversée par plusieurs zones d\'alerte',
    value: 'no',
    img: null,
  },
  {
    label:
      'Non, nous n’harmonisons aucun niveau de gravité à la commune (toutes ressources confondues)',
    value: 'no_all',
    img: null,
  },
  {
    label:
      'Le niveau le plus restrictif s\'applique pour chaque type de ressource à la commune (1 niveau ESU, 1 niveau AEP, 1 niveau ESO)',
    value: 'yes_distinct',
    img: '/regles_commune_yes_distinct.png',
  },
  {
    label: 'Le niveau le plus restrictif s\'applique pour toutes les ressources à la commune (1 niveau unique ESU-ESO-AEP)',
    value: 'yes_all',
    img: '/regles_commune_yes_all.png',
  },
  {
    label: 'Le niveau le plus restrictif s\'applique pour les milieux naturels à la commune (1 niveau unique ESU-ESO) et le niveau AEP est distinct',
    value: 'yes_except_aep',
    img: '/regles_commune_yes_except_aep.png',
  },
  {
    label: 'Le niveau le plus restrictif s\'applique à la commune pour l’AEP mais les niveaux ESU et ESO sont appliqués à l\'adresse',
    value: 'yes_only_aep',
    img: '/regles_commune_yes_only_aep.png',
  },
];

const modalOpened = ref(false);
const modalTitle: Ref<string> = ref(`Schéma explicatif`);
const modalImg: Ref<string> = ref('');
const modalActions: Ref<any[]> = ref([
  {
    label: 'Fermer',
    secondary: true,
    onClick: () => {
      utils.closeModal(modalOpened);
    },
  },
]);

const v$ = useVuelidate(rules, props.parametres);
const expandedId = ref();

defineExpose({
  v$,
});
</script>

<template>
  <form @submit.prevent="">
    <DsfrInputGroup :error-message="utils.showInputError(v$, 'superpositionCommune')">
      <fieldset class="fr-fieldset">
        <legend class="fr-fieldset__legend fr-fieldset__legend--regular">
          Si une commune est traversée par plusieurs zones d’alerte, appliquez-vous le niveau de gravité maximal au niveau de la commune ? *
        </legend>
        <div class="fr-grid-row fr-grid-row--gutters">
          <template v-for="option in regleGestionSuperpositionCommuneOptions">
            <div class="fr-col-12 fr-col-lg-6">
              <DsfrRadioButton
                :value="option.value"
                name="superpositionCommune"
                v-model="parametres.superpositionCommune"
                :label="option.label"
                :data-cy="`ArreteCadreFormCommuneRadio${option.value}`"
              />
            </div>
            <div class="fr-col-12 fr-col-lg-6">
              <DsfrButton v-if="option.img"
                          class="fr-mb-2w"
                          label="Voir le schéma explicatif"
                          @click="modalImg = option.img; modalOpened = true" />
            </div>
          </template>
        </div>
      </fieldset>
    </DsfrInputGroup>
  </form>

  <DsfrModal :opened="modalOpened"
             :title="modalTitle"
             :actions="modalActions"
             size="xl"
             @close="modalOpened = utils.closeModal(modalOpened)">
    <img :src="modalImg" />
  </DsfrModal>
</template>

<style lang="scss" scoped>
img {
  width: 100%;
}
</style>
