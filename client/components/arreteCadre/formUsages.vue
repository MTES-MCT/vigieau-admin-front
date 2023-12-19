<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators/dist";
import useVuelidate from "@vuelidate/core";
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";
import type { Ref } from "vue";
import { useRefDataStore } from "~/stores/refData";
import { Usage } from "~/dto/usage.dto";
import { UsageArreteCadre } from "~/dto/usage_arrete_cadre.dto";

const props = defineProps<{
  arreteCadre: ArreteCadre,
  fullValidation: boolean
}>();
const modalUsageOpened: Ref<boolean> = ref(false);
const modalTitle: Ref<string> = ref("Création d'un nouvel usage");
const usageToEdit: Ref<Usage | undefined> = ref(new Usage());
const usageFormRef = ref(null);
const loading: Ref<boolean> = ref(false);

const query: Ref<string> = ref("");
const usagesFiltered: Ref<Usage[]> = ref([]);
const refDataStore = useRefDataStore();
const api = useApi();
const usageArreteCadreToEdit: Ref<UsageArreteCadre | null> = ref(null);

const rules = computed(() => {
  return {
    numero: {
      required: helpers.withMessage("Le numéro de l'arrêté est obligatoire.", required)
    }
  };
});

const v$ = useVuelidate(rules, props.arreteCadre);

const filterUsages = () => {
  const tmp = query.value ? refDataStore.usages.filter(u => {
    return u.nom.toLowerCase().includes(query.value.toLowerCase());
  }) : [];
  tmp.map(u => {
    u.isAlreadyUsed = props.arreteCadre.usagesArreteCadre.findIndex(uac => uac.usage.id === u.id) > -1;
    u.display = u.isAlreadyUsed ? "<b>" + u.nom + "</b>" : u.nom;
  });
  usagesFiltered.value = tmp;
};

const selectUsage = (usage: Usage | UsageArreteCadre | string, isUsageArreteCadre: boolean = false) => {
  if (typeof usage === "string") {
    return;
  }
  query.value = "";
  if (!isUsageArreteCadre) {
    let usageArreteCadre = props.arreteCadre.usagesArreteCadre.find(uac => uac.usage.id === (<Usage>usage).id);
    if (!usageArreteCadre) {
      usageArreteCadre = new UsageArreteCadre(<Usage>usage);
    }
    usageArreteCadreToEdit.value = usageArreteCadre;
  } else {
    usageArreteCadreToEdit.value = <UsageArreteCadre>usage;
  }
};

const closeModal = () => {
  modalUsageOpened.value = false;
};

const validateUsageForm = () => {
  usageFormRef.value?.submitForm();
};

const modalActions: Ref<any[]> = ref([
  {
    label: "Enregistrer",
    onclick: validateUsageForm
  },
  {
    label: "Annuler",
    secondary: true,
    onclick: closeModal
  }
]);

const createEditUsage = async (usage: Usage) => {
  loading.value = true;
  console.log(usage);
  const { data, error } = await api.usage.create(usage);
  loading.value = false;
  closeModal();
  if (data.value) {
    refDataStore.setUsages([...refDataStore.usages, data.value]);
    selectUsage(data.value);
  }
};

const addEditUsageArreteCadre = () => {
  // TMP
  console.log(usageArreteCadreToEdit.value);
};

const usageArreteCadreFormButtons: Ref<any[]> = ref([
  {
    label: "Annuler",
    secondary: true,
    onclick: () => {
      usageArreteCadreToEdit.value = null;
    }
  },
  {
    label: "Enregistrer",
    onclick: addEditUsageArreteCadre
  },
]);

watch(query, useUtils().debounce(async () => {
  filterUsages();
}, 300));
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>
          Ajouter un usage
          <DsfrButton label="Ajouter"
                      @click="modalUsageOpened=true" />
        </h6>
        <MixinsAutoComplete
          class="show-label"
          buttonText="Ajouter"
          display-key="display"
          v-model="query"
          :options="usagesFiltered"
          :required="true"
          @update:modelValue="selectUsage($event)"
          @search="selectUsage($event)"
        />
        <div v-if="usageArreteCadreToEdit"
             class="usage-form-wrapper fr-p-2w fr-mt-2w">
          <UsageArreteCadreForm
            :usageArreteCadre="usageArreteCadreToEdit" />
          <DsfrButtonGroup :buttons="usageArreteCadreFormButtons"
                           class="fr-mt-2w"
                           align="right"
                           inlineLayoutWhen="always"
          />
        </div>
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <div class="arrete-cadre-usage-list fr-p-2w fr-mt-7w">
          <ArreteCadreUsageList :usagesArreteCadre="arreteCadre.usagesArreteCadre"
                                @usage-selected="selectUsage($event, true)" />
        </div>
      </div>
    </div>
  </form>
  <DsfrModal
    :opened="modalUsageOpened"
    :title="modalTitle"
    :actions="modalActions"
    @close="closeModal"
  >
    <UsageForm
      ref="usageFormRef"
      :loading="loading"
      :usage="usageToEdit"
      @createEdit="createEditUsage($event)" />
  </DsfrModal>
</template>

<style lang="scss" scoped>
.usage-form-wrapper {
  border: 1px solid var(--grey-925-125);
}

.arrete-cadre-usage-list {
  background: var(--grey-975-75);
}
</style>