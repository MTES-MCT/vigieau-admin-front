<script setup lang="ts">
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
}>();
</script>

<template>
  <h2>Généralité</h2>
  <p>Date de mise en vigueur&nbsp;: {{ arreteRestriction.dateDebut }}</p>
  <p>Date de fin&nbsp;: {{ arreteRestriction.dateFin }}</p>
  <p>Date de signature&nbsp;: {{ arreteRestriction.dateSignature }}</p>
</template>