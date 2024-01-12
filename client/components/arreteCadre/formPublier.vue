<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import { ArreteCadre } from '~/dto/arrete_cadre.dto';
import { requiredIf } from "@vuelidate/validators";

const props = defineProps<{
  arreteCadre: ArreteCadre;
  loading: boolean;
}>();

const emit = defineEmits<{
  publier: any;
}>();
const utils = useUtils()
const ac = ref({...props.arreteCadre});

const rules = computed(() => {
  return {
    dateDebut: {
      required: helpers.withMessage("La date de début de l'arrêté est obligatoire.", required),
    },
    dateFin: {
      minValue: helpers.withMessage("La date de fin de l'arrêté doit être supérieure à la date de début.", (val: string) => {
        if (ac.value.dateDebut && val) {
          return new Date(val) > new Date(ac.value.dateDebut);
        }
        return true;
      }),
    },
    file: {
      required: helpers.withMessage("Le PDF de l'arrêté doit être ajouté", requiredIf(() => !ac.value.url)),
    },
  };
});

const v$ = useVuelidate(rules, ac);

const submitForm = async () => {
  await v$.value.$validate();
  if (!v$.value.$error) {
    emit('publier', ac.value);
  }
};

defineExpose({
  submitForm,
});
</script>

<template>
  <form @submit.prevent="">
    <p>Choisissez la date d’entrée en vigueur de l’arrêté et sa date de fin (optionnel)</p>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'dateDebut')">
          <DsfrInput
            id="dateDebut"
            v-model="ac.dateDebut"
            label="Date de début de l'arrêté"
            label-visible
            type="date"
            name="dateDebut"
            :required="true"
          />
        </DsfrInputGroup>
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'dateFin')">
          <DsfrInput id="dateFin" v-model="ac.dateFin" label="Date de fin de l'arrêté" label-visible type="date" name="dateFin" />
        </DsfrInputGroup>
      </div>
    </div>
    
    <div class="fr-mt-4w" v-if="ac.url">
      <DsfrFileDownload
        format="PDF"
        :href="ac.url"
        :size="null"
        :download="ac.url"
        title="PDF Arrête cadre"
      />
    </div>

    <div class="fr-mt-4w">
      <DsfrInputGroup :error-message="utils.showInputError(v$, 'file')">
        <DsfrFileUpload :required="!ac.url"
                        :label="ac.url ? 'Modifier le PDF de l\'arrêté cadre' : 'Importer le PDF de l\'arrêté cadre'"
                        :accept="['application/pdf']"
                        @change="ac.file = $event[0]" />
      </DsfrInputGroup>
    </div>
  </form>
</template>
