<script setup lang="ts">
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
}>();

const rules = computed(() => {
  return {
    restrictions: {
      required: helpers.withMessage("L'arrêté doit être lié à au moins une zone d'alerte", required),
    },
  };
});

const v$ = useVuelidate(rules, props.arreteRestriction);

const getRestrictionsByZoneType = (type: string) => {
  return props.arreteRestriction.restrictions.filter((r) => r.zoneAlerte.type === type);
};

const getArreteCadreByZone = (zoneId: number) => {
  return props.arreteRestriction.arretesCadre.find((ac) => ac.zonesAlerte.some(z => z.id === zoneId));
};
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-6">
        <p><b>Eaux superficielles</b></p>
        <div class="divider" />
        <div v-for="r in getRestrictionsByZoneType('SUP')" class="divider">
          <ArreteRestrictionFormRestriction :restriction="r" :arreteCadre="getArreteCadreByZone(r.zoneAlerte.id)" />
        </div>
        <p><b>Eaux souterraines</b></p>
        <div class="divider" />
        <div v-for="r in getRestrictionsByZoneType('SOU')" class="divider">
          <ArreteRestrictionFormRestriction :restriction="r" :arreteCadre="getArreteCadreByZone(r.zoneAlerte.id)" />
        </div>
      </div>
    </div>
  </form>  
</template>
