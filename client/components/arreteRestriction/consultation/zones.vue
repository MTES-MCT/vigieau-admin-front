<script setup lang="ts">
import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";
import { RestrictionNiveauGraviteFr } from "~/dto/restriction.dto";
import NiveauGraviteBadge from "~/components/mixins/NiveauGraviteBadge.vue";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
}>();

const restrictionNiveauGraviteFr = RestrictionNiveauGraviteFr;
const expandedId = ref();

const getRestrictionsByZoneType = (type: string) => {
  if(type === 'AEP') {
    return props.arreteRestriction.restrictions.filter((r) => r.isAep);
  }
  return props.arreteRestriction.restrictions.filter((r) => r.zoneAlerte?.type === type);
};

const zonesType = [
  { type: 'SUP', label: 'Eaux superficielles' },
  { type: 'SOU', label: 'Eaux souterraines' },
  { type: 'AEP', label: 'Eau potable' },
];
</script>

<template>
  <h2>Zones d'alerte</h2>
  <template v-for="zoneType of zonesType">
    <template v-if="getRestrictionsByZoneType(zoneType.type).length > 0">
      <p><b>{{ zoneType.label }}</b></p>
      <p v-for="r of getRestrictionsByZoneType(zoneType.type)" class="fr-ml-2w fr-my-2w">
        <div class="fr-grid-row fr-grid-row--middle fr-mb-2w">
          <template v-if="r.zoneAlerte">
            {{ r.zoneAlerte?.code }} {{ r.zoneAlerte?.nom }}
          </template>
          <template v-else>
            {{ r.nomGroupementAep }}
          </template>
          <NiveauGraviteBadge v-if="r.niveauGravite"
                              class="fr-ml-2w"
                              :niveauGravite="r.niveauGravite" />          
        </div>
        <DsfrAccordion :title="'Voir les ' + r.usagesArreteRestriction.length + ' usages'" :expanded-id="expandedId" @expand="expandedId = $event">
          <div v-for="usage in r.usagesArreteRestriction">
                <b>{{ usage.usage.nom }}</b>
                <div class="full-width">
                  <template v-if="r.niveauGravite === 'vigilance'">
                    {{ usage.descriptionVigilance }}
                  </template>
                  <template v-else-if="r.niveauGravite === 'alerte'">
                    {{ usage.descriptionAlerte }}
                  </template>
                  <template v-else-if="r.niveauGravite === 'alerte_renforcee'">
                    {{ usage.descriptionAlerteRenforcee }}
                  </template>
                  <template v-else-if="r.niveauGravite === 'crise'">
                    {{ usage.descriptionCrise }}
                  </template>
                </div>
            <div class="divider fr-mb-2w" />
          </div>
        </DsfrAccordion>
      </p>
    </template>
  </template>
</template>