<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import type { Restriction } from '~/dto/restriction.dto';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import type { UsageArreteCadre } from '~/dto/usage_arrete_cadre.dto';

const props = defineProps<{
  restriction: Restriction;
  arreteCadre: ArreteCadre;
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
    // usagesArreteRestriction: {
    //   required: helpers.withMessage("La zone d'alerte doit être liée à au moins un usage.", required),
    // },
  };
});
const usagesSelected: Ref<number[]> = ref(props.restriction.usagesArreteRestriction.map((u) => u.usage.id));
const allUsages: Ref<any[]> = ref([]);
if(!props.arreteCadre) {
  allUsages.value = props.restriction.usagesArreteRestriction;
} else {
  let usagesAc = props.arreteCadre.usagesArreteCadre;
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
allUsages.value = allUsages.value.sort((a, b) => {
  if (a.usage.nom < b.usage.nom) {
    return -1;
  }
  if (a.usage.nom > b.usage.nom) {
    return 1;
  }
  return 0;
});
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
  const allUsagesLength = props.restriction.niveauGravite ? 
    allUsages.value.filter((u) => getNiveauGravite(u) !== null && getNiveauGravite(u) !== '').length : 
    allUsages.value.length;
  return `Afficher les ${props.restriction.usagesArreteRestriction.length}/${allUsagesLength} usages`;
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

const getNiveauGravite = (usageArreteCadre: UsageArreteCadre, niveauGravite?: string | null) => {
  switch (niveauGravite ? niveauGravite : props.restriction.niveauGravite) {
    case 'vigilance':
      return usageArreteCadre.descriptionVigilance;
    case 'alerte':
      return usageArreteCadre.descriptionAlerte;
    case 'alerte_renforcee':
      return usageArreteCadre.descriptionAlerteRenforcee;
    case 'crise':
      return usageArreteCadre.descriptionCrise;
    default:
      return null;
  }
};

watch(() => props.restriction.usagesArreteRestriction, () => {
  usagesSelected.value = props.restriction.usagesArreteRestriction.map((u) => u.usage.id);
});

watch(() => props.restriction.niveauGravite, (newValue, oldValue) => {
  const selectedUsage = allUsages.value.filter(usage => {
    return usagesSelected.value.includes(usage.usage.id) && getNiveauGravite(usage) !== null && getNiveauGravite(usage) !== '';
  }).map(u => u.usage.id);
  const oldUsagesDisabledEnabled = allUsages.value.filter(usage => {
    return (getNiveauGravite(usage, oldValue ? oldValue : 'new') === null || getNiveauGravite(usage, oldValue ? oldValue : 'new') === '') &&
      getNiveauGravite(usage) !== null && getNiveauGravite(usage) !== '';
  }).map(u => u.usage.id);
  usagesSelected.value = [...new Set([selectedUsage, oldUsagesDisabledEnabled].flat())];
  props.restriction.usagesArreteRestriction = allUsages.value.filter((u) => usagesSelected.value.includes(u.usage.id));
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
            id="niveauGravite"
            v-model="restriction.niveauGravite"
            :options="niveauGraviteOptions"
            defaultUnselectedText="Niveau de gravité *"
            type="text"
            name="niveauGravite"
          />
        </DsfrInputGroup>        
      </div>
      <div class="fr-col-12 fr-grid-row">
        <DsfrInputGroup class="full-width"
                        :error-message="utils.showInputError(v$, 'usagesArreteRestriction')">
          <DsfrAccordion :title="accordionTitle"
                         :expanded-id="expandedId"
                         @expand="expandedId = $event"
                         class="fr-accordion--no-shadow">
            <div v-for="usageArreteCadre in allUsages">
              <DsfrCheckbox
                :id="'' + restriction.zoneAlerte?.id + restriction.nomGroupementAep + usageArreteCadre.usage.id"
                :key="'' + restriction.zoneAlerte?.id + restriction.nomGroupementAep + usageArreteCadre.usage.id || usageArreteCadre.name"
                :name="usageArreteCadre.usage.nom"
                :model-value="usagesSelected.includes(usageArreteCadre.usage.id)"
                :small="false"
                :disabled="getNiveauGravite(usageArreteCadre) === null || getNiveauGravite(usageArreteCadre) === ''"
                @update:model-value="onChange({ id: usageArreteCadre.usage.id, checked: $event })"
              >
                <template #label>
                  <b>{{ usageArreteCadre.usage.nom }}</b>
                  <div class="full-width">
                    {{ getNiveauGravite(usageArreteCadre) }}
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
}
</style>
