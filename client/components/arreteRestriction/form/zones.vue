<script setup lang="ts">
import type { ArreteRestriction } from '~/dto/arrete_restriction.dto';
import { useRefDataStore } from '~/stores/refData';
import type { Ref } from 'vue';
import { helpers } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import type { Departement } from '~/dto/departement.dto';
import type { ZoneAlerte } from '~/dto/zone_alerte.dto';
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
  selected: boolean;
}>();

const refDataStore = useRefDataStore();
const utils = useUtils();
const zonesSelected: Ref<number[]> = ref(props.arreteRestriction.restrictions.filter((r) => !r.isAep).map((r) => r.zoneAlerte.id));
const acFiltered: Ref<any[]> = ref([]);

const rules = computed(() => {
  return {
    restrictions: {
      required: helpers.withMessage("L'arrêté doit être lié à au moins une zone d'alerte.", () => {
        return props.arreteRestriction.restrictions.filter((r) => !r.isAep).length > 0;
      }),
    },
  };
});

const v$ = useVuelidate(rules, props.arreteRestriction);

const zonesOptionsCheckBox = (ac: ArreteCadre, type: string) => {
  const arsAssociated = ac.arretesRestriction.filter((ar) => ar.id !== props.arreteRestriction.id);
  return ac.zonesAlerte
    .filter((z) => z.type === type)
    .map((z) => {
      return {
        id: z.id,
        name: z.id,
        label: `${z.code} ${z.nom}`,
        isArAssociated: arsAssociated.some((ar) => ar.restrictions.some((r) => r.zoneAlerte?.id === z.id)),
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

const computeZonesSelected = () => {
  acFiltered.value.forEach((ac) => {
    ac.nbZonesSelected = zonesSelected.value.filter((z) => ac.zonesAlerte.map((za: ZoneAlerte) => za.id).includes(z)).length;
  });
};

const onChange = ({ name, checked }: { name: number; checked: boolean }) => {
  zonesSelected.value = checked ? [...zonesSelected.value, name] : zonesSelected.value.filter((val) => val !== name);
};

watch(zonesSelected, () => {
  const zones = refDataStore.zonesAlerte.filter((z) => zonesSelected.value.includes(z.id));
  props.arreteRestriction.restrictions = props.arreteRestriction.restrictions.filter(
    (r) => r.isAep || zonesSelected.value.includes(r.zoneAlerte.id),
  );
  const newZones = zones.filter((z) => !props.arreteRestriction.restrictions.some((r) => r.zoneAlerte?.id === z.id));
  newZones.forEach((z) => {
    let usagesAc = props.arreteRestriction.arretesCadre
      .filter((ac) => ac.zonesAlerte?.some(za => za.id === z.id))
      .map((ac) => ac.usagesArreteCadre).flat();
    usagesAc = usagesAc.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.usage.id === value.usage.id
        ))
    ).map(u => {
      u.id = null;
      return u;
    });
    props.arreteRestriction.restrictions.push({
      id: null,
      zoneAlerte: z,
      niveauGravite: null,
      usagesArreteRestriction: usagesAc,
      isAep: false,
      communes: null,
      nomGroupementAep: null,
      communesText: undefined,
    });
  });
  computeZonesSelected();
});

watch(
  () => props.arreteRestriction.arretesCadre,
  () => {
    if (!props.arreteRestriction) {
      return;
    }
    // On récupère le tableau de départements des arrêtés cadres
    const departement = props.arreteRestriction.departement;
    acFiltered.value = props.arreteRestriction.arretesCadre.map((ac) => {
      return {
        ...ac,
        zonesAlerte: ac.zonesAlerte.filter((z) => z.departement.id === departement?.id),
      };
    });
    const allZones = acFiltered.value.flatMap((ac) => ac.zonesAlerte);
    
    zonesSelected.value = zonesSelected.value.filter((z) => allZones.map((za: ZoneAlerte) => za.id).includes(z));
    computeZonesSelected();
  },
  { immediate: true },
);

computeZonesSelected();

defineExpose({
  v$,
});
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-6">
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'restrictions')">
          <div v-for="ac of acFiltered">
            <div class="zone-alerte__title">
              <h6>Zones d'alerte de l'arrêté {{ ac.numero }} ({{ ac.nbZonesSelected }}/{{ ac.zonesAlerte.length }})</h6>
              <div>
                Tout sélectionner
                <DsfrCheckbox :onUpdate:modelValue="() => selectAll(ac)"
                              :disabled="ac.zonesAlerte.length < 1"
                              :checked="ac.nbZonesSelected === ac.zonesAlerte.length" />
              </div>
            </div>
            <div class="zone-alerte__body" v-if="zonesOptionsCheckBox(ac, 'SUP').length > 0">
              <p><b>Eaux superficielles</b></p>
              <div class="form-group fr-fieldset fr-mt-2w">
                <DsfrCheckbox
                  v-for="option in zonesOptionsCheckBox(ac, 'SUP')"
                  :id="option.id"
                  :key="option.id || option.name"
                  :name="option.name"
                  :model-value="zonesSelected.includes(option.name)"
                  :small="false"
                  @update:model-value="onChange({ name: option.name, checked: $event })"
                >
                  <template #label>
                    {{ option.label }}
                    <div class="checkbox-label-info" v-if="option.isArAssociated">
                      <VIcon name="ri-information-fill" />
                      Cette zone est utilisée dans un autre arrêté de restriction actif
                    </div>
                  </template>
                </DsfrCheckbox>
              </div>
            </div>
            <div class="zone-alerte__body" v-if="zonesOptionsCheckBox(ac, 'SOU').length > 0">
              <p><b>Eaux souterraines</b></p>
              <div class="form-group fr-fieldset fr-mt-2w">
                <DsfrCheckbox
                  v-for="option in zonesOptionsCheckBox(ac, 'SOU')"
                  :id="option.id"
                  :key="option.id || option.name"
                  :name="option.name"
                  :model-value="zonesSelected.includes(option.name)"
                  :small="false"
                  @update:model-value="onChange({ name: option.name, checked: $event })"
                >
                  <template #label>
                    {{ option.label }}
                    <div class="checkbox-label-info" v-if="option.isArAssociated">
                      <VIcon name="ri-information-fill" />
                      Cette zone est utilisée dans un autre arrêté de restriction actif
                    </div>
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
