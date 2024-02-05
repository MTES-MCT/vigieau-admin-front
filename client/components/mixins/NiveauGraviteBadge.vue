<script setup lang="ts">
import { RestrictionNiveauGraviteFr } from "~/dto/restriction.dto";

const props = defineProps<{
  niveauGravite: string;
}>();

const restrictionNiveauGraviteFr = RestrictionNiveauGraviteFr;

const badgeType = computed(() => {
  switch (props.niveauGravite) {
    case 'vigilance':
      return 'info';
    case 'alerte':
      return 'new';
    case 'alerte_renforcee':
      return 'warning';
    case 'crise':
      return 'error';
  }
})
</script>

<template>
  <DsfrBadge :label="restrictionNiveauGraviteFr[niveauGravite]" :type="badgeType" />
</template>