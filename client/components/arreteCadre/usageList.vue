<script setup lang="ts">
import type { Ref } from "vue";

const props = defineProps<{
  usagesArreteCadre: any[],
}>();

const emit = defineEmits(['usageSelected'])

const headers = ['Usages', 'Actions']
const rows: Ref<any[]> = ref([])
const componentKey = ref(0)

const generateRows = () => {
  rows.value = [...props.usagesArreteCadre.map((u: any) => {
    return [u.usage.nom, {
      component: 'DsfrButton',
      icon: 'ri-edit-2-fill',
      iconOnly: true,
      label: 'Editer',
      onClick: () => {
        emit('usageSelected', u)
      },
    }]
  })]
  componentKey.value += 1
}

generateRows()
</script>

<template>
    <h6>Récapitulatif des usages</h6>
    <DsfrTable
      :headers="headers"
      :rows="rows"
      :no-caption="false"
      :pagination="false"
      :key="componentKey"
    /> 
</template>