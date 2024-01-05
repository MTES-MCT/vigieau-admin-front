<script setup lang="ts">
import { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import useVuelidate from '@vuelidate/core/dist/index';
import { useRefDataStore } from '~/stores/refData';
import type { Departement } from '~/dto/departement.dto';
import type { Usage } from '~/dto/usage.dto';
import type { Thematique } from '~/dto/thematique.dto';
import type { UsageArreteCadre } from '~/dto/usage_arrete_cadre.dto';

const props = defineProps<{
  viewOnly?: boolean;
  duplicate?: boolean;
}>();

const arreteCadre: Ref<ArreteCadre> = ref();
const fullValidation: Ref<boolean> = ref(false);

const route = useRoute();
const api = useApi();
const isNewArreteCadre = route.params.id === 'nouveau';
const loadRefData = ref(false);
const loading = ref(false);
const componentKey = ref(0);

const usageSelected = ref();

const currentStep: Ref<number> = ref(1);
const steps = [
  'Informations générales',
  "Règles de gestion des niveaux d'alerte",
  "Liste des zones d'alertes",
  'Les usages',
  'Récapitulatif',
];

const titleAlerte: Ref<string> = ref(`Impossible d'enregistrer l'arrêté cadre`);
const descriptionAlerte: Ref<string> = ref('');
const isAlerteClosed: Ref<boolean> = ref(true);

// Départements
const [fecthDep, fetchUsage, fetchThematique] = await Promise.all([api.departement.list(), api.usage.list(), api.thematique.list()]);
if (fecthDep.data.value) {
  useRefDataStore().setDepartements(<Departement[]>fecthDep.data.value);
}
if (fetchUsage.data.value) {
  useRefDataStore().setUsages(<Usage[]>fetchUsage.data.value);
}
if (fetchThematique.data.value) {
  useRefDataStore().setThematiques(<Thematique[]>fetchThematique.data.value);
}
loadRefData.value = true;

const v$ = useVuelidate();

if (isNewArreteCadre) {
  arreteCadre.value = new ArreteCadre();
} else {
  const { data, error } = await api.arreteCadre.get(<string>route.params.id);
  if (data.value) {
    arreteCadre.value = <ArreteCadre>data.value;
    if (props.duplicate) {
      arreteCadre.value.id = null;
      arreteCadre.value.usagesArreteCadre.map((u) => {
        u.id = null;
        return u;
      });
    }
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
  if (loading.value) {
    return;
  }
  await v$.value.$validate();
  if (v$.value.$error) {
    console.log(v$.value.$errors);
    descriptionAlerte.value = v$.value.$errors.map((e: any) => e.$message).join(', ');
    isAlerteClosed.value = false;
    return;
  }
  loading.value = true;
  const { data, error } = arreteCadre.value.id
    ? await api.arreteCadre.update(arreteCadre.value.id.toString(), arreteCadre.value)
    : await api.arreteCadre.create({ ...arreteCadre.value });
  if (data.value) {
    // Mise à jour des ids des objets nouvellement crées
    arreteCadre.value.id = data.value.id;
    arreteCadre.value.usagesArreteCadre.map((usageArreteCadre: UsageArreteCadre) => {
      usageArreteCadre.id = (<ArreteCadre>data.value).usagesArreteCadre.find(
        (uac: UsageArreteCadre) => uac.usage.id === usageArreteCadre.usage.id,
      ).id;
      return usageArreteCadre;
    });
    componentKey.value++;
  }
  loading.value = false;
};

const publishArrete = () => {
  fullValidation.value = true;
  titleAlerte.value = `Impossible de publier l'arrêté cadre`;
  saveArrete();
  titleAlerte.value = `Impossible d'enregistrer l'arrêté cadre`;
  // TODO Publish
};

const showButtons = () => {
  buttonsFiltered.value = buttons.value.slice();
  switch (currentStep.value) {
    case 1:
      buttonsFiltered.value.splice(2, 1);
      buttonsFiltered.value.splice(0, 1);
      if (props.viewOnly) {
        buttonsFiltered.value.splice(0, 1);
      }
      break;
    case 5:
      buttonsFiltered.value.splice(3, 1);
      buttonsFiltered.value.splice(2, 1);
      if (props.viewOnly) {
        buttonsFiltered.value.splice(1, 1);
      }
      break;
    default:
      buttonsFiltered.value.splice(2, 1);
      if (props.viewOnly) {
        buttonsFiltered.value.splice(1, 1);
      }
  }
};

const buttonsFiltered = ref([]);
const buttons = ref([
  {
    label: 'Précedent',
    secondary: true,
    icon: 'ri-arrow-left-line',
    onclick: previousStep,
  },
  {
    label: 'Enregistrer en brouillon',
    secondary: true,
    icon: 'ri-settings-3-line',
    onclick: saveArrete,
  },
  {
    label: 'Publier',
    onclick: publishArrete,
  },
  {
    label: 'Suivant',
    secondary: true,
    iconRight: true,
    icon: 'ri-arrow-right-line',
    onclick: nextStep,
  },
]);
showButtons();
</script>

<template>
  <h1>{{ isNewArreteCadre ? 'Création' : 'Edition' }} d'un arrêté cadre</h1>
  <DsfrStepper :steps="steps" :currentStep="currentStep" />
  <DsfrAlert
    class="fr-mb-2w"
    :title="titleAlerte"
    :description="descriptionAlerte"
    type="error"
    :closeable="true"
    :closed="isAlerteClosed"
    @close="isAlerteClosed = true"
  />
  <DsfrButtonGroup class="fr-mt-4w" :buttons="buttonsFiltered" inline-layout-when="always" />
  <DsfrTabs class="tabs-light" v-if="loadRefData">
    <DsfrTabContent :selected="currentStep === 1">
      <ArreteCadreFormGeneral :arrete-cadre="arreteCadre" :fullValidation="fullValidation" :viewOnly="viewOnly" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 2">
      <ArreteCadreFormRegles :arrete-cadre="arreteCadre" :fullValidation="fullValidation" :viewOnly="viewOnly" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 3">
      <ArreteCadreFormZones :arrete-cadre="arreteCadre" :fullValidation="fullValidation" :viewOnly="viewOnly" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 4">
      <ArreteCadreFormUsages :arrete-cadre="arreteCadre"
                             :fullValidation="fullValidation"
                             :viewOnly="viewOnly"
                             :usageSelected="usageSelected"
                             :key="componentKey" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 5">
      <ArreteCadreFormRecapitulatif :arrete-cadre="arreteCadre"
                                    :key="componentKey"
                                    @usageSelected="usageSelected = $event; previousStep()" />
    </DsfrTabContent>
  </DsfrTabs>
</template>
