<script setup lang="ts">
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";
import { useRefDataStore } from "~/stores/refData";
import type { Ref } from "vue";
import type { ZoneAlerte } from "~/dto/zone_alerte.dto";

const props = defineProps<{
  arreteCadre: ArreteCadre;
}>();

const refDataStore = useRefDataStore();

const departementsFiletered: Ref<any[]> = ref([]);

const getZonesByType = (zones: ZoneAlerte[], type: string) => {
  return zones.filter((z) => z.type === type);
};

watch(() => refDataStore.departements,
  () => {
    departementsFiletered.value = refDataStore.departements
      .filter((d) => props.arreteCadre.departements.map(ad => ad.id).includes(d.id))
      .map(d => {
        return {
          id: d.id,
          nom: d.nom,
          zonesAlerte: d.zonesAlerte.filter(za => props.arreteCadre.zonesAlerte.map(z => z.id).includes(za.id))
        }
      });
  }, { immediate: true });
</script>

<template>
  <template v-for="d of departementsFiletered">
    <h2>Zones d'alerte du {{ d.nom }} ({{ d.zonesAlerte.length }})</h2>
    <template v-if="getZonesByType(d.zonesAlerte, 'SUP').length > 0">
      <p>Eaux superficielles</p>
      <p v-for="za of getZonesByType(d.zonesAlerte, 'SUP')" class="fr-ml-2w fr-my-2w">
        {{ za.code }} {{ za.nom }}
      </p>
    </template>
    <template v-if="getZonesByType(d.zonesAlerte, 'SOU').length > 0">
      <p>Eaux souterraines</p>
      <p v-for="za of getZonesByType(d.zonesAlerte, 'SOU')" class="fr-ml-2w fr-my-2w">
        {{ za.code }} {{ za.nom }}
      </p>
    </template>
  </template>
</template>