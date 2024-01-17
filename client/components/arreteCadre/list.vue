<script setup lang="ts">
import type { Ref } from 'vue';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { PaginatedResult } from '~/dto/paginated_result.dto';

const arretesCadrePaginated: Ref<PaginatedResult<ArreteCadre> | null> = ref(null);
const currentPage: Ref<number> = ref(0);
const query: Ref<string> = ref('');
const loading = ref(false);
const statusFilter = ref('publie');
const statusOptions = ref([
  {
    label: 'En vigueur',
    value: 'publie',
    'data-cy': 'ArreteCadreListFilterPublie',
  },
  {
    label: 'Abrogé',
    value: 'abroge',
    'data-cy': 'ArreteCadreListFilterAbroge',
  },
]);

const api = useApi();

const paginate = async () => {
  const filter = {
    attribute: 'statut',
    filter: `$in:${statusFilter.value === 'publie' ? 'publie,a_valider,a_venir' : 'abroge'}`,
  };
  loading.value = true;
  const { data, error } = await api.arreteCadre.paginate(currentPage.value + 1, query.value, filter);
  loading.value = false;
  if (data.value) {
    data.value.meta.dsfrPages = Array.from({ length: data.value.meta.totalPages }, (value, index) => {
      return {
        title: `Page ${index + 1}`,
        label: `${index + 1}`,
      };
    });
    arretesCadrePaginated.value = data.value;
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
  <div class="arrete-cadre-header fr-grid-row fr-grid-row--middle fr-mb-2w"
       data-cy="ArreteCadreListHeader">
    <MixinsAlerts class="fr-mb-2w" />
    <h1 class="fr-my-0">
      Les arrêtés cadre

      <VIcon v-if="loading" name="ri-loader-4-line" animation="spin" :width="40" :height="40" />
    </h1>
    <NuxtLink to="/arrete-cadre/nouveau/edition">
      <DsfrButton label="Créer un nouvel arrêté" data-cy="ArreteCadreListAddBtn" />
    </NuxtLink>
    <div class="fr-col-12 fr-grid-row fr-mt-2w">
      <div class="fr-col-12 fr-col-md-8">
        <DsfrSegmentedSet v-model="statusFilter"
                          :inline="true"
                          :options="statusOptions" />
      </div>
      <div class="fr-col-12 fr-col-md-4 fr-mb-2w">
        <DsfrSearchBar :labelVisible="false" v-model="query" data-cy="ArreteCadreListSearchBar"/>
      </div>      
    </div>
  </div>
  <template v-if="arretesCadrePaginated">
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-1w"
         data-cy="ArreteCadreList">
      <div class="fr-col-12 text-align-center" v-if="arretesCadrePaginated.data.length < 1">
        Aucun arrêté cadre n'a été trouvé.
      </div>
      <div v-for="arreteCadre in arretesCadrePaginated.data" class="fr-col-md-4 fr-col-12">
        <ArreteCadreCard :arrete-cadre="arreteCadre" :key="arreteCadre.id" @delete="paginate()" @repeal="paginate()" />
      </div>
    </div>
    <div class="fr-grid-row fr-grid-row--center fr-mt-2w">
      <DsfrPagination v-model:current-page="currentPage" :pages="arretesCadrePaginated.meta.dsfrPages" @update:current-page="paginate()" />
    </div>
  </template>
</template>

<style lang="scss" scoped>
.arrete-cadre-header {
  justify-content: space-between;
}
</style>
