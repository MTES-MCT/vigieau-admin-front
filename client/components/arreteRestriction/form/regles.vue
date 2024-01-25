<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
}>();

const rules = computed(() => {
  return {
    niveauGraviteSpecifiqueEap: {
      required: helpers.withMessage("La règle de gestion de l'eau potable est obligatoire.", required),
    },
    ressourceEapCommunique: {
      requiredIf: helpers.withMessage(
        "La niveau de gravité de l'eau potable est obligatoire.",
        requiredIf(() => props.arreteRestriction.niveauGraviteSpecifiqueEap == false),
      ),
    },
  };
});

const utils = useUtils();

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

const v$ = useVuelidate(rules, props.arreteRestriction);

defineExpose({
  v$,
});
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Gestion de l'eau potable</h6>
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'niveauGraviteSpecifiqueEap')">
          <DsfrRadioButtonSet
            legend="Dans cet arrêté cadre, prévoyez-vous d’appliquer des niveaux de gravité spécifiques aux usages issus de l'eau potable ?"
            :options="niveauGraviteSpecifiqueEapOptions"
            v-model="arreteRestriction.niveauGraviteSpecifiqueEap"
            name="niveauGraviteSpecifiqueEap"
            :small="false"
          />
        </DsfrInputGroup>
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'ressourceEapCommunique')">
          <DsfrRadioButtonSet
            v-if="arreteRestriction.niveauGraviteSpecifiqueEap == false"
            legend="Pour une localisation géographique donnée, un seul niveau de gravité sera communiqué pour l'eau potable. Précisez quel niveau de gravité s'applique à l'eau potable si des zones ESU et ESO se superposent ?"
            :options="ressourceEapCommuniqueOptions"
            v-model="arreteRestriction.ressourceEapCommunique"
            name="ressourceEapCommunique"
            :small="false"
          />
        </DsfrInputGroup>
        <div class="divider" />
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <DsfrAlert
          type="info"
          title="Information"
          description="Vous aurez la possibilité de créer une zone géographique spécifique pour l'eau potable lors de la saisie de vos arrêtés de restriction."
        />
      </div>
    </div>
  </form>
</template>
