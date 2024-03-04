<script setup lang="ts">
import type { ArreteRestriction } from '~/dto/arrete_restriction.dto';
import { helpers, required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';

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
  if (type === 'AEP') {
    return props.arreteRestriction.restrictions.filter((r) => r.isAep);
  }
  return props.arreteRestriction.restrictions.filter((r) => r.zoneAlerte?.type === type);
};

const getArretesCadreByZone = (zoneId: number) => {
  if (!zoneId) {
    return props.arreteRestriction.arretesCadre;
  }
  return props.arreteRestriction.arretesCadre.filter((ac) => ac.zonesAlerte?.some((z) => z.id === zoneId));
};

const zonesType = [
  { type: 'SUP', label: 'Eaux superficielles' },
  { type: 'SOU', label: 'Eaux souterraines' },
  { type: 'AEP', label: 'Eaux potable' },
];
const isSameNiveauGravite = ref(props.arreteRestriction.restrictions?.every((r, i, arr) => r.niveauGravite === arr[0].niveauGravite));
const sameNiveauGravite = ref(isSameNiveauGravite.value ? props.arreteRestriction.restrictions[0].niveauGravite : null);
const niveauGraviteOptions = [
  {
    text: 'Vigilance',
    value: 'vigilance',
  },
  {
    text: 'Alerte',
    value: 'alerte',
  },
  {
    text: 'Alerte renforcée',
    value: 'alerte_renforcee',
  },
  {
    text: 'Crise',
    value: 'crise',
  },
];

watch(sameNiveauGravite, () => {
  if (!isSameNiveauGravite.value || !sameNiveauGravite.value) {
    return;
  }
  props.arreteRestriction.restrictions = props.arreteRestriction.restrictions.map((r) => {
    r.niveauGravite = sameNiveauGravite.value;
    return r;
  });
});

watch(
  () => props.arreteRestriction.restrictions.map((r) => r.niveauGravite),
  () => {
    isSameNiveauGravite.value = props.arreteRestriction.restrictions?.every((r, i, arr) => r.niveauGravite === arr[0].niveauGravite);
    if (!isSameNiveauGravite.value) {
      sameNiveauGravite.value = null;
    }
  }
);
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-6">
        <div class="fr-grid-row fr-p-2w fr-mb-2w fr-grid-row--bottom fr-notice fr-notice--info">
          <div class="fr-col-10">
            <h6>Niveau de gravité commun aux zones d'alerte</h6>
            <p>Appliquer le même niveau de gravité pour toutes les zones d’alerte</p>
          </div>
          <div class="fr-col-2">
            <DsfrToggleSwitch v-model="isSameNiveauGravite" :labelLeft="true" />
          </div>
          <div class="fr-col-12 fr-mt-2w fr-grid-row" v-if="isSameNiveauGravite">
            <DsfrSelect
              id="role"
              v-model="sameNiveauGravite"
              :options="niveauGraviteOptions"
              label="Choisir un niveau de gravité unique"
              required
              type="text"
              name="niveauGravite"
            />
          </div>
        </div>
        <h6>Zones d'alerte</h6>
        <template v-for="zoneType of zonesType">
          <template v-if="getRestrictionsByZoneType(zoneType.type).length > 0">
            <p>
              <b>{{ zoneType.label }}</b>
            </p>
            <div class="divider" />
            <div v-for="r in getRestrictionsByZoneType(zoneType.type)" class="divider">
              <ArreteRestrictionFormRestriction
                :restriction="r"
                :type="zoneType"
                :arretesCadre="getArretesCadreByZone(r.zoneAlerte?.id)"
                :disableNiveauGravite="isSameNiveauGravite"
              />
            </div>
          </template>
        </template>
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.fr-notice {
  color: initial;
}
</style>
