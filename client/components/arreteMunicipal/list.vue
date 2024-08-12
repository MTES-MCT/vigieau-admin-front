<script setup lang="ts">
import type { Ref } from 'vue';
import type { PaginatedResult } from '~/dto/paginated_result.dto';
import type { ArreteRestriction } from '~/dto/arrete_restriction.dto';

const arretesMunicipauxPaginated: Ref<PaginatedResult<ArreteRestriction> | null> = ref(null);
const loading = ref(false);
</script>

<template>
  <div class="fr-grid-row fr-grid-row--space-between fr-grid-row--middle fr-mb-2w">
    <h1 class="fr-my-0">
      Les arrêtés municipaux

      <VIcon v-if="loading" name="ri-loader-4-line" animation="spin" :width="40" :height="40" />
    </h1>
  </div>
  <template v-if="arretesMunicipauxPaginated">
  </template>
</template>