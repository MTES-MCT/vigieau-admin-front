<script setup lang="ts">
import type { Ref } from 'vue'
import type { ArreteCadre } from '~/dto/arrete_cadre.dto'
import type { PaginatedResult } from '~/dto/paginated_result.dto'

const arretesCadrePaginated: Ref<PaginatedResult<ArreteCadre> | null> = ref(null)
const currentPage = ref(0)

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
  <template v-if="arretesCadrePaginated">
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-1w">
      <div
        v-for="arreteCadre in arretesCadrePaginated.data"
        class="fr-col-md-4 fr-col-12"
      >
        <ArreteCadreCard :arrete-cadre="arreteCadre" />
      </div>
    </div>
    <DsfrPagination
      v-model:current-page="currentPage"
      :pages="arretesCadrePaginated.meta.dsfrPages"
      @update:current-page="paginate()"
    />
  </template>
</template>
