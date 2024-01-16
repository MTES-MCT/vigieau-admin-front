<script setup lang="ts">
import { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import useVuelidate from '@vuelidate/core/dist/index';
import { useRefDataStore } from '~/stores/refData';
import type { UsageArreteCadre } from '~/dto/usage_arrete_cadre.dto';
import { useAlertStore } from '~/stores/alert';

const props = defineProps<{
  arreteCadre: ArreteCadre;
  fullValidation: boolean;
}>();

const fullValidation: Ref<boolean> = ref(false);

const route = useRoute();
const api = useApi();
const refDataStore = useRefDataStore();
const alertStore = useAlertStore();
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

const v$ = useVuelidate();

const nextStep = () => {
  currentStep.value++;
};
const previousStep = () => {
  currentStep.value--;
};
const saveArrete = async (publish: boolean = false) => {
  if (loading.value) {
    return;
  }
  await v$.value.$validate();
  if (v$.value.$error) {
    alertStore.addAlert({
      title: publish ? "Impossible de publier l'arrêté cadre" : "Impossible d'enregistrer l'arrêté cadre",
      description: v$.value.$errors.map((e: any) => e.$message).join(', '),
      type: 'error',
    });
    return;
  }
  loading.value = true;
  const { data, error } = props.arreteCadre.id
    ? await api.arreteCadre.update(props.arreteCadre.id.toString(), props.arreteCadre)
    : await api.arreteCadre.create({ ...props.arreteCadre });
  if (data.value) {
    // Mise à jour des ids des objets nouvellement crées
    props.arreteCadre.id = data.value.id;
    props.arreteCadre.usagesArreteCadre.map((usageArreteCadre: UsageArreteCadre) => {
      usageArreteCadre.id = (<ArreteCadre>data.value).usagesArreteCadre.find(
        (uac: UsageArreteCadre) => uac.usage.id === usageArreteCadre.usage.id,
      ).id;
      return usageArreteCadre;
    });
    componentKey.value++;
    if (!publish) {
      alertStore.addAlert({
        description: 'Enregistrement réussi',
        type: 'success',
      });
    }
  }
  loading.value = false;
};

const askPublishArrete = async () => {
  fullValidation.value = true;
  await saveArrete(true);
  if (!v$.value.$error) {
    modalPublishOpened.value = true;
  }
};

const publishArrete = async (ac: ArreteCadre) => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  const { data, error } = await api.arreteCadre.publish(ac.id?.toString(), ac);
  if (data.value) {
    modalPublishOpened.value = false;
  }
  loading.value = false;
  navigateTo('/arrete-cadre');
};

// PUBLISH MODAL
const modalPublishOpened: Ref<boolean> = ref(false);
const modalTitle: Ref<string> = ref('Date de publication');
const publierFormRef = ref(null);
</script>

<template>
  <h1>
    {{ isNewArreteCadre ? 'Création' : 'Edition' }} d'un arrêté cadre
    <MixinsStatutBadge :statut="arreteCadre.statut" />
  </h1>
  <DsfrStepper :steps="steps" :currentStep="currentStep" />
  <MixinsAlerts class="fr-mb-2w" />
  <ul class="fr-btns-group fr-btns-group--md fr-btns-group--inline-sm fr-btns-group--inline-md fr-btns-group--inline-lg fr-mt-4w">
    <li>
      <DsfrButton label="Précedent"
                  :secondary="true"
                  icon="ri-arrow-left-line"
                  :disabled="currentStep === 1"
                  @click="previousStep()" />
    </li>
    <li>
      <DsfrButton
        label="Enregistrer en brouillon"
        :secondary="true"
        :icon="loading ? { name: 'ri-settings-3-line', animation: 'spin' } : 'ri-settings-3-line'"
        :disabled="loading"
        @click="saveArrete()"
      />
    </li>
    <li>
      <DsfrButton label="Suivant"
                  :secondary="true"
                  icon="ri-arrow-right-line"
                  :disabled="currentStep === 4"
                  @click="nextStep()" />
    </li>
    <li v-if="currentStep === 4">
      <DsfrButton
        label="Publier"
        :disabled="loading"
        :icon="loading ? { name: 'ri-loader-4-line', animation: 'spin' } : ''"
        :iconRight="true"
        @click="askPublishArrete()"
      />
    </li>
  </ul>
  <DsfrTabs class="tabs-light" v-if="refDataStore.departements.length > 0">
    <DsfrTabContent :selected="currentStep === 1">
      <ArreteCadreFormGeneral :arrete-cadre="arreteCadre" :fullValidation="fullValidation" />
    </DsfrTabContent>
    <!--    <DsfrTabContent :selected="currentStep === 2">-->
    <!--      <ArreteCadreFormRegles :arrete-cadre="arreteCadre" :fullValidation="fullValidation" :viewOnly="viewOnly" />-->
    <!--    </DsfrTabContent>-->
    <DsfrTabContent :selected="currentStep === 2">
      <ArreteCadreFormZones :arrete-cadre="arreteCadre" :fullValidation="fullValidation" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 3">
      <ArreteCadreFormUsages
        :arrete-cadre="arreteCadre"
        :fullValidation="fullValidation"
        :usageSelected="usageSelected"
        :key="componentKey"
      />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 4">
      <ArreteCadreFormRecapitulatif
        :arrete-cadre="arreteCadre"
        :key="componentKey"
        @usageSelected="
          usageSelected = $event;
          previousStep();
        "
      />
    </DsfrTabContent>
  </DsfrTabs>
  <DsfrModal :opened="modalPublishOpened" icon="ri-arrow-right-line" :title="modalTitle" @close="modalPublishOpened = false">
    <ArreteCadreFormPublier ref="publierFormRef" :arrete-cadre="arreteCadre" :loading="loading" @publier="publishArrete($event)" />
    <template #footer>
      <ul class="fr-btns-group fr-btns-group--md fr-btns-group--inline-sm fr-btns-group--inline-md fr-btns-group--inline-lg fr-mt-4w">
        <li v-if="currentStep !== 1">
          <DsfrButton label="Annuler" :disabled="loading" :secondary="true" @click="modalPublishOpened = false" />
        </li>
        <li>
          <DsfrButton
            label="Publier"
            :icon="loading ? { name: 'ri-loader-4-line', animation: 'spin' } : ''"
            :disabled="loading"
            @click="publierFormRef.submitForm()"
          />
        </li>
      </ul>
    </template>
  </DsfrModal>
</template>
