<script setup lang="ts">
const errorFileUpload = ref('')
const files = ref(null)
const fileName = ref('')
const loading = ref(false)
const api = useApi()

const verifyZones = async () => {
  if(!files.value && !files.value[0]) {
    return;
  }
  loading.value = true
  console.log(files.value)
  const { data, error } = await api.zoneAlerte.importTmp('34', files.value[0])
  loading.value = false
  if(!error.value) {
    navigateTo(`/zone-alerte/34/SUP`)
  }
}

const onFileChanged = (fileImported) => {
  files.value = fileImported
}
</script>

<template>
  <DsfrFileUpload
    v-model="fileName"
    label="Ajouter un fichier de contours de zones"
    hint="Format supportés : GeoPackage, Shapefile, GeoJSON"
    :error="errorFileUpload"
    :accept="['.gpkg', '.shp', '.geojson']"
    @change="onFileChanged($event)"
  />
  <DsfrButton
    label="Vérifier les zones"
    :disabled="!files || !files[0] || loading"
    :icon="loading ? { name: 'ri-loader-4-line', animation: 'spin' } : ''"
    :icon-right="true"
    @click="verifyZones()"
  />
</template>