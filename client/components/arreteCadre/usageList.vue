<script setup lang="ts">
import type { Ref } from 'vue';

const props = defineProps<{
  usagesArreteCadre: any[];
}>();

const emit = defineEmits(['usageSelected', 'usageRemoved']);

const headers = ['Usages', 'Actions'];
const rows: Ref<any[]> = ref([]);
const componentKey = ref(0);

const generateRows = () => {
  rows.value = [
    ...props.usagesArreteCadre.map((u: any) => {
      return [
        u.usage.nom,
        {
          component: 'DsfrButtonGroup',
          inlineLayoutWhen: 'always',
          buttons: [
            {
              icon: 'ri-edit-2-fill',
              iconOnly: true,
              label: 'Editer',
              onClick: () => {
                emit('usageSelected', u);
              },
            },
            {
              icon: 'ri-delete-bin-5-fill',
              iconOnly: true,
              label: 'Supprimer',
              onClick: () => {
                emit('usageRemoved', u);
              },
            },
          ],
        },
      ];
    }),
  ];
  componentKey.value += 1;
};

generateRows();
</script>

<template>
  <h6>Récapitulatif des usages</h6>
  <DsfrTable v-if="usagesArreteCadre.length > 0" 
             :headers="headers"
             :rows="rows"
             :no-caption="false"
             :pagination="false"
             :key="componentKey" />
  <div v-else>
    Aucun usage lié à l'arrêté cadre
  </div>
</template>

<style lang="scss">
.fr-table {
  .fr-btns-group {
    flex-wrap: nowrap;
  }
}
</style>
