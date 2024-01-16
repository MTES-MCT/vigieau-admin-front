<script setup lang="ts">
import { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import useVuelidate from '@vuelidate/core/dist/index';
import { useRefDataStore } from '~/stores/refData';
import { useAlertStore } from '~/stores/alert';
import { useAuthStore } from "~/stores/auth";

const props = defineProps<{
  arreteCadre: ArreteCadre;
  fullValidation: boolean;
}>();

const fullValidation: Ref<boolean> = ref(false);

const api = useApi();
const refDataStore = useRefDataStore();
const alertStore = useAlertStore();
const authStore = useAuthStore();
const loading = ref(false);
const componentKey = ref(0);

const usageSelected = ref();

const currentStep: Ref<number> = ref(1);

const v$ = useVuelidate();

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
  await v$.value.$validate();
  if (v$.value.$error) {
    alertStore.addAlert({
      title: "Impossible d'enregistrer l'arrêté cadre",
      description: v$.value.$errors.map((e: any) => e.$message).join(', '),
      type: 'error',
    });
    return;
  }
  loading.value = true;
  const { data, error } = await api.arreteCadre.updateZones(props.arreteCadre.id.toString(), authStore.user.roleDepartement, props.arreteCadre.zonesAlerte);
  if (data.value) {
    alertStore.addAlert({
      description: 'Enregistrement réussi',
      type: 'success',
    });
  }
  loading.value = false;
};
</script>

<template>
  <h1>
    Arrêté cadre&nbsp;: {{ arreteCadre.numero }}
    <MixinsStatutBadge :statut="arreteCadre.statut" />
  </h1>
  <MixinsAlerts class="fr-mb-2w" />
  <ul class="fr-btns-group fr-btns-group--md fr-btns-group--inline-sm fr-btns-group--inline-md fr-btns-group--inline-lg fr-mt-4w">
    <li>
      <DsfrButton label="Précedent" :secondary="true" icon="ri-arrow-left-line" :disabled="currentStep === 1" @click="previousStep()" />
    </li>
    <li>
      <DsfrButton
        label="Enregistrer"
        :secondary="true"
        :icon="loading ? { name: 'ri-settings-3-line', animation: 'spin' } : 'ri-settings-3-line'"
        :disabled="loading"
        @click="saveArrete()"
      />
    </li>
    <li>
      <DsfrButton label="Suivant" :secondary="true" icon="ri-arrow-right-line" :disabled="currentStep === 2" @click="nextStep()" />
    </li>
  </ul>
  <DsfrTabs class="tabs-light" v-if="refDataStore.departements.length > 0">
    <DsfrTabContent :selected="currentStep === 1">
      <ArreteCadreConsultationGeneral :arrete-cadre="arreteCadre" />
      <ArreteCadreFormZones :arrete-cadre="arreteCadre" :fullValidation="fullValidation" />
    </DsfrTabContent>
    <!--    <DsfrTabContent :selected="currentStep === 2">-->
    <!--      <ArreteCadreFormRegles :arrete-cadre="arreteCadre" :fullValidation="fullValidation" :viewOnly="viewOnly" />-->
    <!--    </DsfrTabContent>-->
    <DsfrTabContent :selected="currentStep === 2">
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
</template>
