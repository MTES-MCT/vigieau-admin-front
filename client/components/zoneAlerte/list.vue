<script setup lang="ts">
import type { Ref } from 'vue'
import type { ZoneAlerte } from '~/dto/zone_alerte.dto'

const title = 'Zones d\'alertes'
const headers = ['Code', 'Type', 'Nom', 'Surface']
const noCaption = false
const pagination = true
const zonesAlerte: Ref<ZoneAlerte[]> = ref([])
const rows: Ref<any[]> = ref([])
const componentKey = ref(0)

const generateRows = () => {
  rows.value = [...zonesAlerte.value.map((z: ZoneAlerte) => {
    return [z.code, z.type, z.nom, z.surface]
  })]
  componentKey.value += 1
}

const api = useApi()
const { data, error } = await api.zoneAlerte.list()
if (data.value) {
  zonesAlerte.value = data.value
  generateRows()
}
</script>

<template>
  <DsfrTable
    :title="title"
    :headers="headers"
    :rows="rows"
    :no-caption="noCaption"
    :pagination="pagination"
    :key="componentKey"
  />
</template>
