<script setup lang="ts">
import { ArreteCadre } from "~/dto/arrete_cadre.dto";
import { helpers, required } from "@vuelidate/validators/dist";
import useVuelidate from "@vuelidate/core";
import type { Ref } from "vue";
import type { Departement } from "~/dto/departement.dto";
import { useAuthStore } from "~/stores/auth";

const props = defineProps<{
  arreteCadre: ArreteCadre,
}>();

const query: Ref<string> = ref("");
const departementsTags = ref([]);
const departements = ref([]);
const departementsFiltered = ref([]);
const api = useApi();
const utils = useUtils();
const authStore = useAuthStore();

const { data, error } = api.departement.list();
if (data.value) {
  departements.value = data.value;
  if(!props.arreteCadre.departements && authStore.user.role === 'departement') {
    props.arreteCadre.departements = departements.value.filter(d => d.code === authStore.user.roleDepartement);
  }
}

const rules = computed(() => {
  return {
    numero: {
      required: helpers.withMessage("Le numéro de l'arrêté est obligatoire.", required)
    },
    departements: {
      required: helpers.withMessage("L'arrêté doit être lié à au moins un département", required)
    },
    dateDebut: {
      required: helpers.withMessage("La date de début de l'arrêté est obligatoire.", required)
    },
    dateFin: {
      minValue: helpers.withMessage("La date de fin de l'arrêté doit être supérieure à la date de début.", (val) => {
        if(props.arreteCadre.dateDebut) {
          return new Date(val) > new Date(props.arreteCadre.dateDebut);          
        }
        return true
      }),
    }
  };
});

const filterDepartements = () => {
  departementsFiltered.value = query.value ? departements.value.filter(d => {
    return !props.arreteCadre.departements.map(ad => ad.id).includes(d.id)
      && d.nom.toLowerCase().includes(query.value.toLowerCase());
  }) : [];
};

const selectDepartement = (departement: Departement) => {
  if (typeof departement === "string") {
    return;
  }
  query.value = "";
  props.arreteCadre.departements.push(departement);
  computeDepartementsTags();
};

const deleteDepartement = (departementId: number) => {
  props.arreteCadre.departements = props.arreteCadre.departements.filter(d => d.id !== departementId);
  computeDepartementsTags();
}

const computeDepartementsTags = () => {
  departementsTags.value = props.arreteCadre.departements.map(d => {
    return {
      label: d.nom,
      class: "fr-tag--dismiss",
      tagName: "button",
      onclick: () => deleteDepartement(d.id)
    };
  });
};

computeDepartementsTags();

const v$ = useVuelidate(rules, props.arreteCadre);

watch(query, useUtils().debounce(async () => {
  filterDepartements();
}, 300));
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-6">

        <h6>Généralité</h6>
        <DsfrInputGroup
          :error-message="utils.showInputError(v$, 'numero')"
        >
          <DsfrInput
            id="numero"
            v-model="arreteCadre.numero"
            label="Numéro de l'arrêté"
            label-visible
            type="text"
            name="numero"
            :required="true"
          />
        </DsfrInputGroup>

        <div class="fr-mt-2w">
          <DsfrInputGroup
            :error-message="utils.showInputError(v$, 'departements')"
          >
            <MixinsAutoComplete
              label="Ajouter un/des départements"
              class="show-label"
              :labelVisible="true"
              buttonText="Ajouter"
              display-key="nom"
              v-model="query"
              :options="departementsFiltered"
              :required="true"
              @update:modelValue="selectDepartement($event)"
              @search="selectDepartement($event)"
            />

            <DsfrTags class="fr-mt-2w"
                      :tags="departementsTags" />
          </DsfrInputGroup>
        </div>

        <div class="fr-mt-2w fr-grid-row fr-grid-row--gutters">
          <div class="fr-col-12 fr-col-lg-6">
            <DsfrInputGroup
              :error-message="utils.showInputError(v$, 'dateDebut')"
            >
              <DsfrInput
                id="dateDebut"
                v-model="arreteCadre.dateDebut"
                label="Date de début de l'arrêté"
                label-visible
                type="date"
                name="dateDebut"
                :required="true"
              />
            </DsfrInputGroup>
          </div>
          <div class="fr-col-12 fr-col-lg-6">
            <DsfrInputGroup
              :error-message="utils.showInputError(v$, 'dateFin')"
            >
              <DsfrInput
                id="dateFin"
                v-model="arreteCadre.dateFin"
                label="Date de fin de l'arrêté"
                label-visible
                type="date"
                name="dateFin"
              />
            </DsfrInputGroup>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>