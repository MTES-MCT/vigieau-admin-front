<script setup lang="ts">
import type { Ref } from 'vue'
import type { ArreteCadre } from '~/dto/arrete_cadre.dto'
import type { PaginatedResult } from '~/dto/paginated_result.dto'

const arretesCadrePaginated: Ref<PaginatedResult<ArreteCadre> | null> = ref(null)
const currentPage: Ref<number> = ref(0)
const query: Ref<string> = ref('')

const api = useApi()

const paginate = async () => {
  const { data, error } = await api.arreteCadre.paginate(currentPage.value + 1)
  if (data.value) {
    data.value.meta.dsfrPages = Array.from(
      { length: data.value.meta.totalPages },
      (value, index) => {
        return {
          title: `Page ${index + 1}`,
          label: `${index + 1}`,
        }
      },
    )
    arretesCadrePaginated.value = data.value
  }
}

paginate()
</script>

<template>
  <div class="arrete-cadre-header fr-grid-row fr-grid-row--middle fr-mb-2w">
    <div class="fr-col-12 fr-mb-2w">
      <DsfrSearchBar
        :labelVisible="false"
        v-model="query"
      />
    </div>
    <h1 class="fr-my-0">Les arrêtés cadre</h1>
    <NuxtLink to="/arrete-cadre/nouveau">
      <DsfrButton
        label="Créer un nouvel arrêté"
      />      
    </NuxtLink>
  </div>
  <template v-if="arretesCadrePaginated">
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-1w">
      <div
        v-for="arreteCadre in arretesCadrePaginated.data"
        class="fr-col-md-4 fr-col-12"
      >
        <ArreteCadreCard :arrete-cadre="arreteCadre"
                         :key="arreteCadre.id"
                         @click-arrete-cadre="navigateTo(`arrete-cadre/${arreteCadre.id}`)"/>
      </div>
    </div>
    <div class="fr-grid-row fr-grid-row--center fr-mt-2w">
      <DsfrPagination
        v-model:current-page="currentPage"
        :pages="arretesCadrePaginated.meta.dsfrPages"
        @update:current-page="paginate()"
      />
    </div>
  </template>
</template>

<style lang="scss">
.arrete-cadre-header {
  justify-content: space-between;
}
</style>
