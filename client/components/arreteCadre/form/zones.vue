<script setup lang="ts">
import { helpers } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import { useRefDataStore } from '~/stores/refData';
import type { Departement } from '~/dto/departement.dto';
import type { Ref } from 'vue';
import type { ZoneAlerte } from '~/dto/zone_alerte.dto';
import { useAuthStore } from "~/stores/auth";
import { required } from "@vuelidate/validators";

const props = defineProps<{
  arreteCadre: ArreteCadre;
}>();

const refDataStore = useRefDataStore();
const authStore = useAuthStore();
const utils = useUtils();
const zonesSelected: Ref<number[]> = ref(props.arreteCadre.zonesAlerte.map((z) => z.id));
const departementsPiloteFiletered: Ref<any[]> = ref([]);
const departementsFiletered: Ref<any[]> = ref([]);

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
        label: z.nom,
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
  departementsPiloteFiletered.value.forEach((d) => {
    d.nbZonesSelected = zonesSelected.value.filter((z) => d.zonesAlerte.map((za: ZoneAlerte) => za.id).includes(z)).length;
  });
  departementsFiletered.value.forEach((d) => {
    d.nbZonesSelected = zonesSelected.value.filter((z) => d.zonesAlerte.map((za: ZoneAlerte) => za.id).includes(z)).length;
  });
};

const onChange = ({ name, checked }: { name: number; checked: boolean }) => {
  zonesSelected.value = checked ? [...zonesSelected.value, name] : zonesSelected.value.filter((val) => val !== name);
};

watch(zonesSelected, () => {
  props.arreteCadre.zonesAlerte = refDataStore.zonesAlerte.filter((z) => zonesSelected.value.includes(z.id));
  computeDepSelected();
});

watch(
  () => props.arreteCadre.departements,
  () => {
    departementsPiloteFiletered.value = refDataStore.departements.filter((d) => (props.arreteCadre.departements.length < 2 || authStore.user.role === 'mte') ?
      props.arreteCadre.departements.some((ad) => ad.id === d.id) :
      props.arreteCadre.departements.some((ad) => ad.id === d.id) && d.code === authStore.user.roleDepartement
    );
    departementsFiletered.value = refDataStore.departements.filter((d) => props.arreteCadre.departements.some((ad) => ad.id === d.id) && !departementsPiloteFiletered.value.some((dp) => dp.id === d.id));
    zonesSelected.value = zonesSelected.value.filter((z) =>
      [...departementsPiloteFiletered.value, ...departementsFiletered.value]
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
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'zonesAlerte')">
          <div v-for="d of departementsPiloteFiletered">
            <div class="zone-alerte__title">
              <h6>{{ d.nom }} ({{ d.nbZonesSelected }}/{{ d.zonesAlerte.length }})</h6>
              <div>
                Tout sélectionner
                <DsfrCheckbox
                  :onUpdate:modelValue="() => selectAll(d)"
                  :checked="d.nbZonesSelected === d.zonesAlerte.length"
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
                      Cette zone est utilisée dans un autre arrêté cadre actif
                    </div>
                  </template>
                </DsfrCheckbox>
              </div>
            </div>
          </div>
        </DsfrInputGroup>
        <template v-if="departementsFiletered && departementsFiletered.length > 0">
          <h6>Zones d'alertes à compléter par les autres départements</h6>
          <div v-for="d of departementsFiletered" class="fr-grid-row zone-alerte__a-completer">
            <div>
              {{ d.nom }} ({{ d.nbZonesSelected }}/{{ d.zonesAlerte.length }})
            </div>
            <div v-if="d.nbZonesSelected > 0">
              <VIcon name="ri-check-fill" />
              Fait
            </div>
            <div v-else>
              <VIcon name="ri-time-fill" />
              En attente
            </div>
          </div>
        </template>
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
  
  &__a-completer {
    justify-content: space-between;
    
    & > div:not(:first-child) {
      color: var(--blue-france-sun-113-625);
    }
  }
}
</style>
