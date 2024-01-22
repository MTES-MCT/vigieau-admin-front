<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import type { UsageArreteCadre } from '~/dto/usage_arrete_cadre.dto';

const props = defineProps<{
  viewOnly: boolean;
  arreteCadre: ArreteCadre;
}>();

const emit = defineEmits(['usageSelected']);

const rows: Ref<any[]> = ref([]);
const componentKey = ref(0);
const arreteCadreRecapitulatifCell = shallowRef(resolveComponent('ArreteCadreRecapitulatifCell'));

const rules = computed(() => {
  return {
    numero: {
      required: helpers.withMessage("Le numéro de l'arrêté est obligatoire.", required),
    },
  };
});

const editUsage = (u: UsageArreteCadre) => {
  emit('usageSelected', u);
};

const generateRows = () => {
  rows.value = [
    ...props.arreteCadre.usagesArreteCadre.map((u: UsageArreteCadre) => {
      return [
        {
          component: arreteCadreRecapitulatifCell,
          viewOnly: props.viewOnly,
          html: `<b>${u.usage.nom}</b><br/><br/>Thématique&nbsp;: <b>${u.usage.thematique?.nom}</b>`,
          onClickEdit: () => editUsage(u)
        },
        {
          component: arreteCadreRecapitulatifCell,
          viewOnly: props.viewOnly,
          html:  u.descriptionVigilance,
          onClickEdit: () => editUsage(u)
        },
        {
          component: arreteCadreRecapitulatifCell,
          viewOnly: props.viewOnly,
          html:  u.descriptionAlerte,
          onClickEdit: () => editUsage(u)
        },
        {
          component: arreteCadreRecapitulatifCell,
          viewOnly: props.viewOnly,
          html:  u.descriptionAlerteRenforcee,
          onClickEdit: () => editUsage(u)
        },
        {
          component: arreteCadreRecapitulatifCell,
          viewOnly: props.viewOnly,
          html:  u.descriptionCrise,
          onClickEdit: () => editUsage(u)
        },
        {
          component: arreteCadreRecapitulatifCell,
          viewOnly: props.viewOnly,
          html:  generateUsagers(u),
          onClickEdit: () => editUsage(u)
        },
        {
          component: arreteCadreRecapitulatifCell,
          viewOnly: props.viewOnly,
          html:  generateRessources(u),
          onClickEdit: () => editUsage(u)
        },
      ];
    }),
  ];
  componentKey.value += 1;
};

const generateUsagers = (u: UsageArreteCadre) => {
  let toReturn = [];
  u.concerneParticulier ? toReturn.push('Particulier') : '';
  u.concerneEntreprise ? toReturn.push('Entreprise') : '';
  u.concerneCollectivite ? toReturn.push('Collectivité') : '';
  u.concerneExploitation ? toReturn.push('Exploitant agricole') : '';
  return toReturn.join(', ');
};

const generateRessources = (u: UsageArreteCadre) => {
  let toReturn = [];
  u.concerneEso ? toReturn.push('ESO') : '';
  u.concerneEsu ? toReturn.push('ESU') : '';
  u.concerneAep ? toReturn.push('AEP') : '';
  return toReturn.join(', ');
};

generateRows();

const v$ = useVuelidate(rules, props.arreteCadre);
</script>

<template>
  <DsfrTable :rows="rows" :no-caption="false" :pagination="false" :key="componentKey">
    <template v-slot:header>
      <tr>
        <th>Usages</th>
        <th>
          <DsfrBadge label="Vigilance" type="info" />
        </th>
        <th>
          <DsfrBadge label="Alerte" type="new" />
        </th>
        <th>
          <DsfrBadge label="Alerte&nbsp;renforcée" type="warning" />
        </th>
        <th>
          <DsfrBadge label="Crise" type="error" />
        </th>
        <th>Usagers</th>
        <th>Ressources</th>
      </tr>
    </template>
  </DsfrTable>
</template>

<style lang="scss">
</style>
