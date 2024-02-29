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
    isFullDepartement: {
      required: helpers.withMessage("La règle de gestion de l'eau potable est obligatoire.", required),
    },
    restrictions: {
      required: helpers.withMessage("L'arrêté doit être lié à au moins une zone d'alerte AEP.", () => {
        return props.arreteRestriction.restrictions.filter(r => r.isAep).length > 0;
      }),
      different: helpers.withMessage("Les zones AEP sélectionnées contiennent des doublons de communes.", () => {
        const communesId = props.arreteRestriction.restrictions.filter(r => r.isAep).map(r => r.communes.map(c => c.id)).flat();
        return (new Set(communesId)).size === communesId.length;
      }),
    }
  };
});

const utils = useUtils();
const api = useApi();
const communes: Ref<Commune[]> = ref([]);
const groupementToEdit: Ref<Restriction | undefined> = ref();
const groupementCommunesFormRef = ref(null);
const zonesAep: Ref<Restriction[]> = ref(props.arreteRestriction.restrictions.filter((r) => r.isAep));
const zonesSelected: Ref<string[]> = ref(zonesAep.value.map((r) => r.nomGroupementAep));

const isFullDepartement = ref(null);
const fullDepartementOptions = [
  {
    label: 'Choisir mon département en entier',
    value: true,
  },
  {
    label: 'Créer des zones en groupant des communes',
    value: false,
  },
];
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
      modalCommunesOpened.value = false;
    },
  },
];

const communesAssociated = computed(() => {
  return props.arreteRestriction.restrictions
    .filter((r) => r.isAep)
    .map((r) => r.communes)
    .flat().length;
});

const createGroupementCommunes = () => {
  groupementToEdit.value = new Restriction(true);
  modalCommunesOpened.value = true;
};

const createEditGroupement = async (restriction: Restriction) => {
  if (!restriction.id) {
    zonesAep.value.push(restriction);
    zonesSelected.value = [...zonesSelected.value, restriction.nomGroupementAep];
  } else {
    const idx = zonesAep.value.findIndex((r) => r.id === restriction.id);
    zonesAep.value[idx] = restriction;
  }
  modalCommunesOpened.value = false;
};

const onChange = ({ name, checked }: { name: string; checked: boolean }) => {
  zonesSelected.value = checked ? [...zonesSelected.value, name] : zonesSelected.value.filter((val) => val !== name);
};

const v$ = useVuelidate(rules, { isFullDepartement });

defineExpose({
  v$,
});

watch(isFullDepartement, () => {
  // On enlève les restrictions AEP
  props.arreteRestriction.restrictions = props.arreteRestriction.restrictions.filter((r) => !r.isAep);
  if (isFullDepartement.value) {
    // On assigne toutes les communes
    props.arreteRestriction.restrictions.push({
      id: null,
      nomGroupementAep: 'Zone AEP départementale',
      zoneAlerte: null,
      niveauGravite: null,
      usagesArreteRestriction: [],
      isAep: true,
      communes: communes.value,
      communesText: undefined,
    });
  }
});

watch(
  () => props.arreteRestriction.departement,
  async () => {
    const query = `depCode=${props.arreteRestriction.departement?.code}`;
    const { data, error } = await api.commune.list(query);
    if (data.value) {
      communes.value = data.value;
    }
  },
  { immediate: true },
);

watch(zonesSelected, () => {
  const zonesAepSelected = zonesAep.value.filter((r) => zonesSelected.value.includes(r.nomGroupementAep));
  props.arreteRestriction.restrictions = props.arreteRestriction.restrictions.filter((r) => !r.isAep).concat(zonesAepSelected);
  console.log(props.arreteRestriction.restrictions);
});
</script>

<template>
  <form @submit.prevent="">
    <div class="zone-alerte-aep fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Définition des zones AEP</h6>

        <DsfrInputGroup :error-message="utils.showInputError(v$, 'isFullDepartement')">
          <DsfrRadioButtonSet
            legend="Vous souhaitez :"
            :options="fullDepartementOptions"
            v-model="isFullDepartement"
            name="isFullDepartement"
            :small="false"
          />
        </DsfrInputGroup>

        <div v-if="isFullDepartement === false">
          <h6>Création de zones AEP avec un groupement de commune</h6>

          <div class="form-group fr-fieldset fr-mt-2w">
            <DsfrInputGroup :error-message="utils.showInputError(v$, 'restrictions')">
              <template v-for="(r, index) in zonesAep">
                <DsfrCheckbox
                  :id="r.id || r.nomGroupementAep"
                  :name="r.nomGroupementAep"
                  :model-value="zonesSelected.includes(r.nomGroupementAep)"
                  :small="false"
                  @update:model-value="onChange({ name: r.nomGroupementAep, checked: $event })"
                >
                  <template #label>
                    {{ r.nomGroupementAep }}
                  </template>
                </DsfrCheckbox>
  
                <DsfrAccordion v-if="r.communes"
                               class="full-width"
                               :title="'Voir les ' + r.communes.length + ' communes'"
                               :expanded-id="expandedId"
                               @expand="expandedId = $event">
                  <span v-for="c of r.communes">
                    {{ c.code }} - {{ c.nom }}<br/>
                  </span>
                </DsfrAccordion>
              </template>
            </DsfrInputGroup>
          </div>
          <DsfrButton
            label="Ajouter un groupement de communes"
            secondary
            @click="createGroupementCommunes()"
            :disabled="communesAssociated >= communes.length"
          />
        </div>
      </div>
    </div>
  </form>
  <DsfrModal
    :opened="modalCommunesOpened"
    title="Nouveau groupement de communes"
    :actions="modalActions"
    @close="modalCommunesOpened = false"
  >
    <ArreteRestrictionFormGroupementCommunes
      :restriction="groupementToEdit"
      ref="groupementCommunesFormRef"
      :communes="communes"
      :zonesAep="zonesAep"
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
