import { ArcElement, Chart, Legend, Title, Tooltip } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

export default defineNuxtPlugin(() => {
  Chart.register(ArcElement, Title, Tooltip, Legend)
})