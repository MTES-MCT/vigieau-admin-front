<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators/dist";
import useVuelidate from "@vuelidate/core";
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";
import { useRefDataStore } from "~/stores/refData";
import type { Departement } from "~/dto/departement.dto";
import type { Ref } from "vue";
import type { ZoneAlerte } from "~/dto/zone_alerte.dto";
import { requiredIf } from "@vuelidate/validators";

const props = defineProps<{
  arreteCadre: ArreteCadre,
  fullValidation: boolean,
}>();

const refDataStore = useRefDataStore();
const utils = useUtils();
const expandedIndex: Ref<string | undefined> = ref();
const zonesSelected: Ref<number[]> = ref(props.arreteCadre.zonesAlerte.map(z => z.id));
const departementsFiletered: Ref<any[]> = ref(refDataStore.departements.filter(d => props.arreteCadre.departements.map(ad => ad.id).includes(d.id)));

const rules = computed(() => {
  return {
    zonesAlerte: {
      requiredIf: helpers.withMessage("L'arrêté doit être lié à au moins une zone d'alerte", requiredIf(props.fullValidation))
    }
  };
});

const v$ = useVuelidate(rules, props.arreteCadre);

const zonesOptionsCheckBox = (dep: Departement) => {
  return dep.zonesAlerte.map(z => {
    return {
      id: z.id,
      name: z.id,
      label: `${z.nom} (${z.type})`
    };
  });
};

const selectAll = (d: any) => {
  if (d.nbZonesSelected === d.zonesAlerte.length) {
    zonesSelected.value = zonesSelected.value.filter(z => !d.zonesAlerte.map((za: ZoneAlerte) => za.id).includes(z));
  } else {
    zonesSelected.value = useUtils().mergeArrays(zonesSelected.value, d.zonesAlerte.map((za: ZoneAlerte) => za.id));
  }
};

const computeDepSelected = () => {
  departementsFiletered.value.forEach(d => {
    d.nbZonesSelected = zonesSelected.value.filter(z => d.zonesAlerte.map((za: ZoneAlerte) => za.id).includes(z)).length;
  });
};

watch(zonesSelected, () => {
  props.arreteCadre.zonesAlerte = refDataStore.zonesAlerte.filter(z => zonesSelected.value.includes(z.id));
  computeDepSelected();
});

watch(() => props.arreteCadre.departements, () => {
  departementsFiletered.value = refDataStore.departements.filter(d => props.arreteCadre.departements.map(ad => ad.id).includes(d.id));
  zonesSelected.value = zonesSelected.value.filter(z => departementsFiletered.value.map((d: Departement) => d.zonesAlerte.map((za: ZoneAlerte) => za.id)).flat().includes(z));
  computeDepSelected();
});

computeDepSelected();
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Sélectionner les zones d'alerte</h6>
        <DsfrInputGroup
          :error-message="utils.showInputError(v$, 'zonesAlerte')"
        >
          <DsfrAccordionsGroup>
            <li v-for="d of departementsFiletered">
              <DsfrAccordion
                :expanded-id="expandedIndex"
                @expand="expandedIndex = $event"
              >
                <template #title>
                  <DsfrCheckbox :label="`${d.nom} (${d.nbZonesSelected}/${d.zonesAlerte.length})`"
                                :onUpdate:modelValue="() => selectAll(d)"
                                :checked="d.nbZonesSelected === d.zonesAlerte.length" />
                </template>
                <DsfrCheckboxSet :small="false"
                                 v-model="zonesSelected"
                                 :options="zonesOptionsCheckBox(d)" />
              </DsfrAccordion>
            </li>
          </DsfrAccordionsGroup>
        </DsfrInputGroup>
      </div>
    </div>
  </form>
</template>