<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import { useRefDataStore } from '~/stores/refData';
import { Usage } from '~/dto/usage.dto';
import { UsageArreteCadre } from '~/dto/usage_arrete_cadre.dto';
import { requiredIf } from '@vuelidate/validators';

const props = defineProps<{
  arreteCadre: ArreteCadre;
  fullValidation: boolean;
  viewOnly: boolean;
  usageSelected?: Usage;
}>();
const modalUsageOpened: Ref<boolean> = ref(false);
const modalTitle: Ref<string> = ref("Création d'un nouvel usage");
const usageToEdit: Ref<Usage | undefined> = ref(new Usage());
const usageFormRef = ref(null);
const loading: Ref<boolean> = ref(false);
const componentKey = ref(0);

const query: Ref<string> = ref('');
const usagesFiltered: Ref<Usage[]> = ref([]);
const refDataStore = useRefDataStore();
const utils = useUtils();
const api = useApi();
const usageArreteCadreToEdit: Ref<UsageArreteCadre | null> = ref(null);

const rules = computed(() => {
  return {
    usagesArreteCadre: {
      requiredIf: helpers.withMessage("L'arrêté doit être lié à au moins un usage", requiredIf(props.fullValidation)),
    },
  };
});

const v$ = useVuelidate(rules, props.arreteCadre);

const filterUsages = () => {
  let tmp: any[] = [];
  if (query.value) {
    tmp = refDataStore.usages.filter((u) => {
      return u.nom.toLowerCase().includes(query.value.toLowerCase());
    });
    tmp.map((u) => {
      u.isAlreadyUsed = props.arreteCadre.usagesArreteCadre.findIndex((uac) => uac.usage.id === u.id) > -1;
      u.display = u.isAlreadyUsed ? '<b>' + u.nom + '</b>' : u.nom;
    });
    tmp.push({
      id: null,
      display: 'Vous ne trouvez pas l’usage que vous cherchez ? Créez un nouvel usage',
    });
  }
  usagesFiltered.value = tmp;
};

const selectUsage = (usage: Usage | UsageArreteCadre | string, isUsageArreteCadre: boolean = false) => {
  if (typeof usage === 'string') {
    return;
  }
  query.value = '';
  if (!usage.id && !isUsageArreteCadre) {
    modalUsageOpened.value = true;
    return;
  }
  if (!isUsageArreteCadre) {
    let usageArreteCadre = props.arreteCadre.usagesArreteCadre.find((uac) => uac.usage.id === (<Usage>usage).id);
    if (!usageArreteCadre) {
      usageArreteCadre = new UsageArreteCadre(<Usage>usage);
    }
    usageArreteCadreToEdit.value = usageArreteCadre;
  } else {
    usageArreteCadreToEdit.value = <UsageArreteCadre>usage;
  }
};

const deleteUsage = (usage: UsageArreteCadre) => {
  props.arreteCadre.usagesArreteCadre = props.arreteCadre.usagesArreteCadre.filter((uac) => uac.usage.id !== usage.usage.id);
  componentKey.value += 1;
};

const closeModal = () => {
  modalUsageOpened.value = false;
};

const validateUsageForm = () => {
  usageFormRef.value?.submitForm();
};

const modalActions: Ref<any[]> = ref([
  {
    label: 'Enregistrer le nouvel usage',
    onclick: validateUsageForm,
  },
  {
    label: 'Annuler',
    secondary: true,
    onclick: closeModal,
  },
]);

const createEditUsage = async (usage: Usage) => {
  loading.value = true;
  const { data, error } = await api.usage.create(usage);
  loading.value = false;
  closeModal();
  if (data.value) {
    refDataStore.setUsages([...refDataStore.usages, data.value]);
    selectUsage(data.value);
  }
};

const addEditUsageArreteCadre = () => {
  const idx = props.arreteCadre.usagesArreteCadre.findIndex((u: UsageArreteCadre) => u.usage.id === usageArreteCadreToEdit.value?.usage.id);
  if (idx > -1) {
    props.arreteCadre.usagesArreteCadre[idx] = usageArreteCadreToEdit.value;
  } else {
    props.arreteCadre.usagesArreteCadre.push(usageArreteCadreToEdit.value);
  }
  componentKey.value += 1;
  usageArreteCadreToEdit.value = null;
};

const usageArreteCadreFormButtons: Ref<any[]> = ref([
  {
    label: 'Annuler',
    secondary: true,
    onclick: () => {
      usageArreteCadreToEdit.value = null;
    },
  },
  {
    label: 'Enregistrer',
    onclick: addEditUsageArreteCadre,
  },
]);

watch(
  query,
  useUtils().debounce(async () => {
    filterUsages();
  }, 300),
);

watch(
  () => props.usageSelected,
  () => {
    if(props.usageSelected) {
      selectUsage(props.usageSelected, true);      
    }
  },
);
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Ajouter un usage</h6>
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'usagesArreteCadre')">
          <MixinsAutoComplete
            class="show-label"
            buttonText="Ajouter"
            display-key="display"
            v-model="query"
            :options="usagesFiltered"
            :required="true"
            @update:modelValue="selectUsage($event)"
            @search="selectUsage($event)"
            :disabled="viewOnly"
          />
        </DsfrInputGroup>
        <div v-if="usageArreteCadreToEdit" class="usage-form-wrapper fr-p-2w fr-mt-2w">
          <UsageArreteCadreForm :usageArreteCadre="usageArreteCadreToEdit" />
          <DsfrButtonGroup :buttons="usageArreteCadreFormButtons" class="fr-mt-2w" align="right" inlineLayoutWhen="always" />
        </div>
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <div class="arrete-cadre-usage-list fr-p-2w fr-mt-7w">
          <ArreteCadreUsageList
            :usagesArreteCadre="arreteCadre.usagesArreteCadre"
            @usage-selected="selectUsage($event, true)"
            @usage-removed="deleteUsage($event)"
            :view-only="viewOnly"
            :key="componentKey"
          />
        </div>
      </div>
    </div>
  </form>
  <DsfrModal :opened="modalUsageOpened" :title="modalTitle" :actions="modalActions" @close="closeModal">
    <UsageForm ref="usageFormRef" :loading="loading" :usage="usageToEdit" @createEdit="createEditUsage($event)" />
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
