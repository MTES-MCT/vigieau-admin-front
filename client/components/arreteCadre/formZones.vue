<script setup lang="ts">
import { helpers } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import { useRefDataStore } from '~/stores/refData';
import type { Departement } from '~/dto/departement.dto';
import type { Ref } from 'vue';
import type { ZoneAlerte } from '~/dto/zone_alerte.dto';
import { requiredIf } from '@vuelidate/validators';

const props = defineProps<{
  arreteCadre: ArreteCadre;
  fullValidation: boolean;
  viewOnly: boolean;
}>();

const refDataStore = useRefDataStore();
const utils = useUtils();
const zonesSelected: Ref<number[]> = ref(props.arreteCadre.zonesAlerte.map((z) => z.id));
const departementsFiletered: Ref<any[]> = ref(
  refDataStore.departements.filter((d) => props.arreteCadre.departements.map((ad) => ad.id).includes(d.id)),
);

const rules = computed(() => {
  return {
    zonesAlerte: {
      requiredIf: helpers.withMessage("L'arrêté doit être lié à au moins une zone d'alerte", requiredIf(props.fullValidation)),
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
        label: z.nom,
        isAcAssociated: z.arretesCadre.filter(ac => ac.id !== props.arreteCadre.id).length > 0
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

const onChange = ({ name, checked }: { name: number, checked: boolean }) => {
  zonesSelected.value = checked
    ? [...zonesSelected.value, name]
    : zonesSelected.value.filter(val => val !== name)
}

watch(zonesSelected, () => {
  props.arreteCadre.zonesAlerte = refDataStore.zonesAlerte.filter((z) => zonesSelected.value.includes(z.id));
  computeDepSelected();
});

watch(
  () => props.arreteCadre.departements,
  () => {
    console.log('poulet', props.arreteCadre.departements);
    departementsFiletered.value = refDataStore.departements.filter((d) => props.arreteCadre.departements.map((ad) => ad.id).includes(d.id));
    zonesSelected.value = zonesSelected.value.filter((z) =>
      departementsFiletered.value
        .map((d: Departement) => d.zonesAlerte.map((za: ZoneAlerte) => za.id))
        .flat()
        .includes(z),
    );
    computeDepSelected();
  },
);

computeDepSelected();
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-6">
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'zonesAlerte')">
          <div v-for="d of departementsFiletered">
            <div class="zone-alerte__title">
              <h6>{{ d.nom }} ({{ d.nbZonesSelected }}/{{ d.zonesAlerte.length }})</h6>
              <div>
                Tout sélectionner
                <DsfrCheckbox
                  :onUpdate:modelValue="() => selectAll(d)"
                  :checked="d.nbZonesSelected === d.zonesAlerte.length"
                  :disabled="viewOnly"
                />
              </div>
            </div>
            <div class="zone-alerte__body" v-if="zonesOptionsCheckBox(d, 'SUP').length > 0">
              <p><b>Eaux superficielles</b></p>
              <div class="form-group fr-fieldset fr-mt-2w">
                <DsfrCheckbox
                  v-for="option in zonesOptionsCheckBox(d, 'SUP')"
                  :id="option.id"
                  :key="option.id || option.name"
                  :name="option.name"
                  :disabled="viewOnly"
                  :model-value="zonesSelected.includes(option.name)"
                  :small="false"
                  @update:model-value="onChange({ name: option.name, checked: $event })">
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
                  :disabled="viewOnly"
                  :model-value="zonesSelected.includes(option.name)"
                  :small="false"
                  @update:model-value="onChange({ name: option.name, checked: $event })">
                  <template #label>
                    {{ option.label }}
                    <div v-if="option.isAcAssociated">
                      Poulet
                    </div>
                  </template>
                </DsfrCheckbox>
              </div>
            </div>
          </div>
        </DsfrInputGroup>
      </div>
    </div>
  </form>
</template>

<style lang="scss">
.zone-alerte {
  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;

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
          content: "";
          display: block;
          position: absolute;
          width: 100%;
          border-top: 1px solid var(--grey-925-125);
          top: -0.5rem;
        }
        
        .checkbox-label-info {
          display: block;
          color: var(--info-425-625);
        }
      }
    }
  }
}
</style>
