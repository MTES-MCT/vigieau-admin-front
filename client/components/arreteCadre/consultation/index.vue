<script setup lang="ts">
import type { Ref } from "vue";
import { ArreteCadre } from "~/dto/arrete_cadre.dto";

const route = useRoute();
const api = useApi();
const router = useRouter();

const arreteCadre: Ref<ArreteCadre> = ref();
const { data, error } = await api.arreteCadre.get(<string>route.params.id);
if (data.value) {
  arreteCadre.value = <ArreteCadre>data.value;
}

const consultationButtons: Ref<any[]> = ref([
  {
    label: 'Retour',
    icon: "ri-arrow-left-line",
    secondary: true,
    onclick: () => {
      router.go(-1)
    },
  },
  {
    label: 'Modifier',
    icon: 'ri-edit-2-fill',
    secondary: true,
    onclick: () => {
      console.log('poulet');
    },
  },
]);
</script>

<template>
  <template v-if="arreteCadre">
    <h1>Arrêté cadre&nbsp;: {{ arreteCadre.numero }}</h1>
    
    <ArreteCadreConsultationGeneral :arreteCadre="arreteCadre" />
      
    <ArreteCadreConsultationZones :arreteCadre="arreteCadre" />
    
    <h2>Usages et mesures de restriction</h2>
    <ArreteCadreFormRecapitulatif :arrete-cadre="arreteCadre" :viewOnly="true" />

    <DsfrButtonGroup :buttons="consultationButtons"
                     class="fr-mt-2w"
                     align="right"
                     inlineLayoutWhen="always" />
  </template>
</template>