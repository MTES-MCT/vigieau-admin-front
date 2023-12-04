<script setup lang="ts">
import type { Ref } from 'vue'
import api from '../../api'
import type { ArreteCadre } from '~/dto/arrete_cadre.dto'

const title = 'Arrêtés cadre'
const headers = ['Numéro', 'Statut']
const noCaption = false
const pagination = true
const arretesCadre: Ref<ArreteCadre[]> = ref([])
const rows: Ref<any[]> = ref([])
const componentKey = ref(0)

const generateRows = () => {
  rows.value = [...arretesCadre.value.map((a: ArreteCadre) => {
    return [a.numero, a.statut]
  })]
  componentKey.value += 1
}

const { data, error } = await api.getArretesCadre()
if (data.value) {
  arretesCadre.value = data.value
  generateRows()
}
</script>

<template>
  <DsfrTable
    :key="componentKey"
    :title="title"
    :headers="headers"
    :rows="rows"
    :no-caption="noCaption"
    :pagination="pagination"
  />
</template>
