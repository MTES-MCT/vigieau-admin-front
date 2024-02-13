<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import type { Restriction } from '~/dto/restriction.dto';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';

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
const allUsages = props.arreteCadre.usagesArreteCadre;
const utils = useUtils();

const v$ = useVuelidate(rules, props.restriction);

const niveauGraviteOptions = [
  {
    text: 'Vigilance',
    value: 'vigilance',
  },
  {
    text: 'Alerte',
    value: 'alerte',
  },
  {
    text: 'Alerte renforcée',
    value: 'alerte_renforcee',
  },
  {
    text: 'Crise',
    value: 'crise',
  },
];
const expandedId = ref();

const accordionTitle = computed(() => {
  return `Afficher les ${props.restriction.usagesArreteRestriction.length}/${allUsages.length} usages`;
});

const onChange = ({ id, checked }: { id: number; checked: boolean }) => {
  usagesSelected.value = checked ? [...usagesSelected.value, id] : usagesSelected.value.filter((val) => val !== id);
};

watch(usagesSelected, () => {
  
});
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row restriction-line">
      {{ restriction.zoneAlerte.code }} {{ restriction.zoneAlerte.nom }}
      <DsfrInputGroup :error-message="utils.showInputError(v$, 'niveauGravite')">
        <DsfrSelect
          id="role"
          v-model="restriction.niveauGravite"
          :options="niveauGraviteOptions"
          placeholder="Niveau de gravité"
          type="text"
          name="niveauGravite"
        />
      </DsfrInputGroup>
      <div class="fr-grid-row">
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'usagesArreteRestriction')">
          <DsfrAccordion :title="accordionTitle" :expanded-id="expandedId" @expand="expandedId = $event">
            <div v-for="usageArreteCadre in allUsages">
              <DsfrCheckbox
                :id="usageArreteCadre.id"
                :key="usageArreteCadre.id || usageArreteCadre.name"
                :name="usageArreteCadre.usage.nom"
                :model-value="usagesSelected.includes(usageArreteCadre.usage.id)"
                :small="false"
                @update:model-value="onChange({ id: usageArreteCadre.id, checked: $event })"
              >
                <template #label>
                  <b>{{ usageArreteCadre.usage.nom }}</b>
                  <div class="full-width">
                    <template v-if="restriction.niveauGravite === 'vigilance'">
                      {{ usageArreteCadre.descriptionVigilance }}
                    </template>
                    <template v-else-if="restriction.niveauGravite === 'alerte'">
                      {{ usageArreteCadre.descriptionAlerte }}
                    </template>
                    <template v-else-if="restriction.niveauGravite === 'alerte_renforcee'">
                      {{ usageArreteCadre.descriptionAlerteRenforcee }}
                    </template>
                    <template v-else-if="restriction.niveauGravite === 'crise'">
                      {{ usageArreteCadre.descriptionCrise }}
                    </template>
                  </div>
                </template>
              </DsfrCheckbox>
              <div class="divider fr-mb-2w" />
            </div>
          </DsfrAccordion>
        </DsfrInputGroup>
      </div>
    </div>
  </form>
</template>

<style lang="scss">
.restriction-line {
  justify-content: space-between;
  align-items: center;

  .fr-select-group {
    margin-bottom: 0;
  }

  .fr-accordion:before {
    box-shadow: none;
  }
}
</style>
