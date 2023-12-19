<script setup lang="ts">

import useVuelidate from "@vuelidate/core/dist";
import { required } from "@vuelidate/validators/dist";
import { Usage } from "~/dto/usage.dto";
import { useRefDataStore } from "~/stores/refData";
import { helpers } from "@vuelidate/validators";

const props = defineProps<{
  usage: Usage,
  loading: boolean
}>();

const emit = defineEmits<{
  createEdit: any;
}>();

const utils = useUtils();
const refDataStore = useRefDataStore();
const thematiquesOptions = refDataStore.thematiques.map(t => {
  return {
    value: t.id,
    text: t.nom
  };
});

console.log(props.usage);

const concernes = [{
  attribute: "concerneParticulier",
  name: "Particulier"
}, {
  attribute: "concerneEntreprise",
  name: "Entreprise"
}, {
  attribute: "concerneCollectivite",
  name: "Collectivité"
}, {
  attribute: "concerneExploitation",
  name: "Exploitant agricole"
}];

const rules = computed(() => {
  return {
    nom: { required: helpers.withMessage("Le nom est obligatoire.", required) },
    thematique: { required: helpers.withMessage("La thématique est obligatoire.", required) },
    concerneParticulier: { required },
    concerneEntreprise: { required },
    concerneCollectivite: { required },
    concerneExploitation: { required }
  };
});

const v$ = useVuelidate(rules, props.usage);

const submitForm = async () => {
  await v$.value.$validate();
  if (!v$.value.$error && !props.loading) {
    emit("createEdit", props.usage);
  }
};

const thematiqueSelected = ($event: number) => {
  props.usage.thematique = refDataStore.thematiques.findLast(t => t.id == $event);
};

defineExpose({
  submitForm
});
</script>

<template>
  <div class="divider fr-mb-2w" />
  <h6>Informations</h6>
  <DsfrInputGroup
    :error-message="utils.showInputError(v$, 'nom')"
  >
    <DsfrInput
      id="nom"
      v-model="usage.nom"
      label="Nom de l'usage"
      label-visible
      type="text"
      name="nom"
      :required="true"
    />
  </DsfrInputGroup>
  <DsfrInputGroup
    :error-message="utils.showInputError(v$, 'thematique')"
  >
    <DsfrSelect
      :required="true"
      label="Choisir une thématique pour l'affichage dans VigiEau"
      :options="thematiquesOptions"
      :value="usage.thematique?.id"
      @update:modelValue="thematiqueSelected"
    />
  </DsfrInputGroup>
  <div class="fr-my-2w">Usagers</div>
  <DsfrInputGroup
    v-for="concerne of concernes"
    :error-message="utils.showInputError(v$, concerne.attribute)"
  >
    <DsfrCheckbox
      :label="concerne.name"
      :name="concerne.attribute"
      v-model="usage[concerne.attribute]"
    />
  </DsfrInputGroup>
</template>