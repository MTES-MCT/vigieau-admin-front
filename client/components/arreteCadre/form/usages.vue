<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import { useRefDataStore } from '~/stores/refData';
import { Usage } from '~/dto/usage.dto';
import deburr from 'lodash.deburr';
import { useAlertStore } from '~/stores/alert';

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
const alertStore = useAlertStore();
const usageArreteCadreToEdit: Ref<Usage | null> = ref(null);

const createEditUsageFormRef = ref();
const modalOpened = ref(false);
const modalActions = ref([
  {
    label: 'Enregistrer',
    onclick: () => {
      createEditUsageFormRef.value?.submitForm();
    },
  },
  {
    label: 'Annuler',
    secondary: true,
    onclick: () => {
      utils.closeModal(modalOpened);
    },
  }
]);
const indexEdited: Ref<number | null> = ref(null);

const rules = computed(() => {
  return {
    usages: {
      required: helpers.withMessage('L\'arrêté doit être lié à au moins un usage', required),
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
      .map(s => s.replace(/^/, '(').replace(/$/, ')'))
      .join('*');
    const regex = new RegExp(`${queryWords}`, 'gi');
    return nom.match(regex);
  }) : refDataStore.usages;
  tmp = tmp.filter((u) => {
    return props.arreteCadre.usages.findIndex((uac) => uac.nom === u.nom) < 0;
  });
  // tmp.push({
  //   id: null,
  //   display: '<span class="select-option-usage"><b>Vous ne trouvez pas l’usage que vous cherchez ?</b> Créez un nouvel usage</span>',
  // });
  usagesFiltered.value = tmp;
};

const selectUsage = (usage: Usage | string, isUsageArreteCadre: boolean = false) => {
  if (typeof usage === 'string') {
    return;
  }
  query.value = '';
  if (!usage.id && !isUsageArreteCadre) {
    return;
  }
  componentKey.value += 1;
  if (!isUsageArreteCadre) {
    let usageArreteCadre = props.arreteCadre.usages.find((uac) => uac.nom === (<Usage>usage).nom);
    if (!usageArreteCadre) {
      usageArreteCadre = new Usage(<Usage>usage);
    }
    askCreateEditUsage(null, usageArreteCadre);
  } else {
    askCreateEditUsage(props.arreteCadre.usages.findIndex(u => u.nom === usage.nom));
  }
};

const deleteUsage = (usage: Usage) => {
  props.arreteCadre.usages = props.arreteCadre.usages.filter((uac) => uac.nom !== usage.nom);
  componentKey.value += 1;
};

const askCreateEditUsage = (index: number | null = null, usage?: Usage) => {
  const u = index !== null ? JSON.parse(JSON.stringify(props.arreteCadre.usages[index])) : new Usage(usage);
  usageToEdit.value = u;
  indexEdited.value = index;
  setTimeout(() => {
    modalOpened.value = true;    
  })
};

const createEditUsage = async (usage: Usage) => {
  if (indexEdited.value === null) {
    props.arreteCadre.usages.push(usage);
  } else {
    props.arreteCadre.usages[indexEdited.value] = usage;
  }
  componentKey.value += 1;
  indexEdited.value = null;
  utils.closeModal(modalOpened);
};

const addEditUsageArreteCadre = () => {
  const idx = props.arreteCadre.usages.findIndex((u: Usage) => u.nom === usageArreteCadreToEdit.value?.nom);
  if (idx > -1) {
    props.arreteCadre.usages[idx] = usageArreteCadreToEdit.value;
  } else {
    props.arreteCadre.usages.push(usageArreteCadreToEdit.value);
  }
  componentKey.value += 1;
  usageArreteCadreToEdit.value = null;
  alertStore.addAlert({
    description: 'Usage enregistré',
    type: 'success',
  });
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

watch(
  query,
  useUtils().debounce(async () => {
    filterUsages();
  }, 300),
  { immediate: true },
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
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <ArreteCadreUsageList
          ref="arreteCadreUsageListRef"
          :usages="arreteCadre.usages"
          @usage-selected="askCreateEditUsage($event)"
          @usage-removed="deleteUsage($event)"
          :key="componentKey"
        />
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <div class="usage-card">
          <h4>Il manque un usage dans votre liste ?</h4>
          <p>
            Retrouvez les usages utilisés dans un arrêté précédent&nbsp;:
          </p>
          <DsfrInputGroup :error-message="utils.showInputError(v$, 'usagesArreteCadre')">
            <MixinsAutoComplete
              class="show-label"
              data-cy="ArreteCadreFormUsagesAutocomplete"
              placeholder="Saisir le nom d'un usage"
              buttonText="Chercher"
              display-key="nom"
              v-model="query"
              :options="usagesFiltered"
              @update:modelValue="selectUsage($event)"
            />
          </DsfrInputGroup>
          <div class="fr-grid-row fr-grid-row--middle fr-mb-2w">
            <div style="flex: 1;" class="divider" />
            <span class="fr-mx-4w">ou</span>
            <div style="flex: 1;" class="divider" />
          </div>
          <div class="fr-grid-row fr-grid-row--middle fr-grid-row--space-between">
            <span>L'usage n'existe pas</span>
            <DsfrButton label="Créer un nouvel usage"
                        @click="askCreateEditUsage()"/>
          </div>          
        </div>
      </div>
    </div>
  </form>
  <DsfrModal
    :opened="modalOpened"
    title="Création / édition d'un usage"
    :actions="modalActions"
    @close="modalOpened = utils.closeModal(modalOpened);">
    <ArreteCadreFormCreateEditUsage ref="createEditUsageFormRef"
                                    @createEdit="createEditUsage($event)"
                                    :usage="usageToEdit"
                                    :other-usages="arreteCadre.usages"
    />
  </DsfrModal>
</template>

<style lang="scss">
.usage-form-wrapper {
  border: 1px solid var(--grey-925-125);
}

.select-option-usage {
  color: var(--blue-france-sun-113-625);
}

.list-item:hover {
  .select-option-usage {
    color: white;
  }
}

.usage-card {
  border: 1px solid var(--border-active-blue-france);
  padding: 1rem;
}
</style>
