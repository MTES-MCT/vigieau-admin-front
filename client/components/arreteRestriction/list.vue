<script setup lang="ts">
import type { Ref } from 'vue';
import type { PaginatedResult } from '~/dto/paginated_result.dto';
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";

const route = useRoute();
const arretesRestrictionPaginated: Ref<PaginatedResult<ArreteRestriction> | null> = ref(null);
const currentPage: Ref<number> = ref(0);
const query: Ref<string> = ref(route.query.query ? route.query.query : '');
const loading = ref(false);
const statusFilter = ref('publie');
const statusOptions = ref([
  {
    label: 'En vigueur',
    value: 'publie',
  },
  {
    label: 'Abrogé',
    value: 'abroge',
  },
]);

const api = useApi();

const paginate = async () => {
  const filter = [{
    attribute: 'statut',
    filter: `$in:${statusFilter.value === 'publie' ? 'publie,a_valider' : 'abroge'}`,
  }];
  loading.value = true;
  const { data, error } = await api.arreteRestriction.paginate(currentPage.value + 1, query.value, filter);
  loading.value = false;
  if (data.value) {
    data.value.meta.dsfrPages = Array.from({ length: data.value.meta.totalPages }, (value, index) => {
      return {
        title: `Page ${index + 1}`,
        label: `${index + 1}`,
      };
    });
    arretesRestrictionPaginated.value = data.value;
  }
};

paginate();

watch(
  query,
  useUtils().debounce(async () => {
    paginate();
  }, 500),
);

watch(statusFilter, () => {
  paginate();
});
</script>

<template>
  <div class="arrete-restriction-header fr-grid-row fr-grid-row--middle fr-mb-2w">
    <h1 class="fr-my-0">
      Les arrêtés de restriction

      <VIcon v-if="loading" name="ri-loader-4-line" animation="spin" :width="40" :height="40" />
    </h1>
    <NuxtLink to="/arrete-restriction/nouveau">
      <DsfrButton label="Créer un nouvel arrêté" disabled />
    </NuxtLink>
    <div class="fr-col-12 fr-col-md-8">
      <DsfrSegmentedSet v-model="statusFilter" :inline="true" :options="statusOptions" />
    </div>
    <div class="fr-col-12 fr-col-md-4 fr-mb-2w">
      <DsfrSearchBar :labelVisible="false" v-model="query" />
    </div>
  </div>
  <template v-if="arretesRestrictionPaginated">
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-1w">
      <div class="fr-col-12 text-align-center" v-if="arretesRestrictionPaginated.data.length < 1">
        Aucun arrêté de restriction n'a été trouvé.
      </div>
      <div v-for="arreteRestriction in arretesRestrictionPaginated.data" class="fr-col-md-4 fr-col-12">
        <ArreteRestrictionCard :arrete-restriction="arreteRestriction" :key="arreteRestriction.id" @delete="paginate()" />
      </div>
    </div>
    <div class="fr-grid-row fr-grid-row--center fr-mt-2w">
      <DsfrPagination
        v-model:current-page="currentPage"
        :pages="arretesRestrictionPaginated.meta.dsfrPages"
        @update:current-page="paginate()"
      />
    </div>
  </template>
</template>

<style lang="scss" scoped>
.arrete-restriction-header {
  justify-content: space-between;
}
</style>
