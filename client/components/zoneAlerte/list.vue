<script setup lang="ts">
import type { Ref } from 'vue'
import type { ZoneAlerte } from '~/dto/zone_alerte.dto'

const headers = ['Code', 'Type', 'Nom', 'Département']
const noCaption = false
const pagination = true
const zonesAlerte: Ref<ZoneAlerte[]> = ref([])
const rows: Ref<any[]> = ref([])
const componentKey = ref(0)

const generateRows = () => {
  rows.value = [...zonesAlerte.value.map((z: ZoneAlerte) => {
    return [z.code, z.type, z.nom, z.departement?.nom || '']
  })]
  componentKey.value += 1
}

const api = useApi()
const { data, error } = await api.zoneAlerte.get('34')
if (data.value) {
  zonesAlerte.value = <ZoneAlerte[]> data.value
  generateRows()
}
</script>

<template>
  <h1>Les zones d'alertes (34)</h1>
  <DsfrTable
    :headers="headers"
    :rows="rows"
    :no-caption="noCaption"
    :pagination="pagination"
    :key="componentKey"
  />
  <zoneAlerteImport />
</template>
