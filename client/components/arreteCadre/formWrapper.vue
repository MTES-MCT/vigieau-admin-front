<script setup lang="ts">
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";
import type { Ref } from "vue";

const props = defineProps<{
  arreteCadre?: ArreteCadre,
}>()

const currentStep: Ref<number> = ref(1)
const steps = ['Informations générales', 'Règles de gestion des niveaux d\'alerte', 'Liste des zones d\'alertes', 'Les usages', 'Récapitulatif']
</script>

<template>
  <h1>Création d'un arrêté cadre</h1>
  <DsfrStepper :steps="steps" :currentStep="currentStep" />
</template>