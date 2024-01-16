<script setup lang="ts">
import { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

const props = defineProps<{
  duplicate?: boolean;
}>();

const arreteCadre: Ref<ArreteCadre> = ref();

const route = useRoute();
const api = useApi();
const authStore = useAuthStore();
const isNewArreteCadre = route.params.id === 'nouveau';
const isAci: Ref<boolean> = ref(false);
const isPilote: Ref<boolean> = ref(false);

if (isNewArreteCadre) {
  arreteCadre.value = new ArreteCadre();
} else {
  const { data, error } = await api.arreteCadre.get(<string>route.params.id);
  if (data.value) {
    arreteCadre.value = <ArreteCadre>data.value;
    isAci.value = arreteCadre.value.departements?.length > 1;
    isPilote.value = authStore.user.role === 'mte' || arreteCadre.value.departementPilote?.code === authStore.user.roleDepartement;
    if (props.duplicate) {
      arreteCadre.value.id = null;
      arreteCadre.value.usagesArreteCadre.map((u) => {
        u.id = null;
        return u;
      });
    }
    if(arreteCadre.value.departements.length > 1 && arreteCadre.value.departementPilote?.code) {
      const depPiloteIndex = arreteCadre.value.departements.findIndex((d) => d.code === arreteCadre.value.departementPilote.code);
      const depPilote = arreteCadre.value.departements[depPiloteIndex];
      arreteCadre.value.departements.splice(depPiloteIndex, 1);
      arreteCadre.value.departements.splice(0, 0, depPilote);
    }
  }
}
</script>

<template>
  <ArreteCadreFormWrapper v-if="arreteCadre && (!isAci || (isAci && isPilote))" :arreteCadre="arreteCadre" />
  <ArreteCadreFormWrapperNotPilote v-if="arreteCadre && isAci && !isPilote" :arreteCadre="arreteCadre" />
</template>
