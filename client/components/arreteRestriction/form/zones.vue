<script setup lang="ts">
import type { ArreteRestriction } from '~/dto/arrete_restriction.dto';
import { useRefDataStore } from '~/stores/refData';
import type { Ref } from 'vue';
import { helpers } from '@vuelidate/validators/dist';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import type { Departement } from '~/dto/departement.dto';
import type { ZoneAlerte } from '~/dto/zone_alerte.dto';

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
  selected: boolean;
}>();

const refDataStore = useRefDataStore();
const utils = useUtils();
const zonesSelected: Ref<number[]> = ref(props.arreteRestriction.restrictions.map((r) => r.zoneAlerte.id));
const departementsFiletered: Ref<any[]> = ref([]);

const rules = computed(() => {
  return {
    restrictions: {
      required: helpers.withMessage("L'arrêté doit être lié à au moins une zone d'alerte", required),
    },
  };
});

const v$ = useVuelidate(rules, props.arreteRestriction);

const zonesOptionsCheckBox = (dep: Departement, type: string) => {
  return dep.zonesAlerte
    .filter((z) => z.type === type)
    .map((z) => {
      return {
        id: z.id,
        name: z.id,
        label: `${z.code} ${z.nom}`,
        // isAcAssociated: z.arretesCadre.filter((ac) => ac.id !== props.arreteRestriction.id).length > 0,
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

watch(zonesSelected, () => {
  const zones = refDataStore.zonesAlerte.filter((z) => zonesSelected.value.includes(z.id));
  props.arreteRestriction.restrictions = props.arreteRestriction.restrictions.filter(r => zonesSelected.value.includes(r.zoneAlerte.id));
  const newZones = zones.filter((z) => !props.arreteRestriction.restrictions.some((r) => r.zoneAlerte.id === z.id));
  newZones.forEach((z) => {
    props.arreteRestriction.restrictions.push({
      zoneAlerte: z,
      niveauGravite: null,
      usagesArreteRestriction: [],
    });
  });
  computeDepSelected();
});

watch(
  () => props.arreteRestriction.arretesCadre,
  () => {
    if (!props.arreteRestriction) {
      return;
    }
    // On récupère le tableau de départements des arrêtés cadres
    const departement = props.arreteRestriction.departement;
    const allZones = props.arreteRestriction.arretesCadre.map((ac) => ac.zonesAlerte).flat();
    let depsUnique = departement ? [departement] : [];
    depsUnique = depsUnique.map((d: any) => {
      return {
        ...d,
        zonesAlerte: allZones
          .filter((z) => z.departement.id === d.id)
      };
    });
    departementsFiletered.value = depsUnique;
    zonesSelected.value = zonesSelected.value.filter((z) => allZones.map((za: ZoneAlerte) => za.id).includes(z));
    computeDepSelected();
  },
  { immediate: true },
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
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'restrictions')">
          <div v-for="d of departementsFiletered">
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
<!--                    <div class="checkbox-label-info" v-if="option.isAcAssociated">-->
<!--                      <VIcon name="ri-information-fill" />-->
<!--                      Cette zone est utilisée dans un autre arrêté cadre actif-->
<!--                    </div>-->
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
<!--                    <div class="checkbox-label-info" v-if="option.isAcAssociated">-->
<!--                      <VIcon name="ri-information-fill" />-->
<!--                      Cette zone est utilisée dans un autre arrêté cadre actif-->
<!--                    </div>-->
                  </template>
                </DsfrCheckbox>
              </div>
            </div>
          </div>
        </DsfrInputGroup>
      </div>
      <div class="fr-col-12 fr-col-lg-6">
<!--        <ArreteRestrictionFormZonesMap v-if="selected" :arreteRestriction="arreteRestriction" />-->
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
