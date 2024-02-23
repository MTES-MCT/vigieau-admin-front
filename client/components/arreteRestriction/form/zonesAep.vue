<script setup lang="ts">
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";
import useVuelidate from "@vuelidate/core";
import { helpers, required, requiredIf } from "@vuelidate/validators";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
  selected: boolean;
}>();

const rules = computed(() => {
  return {
    isAepFullDepartement: {
      required: helpers.withMessage("La règle de gestion de l'eau potable est obligatoire.", required),
    },
  };
});

const utils = useUtils();

const fullDepartementOptions = [
  {
    label: 'Choisir mon département en entier',
    value: true,
  },
  {
    label: 'Créer des zones en groupant des communes',
    value: false,
  },
];

const restriction = {
  id: null,
  zoneAlerte: null,
  niveauGravite: null,
  usagesArreteRestriction: [],
  isAep: true,
};


const v$ = useVuelidate(rules, props.arreteRestriction);

defineExpose({
  v$,
});
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Définition des zones AEP</h6>

        <DsfrInputGroup :error-message="utils.showInputError(v$, 'isAepFullDepartement')">
          <DsfrRadioButtonSet
            legend="Vous souhaitez :"
            :options="fullDepartementOptions"
            v-model="arreteRestriction.isAepFullDepartement"
            name="isFullDepartement"
            :small="false"
          />
        </DsfrInputGroup>

        <template v-if="arreteRestriction.isAepFullDepartement !== undefined">
          <div v-if="arreteRestriction.isAepFullDepartement">
            <h6>Zones d'alerte</h6>
            <div class="divider" />
            <ArreteRestrictionFormRestriction 
              :restriction="restriction"
              :arreteCadre="arreteRestriction.arretesCadre[0]" />
            <div class="divider" />
          </div>

          <div v-else>
            <h6>Création de zones AEP avec un groupement de commune</h6>
          </div>
          
        </template>
      </div>
    </div>
  </form>
</template>