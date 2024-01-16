<script setup lang="ts">
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";

const props = defineProps<{
  arreteCadre: ArreteCadre;
}>();
</script>

<template>
  <h2>Généralité</h2>
  <p>Cet arrêté est {{ arreteCadre.departements.length > 1 ? 'interdépartemental' : 'départemental'}}</p>
  <DsfrHighlight>
    <span v-for="d of arreteCadre.departements">{{ d.nom }}<br/></span>
  </DsfrHighlight>
  <p>Date de mise en vigueur&nbsp;: {{ arreteCadre.dateDebut }}</p>
  <p>Date de fin&nbsp;: {{ arreteCadre.dateFin }}</p>
  <DsfrFileDownload
    v-if="arreteCadre.url"
    format="PDF"
    :href="arreteCadre.url"
    :size="null"
    :download="arreteCadre.url"
    title="PDF Arrête cadre"
  />
  <div v-if="arreteCadre.url" class="fr-mb-2w"></div>
</template>