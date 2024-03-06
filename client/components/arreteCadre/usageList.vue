<script setup lang="ts">
import type { Ref } from 'vue';
import { helpers, required } from "@vuelidate/validators/dist";
import useVuelidate from "@vuelidate/core";

const props = defineProps<{
  usagesArreteCadre: any[];
}>();

const emit = defineEmits(['usageSelected', 'usageRemoved']);

const headers = ['Usages', 'Actions'];
const rows: Ref<any[]> = ref([]);
const componentKey = ref(0);
const utils = useUtils();

const rules = computed(() => {
  return {
    $each: helpers.forEach({
      descriptionCrise: {
        required: helpers.withMessage("Tout les usages doivent avoir une description de crise", required),
      },
    })
  };
});

const v$ = useVuelidate(rules, props.usagesArreteCadre);

const generateRows = () => {
  rows.value = [
    ...props.usagesArreteCadre.map((u: any) => {
      return [
        {
          component: 'span',
          text: u.usage.nom,
          class: u.descriptionCrise ? '' : 'usage-error'
        },
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
                modalActions.value = [
                  {
                    label: 'Valider',
                    onClick: () => {
                      utils.closeModal(modalOpened);
                      emit('usageRemoved', u);
                    },
                  },
                  {
                    label: 'Annuler',
                    secondary: true,
                    onClick: () => {
                      utils.closeModal(modalOpened);
                    },
                  },
                ]
                modalDescription.value = `Voulez vous vraiment supprimer l'usage <b>${u.usage.nom}</b> ?`;
                modalOpened.value = true;
              },
            },
          ],
        },
      ];
    }),
  ];
  componentKey.value += 1;
};

const modalOpened: Ref<boolean> = ref(false);
const modalTitle: Ref<string> = ref(`Suppression d'un usage`);
const modalDescription: Ref<string> = ref('');
const modalActions: Ref<any[]> = ref([]);

generateRows();

defineExpose({
  v$,
});
</script>

<template>
  <h6>Usages présents dans l’arrêté</h6>
  <DsfrTable v-if="usagesArreteCadre.length > 0" 
             :headers="headers"
             :rows="rows"
             :no-caption="false"
             :pagination="false"
             :key="componentKey" />
  <div v-else>
    Aucun usage lié à l'arrêté cadre
  </div>
  
  <DsfrModal :opened="modalOpened"
             :title="modalTitle"
             :actions="modalActions"
             @close="utils.closeModal(modalOpened)">
    <div v-html="modalDescription" />
  </DsfrModal>
</template>

<style lang="scss">
.fr-table {
  .fr-btns-group {
    flex-wrap: nowrap;
  }
  
  .usage-error {
    color: var(--red-marianne-425-625);
  }
}
</style>
