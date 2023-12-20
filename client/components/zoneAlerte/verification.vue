<script setup lang="ts">
import * as maplibregl from 'maplibre-gl';
import type { ZoneAlerteComparaisonDepartement, ZoneAlerteComparaisonZone } from '~/dto/zone_alerte_verification.dto';
import type { Ref } from 'vue';

const comparaisonDepartement: ZoneAlerteComparaisonDepartement = ref(null);
const comparaisonZones: ZoneAlerteComparaisonZone[] = ref(null);
const headers = [
  'Code zone active',
  'Code nouvelle zone',
  'Zone en commun (%)',
  'Zone en commun (km²)',
  'Zone différence (km²)',
  'Zone différence',
];
const rows = ref([]);

const mapContainer = shallowRef(null);
const map: Ref<any> = shallowRef(null);
const isMapSupported: boolean = useUtils().isWebglSupported();
const initialState = [
  [-7.075195, 41.211722],
  [11.403809, 51.248163],
];
const layers = ref(['zoneEmptyDepartementGeom', 'zoneOutsideDepartementGeom']);

const route = useRoute();
const api = useApi();

const showZone = (layerName: string) => {
  layers.value.forEach((l) => {
    map.value.setLayoutProperty(l, 'visibility', l === layerName ? 'visible' : 'none');
  });
};

const { data, error } = await api.zoneAlerte.check(route.params.id_dep, route.params.type_zone);
if (data.value) {
  comparaisonDepartement.value = data.value.comparaisonDepartement;
  comparaisonZones.value = data.value.comparaisonZones;
  rows.value = comparaisonZones.value.map((z: ZoneAlerteComparaisonZone) => {
    return [
      z.currentCode,
      z.futurCode,
      z.percentageCover.toFixed(3),
      z.areaCover.toFixed(3),
      z.areaDifference.toFixed(3),
      z.areaDifference.toFixed(3) === '0.000'
        ? ''
        : {
            component: 'DsfrButton',
            label: 'Voir',
            onClick: () => {
              showZone(`${z.currentCode}_${z.futurCode}`);
            },
          },
    ];
  });
  layers.value = layers.value.concat(
    comparaisonZones.value.map((z: ZoneAlerteComparaisonZone) => {
      return `${z.currentCode}_${z.futurCode}`;
    }),
  );
}

onMounted(() => {
  if (!isMapSupported) {
    return;
  }

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: `https://etalab-tiles.fr/styles/osm-bright/style.json`,
    bounds: initialState,
  });

  // Add zoom and rotation controls to the map.
  map.value?.addControl(new maplibregl.NavigationControl(), 'bottom-right');

  // Add fullscreen control to the map.
  map.value?.addControl(new maplibregl.FullscreenControl(), 'bottom-right');

  map.value?.on('load', () => {
    // SOURCES
    map.value?.addSource('cadastre', {
      type: 'vector',
      url: `https://etalab-tiles.fr/data/decoupage-administratif.json`,
    });
    map.value?.addSource('zoneEmptyDepartementGeom', {
      type: 'geojson',
      data: comparaisonDepartement.value.zoneEmptyDepartementGeom,
    });
    map.value?.addSource('zoneOutsideDepartementGeom', {
      type: 'geojson',
      data: comparaisonDepartement.value.zoneOutsideDepartementGeom,
    });
    comparaisonZones.value.forEach((z: ZoneAlerteComparaisonZone) => {
      map.value?.addSource(`${z.currentCode}_${z.futurCode}`, {
        type: 'geojson',
        data: z.zoneDifference,
      });
    });

    // LAYER
    map.value?.addLayer({
      id: 'departements-data',
      type: 'line',
      source: 'cadastre',
      'source-layer': 'departements',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#888888',
        'line-width': 1,
      },
    });
    populateLayers();
  });
});

onUnmounted(() => {
  map.value?.remove();
});

const populateLayers = () => {
  layers.value.forEach((layerName: string) => {
    map.value?.addLayer({
      id: layerName,
      type: 'fill',
      source: layerName,
      layout: {
        visibility: 'none',
      },
      paint: {
        'fill-color': '#000091',
        'fill-opacity': 0.6,
        'fill-outline-color': '#000091',
      },
    });
  });
};
</script>

<template>
  <div class="fr-grid-row">
    <div class="fr-col-s-12 fr-col-6">
      <template v-if="comparaisonDepartement">
        <h1>Comparaison avec le département</h1>
        <ul>
          <li>Code du département : {{ comparaisonDepartement.code }}</li>
          <li>Pourcentage du département couvert par les zones : {{ comparaisonDepartement.percentageCover.toFixed(3) }}%</li>
          <li>Surface en dehors du département : {{ comparaisonDepartement.zoneOutsideDepartement.toFixed(3) }}km²</li>
          <li>
            Zones en dehors du département
            <DsfrButton label="Voir" @click="showZone('zoneOutsideDepartementGeom')" />
          </li>
          <li>
            Zones non-couvertes du département
            <DsfrButton label="Voir" @click="showZone('zoneEmptyDepartementGeom')" />
          </li>
        </ul>
      </template>
      <template v-if="comparaisonZones">
        <h1>Comparaison avec les zones {{ route.params.type_zone }} actives</h1>
        <DsfrTable :headers="headers" :rows="rows" :pagination="false" :default-option-selected="1000" />
      </template>
    </div>
    <div class="fr-col-s-12 fr-col-6" v-if="isMapSupported">
      <div class="map-wrap">
        <div class="map" ref="mapContainer"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.map-wrap {
  height: calc(75vh);

  .map {
    width: 100%;
    height: 100%;
  }
}

.maplibregl-map {
  font-family: inherit;
}
</style>
