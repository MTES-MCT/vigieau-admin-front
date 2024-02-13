<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';

const props = defineProps<{
  arreteCadre: ArreteCadre;
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
      'Oui, nous appliquons un niveau de gravité unique pour chaque type de ressource à la commune (1 niveau ESU, 1 niveau ESO, 1 niveau AEP)',
    value: 'yes_distinct',
    img: '/regles_commune_yes_distinct.png',
  },
  {
    label:
      'Oui, en cas de superposition de zones, nous appliquons le niveau le plus restrictif pour toutes les ressources (1 niveau unique ESU-ESO-AEP)',
    value: 'yes_all',
    img: '/regles_commune_yes_all.png',
  },
  {
    label:
      'Oui, nous appliquons un niveau unique à la commune pour les milieux naturels (1 niveau unique ESU-ESO) mais le niveau AEP est distinct ',
    value: 'yes_except_aep',
    img: '/regles_commune_yes_except_aep.png',
  },
  {
    label: 'Oui, nous appliquons un niveau unique à la commune pour l’AEP mais les niveaux ESU et ESO sont distincts',
    value: 'yes_only_aep',
    img: '/regles_commune_yes_only_aep.png',
  },
  {
    label:
      'Oui, nous appliquons un niveau unique à la commune pour les milieux naturels (1 niveau unique ESU-ESO) mais le niveau AEP est distinct ',
    value: 'no',
    img: null,
  },
];

const v$ = useVuelidate(rules, props.arreteCadre);

defineExpose({
  v$,
});
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Cas particuliers</h6>
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'communeNiveauGraviteMax')">
          <fieldset class="fr-fieldset">
            <legend class="fr-fieldset__legend fr-fieldset__legend--regular">
              Si une commune est traversée par plusieurs zones d’alerte, appliquez-vous le niveau de gravité maximal au niveau de la commune ? *
            </legend>
            <template v-for="option in regleGestionSuperpositionCommuneOptions">
              <DsfrRadioButton
                :value="option.value"
                name="superpositionCommune"
                v-model="arreteCadre.superpositionCommune"
                :label="option.label"
                :data-cy="`ArreteCadreFormCommuneRadio${option.value}`"
              />
              <img v-if="option.img" :src="option.img" />
            </template>
          </fieldset>
          <!--          <DsfrRadioButtonSet-->
          <!--            legend="Dans cet arrêté cadre, si une commune est touchée par plusieurs zones de mêmes types choisissez-vous d’uniformiser au niveau de gravité maximal  ?"-->
          <!--            :options="regleGestionSuperpositionCommuneOptions"-->
          <!--            v-model="arreteCadre.communeNiveauGraviteMax"-->
          <!--            name="communeNiveauGraviteMax"-->
          <!--            data-cy="ArreteCadreFormCommuneRadio"-->
          <!--            :small="false"-->
          <!--          />-->
        </DsfrInputGroup>
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
img {
  width: 100%;
}
</style>
