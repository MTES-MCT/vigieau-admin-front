<script setup lang="ts">
import { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import useVuelidate from '@vuelidate/core/dist/index';
import { useRefDataStore } from '~/stores/refData';
import type { UsageArreteCadre } from '~/dto/usage_arrete_cadre.dto';
import { useAlertStore } from '~/stores/alert';

const props = defineProps<{
  arreteCadre: ArreteCadre;
}>();

const route = useRoute();
const api = useApi();
const refDataStore = useRefDataStore();
const alertStore = useAlertStore();
const isNewArreteCadre = route.params.id === 'nouveau';
const loading = ref(false);
const componentKey = ref(0);
const asc = ref(true);

const usageSelected = ref();

const currentStep: Ref<number> = ref(1);
const steps = [
  'Informations générales',
  "Règles de gestion des niveaux d'alerte",
  "Liste des zones d'alertes",
  'Les usages',
  'Récapitulatif',
];

const v$ = useVuelidate();

const nextStep = async () => {
  asc.value = true;
  let errors;
  switch (currentStep.value) {
    case 1:
      await generalFormRef.value?.v$.$validate()
      errors = generalFormRef.value?.v$.$errors;
      break;
    case 2:
      await reglesFormRef.value?.v$.$validate()
      errors = reglesFormRef.value?.v$.$errors;
      break;
    case 3:
      await zonesFormRef.value?.v$.$validate()
      errors = zonesFormRef.value?.v$.$errors;
      break;
    case 4:
      await usagesFormRef.value?.v$.$validate()
      errors = usagesFormRef.value?.v$.$errors;
      break;
  }
  if(errors && errors.length > 0) {
    return;
  }
  currentStep.value++;
};

const previousStep = () => {
  asc.value = false;
  currentStep.value--;
};

const saveArrete = async (publish: boolean = false) => {
  if (loading.value) {
    return;
  }
  publish ? v$.value.$validate() : generalFormRef.value?.v$.$validate();
  if (publish ? v$.value.$error : generalFormRef.value?.v$.$error) {
    showErrors(publish ? v$.value.$errors : generalFormRef.value?.v$.$errors, publish);
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
    loading.value = false;
    if(props.arreteCadre.statut !== 'a_valider') {
      await publishArrete(props.arreteCadre);
    }
    if (!publish) {
      alertStore.addAlert({
        description: 'Enregistrement réussi',
        type: 'success',
      });
    }
  }
  loading.value = false;
};

const showErrors = (errors, publish) => {
  alertStore.addAlert({
    title: publish ? "Impossible de publier l'arrêté cadre" : "Impossible d'enregistrer l'arrêté cadre",
    description: errors.map((e: any) => e.$message).join(', '),
    type: 'error',
  });
}

const askPublishArrete = async () => {
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
    navigateTo('/arrete-cadre');
  }
  loading.value = false;
};

// PUBLISH MODAL
const modalPublishOpened: Ref<boolean> = ref(false);
const modalTitle: Ref<string> = ref('Date de publication');
const publierFormRef = ref(null);

// Forms
const generalFormRef = ref(null);
const reglesFormRef = ref(null);
const zonesFormRef = ref(null);
const usagesFormRef = ref(null);
</script>

<template>
  <h1>
    {{ isNewArreteCadre ? 'Création' : 'Edition' }} d'un arrêté cadre
    <MixinsStatutBadge :statut="arreteCadre.statut" />
  </h1>
  <DsfrStepper :steps="steps" :currentStep="currentStep" />
  <DsfrTabs class="tabs-light" v-if="refDataStore.departements.length > 0">
    <DsfrTabContent :selected="currentStep === 1" :asc="asc">
      <ArreteCadreFormGeneral
        ref="generalFormRef"
        :arrete-cadre="arreteCadre" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 2" :asc="asc">
      <ArreteCadreFormRegles
        ref="reglesFormRef"
        :arrete-cadre="arreteCadre" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 3" :asc="asc">
      <ArreteCadreFormZones
        ref="zonesFormRef"
        :arrete-cadre="arreteCadre" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 4" :asc="asc">
      <ArreteCadreFormUsages
        ref="usagesFormRef"
        :arrete-cadre="arreteCadre"
        :usageSelected="usageSelected"
        :key="componentKey"
      />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 5" :asc="asc">
      <ArreteCadreFormRecapitulatif
        :arrete-cadre="arreteCadre"
        :key="componentKey"
        :view-only="false"
        @usageSelected="
          usageSelected = $event;
          previousStep();
        "
      />
    </DsfrTabContent>
  </DsfrTabs>
  <ul  class="fr-btns-group--shadow-sticky"></ul>
  <ul class="fr-btns-group--sticky fr-btns-group fr-btns-group--md fr-btns-group--inline-sm fr-btns-group--inline-md fr-btns-group--inline-lg fr-mt-4w">
    <li>
      <DsfrButton label="Précedent"
                  :secondary="true"
                  icon="ri-arrow-left-line"
                  data-cy="ArreteCadreFormPreviousStepBtn"
                  :disabled="currentStep === 1"
                  @click="previousStep()" />
    </li>
    <li>
      <DsfrButton
        :label="arreteCadre.statut === 'a_valider' ? 'Enregistrer en brouillon' : 'Enregistrer'"
        data-cy="ArreteCadreFormSaveBtn"
        :secondary="true"
        :icon="loading ? { name: 'ri-settings-3-line', animation: 'spin' } : 'ri-settings-3-line'"
        :disabled="loading"
        @click="saveArrete(arreteCadre.statut !== 'a_valider')"
      />
    </li>
    <li>
      <DsfrButton label="Suivant"
                  :secondary="true"
                  icon="ri-arrow-right-line"
                  data-cy="ArreteCadreFormNextStepBtn"
                  :disabled="currentStep === 5"
                  @click="nextStep()" />
    </li>
    <li v-if="currentStep === 5 && arreteCadre.statut === 'a_valider'">
      <DsfrButton
        label="Publier"
        :disabled="loading"
        :icon="loading ? { name: 'ri-loader-4-line', animation: 'spin' } : ''"
        :iconRight="true"
        data-cy="ArreteCadreFormPublishBtn"
        @click="askPublishArrete()"
      />
    </li>
  </ul>
  <DsfrModal :opened="modalPublishOpened" icon="ri-arrow-right-line" :title="modalTitle" @close="modalPublishOpened = false">
    <ArreteCadreFormPublier ref="publierFormRef" :arrete-cadre="arreteCadre" @publier="publishArrete($event)" />
    <template #footer>
      <ul class="fr-btns-group fr-btns-group--md fr-btns-group--inline-sm fr-btns-group--inline-md fr-btns-group--inline-lg fr-mt-4w">
        <li v-if="currentStep !== 1">
          <DsfrButton label="Annuler" :disabled="loading" :secondary="true" @click="modalPublishOpened = false" />
        </li>
        <li>
          <DsfrButton
            label="Publier"
            data-cy="PublishFormPublishBtn"
            :icon="loading ? { name: 'ri-loader-4-line', animation: 'spin' } : ''"
            :disabled="loading"
            @click="publierFormRef.submitForm()"
          />
        </li>
      </ul>
    </template>
  </DsfrModal>
</template>
