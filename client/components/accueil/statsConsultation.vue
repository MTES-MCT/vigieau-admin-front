<script setup lang="ts">
import type { StatisticDepartement } from '~/dto/statistic_departement.dto';
import type { ChartOptions } from 'chart.js';
import { Line } from 'vue-chartjs';

const props = defineProps<{
  statisticDepartement: StatisticDepartement[];
}>();

const chartLineData = computed(() => {
  const dates = props.statisticDepartement
    .map((s: any) => s.visits.map((v: any) => new Date(v.date)))
    .flat()
    .filter(d => {
      const dateDebutValue = new Date(dateDebut.value);
      const dateFinValue = new Date(dateFin.value);
      return d.getTime() >= dateDebutValue.getTime() && d.getTime() <= dateFinValue.getTime();
    });
  const uniqueDates = Array.from(new Set(dates));
  uniqueDates.sort((a, b) => a.getTime() - b.getTime());
  const data: number[] = [];
  uniqueDates.forEach(d => {
    const visits = props.statisticDepartement.map(s => {
      return s.visits.find((v: any) => new Date(v.date).getTime() === d.getTime())?.visits;
    }).reduce((acc, current) => acc + current, 0);
    data.push(visits);
  });

  return {
    labels: uniqueDates,
    datasets: [
      {
        label: 'Visiteurs',
        data: data,
      },
    ],
  };
});

const tooltipTitle = (tooltipItems: any[]): string => {
  const date = new Date(tooltipItems[0].parsed.x);
  const year: string | number = date.getFullYear();
  let month: string | number = date.getMonth() + 1;
  let dt: string | number = date.getDate();

  if (dt < 10) {
    dt = '0' + dt;
  }
  if (month < 10) {
    month = '0' + month;
  }

  return `${dt}/${month}/${year}`;
};

const chartLineOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'week',
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    tooltip: {
      callbacks: {
        title: tooltipTitle,
      },
    },
  },
};


const dateMin = computed(() => {
  const dates = props.statisticDepartement.map((s: any) => s.visits.map((v: any) => new Date(v.date))).flat();
  return new Date(Math.min(...dates.map(date => date.getTime()))).toISOString().split('T')[0];
});
const dateDebut = ref(dateMin.value);
const dateFin = ref(new Date().toISOString().split('T')[0]);
const currentDate = ref(new Date().toISOString().split('T')[0]);
</script>

<template>
  <div class="fr-card fr-p-2w">
    <h2 class="text-align-center">Nombre de consultations VigiEau sur votre territoire</h2>
    <div class="fr-grid-row">
      <DsfrInputGroup>
        <DsfrInput
          id="dateDebut"
          v-model="dateDebut"
          label="Date début"
          label-visible
          type="date"
          name="dateCarte"
          :min="dateMin"
          :max="dateFin"
        />
      </DsfrInputGroup>
      <DsfrInputGroup>
        <DsfrInput
          class="fr-ml-1w"
          id="dateFin"
          v-model="dateFin"
          label="Date fin"
          label-visible
          type="date"
          name="dateCarte"
          :min="dateDebut"
          :max="currentDate"
        />
      </DsfrInputGroup>
    </div>
    <div>
      <Line :options="chartLineOptions"
            :data="chartLineData"
            :style="{'min-height': '400px'}" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fr-card {
  & > div {
    .fr-h1 {
      color: inherit;
    }
  }
}
</style>