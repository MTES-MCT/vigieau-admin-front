<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { ArreteRestriction } from '~/dto/arrete_restriction.dto';
import type { Ref } from 'vue';
import { requiredIf } from '@vuelidate/validators';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import { useAuthStore } from '~/stores/auth';
import { useRefDataStore } from '~/stores/refData';

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
}>();

const utils = useUtils();
const api = useApi();
const authStore = useAuthStore();
const refDataStore = useRefDataStore();
const isAbrogeant: Ref<boolean> = ref(!!props.arreteRestriction.arreteRestrictionAbroge);
const arretesCadreTags: Ref<any> = ref([]);
const acSelected = ref();

const assignDepartement = (force = false) => {
  if ((!props.arreteRestriction.id  && !props.arreteRestriction.departement) || force) {
    props.arreteRestriction.departement =
      authStore.user.role === 'departement' ? refDataStore.departements.find((d) => d.code === authStore.user.roleDepartement) : null;
  }
  if(props.arreteRestriction.departement) {
    loadArretes();    
  }
};

const rules = computed(() => {
  return {
    departement: {
      required: helpers.withMessage("Le département de l'arrêté est obligatoire", required),
    },
    arreteRestrictionAbroge: {
      requiredIf: helpers.withMessage("L'arrêté abrogé est obligatoire", requiredIf(isAbrogeant)),
    },
    numero: {
      required: helpers.withMessage("Le numéro de l'arrêté est obligatoire", required),
    },
    arretesCadre: {
      required: helpers.withMessage("L'arrêté doit être lié à au moins un arrêté cadre", required),
    },
  };
});

const v$ = useVuelidate(rules, props.arreteRestriction);

const abrogeantOptions = [
  {
    label: 'Oui',
    value: true,
  },
  {
    label: 'Non',
    value: false,
  },
];
const arretesRestrictionsOptions: Ref<any> = ref([]);
const arretesRestrictions: Ref<any> = ref([]);
const arretesCadreFiltered: Ref<any> = ref([]);
const arretesCadre: Ref<any> = ref([]);

const loadArretes = async () => {
  const query = `depCode=${props.arreteRestriction.departement.code}`;
  const results = await Promise.all([
    api.arreteRestriction.list(query),
    api.arreteCadre.list(query)
  ]);
  if (results[0].data.value && results[1].data.value) {
    arretesRestrictions.value = results[0].data.value;
    arretesCadre.value = results[1].data.value;
    arretesRestrictionsOptions.value =
      arretesRestrictions.value.length > 0
        ? arretesRestrictions.value.map((ar: ArreteRestriction) => {
            return {
              value: ar.id,
              text: ar.numero,
            };
          })
        : [
            {
              value: null,
              text: 'Aucun arrêté de restriction en vigueur sur votre département',
              disabled: true,
            },
          ];
    filterArretesCadre();
    computeArretesCadreTags();
  }
};

const arreteAbrogeChange = (arId: string) => {
  if (!arId) {
    props.arreteRestriction.arreteRestrictionAbroge = null;
    return;
  }
  console.log('plep');
};

watch(isAbrogeant, () => {
  if (!isAbrogeant) {
    props.arreteRestriction.arreteRestrictionAbroge = null;
    return;
  }
  console.log('plep');
});

const filterArretesCadre = () => {
  arretesCadreFiltered.value = arretesCadre.value.filter((ac: ArreteCadre) => {
    return !props.arreteRestriction.arretesCadre.map((arAc) => arAc.id).includes(ac.id);
  }).map((ac: ArreteCadre) => {
    return {
      value: ac.id,
      text: ac.numero,
    };
  });
  if(arretesCadreFiltered.value.length < 1) {
    arretesCadreFiltered.value = [
      {
        value: null,
        text: 'Aucun arrêté cadre en vigueur disponible',
        disabled: true,
      },
    ];
  }
};

const selectArreteCadre = (acId: string) => {
  const ac = arretesCadre.value.find((ac: ArreteCadre) => ac.id === +acId);
  props.arreteRestriction.arretesCadre = [...props.arreteRestriction.arretesCadre, ac];
  acSelected.value = null;
  computeArretesCadreTags();
  filterArretesCadre();
};

const deleteArreteCadre = (acId: number) => {
  props.arreteRestriction.arretesCadre = props.arreteRestriction.arretesCadre.filter((ac) => ac.id !== acId);
  computeArretesCadreTags();
  filterArretesCadre();
};

const computeArretesCadreTags = () => {
  arretesCadreTags.value = props.arreteRestriction.arretesCadre.map((ac) => {
    return {
      label: ac.numero,
      class: 'fr-tag--dismiss',
      tagName: 'button',
      onclick: () => {
        deleteArreteCadre(ac.id);
      },
    };
  });
};

const departementChange = (depId: string) => {
  const departement = refDataStore.departements.find((d) => d.id === Number(depId));
  props.arreteRestriction.departement = departement;
  loadArretes();
};

const departementsOptions = refDataStore.departements.map((d) => {
  return {
    value: d.id,
    text: d.nom,
  };
});

defineExpose({
  v$,
});

watch(
  () => refDataStore.departements,
  () => {
    if (refDataStore.departements && refDataStore.departements.length > 0) {
      assignDepartement();
    }
  },
  { immediate: true },
);
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Généralité</h6>
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'departement')">
          <DsfrSelect
            v-if="authStore.user.role === 'mte'"
            :model-value="arreteRestriction.departement?.id"
            label="Département"
            :options="departementsOptions"
            @update:modelValue="departementChange($event)"
          />
        </DsfrInputGroup>

        <DsfrInputGroup :error-message="utils.showInputError(v$, 'arreteRestrictionAbroge')">
          <DsfrRadioButtonSet
            :disabled="!arreteRestriction.departement"
            legend="Cet arrêté abroge t-il un autre arrêté de restriction"
            :options="abrogeantOptions"
            v-model="isAbrogeant"
            name="isAbrogeant"
            :small="false"
          />

          <DsfrSelect
            v-if="isAbrogeant"
            :model-value="arreteRestriction.arreteRestrictionAbroge?.id"
            data-cy="ArreteRestrictionFormAbrogeSelect"
            label="Arrêté abrogé"
            :options="arretesRestrictionsOptions"
            @update:modelValue="arreteAbrogeChange($event)"
          />
        </DsfrInputGroup>

        <DsfrInputGroup :error-message="utils.showInputError(v$, 'numero')">
          <DsfrInput
            id="numero"
            :disabled="!arreteRestriction.departement"
            v-model="arreteRestriction.numero"
            data-cy="ArreteRestrictionFormNumeroInput"
            label="Numéro de l'arrêté"
            label-visible
            type="text"
            name="numero"
            :required="true"
          />
        </DsfrInputGroup>

        <DsfrInputGroup :error-message="utils.showInputError(v$, 'arretesCadre')">
          <DsfrSelect
            :disabled="!arreteRestriction.departement"
            label="Ajouter un/des arrêtés cadre"
            data-cy="ArreteRestrictionFormAcSelect"
            :labelVisible="true"
            :options="arretesCadreFiltered"
            placeholder="Rechercher un arrêté cadre"
            v-model="acSelected"
            required
            @update:modelValue="selectArreteCadre($event)"
            @search="selectArreteCadre($event)"
          />

          <DsfrTags class="fr-mt-2w" :tags="arretesCadreTags" />
        </DsfrInputGroup>
      </div>
      <div class="fr-col-12 fr-col-lg-6"></div>
      
      <ArreteRestrictionFormPublier v-if="arreteRestriction.statut !== 'a_valider'" :arreteRestriction="arreteRestriction" />
    </div>
  </form>
</template>
