import type { Ref } from "vue";
import type { Departement } from "~/dto/departement.dto";
import type { ZoneAlerte } from "~/dto/zone_alerte.dto";

export const useRefDataStore = defineStore("rafDataStore", () => {
  const departements: Ref<Departement[]> = ref([]);
  const zonesAlerte: Ref<ZoneAlerte[]> = ref([]);

  function setDepartements(value: Departement[]): void {
    departements.value = value;
    zonesAlerte.value = departements.value.map(d => d.zonesAlerte).flat()    
  }

  return { setDepartements, departements, zonesAlerte };
});