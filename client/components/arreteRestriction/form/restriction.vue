<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import type { Restriction } from '~/dto/restriction.dto';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';

const props = defineProps<{
  restriction: Restriction;
  arretesCadre: ArreteCadre[];
  type: 'SUP' | 'SOU' | 'AEP';
  multipleZones: boolean;
}>();

const emit = defineEmits<{
  applyToAllRestrictions: any;
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
const allUsages: Ref<any[]> = ref([]);
if(props.arretesCadre.length < 1) {
  allUsages.value = props.restriction.usagesArreteRestriction;
} else {
  let usagesAc = props.arretesCadre.map((ac) => ac.usagesArreteCadre).flat();
  usagesAc = usagesAc.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.usage.id === value.usage.id
      ))
  );
  allUsages.value = props.restriction.usagesArreteRestriction.concat(usagesAc
    .filter((u) => !usagesSelected.value.includes(u.usage.id))
    .map((u) => {
      u.id = null;
      return u;
    }),
  ).filter(u => {
    if(props.type === 'SUP') {
      return u.concerneEsu;
    } else  if (props.type === 'SOU') {
      return u.concerneEso;
    } else {
      return u.concerneAep;
    }
  });
}
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
  return `Afficher les ${props.restriction.usagesArreteRestriction.length}/${allUsages.value.length} usages`;
});

const modalOpened = ref(false);
const modalTitle = ref('');
const usageIdToEmit = ref();
const modalActions = ref([
  {
    label: 'Appliquer à toutes les zones',
    onclick: () => {
      emit('applyToAllRestrictions', usageIdToEmit.value);
      utils.closeModal(modalOpened);
    },
  },
  {
    label: 'Appliquer seulement à cette zone',
    secondary: true,
    onclick: () => {
      utils.closeModal(modalOpened);
    },
  },
]);

const onChange = ({ id, checked }: { id: number; checked: boolean }) => {
  usagesSelected.value = checked ? [...usagesSelected.value, id] : usagesSelected.value.filter((val) => val !== id);
  props.restriction.usagesArreteRestriction = allUsages.value.filter((u) => usagesSelected.value.includes(u.usage.id));
  if(!checked && props.multipleZones) {
    usageIdToEmit.value = id;
    modalTitle.value = `Souhaitez-vous ${checked ? 'cocher' : 'décocher'} cet usage sur toutes les zones d’alertes de même ressource ?`;
    modalOpened.value = true;    
  }
};

watch(() => props.restriction.usagesArreteRestriction, () => {
  usagesSelected.value = props.restriction.usagesArreteRestriction.map((u) => u.usage.id);
});
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row restriction-line">
      <div class="fr-col-8">
        <template v-if="restriction.isAep">
          {{ restriction.nomGroupementAep }}
        </template>
        <template v-else> {{ restriction.zoneAlerte.code }} {{ restriction.zoneAlerte.nom }} </template>        
      </div>
      <div class="fr-col-4">
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'niveauGravite')">
          <DsfrSelect
            id="role"
            v-model="restriction.niveauGravite"
            :options="niveauGraviteOptions"
            defaultUnselectedText="Niveau de gravité *"
            type="text"
            name="niveauGravite"
          />
        </DsfrInputGroup>        
      </div>
      <div class="fr-col-12 fr-grid-row">
        <DsfrInputGroup class="full-width"  :error-message="utils.showInputError(v$, 'usagesArreteRestriction')">
          <DsfrAccordion :title="accordionTitle" :expanded-id="expandedId" @expand="expandedId = $event">
            <div v-for="usageArreteCadre in allUsages">
              <DsfrCheckbox
                :id="'' + restriction.zoneAlerte?.id + usageArreteCadre.usage.id"
                :key="'' + restriction.zoneAlerte?.id + usageArreteCadre.usage.id || usageArreteCadre.name"
                :name="usageArreteCadre.usage.nom"
                :model-value="usagesSelected.includes(usageArreteCadre.usage.id)"
                :small="false"
                @update:model-value="onChange({ id: usageArreteCadre.usage.id, checked: $event })"
              >
                <template #label>
                  <b>{{ usageArreteCadre.usage.nom }}</b>
                  <div class="full-width">
                    <template v-if="restriction.niveauGravite === 'vigilance'">
                      {{ usageArreteCadre.descriptionVigilance ? usageArreteCadre.descriptionVigilance : 'Pas de restrictions pour ce niveau de gravité.' }}
                    </template>
                    <template v-else-if="restriction.niveauGravite === 'alerte'">
                      {{ usageArreteCadre.descriptionAlerte ? usageArreteCadre.descriptionAlerte : 'Pas de restrictions pour ce niveau de gravité.' }}
                    </template>
                    <template v-else-if="restriction.niveauGravite === 'alerte_renforcee'">
                      {{ usageArreteCadre.descriptionAlerteRenforcee ? usageArreteCadre.descriptionAlerteRenforcee : 'Pas de restrictions pour ce niveau de gravité.' }}
                    </template>
                    <template v-else-if="restriction.niveauGravite === 'crise'">
                      {{ usageArreteCadre.descriptionCrise ? usageArreteCadre.descriptionCrise : 'Pas de restrictions pour ce niveau de gravité.' }}
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
  <DsfrModal
    :opened="modalOpened"
    :title="modalTitle"
    :actions="modalActions"
    @close="modalOpened = utils.closeModal(modalOpened);"
  >
    Vous pouvez choisir d’appliquer ou non votre action à toutes les autres zones d’alertes de même ressource.
  </DsfrModal>
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
