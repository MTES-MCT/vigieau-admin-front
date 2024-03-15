<script setup lang="ts">
import type { ArreteRestriction } from '~/dto/arrete_restriction.dto';
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import type { Ref } from 'vue';
import { Restriction } from '~/dto/restriction.dto';
import type { Commune } from '~/dto/commune.dto';

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
  selected: boolean;
}>();
const modalCommunesOpened = ref(false);
const modalActions = ref();
const expandedId = ref();

const rules = computed(() => {
  return {
    restrictions: {
      required: helpers.withMessage('L\'arrêté doit être lié à au moins une zone d\'alerte AEP.', () => {
        return props.arreteRestriction.restrictions.filter((r) => r.isAep).length > 0;
      }),
      different: helpers.withMessage('Les zones AEP sélectionnées contiennent des doublons de communes.', () => {
        const communesId = props.arreteRestriction.restrictions
          .filter((r) => r.isAep)
          .map((r) => r.communes.map((c) => c.id))
          .flat();
        return new Set(communesId).size === communesId.length;
      }),
    },
  };
});

const utils = useUtils();
const api = useApi();
const communes: Ref<Commune[]> = ref([]);
const groupementToEdit: Ref<Restriction | undefined> = ref();
const groupementCommunesFormRef = ref(null);
const zonesAep: Ref<Restriction[]> = ref(props.arreteRestriction.restrictions.filter((r) => r.isAep));
const zonesSelected: Ref<string[]> = ref(zonesAep.value.map((r) => r.nomGroupementAep));
const indexEdited = ref(null);

const isFullDepartement = ref(null);
const canComputeFullDepartement = ref(true);
modalActions.value = [
  {
    label: 'Enregistrer',
    onclick: () => {
      groupementCommunesFormRef.value?.submitForm();
    },
  },
  {
    label: 'Annuler',
    secondary: true,
    onclick: () => {
      utils.closeModal(modalCommunesOpened);
    },
  },
];

const communesAssociated = computed(() => {
  return props.arreteRestriction.restrictions
    .filter((r) => r.isAep)
    .map((r) => r.communes)
    .flat().length;
});

const createEditGroupementCommunes = (index = null, isFullDepartement = false) => {
  const r = index !== null ? JSON.parse(JSON.stringify(props.arreteRestriction.restrictions[index])) : new Restriction(true);
  if (isFullDepartement) {
    r.nomGroupementAep === 'Zone AEP départementale';
    r.communes = communes.value.map((c) => {
      return { id: c.id };
    });
  }
  groupementToEdit.value = r;
  indexEdited.value = index;
  modalCommunesOpened.value = true;
};

const createEditGroupement = async (restriction: Restriction) => {
  if (indexEdited.value === null) {
    props.arreteRestriction.restrictions.push(restriction);
    zonesSelected.value = [...zonesSelected.value, restriction.nomGroupementAep];
  } else {
    props.arreteRestriction.restrictions[indexEdited.value] = restriction;
  }
  indexEdited.value = null;
  utils.closeModal(modalCommunesOpened);
};

const onChange = ({ name, checked }: { name: string; checked: boolean }) => {
  zonesSelected.value = checked ? [...zonesSelected.value, name] : zonesSelected.value.filter((val) => val !== name);
};

const v$ = useVuelidate(rules, { isFullDepartement });

defineExpose({
  v$,
});

// watch(isFullDepartement, () => {
//   if (!canComputeFullDepartement.value) {
//     canComputeFullDepartement.value = true;
//     return;
//   }
//   if (isFullDepartement.value) {
//     // On assigne toutes les communes
//     if (!zonesAep.value.some((r) => r.nomGroupementAep === 'Zone AEP départementale')) {
//       zonesAep.value.push({
//         arreteCadre: null,
//         id: null,
//         nomGroupementAep: 'Zone AEP départementale',
//         zoneAlerte: null,
//         niveauGravite: null,
//         usagesArreteRestriction: [],
//         isAep: true,
//         communes: communes.value.map((c) => {
//           return { id: c.id };
//         }),
//         communesText: undefined,
//       });
//     } else {
//       zonesAep.value = zonesAep.value.map((r) => {
//         if (r.nomGroupementAep === 'Zone AEP départementale') {
//           r.communes = communes.value.map((c) => {
//             return { id: c.id };
//           });
//         }
//         return r;
//       });
//     }
//     zonesSelected.value = ['Zone AEP départementale'];
//   } else {
//     zonesAep.value = zonesAep.value.filter((r) => r.nomGroupementAep !== 'Zone AEP départementale');
//     // On enlève les restrictions AEP
//     zonesSelected.value = [];
//   }
// });

watch(
  () => props.arreteRestriction.departement,
  async () => {
    const query = `depCode=${props.arreteRestriction.departement?.code}`;
    const { data, error } = await api.commune.list(query);
    if (data.value) {
      communes.value = data.value;
      const restrictionsAep = props.arreteRestriction.restrictions.filter((r) => r.isAep);
      if (restrictionsAep.length > 0) {
        canComputeFullDepartement.value = false;
        isFullDepartement.value = restrictionsAep.length < 2 && communesAssociated.value === communes.value.length;
      }
    }
  },
  { immediate: true },
);

watch(zonesSelected, () => {
  const zonesAepSelected = zonesAep.value.filter((r) => zonesSelected.value.includes(r.nomGroupementAep));
  props.arreteRestriction.restrictions = props.arreteRestriction.restrictions.filter(
    (r) => !r.isAep || zonesSelected.value.includes(r.nomGroupementAep),
  );
  const newZones = zonesAepSelected.filter(
    (z) => !props.arreteRestriction.restrictions.some((r) => r.nomGroupementAep === z.nomGroupementAep),
  );
  newZones.forEach((z) => {
    props.arreteRestriction.restrictions.push(z);
  });
});
</script>

<template>
  <form @submit.prevent="">
    <div class="zone-alerte-aep fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Définition des zones AEP</h6>

        <h6>Création de zones AEP avec un groupement de commune</h6>

        <div v-if="communes.length > 0" class="form-group fr-fieldset fr-mt-2w">
          <DsfrInputGroup class="full-width" :error-message="utils.showInputError(v$, 'restrictions')">
            <template v-for="(r, index) in arreteRestriction.restrictions">
              <template v-if="r.isAep">
                <DsfrCheckbox
                  :id="r.id || r.nomGroupementAep"
                  :name="r.nomGroupementAep"
                  :model-value="zonesSelected.includes(r.nomGroupementAep)"
                  :small="false"
                  @update:model-value="onChange({ name: r.nomGroupementAep, checked: $event })"
                >
                  <template #label>
                    <DsfrButton
                      :label="r.nomGroupementAep"
                      :tertiary="true"
                      :no-outline="false"
                      @click.stop="createEditGroupementCommunes(index)"
                    />
                  </template>
                </DsfrCheckbox>

                <DsfrAccordion
                  v-if="r.communes"
                  class="full-width fr-accordion--no-shadow"
                  :title="'Voir les ' + r.communes.length + ' communes'"
                  :expanded-id="expandedId"
                  @expand="expandedId = $event"
                >
                  <span v-for="c of r.communes"> {{ c.code }} - {{ c.nom }}<br /> </span>
                </DsfrAccordion>
              </template>
            </template>
            <div class="divider fr-mb-2w" />
          </DsfrInputGroup>
        </div>
        <DsfrButton
          label="Ajouter un groupement de communes"
          secondary
          @click="createEditGroupementCommunes()"
          :disabled="communesAssociated >= communes.length"
        />
        <DsfrButton
          label="Ajouter toutes les communes du département"
          secondary
          @click="createEditGroupementCommunes(null, true)"
          :disabled="zonesSelected.length > 0"
        />
      </div>
    </div>
  </form>
  <DsfrModal
    :opened="modalCommunesOpened"
    title="Nouveau groupement de communes"
    :actions="modalActions"
    @close="modalCommunesOpened = utils.closeModal(modalCommunesOpened);"
  >
    <ArreteRestrictionFormGroupementCommunes
      :restriction="groupementToEdit"
      ref="groupementCommunesFormRef"
      :communes="communes"
      :zonesAep="zonesAep"
      :arretesCadre="arreteRestriction.arretesCadre"
      @createEdit="createEditGroupement($event)"
    />
  </DsfrModal>
</template>

<style lang="scss">
.zone-alerte-aep {
  .fr-checkbox-group {
    margin-top: 1rem;

    input[type='checkbox'] + label {
      margin-left: 0;
      padding-right: 3rem;

      &::before {
        left: auto;
        right: 0.5rem;
      }

      .checkbox-label-info {
        display: block;
        color: var(--info-425-625);
        width: 100%;
      }
    }
  }
}
</style>
