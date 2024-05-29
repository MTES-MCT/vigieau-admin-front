<script setup lang="ts">
import type { StatisticDepartement } from '~/dto/statistic_departement.dto';

const props = defineProps<{
  statisticDepartement: StatisticDepartement[];
}>();

const getAttributeSum = (attribute: string) => {
  return props.statisticDepartement.reduce((acc, current) => acc + current[attribute], 0);  
}
</script>

<template>
  <div class="fr-card fr-p-2w text-align-center">
    <h2>Nombre de consultations VigiEau sur votre territoire</h2>
    <div>
      <b><span class="fr-h1">{{ getAttributeSum('weekVisits') }}</span><br />
        consultations hebdomadaires</b>
    </div>
    <div class="fr-mt-2w">
      <b><span class="fr-h1">{{ getAttributeSum('monthVisits') }}</span><br />
        consultations mensuelles</b>
    </div>
    <div class="divider fr-my-2w" />
    <div>
      <b>Nombre d'abonnés aux alertes emails<br />
        <span class="fr-h1">{{ getAttributeSum('subscriptions') }}</span></b>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fr-card {
  & > div {
    .fr-h1 {
      color: inherit;
    }
    
    &:nth-child(2) {
      color: var(--green-bourgeon-main-640);
    }

    &:nth-child(3) {
      color: var(--green-menthe-main-548);
    }
    
    &:last-child {
      color: var(--green-menthe-sun-373-moon-652);
    }
  }
}
</style>