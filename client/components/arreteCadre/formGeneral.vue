<script setup lang="ts">
import { ArreteCadre } from '~/dto/arrete_cadre.dto';
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { Ref } from 'vue';
import type { Departement } from '~/dto/departement.dto';
import { useAuthStore } from '~/stores/auth';
import { useRefDataStore } from '~/stores/refData';
import { requiredIf } from '@vuelidate/validators';

const props = defineProps<{
  arreteCadre: ArreteCadre;
  fullValidation: boolean;
  viewOnly: boolean;
}>();

const query: Ref<string> = ref('');
const departementsTags = ref([]);
const departementsFiltered = ref([]);
const utils = useUtils();
const authStore = useAuthStore();
const refDataStore = useRefDataStore();

if (refDataStore.departements) {
  if (!props.arreteCadre.departements && authStore.user.role === 'departement') {
    props.arreteCadre.departements = refDataStore.departements.filter((d) => d.code === authStore.user.roleDepartement);
  }
}

const rules = computed(() => {
  return {
    numero: {
      required: helpers.withMessage("Le numéro de l'arrêté est obligatoire.", required),
    },
    departements: {
      requiredIf: helpers.withMessage("L'arrêté doit être lié à au moins un département", requiredIf(props.fullValidation)),
    },
    dateDebut: {
      required: helpers.withMessage("La date de début de l'arrêté est obligatoire.", requiredIf(props.fullValidation)),
    },
    dateFin: {
      minValue: helpers.withMessage("La date de fin de l'arrêté doit être supérieure à la date de début.", (val) => {
        if (props.arreteCadre.dateDebut && val) {
          return new Date(val) > new Date(props.arreteCadre.dateDebut);
        }
        return true;
      }),
    },
  };
});

const filterDepartements = () => {
  departementsFiltered.value = query.value
    ? refDataStore.departements.filter((d) => {
        return !props.arreteCadre.departements.map((ad) => ad.id).includes(d.id) && d.nom.toLowerCase().includes(query.value.toLowerCase());
      })
    : [];
};

const selectDepartement = (departement: Departement) => {
  if (typeof departement === 'string') {
    return;
  }
  query.value = '';
  props.arreteCadre.departements.push(departement);
  computeDepartementsTags();
};

const deleteDepartement = (departementId: number) => {
  props.arreteCadre.departements = props.arreteCadre.departements.filter((d) => d.id !== departementId);
  computeDepartementsTags();
};

const computeDepartementsTags = () => {
  departementsTags.value = props.arreteCadre.departements.map((d) => {
    return {
      label: d.nom,
      class: props.viewOnly ? '' : 'fr-tag--dismiss',
      tagName: 'button',
      onclick: () => {
        if (!props.viewOnly) deleteDepartement(d.id);
      },
    };
  });
};

computeDepartementsTags();

const v$ = useVuelidate(rules, props.arreteCadre);

watch(
  query,
  useUtils().debounce(async () => {
    filterDepartements();
  }, 300),
);
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Généralité</h6>
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'numero')">
          <DsfrInput
            id="numero"
            v-model="arreteCadre.numero"
            label="Numéro de l'arrêté"
            label-visible
            type="text"
            name="numero"
            :required="true"
            :disabled="viewOnly"
          />
        </DsfrInputGroup>

        <div class="fr-mt-2w">
          <DsfrInputGroup :error-message="utils.showInputError(v$, 'departements')">
            <MixinsAutoComplete
              label="Ajouter un/des départements"
              class="show-label"
              :labelVisible="true"
              buttonText="Ajouter"
              display-key="nom"
              v-model="query"
              :options="departementsFiltered"
              :required="true"
              :disabled="viewOnly"
              @update:modelValue="selectDepartement($event)"
              @search="selectDepartement($event)"
            />

            <DsfrTags class="fr-mt-2w" :tags="departementsTags" />
          </DsfrInputGroup>
        </div>
      </div>
      <div class="fr-col-12">
        <div class="fr-mt-2w fr-grid-row fr-grid-row--gutters">
          <div class="fr-col-6 fr-col-lg-3">
            <DsfrInputGroup :error-message="utils.showInputError(v$, 'dateDebut')">
              <DsfrInput
                id="dateDebut"
                v-model="arreteCadre.dateDebut"
                label="Date de début de l'arrêté"
                label-visible
                type="date"
                name="dateDebut"
                :required="true"
                :disabled="viewOnly"
              />
            </DsfrInputGroup>
          </div>
          <div class="fr-col-6 fr-col-lg-3">
            <DsfrInputGroup :error-message="utils.showInputError(v$, 'dateFin')">
              <DsfrInput
                id="dateFin"
                v-model="arreteCadre.dateFin"
                label="Date de fin de l'arrêté"
                label-visible
                type="date"
                name="dateFin"
                :disabled="viewOnly"
              />
            </DsfrInputGroup>
          </div>
          <div class="fr-col-12 fr-col-lg-6">
            <DsfrAlert
              type="info"
              title="Information"
              description="L’arrêté sera automatiquement publié / dépublié en fonction des dates  sélectionnées ici."
            />
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
