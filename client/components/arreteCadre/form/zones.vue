<script setup lang="ts">
import { helpers } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import { useRefDataStore } from '~/stores/refData';
import type { Departement } from '~/dto/departement.dto';
import type { Ref } from 'vue';
import type { ZoneAlerte } from '~/dto/zone_alerte.dto';
import { required } from "@vuelidate/validators";
import { useAuthStore } from "~/stores/auth";

const props = defineProps<{
  arreteCadre: ArreteCadre;
}>();

const refDataStore = useRefDataStore();
const authStore = useAuthStore();
const utils = useUtils();
const zonesSelected: Ref<number[]> = ref(props.arreteCadre.zonesAlerte.map((z) => z.id));
const departementsFiletered: Ref<any[]> = ref([]);
const expandedDepCode: Ref<string | null> = ref(authStore.user?.roleDepartement || null);

const rules = computed(() => {
  return {
    zonesAlerte: {
      required: helpers.withMessage("L'arrêté doit être lié à au moins une zone d'alerte", required),
    },
  };
});

const v$ = useVuelidate(rules, props.arreteCadre);

const zonesOptionsCheckBox = (dep: Departement, type: string) => {
  return dep.zonesAlerte
    .filter((z) => z.type === type)
    .map((z) => {
      return {
        id: z.id,
        name: z.id,
        label: `${z.code} ${z.nom}`,
        isAcAssociated: z.arretesCadre.filter((ac) => ac.id !== props.arreteCadre.id).length > 0,
      };
    });
};

const selectAll = (d: any) => {
  if (d.nbZonesSelected === d.zonesAlerte.length) {
    zonesSelected.value = zonesSelected.value.filter((z) => !d.zonesAlerte.map((za: ZoneAlerte) => za.id).includes(z));
  } else {
    zonesSelected.value = useUtils().mergeArrays(
      zonesSelected.value,
      d.zonesAlerte.map((za: ZoneAlerte) => za.id),
    );
  }
};

const computeDepSelected = () => {
  departementsFiletered.value.forEach((d) => {
    d.nbZonesSelected = zonesSelected.value.filter((z) => d.zonesAlerte.map((za: ZoneAlerte) => za.id).includes(z)).length;
  });
};

const onChange = ({ name, checked }: { name: number; checked: boolean }) => {
  zonesSelected.value = checked ? [...zonesSelected.value, name] : zonesSelected.value.filter((val) => val !== name);
};

const onAccordionClick = (depCode: string) => {
  expandedDepCode.value = depCode !== expandedDepCode.value ? depCode : null;
}

watch(zonesSelected, () => {
  props.arreteCadre.zonesAlerte = refDataStore.zonesAlerte.filter((z) => zonesSelected.value.includes(z.id));
  computeDepSelected();
});

watch(
  () => props.arreteCadre.departements,
  () => {
    departementsFiletered.value = refDataStore.departements.filter((d) => props.arreteCadre.departements.some((ad) => ad.id === d.id));
    zonesSelected.value = zonesSelected.value.filter((z) =>
      departementsFiletered.value
        .map((d: Departement) => d.zonesAlerte.map((za: ZoneAlerte) => za.id))
        .flat()
        .includes(z),
    );
    computeDepSelected();
  },
  { immediate: true }
);

computeDepSelected();

defineExpose({
  v$,
});
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-6">
        <p>
          Sélectionner les zones d’alerte concernées par cet arrêté
        </p>
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'zonesAlerte')">
          <template v-for="(d, index) in departementsFiletered">
            <div class="divider fr-mb-2w"></div>
            <div class="fr-grid-row fr-grid-row--space-between zone-line full-width">
              <h6>{{ d.nom }}</h6>
              <DsfrCheckbox
                label="Tout sélectionner"
                :onUpdate:modelValue="() => selectAll(d)"
                :checked="d.nbZonesSelected === d.zonesAlerte.length"
              />
              <div class="fr-grid-row full-width fr-mt-1w">
                <DsfrAccordion :expanded-id="expandedDepCode"
                               @expand="onAccordionClick(d.code)"
                               class="full-width"
                               :id="d.code">
                  <template v-slot:title>
                    Afficher les {{ d.nbZonesSelected }}/{{ d.zonesAlerte.length }} zones
                  </template>
                  <div class="zone-alerte__body" v-if="zonesOptionsCheckBox(d, 'SUP').length > 0">
                    <p><b>Eaux superficielles</b></p>
                    <div class="form-group fr-fieldset fr-mt-2w">
                      <DsfrCheckbox
                        v-for="option in zonesOptionsCheckBox(d, 'SUP')"
                        :id="option.id"
                        :key="option.id || option.name"
                        :name="option.name"
                        :model-value="zonesSelected.includes(option.name)"
                        :small="false"
                        @update:model-value="onChange({ name: option.name, checked: $event })"
                      >
                        <template #label>
                          {{ option.label }}
                          <div class="checkbox-label-info" v-if="option.isAcAssociated">
                            <VIcon name="ri-information-fill" />
                            Cette zone est utilisée dans un autre arrêté cadre actif
                          </div>
                        </template>
                      </DsfrCheckbox>
                    </div>
                  </div>
                  <div class="zone-alerte__body" v-if="zonesOptionsCheckBox(d, 'SOU').length > 0">
                    <p><b>Eaux souterraines</b></p>
                    <div class="form-group fr-fieldset fr-mt-2w">
                      <DsfrCheckbox
                        v-for="option in zonesOptionsCheckBox(d, 'SOU')"
                        :id="option.id"
                        :key="option.id || option.name"
                        :name="option.name"
                        :model-value="zonesSelected.includes(option.name)"
                        :small="false"
                        @update:model-value="onChange({ name: option.name, checked: $event })"
                      >
                        <template #label>
                          {{ option.label }}
                          <div class="checkbox-label-info" v-if="option.isAcAssociated">
                            <VIcon name="ri-information-fill" />
                            Cette zone est utilisée dans un autre arrêté cadre en vigueur
                          </div>
                        </template>
                      </DsfrCheckbox>
                    </div>
                  </div>
                </DsfrAccordion>
              </div>
            </div>
            <div class="divider fr-mb-2w"></div>
          </template>
        </DsfrInputGroup>
      </div>
    </div>
  </form>
</template>

<style lang="scss">
.zone-line {
  align-items: center;
  
  h6 {
    margin-bottom: 0;
  }

  & > .fr-fieldset__element {
    flex: none;
    margin-bottom: 0;
  }

  .fr-accordion:before {
    box-shadow: none;
  }
}

.zone-alerte {
  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    h6 {
      margin: 0;
    }

    div {
      display: flex;
      align-items: center;

      & > * {
        flex: none;
      }

      .fr-fieldset__element {
        margin-bottom: 1.5rem;
      }
    }
  }

  &__body {
    & > p {
      margin: 0;
    }

    .fr-checkbox-group {
      input[type='checkbox'] + label {
        margin-left: 0;
        padding-right: 3rem;

        &::before {
          left: auto;
          right: 0.5rem;
        }

        &::after {
          content: '';
          display: block;
          position: absolute;
          width: 100%;
          border-top: 1px solid var(--grey-925-125);
          top: -0.5rem;
        }

        .checkbox-label-info {
          display: block;
          color: var(--info-425-625);
          width: 100%;
        }
      }
    }
  }
}
</style>
