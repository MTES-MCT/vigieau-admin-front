<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators/dist";
import useVuelidate from "@vuelidate/core";
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";
import type { Ref } from "vue";
import type { UsageArreteCadre } from "~/dto/usage_arrete_cadre.dto";

const props = defineProps<{
  arreteCadre: ArreteCadre,
}>();

const rows: Ref<any[]> = ref([]);
const componentKey = ref(0);

const rules = computed(() => {
  return {
    numero: {
      required: helpers.withMessage("Le numéro de l'arrêté est obligatoire.", required)
    }
  };
});

const generateRows = () => {
  rows.value = [...props.arreteCadre.usagesArreteCadre.map((u: UsageArreteCadre) => {
    return [u.usage.nom, generateUsagers(u), u.descriptionVigilance || "", u.descriptionAlerte || "", u.descriptionAlerteRenforcee || "", u.descriptionCrise || ""];
  })];
  componentKey.value += 1;
};

const generateUsagers = (u: UsageArreteCadre) => {
  let toReturn = [];
  u.concerneParticulier ? toReturn.push('Particulier') : '';
  u.concerneEntreprise ? toReturn.push('Entreprise') : '';
  u.concerneCollectivite ? toReturn.push('Collectivité') : '';
  u.concerneExploitation ? toReturn.push('Exploitant agricole') : '';
  return toReturn.join(', ');
}

generateRows();

const v$ = useVuelidate(rules, props.arreteCadre);
</script>

<template>
  <DsfrTable
    :rows="rows"
    :no-caption="false"
    :pagination="false"
    :key="componentKey">
    <template v-slot:header>
      <tr>
        <th>
          Usages
        </th>
        <th>
          Usagers
        </th>
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
      </tr>
    </template>
  </DsfrTable>
</template>