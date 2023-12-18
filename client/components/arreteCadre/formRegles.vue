<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators/dist";
import useVuelidate from "@vuelidate/core";
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";

const props = defineProps<{
  arreteCadre: ArreteCadre,
}>();

const rules = computed(() => {
  return {
    numero: {
      required: helpers.withMessage("Le numéro de l'arrêté est obligatoire.", required)
    }
  };
});

const sameZoneCommuneRules = [
  {
    label: 'Oui pour toutes les ressources',
    value: 'all',
  },
  {
    label: 'Oui, pour l\'AEP (eau potable) uniquement',
    value: 'aep',
  },
  {
    label: 'Non',
    value: 'none',
  },
]

const customEapNiveauRules = [
  {
    label: 'Non, le niveau de gravité ESO/ESU s’applique à l’ensemble des usages y compris l’eau potable.',
    value: false,
  },
  {
    label: 'Oui, des niveaux de gravité spécifiques aux usages issus de l’AEP peuvent être appliqués sur des périmètres géographiques distincts',
    value: true,
  },
]

const customEapZoneRules = [
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
]

const v$ = useVuelidate(rules, props.arreteCadre);
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Cas particuliers</h6>
        <DsfrRadioButtonSet
          legend="Dans cet arrêté cadre, précisez-vous que le niveau de gravité maximal s'applique si une commune est touchée par plusieurs zones de mêmes types ?"
          :options="sameZoneCommuneRules"
          v-model="arreteCadre.sameZoneCommuneRule"
          name="sameZoneCommuneRules"
          :small="false"
        />
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <DsfrAlert
          type="info"
          title="Information"
          description="Cette règle sera effective sur toutes les zones d'alerte de votre arrêté cadre et visible par tous les usagers."
        />
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Gestion de l'eau potable</h6>
        <DsfrRadioButtonSet
          legend="Dans cet arrêté cadre, prévoyez-vous d’appliquer des niveaux de gravité spécifiques aux usages issus de l'eau potable ?"
          :options="customEapNiveauRules"
          v-model="arreteCadre.customEapNiveau"
          name="customEapNiveauRules"
          :small="false"
        />
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <DsfrAlert
          type="info"
          title="Information"
          description="Vous aurez la possibilité d'appliquer des restrictions sur l'eau potable lors de la saisie de vos arrêtés de restriction."
        />
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Affichage VigiEau</h6>
        <DsfrRadioButtonSet
          legend="Précisez quel niveau de gravité s'applique à l'eau potable si des zones ESU et ESO se superposent ?"
          :options="customEapZoneRules"
          v-model="arreteCadre.customEapZone"
          name="customEapZoneRules"
          :small="false"
        />
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <DsfrAlert
          type="info"
          title="Information"
          description="P our une localisation géographique donnée, un seul niveau d'alerte sera communiqué pour l'eau potable"
        />
      </div>
    </div>
  </form>
</template>