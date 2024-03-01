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
  if(type === 'AEP') {
    return props.arreteRestriction.restrictions.filter((r) => r.isAep);    
  }
  return props.arreteRestriction.restrictions.filter((r) => r.zoneAlerte?.type === type);
};

const getArreteCadreByZone = (zoneId: number) => {
  return props.arreteRestriction.arretesCadre.find((ac) => ac.zonesAlerte?.some(z => z.id === zoneId));
};
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-6">
        <template v-if="getRestrictionsByZoneType('SUP').length > 0">
          <p><b>Eaux superficielles</b></p>
          <div class="divider" />
          <div v-for="r in getRestrictionsByZoneType('SUP')" class="divider">
            <ArreteRestrictionFormRestriction :restriction="r"
                                              :type="'SUP'"
                                              :arretesCadre="[getArreteCadreByZone(r.zoneAlerte.id)]" />
          </div>          
        </template>
        <template v-if="getRestrictionsByZoneType('SOU').length > 0">
          <p><b>Eaux souterraines</b></p>
          <div class="divider" />
          <div v-for="r in getRestrictionsByZoneType('SOU')" class="divider">
            <ArreteRestrictionFormRestriction :restriction="r"
                                              :type="'SOU'"
                                              :arretesCadre="[getArreteCadreByZone(r.zoneAlerte.id)]" />
          </div>
        </template>
        <template v-if="getRestrictionsByZoneType('AEP').length > 0">
          <p><b>Eau potable</b></p>
          <div class="divider" />
          <div v-for="r in getRestrictionsByZoneType('AEP')" class="divider">
            <ArreteRestrictionFormRestriction :restriction="r"
                                              :type="'AEP'"
                                              :arretesCadre="arreteRestriction.arretesCadre" />
          </div>
        </template>
      </div>
    </div>
  </form>  
</template>
