<script setup lang="ts">
import type { Ref } from "vue";
import { ArreteCadre } from "~/dto/arrete_cadre.dto";
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";

const route = useRoute();
const api = useApi();

const arreteRestriction: Ref<ArreteRestriction> = ref();
const { data, error } = await api.arreteRestriction.get(<string>route.params.id);
if (data.value) {
  arreteRestriction.value = <ArreteCadre>data.value;
}
</script>

<template>
  <template v-if="arreteRestriction">
    <h1>Arrêté de restriction&nbsp;: {{ arreteRestriction.numero }}</h1>
    
    <h2>Généralité</h2>
    <p>Date de mise en vigueur&nbsp;: {{ arreteRestriction.dateDebut }}</p>
    <p>Date de fin&nbsp;: {{ arreteRestriction.dateFin }}</p>
    <p>Date de signature&nbsp;: {{ arreteRestriction.dateSignature }}</p>
  </template>
</template>