<script setup lang="ts">
import type { Ref } from "vue";
import useVuelidate from "@vuelidate/core/dist/index";
import { useRefDataStore } from "~/stores/refData";
import { useAlertStore } from "~/stores/alert";
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";
import type { UsageArreteCadre } from "~/dto/usage_arrete_cadre.dto";
import { ArreteCadre } from "~/dto/arrete_cadre.dto";
import type { Restriction } from "~/dto/restriction.dto";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
}>();

const route = useRoute();
const api = useApi();
const refDataStore = useRefDataStore();
const alertStore = useAlertStore();
const isNewArreteRestriction = route.params.id === "nouveau";
const loading = ref(false);
const componentKey = ref(0);
const asc = ref(true);

const currentStep: Ref<number> = ref(1);

const v$ = useVuelidate();

const nextStep = async () => {
  asc.value = true;
  let errors;
  switch (currentStep.value) {
    case 1:
      await generalFormRef.value?.v$.$validate();
      errors = generalFormRef.value?.v$.$errors;
      break;
    case 2:
      await reglesFormRef.value?.v$.$validate();
      errors = reglesFormRef.value?.v$.$errors;
      break;
    case 3:
      if (showRestrictionsAepForm.value) {
        await restrictionsAepFormRef.value?.v$.$validate();
        errors = restrictionsAepFormRef.value?.v$.$errors;
      } else {
        await restrictionsFormRef.value?.v$.$validate();
        errors = restrictionsFormRef.value?.v$.$errors;      }
      break;
    case 4:
      if (showRestrictionsForm.value && showRestrictionsAepForm.value) {
        await restrictionsFormRef.value?.v$.$validate();
        errors = restrictionsFormRef.value?.v$.$errors;
      } else {
        await graviteFormRef.value?.v$.$validate();
        errors = graviteFormRef.value?.v$.$errors;
      }
      break;
    case 5:
      await graviteFormRef.value?.v$.$validate();
      errors = graviteFormRef.value?.v$.$errors;
      break;
  }
  if (errors && errors.length > 0) {
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
    props.arreteRestriction.restrictions.map((restriction: Restriction) => {
      restriction.id = (<ArreteRestriction>data.value).restrictions.find(
        (r: Restriction) => r.zoneAlerte ? r.zoneAlerte.id === restriction.zoneAlerte?.id : r.nomGroupementAep === restriction.nomGroupementAep
      ).id;
      restriction.usagesArreteRestriction.map((usagesArreteRestriction: UsageArreteCadre) => {
        usagesArreteRestriction.id = (<ArreteRestriction>data.value).restrictions.find(
          (r: Restriction) => r.id === restriction.id
        ).usagesArreteRestriction.find(
          (u: UsageArreteCadre) => u.usage.id === usagesArreteRestriction.usage.id
        ).id;
        return usagesArreteRestriction;
      });
      return restriction;
    });
    componentKey.value++;
    if (props.arreteRestriction.statut !== "a_valider") {
      await publishArrete(props.arreteRestriction);
    }
    if (!publish) {
      alertStore.addAlert({
        description: "Enregistrement réussi",
        type: "success"
      });
    }
  }
  loading.value = false;
};

const showErrors = (errors, publish) => {
  alertStore.addAlert({
    title: publish ? "Impossible de publier l'arrêté de restriction" : "Impossible d'enregistrer l'arrêté de restriction",
    description: errors.map((e: any) => e.$message).join(", "),
    type: "error"
  });
};

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
    navigateTo("/arrete-restriction");
  }
  loading.value = false;
};

const getRestrictionByNiveauDeGravite = (niveauGravite: string) => {
  return props.arreteRestriction.restrictions.filter((restriction) => restriction.niveauGravite === niveauGravite);
};

const showRestrictionsForm = computed(() => {
  return props.arreteRestriction.perimetreAr !== "aep";
});

const showRestrictionsAepForm = computed(() => {
  return props.arreteRestriction.perimetreAr === "aep" ||
    (props.arreteRestriction.perimetreAr === "all" && props.arreteRestriction.niveauGraviteSpecifiqueEap);
});

const totalSteps = computed(() => {
  return showRestrictionsForm.value && showRestrictionsAepForm.value ? 5 : 4;
});


const steps = computed(() => {
  if (showRestrictionsForm.value && !showRestrictionsAepForm.value) {
    return [
      "Informations générales",
      "Gestion de l'eau potable",
      "Liste des zones d'alertes",
      "Niveaux de gravité et usages"
    ];
  } else if (showRestrictionsForm.value && showRestrictionsAepForm.value) {
    return [
      "Informations générales",
      "Gestion de l'eau potable",
      "Liste des zones d'alertes",
      "Liste des zones d'alertes AEP",
      "Niveaux de gravité et usages"
    ];
  } else {
    return [
      "Informations générales",
      "Gestion de l'eau potable",
      "Liste des zones d'alertes AEP",
      "Niveaux de gravité et usages"
    ];
  }
});

// PUBLISH MODAL
const modalPublishOpened: Ref<boolean> = ref(false);
const modalTitle: Ref<string> = ref("Récapitulatif et publication de l’arrêté de restriction");
const publierFormRef = ref(null);

// Forms
const generalFormRef = ref(null);
const reglesFormRef = ref(null);
const restrictionsFormRef = ref(null);
const restrictionsAepFormRef = ref(null);
const graviteFormRef = ref(null);
</script>

<template>
  <h1>
    {{ isNewArreteRestriction ? "Création" : "Edition" }} d'un arrêté de restriction
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
    <DsfrTabContent v-if="showRestrictionsAepForm"
                    :selected="currentStep === 3" :asc="asc">
      <ArreteRestrictionFormZonesAep
        ref="restrictionsAepFormRef"
        :selected="currentStep === (totalSteps - 1)"
        :arreteRestriction="arreteRestriction" />
    </DsfrTabContent>
    <DsfrTabContent v-if="showRestrictionsForm"
                    :selected="currentStep === totalSteps - 1" :asc="asc">
      <ArreteRestrictionFormZones
        ref="restrictionsFormRef"
        :selected="currentStep === 3"
        :arreteRestriction="arreteRestriction" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === totalSteps" :asc="asc">
      <ArreteRestrictionFormGravite
        ref="graviteFormRef"
        :key="currentStep"
        :arreteRestriction="arreteRestriction"
      />
    </DsfrTabContent>
  </DsfrTabs>
  <ul class="fr-btns-group--shadow-sticky"></ul>
  <ul
    class="fr-btns-group--sticky fr-btns-group fr-btns-group--md fr-btns-group--inline-sm fr-btns-group--inline-md fr-btns-group--inline-lg fr-mt-4w">
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
                  :disabled="currentStep === totalSteps"
                  @click="nextStep()" />
    </li>
    <li v-if="currentStep === totalSteps && arreteRestriction.statut === 'a_valider'">
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
    <p>
      Cet arrêté de restriction contient&nbsp;:
      <ul>
        <li v-if="getRestrictionByNiveauDeGravite('vigilance').length > 0">
          {{ getRestrictionByNiveauDeGravite("vigilance").length }} zone(s) en vigilance
        </li>
        <li v-if="getRestrictionByNiveauDeGravite('alerte').length > 0">
          {{ getRestrictionByNiveauDeGravite("alerte").length }} zone(s) en alerte
        </li>
        <li v-if="getRestrictionByNiveauDeGravite('alerte_renforcee').length > 0">
          {{ getRestrictionByNiveauDeGravite("alerte_renforcee").length }} zone(s) en alerte renforcée
        </li>
        <li v-if="getRestrictionByNiveauDeGravite('crise').length > 0">
          {{ getRestrictionByNiveauDeGravite("crise").length }} zone(s) en crise
        </li>
      </ul>
      <div class="divider"></div>
    </p>
    <ArreteRestrictionFormPublier ref="publierFormRef" :arreteRestriction="arreteRestriction" @publier="publishArrete($event)" />
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
