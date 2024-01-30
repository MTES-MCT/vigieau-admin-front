<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators/dist';
import useVuelidate from '@vuelidate/core';
import { ArreteCadre } from '~/dto/arrete_cadre.dto';
import { requiredIf } from "@vuelidate/validators";

const props = defineProps<{
  arreteCadre: ArreteCadre;
}>();

const emit = defineEmits<{
  publier: any;
}>();
const utils = useUtils()
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const rules = computed(() => {
  return {
    dateDebut: {
      required: helpers.withMessage("La date de début de l'arrêté est obligatoire.", required),
    },
    dateFin: {
      minValue: helpers.withMessage("La date de fin de l'arrêté doit être supérieure à la date de début.", (val: string) => {
        if (props.arreteCadre.dateDebut && val) {
          return new Date(val) > new Date(props.arreteCadre.dateDebut);
        }
        return true;
      }),
    },
    file: {
      required: helpers.withMessage("Le PDF de l'arrêté doit être ajouté", requiredIf(() => !props.arreteCadre.url)),
      maxSize: helpers.withMessage("La taille du PDF ne doit pas dépasser 10Mo", (value: any) => {
        return !value || value?.size < MAX_FILE_SIZE
      }),
      maxLength: helpers.withMessage("Le nom du fichier ne doit pas dépasser 50 caractères", (value: any) => {
        return !value || value?.name.length <= 50
      }),
    },
  };
});

const v$ = useVuelidate(rules, props.arreteCadre);

const submitForm = async () => {
  await v$.value.$validate();
  if (!v$.value.$error) {
    emit('publier', props.arreteCadre);
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
            v-model="arreteCadre.dateDebut"
            label="Date de début de l'arrêté"
            label-visible
            type="date"
            name="dateDebut"
            data-cy="PublishFormDateDebutInput"
            :required="true"
          />
        </DsfrInputGroup>
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'dateFin')">
          <DsfrInput id="dateFin"
                     v-model="arreteCadre.dateFin"
                     label="Date de fin de l'arrêté"
                     label-visible
                     type="date"
                     name="dateFin"
                     data-cy="PublishFormDateFinInput" />
        </DsfrInputGroup>
      </div>
    </div>
    
    <div class="fr-mt-4w" v-if="arreteCadre.url">
      <DsfrFileDownload
        format="PDF"
        :href="arreteCadre.url"
        :size="null"
        :download="arreteCadre.url"
        title="PDF Arrête cadre"
        hint="Taille maximale autorisée : 10mo"
      />
    </div>

    <div class="fr-mt-4w">
      <DsfrInputGroup :error-message="utils.showInputError(v$, 'file')">
        <DsfrFileUpload :required="!arreteCadre.url"
                        :label="arreteCadre.url ? 'Modifier le PDF de l\'arrêté cadre' : 'Importer le PDF de l\'arrêté cadre'"
                        :arreteCadrecept="['application/pdf']"
                        data-cy="PublishFormFileInput"
                        @change="arreteCadre.file = $event[0]" />
      </DsfrInputGroup>
    </div>
  </form>
</template>
