<script setup lang="ts">
const errorFileUpload = ref('');
const files = ref(null);
const fileName = ref('');
const loading = ref(false);
const api = useApi();
const route = useRoute();
const zoneType = ref('SUP');
const options = [
  {
    label: 'ESU',
    value: 'SUP',
  },
  {
    label: 'ESO',
    value: 'SOU',
  },
];

const verifyZones = async () => {
  if (!files.value && !files.value[0]) {
    return;
  }
  loading.value = true;
  console.log(files.value);
  const { data, error } = await api.zoneAlerte.importTmp(<string>route.params.id_dep, zoneType.value, files.value[0]);
  loading.value = false;
  if (!error.value) {
    navigateTo(`/zone-alerte/${route.params.id_dep}/${zoneType.value}`);
  }
};

const onFileChanged = (fileImported) => {
  files.value = fileImported;
};
</script>

<template>
  <div class="fr-grid-row fr-grid-row--middle">
    <DsfrFileUpload
      v-model="fileName"
      label="Ajouter un fichier de contours de zones"
      hint="Format supportés : GeoPackage, Shapefile, GeoJSON"
      :error="errorFileUpload"
      :accept="['.gpkg', '.shp', '.geojson']"
      @change="onFileChanged($event)"
    />
    <DsfrRadioButtonSet class="fr-ml-4w" legend="Type de zone" :options="options" v-model="zoneType" :small="false" :inline="true" />
    <DsfrButton
      class="fr-ml-4w"
      label="Vérifier les zones"
      :disabled="!files || !files[0] || loading"
      :icon="loading ? { name: 'ri-loader-4-line', animation: 'spin' } : ''"
      :icon-right="true"
      @click="verifyZones()"
    />
  </div>
</template>
