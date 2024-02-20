<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import { useRefDataStore } from '~/stores/refData';
import { Usage } from '~/dto/usage.dto';
import { UsageArreteCadre } from '~/dto/usage_arrete_cadre.dto';
import deburr from 'lodash.deburr';

const props = defineProps<{
  arreteCadre: ArreteCadre;
  usageSelected?: Usage | null;
}>();
const emit = defineEmits(['resetUsageSelected']);
const usageToEdit: Ref<Usage | undefined> = ref(new Usage());
const usageFormRef = ref(null);
const usageArreteCadreFormRef = ref(null);
const loading: Ref<boolean> = ref(false);
const componentKey = ref(0);

const query: Ref<string> = ref('');
const usagesFiltered: Ref<Usage[]> = ref([]);
const refDataStore = useRefDataStore();
const utils = useUtils();
const api = useApi();
const usageArreteCadreToEdit: Ref<UsageArreteCadre | null> = ref(null);
const tabs = ref();

const rules = computed(() => {
  return {
    usagesArreteCadre: {
      required: helpers.withMessage("L'arrêté doit être lié à au moins un usage", required),
    },
  };
});

const v$ = useVuelidate(rules, props.arreteCadre);

const filterUsages = () => {
  let tmp: any[] = [];
  tmp = query.value ? refDataStore.usages.filter((u) => {
    const nom = deburr(u.nom)
      .replace(/[\-\_]/g, '');
    const queryWords = deburr(query.value)
      .replace(/[\-\_]/g, '')
      .split(' ')
      .map(s => s.replace(/^/,"(").replace(/$/,")"))
      .join('*');
    const regex = new RegExp(`${queryWords}`, 'gi');
    return nom.match(regex);
  }) : refDataStore.usages;
  tmp = tmp.filter((u) => {
    return props.arreteCadre.usagesArreteCadre.findIndex((uac) => uac.usage.id === u.id) < 0
  });
  // tmp.push({
  //   id: null,
  //   display: '<span class="select-option-usage"><b>Vous ne trouvez pas l’usage que vous cherchez ?</b> Créez un nouvel usage</span>',
  // });
  usagesFiltered.value = tmp;
};

const selectUsage = (usage: Usage | UsageArreteCadre | string, isUsageArreteCadre: boolean = false) => {
  if (typeof usage === 'string') {
    return;
  }
  query.value = '';
  if (!usage.id && !isUsageArreteCadre) {
    tabs.value.selectIndex(1);
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

const validateUsageForm = () => {
  usageFormRef.value?.submitForm();
};

const hideNewUsage = () => {
  tabs.value.selectIndex(0);
  usageToEdit.value = new Usage();
};

const usageFormButtons: Ref<any[]> = ref([
  {
    label: 'Annuler',
    secondary: true,
    onclick: hideNewUsage,
  },
  {
    label: 'Enregistrer le nouvel usage',
    'data-cy': 'UsageFormSaveBtn',
    onclick: validateUsageForm,
  },
]);

const createEditUsage = async (usage: Usage) => {
  loading.value = true;
  const { data, error } = await api.usage.create(usage);
  loading.value = false;
  hideNewUsage();
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
      usageToEdit.value = new Usage();
    },
  },
  {
    label: 'Enregistrer',
    'data-cy': 'ArreteCadreFormUsagesSaveBtn',
    onclick: () => {
      usageArreteCadreFormRef.value?.submitForm();
    },
  },
]);

const tabTitles = [{ title: 'Recherche' }, { title: 'Créer un nouvel usage' }];
const selectedTabIndex: Ref<number> = ref(0);
const asc = ref(true);
const selectTab = (idx: number) => {
  // this.onSelectTab(idx)
  asc.value = selectedTabIndex.value < idx;
  selectedTabIndex.value = idx;
};

watch(
  query,
  useUtils().debounce(async () => {
    filterUsages();
  }, 300),
  { immediate: true }
);

watch(
  () => props.usageSelected,
  () => {
    if (props.usageSelected) {
      selectUsage(props.usageSelected, true);
    }
    emit('resetUsageSelected');
  },
  { immediate: true },
);

const arreteCadreUsageListRef = ref(null);

defineExpose({
  v$,
  selectUsage,
  arreteCadreUsageListRef,
});
</script>

<template>
  <form @submit.prevent="">
    <div class="usage-wrapper fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <DsfrTabs ref="tabs" :tab-titles="tabTitles" :initial-selected-index="selectedTabIndex" @select-tab="selectTab($event)">
          <DsfrTabContent panel-id="tab-content-0" tab-id="tab-0" :asc="asc" :selected="selectedTabIndex === 0">
            <p>
              Retrouvez les usages utilisés dans un arrêté  cadre précédent&nbsp;:
            </p>
            <DsfrInputGroup :error-message="utils.showInputError(v$, 'usagesArreteCadre')">
              <MixinsAutoComplete
                class="show-label"
                data-cy="ArreteCadreFormUsagesAutocomplete"
                placeholder="Taper le nom d'un usage"
                buttonText="Rechercher"
                display-key="nom"
                v-model="query"
                :options="usagesFiltered"
                :required="true"
                @update:modelValue="selectUsage($event)"
                @search="selectUsage($event)"
              />
            </DsfrInputGroup>
            <div v-if="usageArreteCadreToEdit" class="usage-form-wrapper fr-p-2w fr-mt-2w">
              <UsageArreteCadreForm
                :usageArreteCadre="usageArreteCadreToEdit"
                :loading="loading"
                @createEdit="addEditUsageArreteCadre()"
                ref="usageArreteCadreFormRef"
              />
              <DsfrButtonGroup :buttons="usageArreteCadreFormButtons" class="fr-mt-2w" align="right" inlineLayoutWhen="always" />
            </div>
          </DsfrTabContent>
          <DsfrTabContent panel-id="tab-content-1" tab-id="tab-1" :asc="asc" :selected="selectedTabIndex === 1">
            <UsageForm ref="usageFormRef" :loading="loading" :usage="usageToEdit" @createEdit="createEditUsage($event)" />
            <DsfrButtonGroup :buttons="usageFormButtons" class="fr-mt-2w" align="right" inlineLayoutWhen="always" />
          </DsfrTabContent>
        </DsfrTabs>
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <div class="arrete-cadre-usage-list fr-p-2w">
          <ArreteCadreUsageList
            ref="arreteCadreUsageListRef"
            :usagesArreteCadre="arreteCadre.usagesArreteCadre"
            @usage-selected="selectUsage($event, true)"
            @usage-removed="deleteUsage($event)"
            :key="componentKey"
          />
        </div>
      </div>
    </div>
  </form>
</template>

<style lang="scss">
.usage-wrapper {
  .fr-tabs {
    overflow: visible;

    &:before {
      height: calc(100% - 40px);
    }
  }
}

.usage-form-wrapper {
  border: 1px solid var(--grey-925-125);
}

.arrete-cadre-usage-list {
  background: var(--grey-975-75);
}

.select-option-usage {
  color: var(--blue-france-sun-113-625);
}

.list-item:hover {
  .select-option-usage {
    color: white;
  }
}
</style>
