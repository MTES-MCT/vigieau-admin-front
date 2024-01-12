<script setup lang="ts">
import type { Ref } from "vue";
import { ArreteCadre } from "~/dto/arrete_cadre.dto";
import { useRefDataStore } from "~/stores/refData";
import type { ZoneAlerte } from "~/dto/zone_alerte.dto";

const route = useRoute();
const api = useApi();
const refDataStore = useRefDataStore();

const arreteCadre: Ref<ArreteCadre> = ref();
const { data, error } = await api.arreteCadre.get(<string>route.params.id);
if (data.value) {
  arreteCadre.value = <ArreteCadre>data.value;
}

const departementsFiletered: Ref<any[]> = ref([]);

const getZonesByType = (zones: ZoneAlerte[], type: string) => {
  return zones.filter((z) => z.type === type);
};

watch(() => refDataStore.departements,
  () => {
  departementsFiletered.value = refDataStore.departements
    .filter((d) => arreteCadre.value.departements.map(ad => ad.id).includes(d.id))
    .map(d => {
      return {
        id: d.id,
        nom: d.nom,
        zonesAlerte: d.zonesAlerte.filter(za => arreteCadre.value.zonesAlerte.map(z => z.id).includes(za.id))
      }
    });
}, { immediate: true });
</script>

<template>
  <template v-if="arreteCadre">
    <h1>Arrêté cadre&nbsp;: {{ arreteCadre.numero }}</h1>
    
    <h2>Généralité</h2>
    <p>Cet arrêté est {{ arreteCadre.departements.length > 1 ? 'interdépartemental' : 'départemental'}}</p>
    <DsfrHighlight v-for="d of arreteCadre.departements" :text="d.nom" />
    <p>Date de mise en vigueur&nbsp;: {{ arreteCadre.dateDebut }}</p>
    <p>Date de fin&nbsp;: {{ arreteCadre.dateFin }}</p>
    <DsfrFileDownload
      v-if="arreteCadre.url"
      format="PDF"
      :href="arreteCadre.url"
      :size="null"
      :download="arreteCadre.url"
      title="PDF Arrête cadre"
    />
    <div v-if="arreteCadre.url" class="fr-mb-2w"></div>
    
    <template v-for="d of departementsFiletered">
      <h2>Zones d'alerte du {{ d.nom }} ({{ d.zonesAlerte.length }})</h2>
      <template v-if="getZonesByType(d.zonesAlerte, 'SUP').length > 0">
        <p>Eaux superficielles</p>
        <p v-for="za of getZonesByType(d.zonesAlerte, 'SUP')" class="fr-ml-2w fr-my-2w">
          {{ za.code }}
        </p>
      </template>
      <template v-if="getZonesByType(d.zonesAlerte, 'SOU').length > 0">
        <p>Eaux souterraines</p>
        <p v-for="za of getZonesByType(d.zonesAlerte, 'SOU')" class="fr-ml-2w fr-my-2w">
          {{ za.code }}
        </p>
      </template>
    </template>
    
    <h2>Usages et niveau de restriction</h2>
    <ArreteCadreFormRecapitulatif :arrete-cadre="arreteCadre" :viewOnly="true" />
  </template>
</template>