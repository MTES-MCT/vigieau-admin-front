<script setup lang="ts">
import type { Ref } from "vue";
import { ArreteCadre } from "~/dto/arrete_cadre.dto";

const route = useRoute();
const api = useApi();

const arreteCadre: Ref<ArreteCadre> = ref();
const { data, error } = await api.arreteCadre.get(<string>route.params.id);
if (data.value) {
  arreteCadre.value = <ArreteCadre>data.value;
}
</script>

<template>
  <template v-if="arreteCadre">
    <h1>Arrêté cadre&nbsp;: {{ arreteCadre.numero }}</h1>
    
    <ArreteCadreConsultationGeneral :arreteCadre="arreteCadre" />
      
    <ArreteCadreConsultationZones :arreteCadre="arreteCadre" />
    
    <h2>Usages et niveau de restriction</h2>
    <ArreteCadreFormRecapitulatif :arrete-cadre="arreteCadre" :viewOnly="true" />
  </template>
</template>