<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';

const props = defineProps<{
  arreteCadre: ArreteCadre;
}>();

const rules = computed(() => {
  return {
    communeNiveauGraviteMax: {
      required: helpers.withMessage("La règle de gestion au niveau communale est obligatoire.", required),
    },
  };
});

const utils = useUtils();

const communeNiveauGraviteMaxOptions = [
  {
    label: 'Oui pour toutes les ressources',
    value: 'all',
  },
  {
    label: "Oui, pour l'AEP (eau potable) uniquement",
    value: 'aep',
  },
  {
    label: 'Non',
    value: 'none',
  },
];

const niveauGraviteSpecifiqueEapOptions = [
  {
    label: 'Non, le niveau de gravité ESO/ESU s’applique à l’ensemble des usages y compris l’eau potable.',
    value: false,
  },
  {
    label:
      'Oui, des niveaux de gravité spécifiques aux usages issus de l’AEP peuvent être appliqués sur des périmètres géographiques distincts',
    value: true,
  },
];

const ressourceEapCommuniqueOptions = [
  {
    label: 'Eaux superficielles (ESU)',
    value: 'esu',
  },
  {
    label: 'Eaux souterraines (ESO)',
    value: 'eso',
  },
  {
    label: 'Le niveau de gravité maximal',
    value: 'max',
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
          <DsfrRadioButtonSet
            legend="Dans cet arrêté cadre, si une commune est touchée par plusieurs zones de mêmes types choisissez-vous d’uniformiser au niveau de gravité maximal  ?"
            :options="communeNiveauGraviteMaxOptions"
            v-model="arreteCadre.communeNiveauGraviteMax"
            name="communeNiveauGraviteMax"
            :small="false"
          />
        </DsfrInputGroup>
<!--        <div class="divider" />-->
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <DsfrAlert
          type="info"
          title="Exemple"
          description="Si une commune est traversée par plusieurs nappes souterraines et que l’une d’elle est en alerte et l’autre en alerte renforcée. On peut choisir d’appliquer le niveau le plus restrictif sur l’ensemble de la commune."
        />
      </div>
<!--      <div class="fr-col-12 fr-col-lg-6">-->
<!--        <h6>Gestion de l'eau potable</h6>-->
<!--        <DsfrRadioButtonSet-->
<!--          legend="Dans cet arrêté cadre, prévoyez-vous d’appliquer des niveaux de gravité spécifiques aux usages issus de l'eau potable ?"-->
<!--          :options="niveauGraviteSpecifiqueEapOptions"-->
<!--          v-model="arreteCadre.niveauGraviteSpecifiqueEap"-->
<!--          name="niveauGraviteSpecifiqueEap"-->
<!--          :small="false"-->
<!--        />-->
<!--        <DsfrRadioButtonSet-->
<!--          v-if="arreteCadre.niveauGraviteSpecifiqueEap == false"-->
<!--          legend="Pour une localisation géographique donnée, un seul niveau de gravité sera communiqué pour l'eau potable. Précisez quel niveau de gravité s'applique à l'eau potable si des zones ESU et ESO se superposent ?"-->
<!--          :options="ressourceEapCommuniqueOptions"-->
<!--          v-model="arreteCadre.ressourceEapCommunique"-->
<!--          name="ressourceEapCommunique"-->
<!--          :small="false"-->
<!--        />-->
<!--        <div class="divider" />-->
<!--      </div>-->
<!--      <div class="fr-col-12 fr-col-lg-6">-->
<!--        <DsfrAlert-->
<!--          type="info"-->
<!--          title="Information"-->
<!--          description="Vous aurez la possibilité de créer une zone géographique spécifique pour l'eau potable lors de la saisie de vos arrêtés de restriction."-->
<!--        />-->
<!--      </div>-->
<!--      <div class="fr-col-12 fr-col-lg-6">-->
<!--      </div>-->
    </div>
  </form>
</template>
