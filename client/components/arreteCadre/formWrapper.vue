<script setup lang="ts">
import { ArreteCadre } from "~/dto/arrete_cadre.dto";
import type { Ref } from "vue";
import useVuelidate from "@vuelidate/core/dist/index";
import { useRefDataStore } from "~/stores/refData";
import type { Departement } from "~/dto/departement.dto";
import type { Usage } from "~/dto/usage.dto";

const arreteCadre: Ref<ArreteCadre | null> = ref(null);

const route = useRoute();
const api = useApi();
const isNewArreteCadre = route.params.id === "nouveau";
const loadRefData = ref(false);

const currentStep: Ref<number> = ref(1);
const steps = ["Informations générales", "Règles de gestion des niveaux d'alerte", "Liste des zones d'alertes", "Les usages", "Récapitulatif"];

// Départements
const [fecthDep, fetchUsage] = await Promise.all([
  api.departement.list(),
  api.usage.list()
]);
if (fecthDep.data.value) {
  useRefDataStore().setDepartements(<Departement[]>fecthDep.data.value);
}
if (fetchUsage.data.value) {
  useRefDataStore().setUsages(<Usage[]>fetchUsage.data.value);
}
loadRefData.value = true;

const v$ = useVuelidate();

if (isNewArreteCadre) {
  arreteCadre.value = new ArreteCadre();
} else {
  const { data, error } = await api.arreteCadre.get(<string>route.params.id);
  if (data.value) {
    arreteCadre.value = <ArreteCadre>data.value;
  }
}

const nextStep = () => {
  currentStep.value++;
  showButtons();
};
const previousStep = () => {
  currentStep.value--;
  showButtons();
};
const saveArrete = async () => {
  await v$.value.$validate();
  console.log(v$.value);
};

const showButtons = () => {
  buttonsFiltered.value = buttons.value.slice();
  switch (currentStep.value) {
    case 1:
      buttonsFiltered.value.splice(2, 1);
      buttonsFiltered.value.splice(0, 1);
      break;
    case 5:
      buttonsFiltered.value.splice(3, 1);
      break;
    default:
      buttonsFiltered.value.splice(2, 1);
  }
};

const buttonsFiltered = ref([]);
const buttons = ref([
  {
    label: "Précedent",
    secondary: true,
    icon: "ri-arrow-left-line",
    onclick: previousStep
  },
  {
    label: "Enregistrer en brouillon",
    secondary: true,
    icon: "ri-settings-3-line",
    onclick: saveArrete
  },
  {
    label: "Publier"
  },
  {
    label: "Suivant",
    secondary: true,
    iconRight: true,
    icon: "ri-arrow-right-line",
    onclick: nextStep
  }
]);
showButtons();
</script>

<template>
  <h1>{{ isNewArreteCadre ? "Création" : "Edition" }} d'un arrêté cadre</h1>
  <DsfrStepper :steps="steps" :currentStep="currentStep" />
  <DsfrTabs class="tabs-light" v-if="loadRefData">
    <DsfrTabContent :selected="currentStep === 1">
      <ArreteCadreFormGeneral :arrete-cadre="arreteCadre" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 2">
      <ArreteCadreFormRegles :arrete-cadre="arreteCadre" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 3">
      <ArreteCadreFormZones :arrete-cadre="arreteCadre" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 4">
      <ArreteCadreFormUsages :arrete-cadre="arreteCadre" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 5">
      <ArreteCadreFormRecapitulatif :arrete-cadre="arreteCadre" />
    </DsfrTabContent>
  </DsfrTabs>
  <DsfrButtonGroup
    class="fr-mt-4w"
    :buttons="buttonsFiltered"
    inline-layout-when="medium"
  />
</template>