<script setup lang="ts">
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
}>();

const utils = useUtils();
</script>

<template>
  <h2>Généralité</h2>
  <p>Date de mise en vigueur&nbsp;: {{ arreteRestriction.dateDebut }}</p>
  <p>Date de fin&nbsp;: {{ arreteRestriction.dateFin }}</p>
  <p>Date de signature&nbsp;: {{ arreteRestriction.dateSignature }}</p>
  <DsfrFileDownload
    v-if="arreteRestriction.fichier"
    format="PDF"
    :href="arreteRestriction.fichier.url"
    :size="utils.fileSizeString(arreteRestriction.fichier.size)"
    :download="arreteRestriction.fichier.url"
    :title="arreteRestriction.fichier.nom"
  />
  <div v-if="arreteRestriction.fichier" class="fr-mb-2w"></div>
</template>