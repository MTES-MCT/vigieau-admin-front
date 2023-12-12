<script setup lang="ts">
import type { Ref } from 'vue'
import type { Departement } from "~/dto/departement.dto";

const headers = ['Code', 'Nom', '']
const noCaption = false
const pagination = true
const departements: Ref<Departement[]> = ref([])
const rows: Ref<any[]> = ref([])
const componentKey = ref(0)

const generateRows = () => {
  rows.value = [...departements.value.map((d: Departement) => {
    return [d.code, d.nom, {
      component: 'DsfrButton',
      label: 'Voir les zones',
      onClick: () => {
        navigateTo(`/zone-alerte/${d.code}`)
      },
    }]
  })]
  componentKey.value += 1
}

const api = useApi()
const { data, error } = await api.departement.list()
if (data.value) {
  departements.value = <Departement[]> data.value
  generateRows()
}
</script>

<template>
  <h1>Départements</h1>
  <DsfrTable
    :headers="headers"
    :rows="rows"
    :no-caption="noCaption"
    :pagination="pagination"
    :key="componentKey"
  />
</template>
