<script setup lang="ts">
import type { Ref } from "vue";
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";

const route = useRoute();
const api = useApi();

const arreteRestriction: Ref<ArreteRestriction> = ref();
const { data, error } = await api.arreteRestriction.get(<string>route.params.id);
if (data.value) {
  arreteRestriction.value = <ArreteRestriction>data.value;
}
</script>

<template>
  <template v-if="arreteRestriction">
    <h1>Arrêté de restriction&nbsp;: {{ arreteRestriction.numero }}</h1>

    <ArreteRestrictionConsultationGeneral :arreteRestriction="arreteRestriction" />
  </template>
</template>