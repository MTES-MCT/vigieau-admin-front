<script setup lang="ts">
import { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import useVuelidate from '@vuelidate/core/dist/index';
import { useRefDataStore } from '~/stores/refData';
import type { UsageArreteCadre } from '~/dto/usage_arrete_cadre.dto';

const props = defineProps<{
  duplicate?: boolean;
}>();

const arreteCadre: Ref<ArreteCadre> = ref();
const fullValidation: Ref<boolean> = ref(false);

const route = useRoute();
const api = useApi();
const refDataStore = useRefDataStore();
const isNewArreteCadre = route.params.id === 'nouveau';
const loading = ref(false);
const componentKey = ref(0);

const usageSelected = ref();

const currentStep: Ref<number> = ref(1);
const steps = [
  'Informations générales',
  // "Règles de gestion des niveaux d'alerte",
  "Liste des zones d'alertes",
  'Les usages',
  'Récapitulatif',
];

const titleAlerte: Ref<string> = ref(`Impossible d'enregistrer l'arrêté cadre`);
const descriptionAlerte: Ref<string> = ref('');
const isAlerteClosed: Ref<boolean> = ref(true);

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
};
const previousStep = () => {
  currentStep.value--;
};
const saveArrete = async () => {
  if (loading.value) {
    return;
  }
  isAlerteClosed.value = true;
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

const askPublishArrete = async () => {
  fullValidation.value = true;
  titleAlerte.value = `Impossible de publier l'arrêté cadre`;
  await saveArrete();
  if (!v$.value.$error) {
    modalPublishOpened.value = true;    
  }
};

const publishArrete = async (ac: ArreteCadre) => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  const { data, error } = await api.arreteCadre.publish(ac.id?.toString(), ac)
  if(data.value) {
    modalPublishOpened.value = false;
  }
  loading.value = false;
};

// PUBLISH MODAL
const modalPublishOpened: Ref<boolean> = ref(false);
const modalTitle: Ref<string> = ref('Date de publication');
const modalActions: Ref<any[]> = ref([
  {
    label: 'Publier',
    onclick: () => {
      publierFormRef.value?.submitForm();
    },
  },
  {
    label: 'Annuler',
    secondary: true,
    onclick: () => {
      modalPublishOpened.value = false;
    },
  },
]);
const publierFormRef = ref(null);
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
  <ul class="fr-btns-group fr-btns-group--md fr-btns-group--inline-sm fr-btns-group--inline-md fr-btns-group--inline-lg fr-mt-4w">
    <li v-if="currentStep !== 1">
      <DsfrButton label="Précedent"
                  :secondary="true"
                  icon="ri-arrow-left-line"
                  @click="previousStep()"/>      
    </li>
    <li>
      <DsfrButton label="Enregistrer en brouillon"
                  :secondary="true"
                  :icon="loading ? { name: 'ri-settings-3-line', animation: 'spin' } : 'ri-settings-3-line'"
                  :disabled="loading"
                  @click="saveArrete()"/>      
    </li>
    <li v-if="currentStep === 4">
      <DsfrButton label="Publier"
                  :disabled="loading"
                  :icon="loading ? { name: 'ri-loader-4-line', animation: 'spin' } : ''"
                  :iconRight="true"
                  @click="askPublishArrete()"/>
    </li>
    <li v-if="currentStep !== 4">
      <DsfrButton label="Suivant"
                  :secondary="true"
                  icon="ri-arrow-right-line"
                  @click="nextStep()"/>
    </li>
  </ul>
  <DsfrTabs class="tabs-light" v-if="refDataStore.departements.length > 0">
    <DsfrTabContent :selected="currentStep === 1">
      <ArreteCadreFormGeneral :arrete-cadre="arreteCadre" :fullValidation="fullValidation" :viewOnly="viewOnly" />
    </DsfrTabContent>
<!--    <DsfrTabContent :selected="currentStep === 2">-->
<!--      <ArreteCadreFormRegles :arrete-cadre="arreteCadre" :fullValidation="fullValidation" :viewOnly="viewOnly" />-->
<!--    </DsfrTabContent>-->
    <DsfrTabContent :selected="currentStep === 2">
      <ArreteCadreFormZones :arrete-cadre="arreteCadre" :fullValidation="fullValidation" :viewOnly="viewOnly" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 3">
      <ArreteCadreFormUsages :arrete-cadre="arreteCadre"
                             :fullValidation="fullValidation"
                             :usageSelected="usageSelected"
                             :key="componentKey" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 4">
      <ArreteCadreFormRecapitulatif :arrete-cadre="arreteCadre"
                                    :key="componentKey"
                                    @usageSelected="usageSelected = $event; previousStep()" />
    </DsfrTabContent>
  </DsfrTabs>
  <DsfrModal :opened="modalPublishOpened"
             icon="ri-arrow-right-line"
             :title="modalTitle"
             :actions="modalActions"
             @close="modalPublishOpened = false">
    <ArreteCadreFormPublier ref="publierFormRef"
                            :arrete-cadre="arreteCadre"
                            :loading="loading"
                            @publier="publishArrete($event)" />
  </DsfrModal>
</template>
