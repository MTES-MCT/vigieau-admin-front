<script setup lang="ts">
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";
import { RestrictionNiveauGraviteFr } from "~/dto/restriction.dto";
import NiveauGraviteBadge from "~/components/mixins/NiveauGraviteBadge.vue";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
}>();

const restrictionNiveauGraviteFr = RestrictionNiveauGraviteFr;

const getRestrictionsByZoneType = (type: string) => {
  return props.arreteRestriction.restrictions.filter((r) => r.zoneAlerte.type === type);
};
</script>

<template>
  <template v-if="getRestrictionsByZoneType('SUP').length > 0">
    <p>Eaux superficielles</p>
    <p v-for="r of getRestrictionsByZoneType('SUP')" class="fr-ml-2w fr-my-2w">
      {{ r.zoneAlerte.code }} {{ r.zoneAlerte.nom }}
      <NiveauGraviteBadge :niveauGravite="r.niveauGravite" />
    </p>
  </template>
  <template v-if="getRestrictionsByZoneType('SOU').length > 0">
    <p>Eaux souterraines</p>
    <p v-for="r of getRestrictionsByZoneType('SOU')" class="fr-ml-2w fr-my-2w">
      {{ r.zoneAlerte.code }} {{ r.zoneAlerte.nom }}
      <NiveauGraviteBadge :niveauGravite="r.niveauGravite" />
    </p>
  </template>
</template>