import type { Ref } from "vue";
import type { Departement } from "~/dto/departement.dto";
import type { ZoneAlerte } from "~/dto/zone_alerte.dto";
import type { Usage } from "~/dto/usage.dto";

export const useRefDataStore = defineStore("rafDataStore", () => {
  const departements: Ref<Departement[]> = ref([]);
  const usages: Ref<Usage[]> = ref([]);
  const zonesAlerte: Ref<ZoneAlerte[]> = ref([]);

  function setDepartements(value: Departement[]): void {
    departements.value = value;
    zonesAlerte.value = departements.value.map(d => d.zonesAlerte).flat()    
  }

  function setUsages(value: Usage[]): void {
    usages.value = value;
  }

  return { setDepartements, departements, zonesAlerte, setUsages, usages };
});