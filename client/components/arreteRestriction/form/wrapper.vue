<script setup lang="ts">
import type { Ref } from 'vue';
import useVuelidate from '@vuelidate/core/dist/index';
import { useRefDataStore } from '~/stores/refData';
import { useAlertStore } from '~/stores/alert';
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
}>();

const route = useRoute();
const api = useApi();
const refDataStore = useRefDataStore();
const alertStore = useAlertStore();
const isNewArreteRestriction = route.params.id === 'nouveau';
const loading = ref(false);
const componentKey = ref(0);
const asc = ref(true);

const currentStep: Ref<number> = ref(1);
const steps = [
  'Informations générales',
  "Gestion de l'eau potable",
  "Liste des zones d'alertes",
  'Niveux de gravité et usages',
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
    // case 3:
    //   await zonesFormRef.value?.v$.$validate()
    //   errors = zonesFormRef.value?.v$.$errors;
    //   break;
    // case 4:
    //   await usagesFormRef.value?.v$.$validate()
    //   errors = usagesFormRef.value?.v$.$errors;
    //   break;
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
  const { data, error } = props.arreteRestriction.id
    ? await api.arreteRestriction.update(props.arreteRestriction.id.toString(), props.arreteRestriction)
    : await api.arreteRestriction.create({ ...props.arreteRestriction });
  if (data.value) {
    // Mise à jour des ids des objets nouvellement crées
    props.arreteRestriction.id = data.value.id;
    componentKey.value++;
    if(props.arreteRestriction.statut !== 'a_valider') {
      await publishArrete(props.arreteRestriction);
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
    title: publish ? "Impossible de publier l'arrêté de restriction" : "Impossible d'enregistrer l'arrêté de restriction",
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

const publishArrete = async (ar: ArreteRestriction) => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  const { data, error } = await api.arreteCadre.publish(ar.id?.toString(), ar);
  if (data.value) {
    modalPublishOpened.value = false;
    navigateTo('/arrete-restriction');
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
    {{ isNewArreteRestriction ? 'Création' : 'Edition' }} d'un arrêté de restriction
    <MixinsStatutBadge :statut="arreteRestriction.statut" />
  </h1>
  <DsfrStepper :steps="steps" :currentStep="currentStep" />
  <MixinsAlerts class="fr-mb-2w" />
  <DsfrTabs class="tabs-light" v-if="refDataStore.departements.length > 0">
    <DsfrTabContent :selected="currentStep === 1" :asc="asc">
      <ArreteRestrictionFormGeneral
        ref="generalFormRef"
        :arreteRestriction="arreteRestriction" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 2" :asc="asc">
      <ArreteRestrictionFormRegles
        ref="reglesFormRef"
        :arreteRestriction="arreteRestriction" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 3" :asc="asc">
      <ArreteRestrictionFormZones
        ref="zonesFormRef"
        :arreteRestriction="arreteRestriction" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 4" :asc="asc">
      <ArreteRestrictionFormGravite
        ref="usagesFormRef"
        :arreteRestriction="arreteRestriction"
      />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 5" :asc="asc">
<!--      <ArreteCadreFormRecapitulatif-->
<!--        :arrete-cadre="arreteCadre"-->
<!--        :key="componentKey"-->
<!--        :view-only="false"-->
<!--        @usageSelected="-->
<!--          usageSelected = $event;-->
<!--          previousStep();-->
<!--        "-->
<!--      />-->
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
        :label="arreteRestriction.statut === 'a_valider' ? 'Enregistrer en brouillon' : 'Enregistrer'"
        data-cy="ArreteCadreFormSaveBtn"
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
                  data-cy="ArreteCadreFormNextStepBtn"
                  :disabled="currentStep === 5"
                  @click="nextStep()" />
    </li>
    <li v-if="currentStep === 5 && arreteRestriction.statut === 'a_valider'">
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
<!--    <ArreteCadreFormPublier ref="publierFormRef" :arreteRestriction="arreteRestriction" @publier="publishArrete($event)" />-->
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
