<script setup lang="ts">
import { ArreteCadre } from "~/dto/arrete_cadre.dto";
import { helpers, required } from "@vuelidate/validators/dist";
import useVuelidate from "@vuelidate/core";
import type { Ref } from "vue";
import type { Departement } from "~/dto/departement.dto";
import { useAuthStore } from "~/stores/auth";
import { useRefDataStore } from "~/stores/refData";
import deburr from "lodash.deburr"; 

const props = defineProps<{
  arreteCadre: ArreteCadre;
}>();

const query: Ref<string> = ref("");
const departementsTags = ref([]);
const departementsFiltered = ref([]);
const utils = useUtils();
const authStore = useAuthStore();
const refDataStore = useRefDataStore();
const isAci: Ref<boolean> = ref(props.arreteCadre.departements.length > 1);

const assignDepartement = (force = false) => {
  if (!props.arreteCadre.id || force) {
    if (props.arreteCadre.departements.length < 1) {
      props.arreteCadre.departements =
        authStore.user.role === "departement" ? refDataStore.departements.filter((d) => d.code === authStore.user.roleDepartement) : [];
    } else if (props.arreteCadre.departements.length > 1 && !isAci.value) {
      props.arreteCadre.departements = [props.arreteCadre.departements[0]];
    }
    computeDepartementsTags();
  }
};

const rules = computed(() => {
  return {
    numero: {
      required: helpers.withMessage("Le numéro de l'arrêté est obligatoire", required)
    },
    departements: {
      required: helpers.withMessage("L'arrêté doit être lié à au moins un département", required)
    }
  };
});

const filterDepartements = () => {
  departementsFiltered.value = query.value
    ? refDataStore.departements.filter((d) => {
      return !props.arreteCadre.departements.map((ad) => ad.id).includes(d.id) 
        && (deburr(d.nom).replace(/[\s\-\_]/g, '').toLowerCase().includes(deburr(query.value).replace(/[\s\-\_]/g, '').toLowerCase()) || d.code.toLowerCase().includes(query.value.toLowerCase()));
    })
    : [];
};

const departementsOptions = refDataStore.departements.map((d) => {
  return {
    value: d.id,
    text: d.nom
  };
});

const selectDepartement = (departement: Departement) => {
  if (typeof departement === "string") {
    return;
  }
  query.value = "";
  props.arreteCadre.departements = [...props.arreteCadre.departements, departement];
  computeDepartementsTags();
};

const deleteDepartement = (departementId: number) => {
  props.arreteCadre.departements = props.arreteCadre.departements.filter((d) => d.id !== departementId);
  computeDepartementsTags();
};

const computeDepartementsTags = () => {
  departementsTags.value = props.arreteCadre.departements
    .filter((d, index) => {
      return index !== 0;
    })
    .map((d) => {
      return {
        label: d.nom,
        class: (authStore.user.role !== "mte" && d.code === authStore.user.roleDepartement) ? "" :
          "fr-tag--dismiss",
        tagName: "button",
        onclick: () => {
          if (authStore.user.role !== "mte" && d.code === authStore.user.roleDepartement) {
            return;
          }
          deleteDepartement(d.id);
        }
      };
    });
};

const departementPiloteChange = (depPiloteId: string) => {
  const departementPilote = refDataStore.departements.find((d) => d.id === Number(depPiloteId));
  // Si l'AC a un seul département ou moins, on le remplace
  if (props.arreteCadre.departements.length < 1) {
    props.arreteCadre.departements = [departementPilote];
  } else {
    // Sinon on remplace le département pilote s'il existe
    const deps = props.arreteCadre.departements.filter((d, index) => index !== 0 && d.id !== Number(depPiloteId));
    props.arreteCadre.departements = [...[departementPilote], ...deps];
  }
  computeDepartementsTags();
};

computeDepartementsTags();

const v$ = useVuelidate(rules, props.arreteCadre);

const aciOptions = [
  {
    label: "Interdépartemental",
    value: true
  },
  {
    label: "Départemental",
    value: false
  }
];

watch(
  query,
  useUtils().debounce(async () => {
    filterDepartements();
  }, 300)
);

watch(isAci, () => {
  assignDepartement(true);
});

watch(
  () => refDataStore.departements,
  () => {
    if (refDataStore.departements && refDataStore.departements.length > 0) {
      assignDepartement();
    }
  },
  { immediate: true }
);

defineExpose({
  v$
});
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
            data-cy="ArreteCadreFormNumeroInput"
            label="Numéro de l'arrêté"
            label-visible
            type="text"
            name="numero"
            :required="true"
          />
        </DsfrInputGroup>

        <DsfrRadioButtonSet legend="Cet arrêté est :" :options="aciOptions" v-model="isAci" name="isAci" :small="false" />
        <DsfrHighlight v-if="authStore.user.role !== 'mte' && arreteCadre.departements[0]" :text="arreteCadre.departements[0].nom" />
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'departements')">
          <DsfrSelect
            v-if="authStore.user.role === 'mte'"
            :model-value="arreteCadre.departements[0]?.id"
            :label="isAci ? 'Département pilote' : 'Département'"
            :options="departementsOptions"
            @update:modelValue="departementPiloteChange($event)"
          />
        </DsfrInputGroup>
        <DsfrAlert
          v-if="isAci"
          type="info"
          title="Arrêté Interdépartemental"
          description="En choisissant de créer un arrêté cadre interdépartemental, cela induit que votre département est le pilote de cet arrêté. Vous avez la responsabilité de remplir les usages et mesures qui serviront à tous les départements. Les autres départements devront uniquement sélectionner leurs zones d’alerte concernées par cet arrêté cadre."
          class="fr-mb-2w"
        />

        <div class="fr-mt-2w" v-if="isAci">
          <DsfrInputGroup :error-message="utils.showInputError(v$, 'departements')">
            <MixinsAutoComplete
              label="Ajouter un/des départements"
              data-cy="ArreteCadreFormDepartementsAutocomplete"
              class="show-label"
              :labelVisible="true"
              buttonText="Ajouter"
              display-key="nom"
              v-model="query"
              :options="departementsFiltered"
              :required="true"
              placeholder="Rechercher un département"
              @update:modelValue="selectDepartement($event)"
              @search="selectDepartement($event)"
            />

            <DsfrTags class="fr-mt-2w" :tags="departementsTags" />
          </DsfrInputGroup>
        </div>
        <DsfrAlert
          v-if="departementsTags.length > 0"
          type="info"
          title="Email d'information"
          description="Afin de favoriser une bonne communication, un email sera envoyé aux autres départements afin qu’ils remplissent leurs zones d’alerte dans les meilleurs délais. Vous serez informé par email lorsque cela est fait."
          class="fr-mb-2w"
        />

        <ArreteCadreFormPublier v-if="arreteCadre.statut !== 'a_valider'" :arrete-cadre="arreteCadre" />
      </div>
    </div>
  </form>
</template>
