<script setup lang="ts">
import { ArreteCadre } from "~/dto/arrete_cadre.dto";
import type { Ref } from "vue";

const arreteCadre: Ref<ArreteCadre | null> = ref(null);

const route = useRoute();
const api = useApi();
const isNewArreteCadre = route.params.id === "nouveau";

if (isNewArreteCadre) {
  arreteCadre.value = new ArreteCadre();
} else {
  const { data, error } = await api.arreteCadre.get(<string>route.params.id);
  if (data.value) {
    arreteCadre.value = <ArreteCadre> data.value;
  }
}

const currentStep: Ref<number> = ref(1);
const steps = ["Informations générales", "Règles de gestion des niveaux d'alerte", "Liste des zones d'alertes", "Les usages", "Récapitulatif"];

</script>

<template>
  <h1>{{ isNewArreteCadre ? "Création" : "Edition" }} d'un arrêté cadre</h1>
  <DsfrStepper :steps="steps" :currentStep="currentStep" />
  <DsfrTabs class="tabs-light">
    <DsfrTabContent :selected="currentStep === 1">
      <ArreteCadreFormGeneral :arrete-cadre="arreteCadre" />
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 2">
      Panel 2
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 3">
      Panel 3
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 4">
      Panel 4
    </DsfrTabContent>
    <DsfrTabContent :selected="currentStep === 5">
      Panel 5
    </DsfrTabContent>
  </DsfrTabs>
</template>