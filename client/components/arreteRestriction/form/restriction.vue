<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import type { Restriction } from "~/dto/restriction.dto";
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";

const props = defineProps<{
  restriction: Restriction;
  arreteCadre: ArreteCadre;
}>();

const rules = computed(() => {
  return {
    niveauGravite: {
      required: helpers.withMessage("La zone d'alerte doit avoir un niveau de gravité.", required),
    },
  };
});

const v$ = useVuelidate(rules, props.restriction);

const niveauGraviteOptions = [
  {
    text: 'Vigilance',
    value: 'vigilance'
  },
  {
    text: 'Alerte',
    value: 'alerte'
  },
  {
    text: 'Alerte renforcée',
    value: 'alerte_renforcee'
  },
  {
    text: 'Crise',
    value: 'crise'
  }
];
const expandedId = ref();

const accordionTitle = computed(() => {
  return `Afficher les ${props.arreteCadre.usagesArreteCadre.length} usages`;
});
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row restriction-line">
      {{ restriction.zoneAlerte.code }} {{ restriction.zoneAlerte.nom }}
      <DsfrSelect
        id="role"
        v-model="restriction.niveauGravite"
        :options="niveauGraviteOptions"
        label="Niveau de gravité"
        label-visible
        type="text"
        name="niveauGravite"
        required
      />
    </div>
    <div class="fr-grid-row">
      <DsfrAccordion
        :title="accordionTitle"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <div v-for="usageArreteCadre in arreteCadre.usagesArreteCadre">
          {{ usageArreteCadre.usage.nom }}
        </div>
      </DsfrAccordion>      
    </div>
  </form>  
</template>

<style lang="scss">
.restriction-line {
  justify-content: space-between;
}
</style>
