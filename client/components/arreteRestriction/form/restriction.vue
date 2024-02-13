<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import type { Restriction } from "~/dto/restriction.dto";
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";
import type { Ref } from "vue";

const props = defineProps<{
  restriction: Restriction;
  arreteCadre: ArreteCadre;
}>();

const rules = computed(() => {
  return {
    niveauGravite: {
      required: helpers.withMessage("La zone d'alerte doit avoir un niveau de gravité.", required),
    },
    usagesArreteRestriction: {
      required: helpers.withMessage("La zone d'alerte doit être liée à au moins un usage.", required),
    },
  };
});
const usagesSelected: Ref<number[]> = ref(props.restriction.usagesArreteRestriction.map((u) => u.usage.id));

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
  return `Afficher les ${props.restriction.usagesArreteRestriction.length}/${props.arreteCadre.usagesArreteCadre.length} usages`;
});

const onChange = ({ id, checked }: { id: number; checked: boolean }) => {
  usagesSelected.value = checked ? [...usagesSelected.value, id] : usagesSelected.value.filter((val) => val !== id);
};
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
          <DsfrCheckbox
            :id="usageArreteCadre.id"
            :key="usageArreteCadre.id || usageArreteCadre.name"
            :name="usageArreteCadre.usage.nom"
            :model-value="usagesSelected.includes(usageArreteCadre.usage.id)"
            :small="false"
            @update:model-value="onChange({ id: usageArreteCadre.id, checked: $event })"
          >
            <template #label>
              {{ usageArreteCadre.usage.nom }}
            </template>
          </DsfrCheckbox>
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
