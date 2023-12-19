<script setup lang="ts">

import useVuelidate from "@vuelidate/core/dist";
import { helpers, required, maxLength } from "@vuelidate/validators/dist";
import { Usage } from "~/dto/usage.dto";
import { useRefDataStore } from "~/stores/refData";

const props = defineProps<{
  usage: Usage,
}>();
const utils = useUtils();
const refDataStore = useRefDataStore();
const thematiquesOptions = refDataStore.thematiques.map(t => {
  return {
    value: t.id,
    text: t.nom
  }
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
    nom: { required },
    thematique: { required },
    concerneParticulier: { required },
    concerneEntreprise: { required },
    concerneCollectivite: { required },
    concerneExploitation: { required }
  };
});

const v$ = useVuelidate(rules, props.usage);

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
      :required="required"
      label="Choisir une thématique pour l'affichage dans VigiEau"
      :options="thematiquesOptions"
      v-model="usage.thematique"
    />
  </DsfrInputGroup>
    Thématique affichée sur VigiEau&nbsp;: <b>{{ usage.thematique?.nom }}</b>
  <div>
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
  </div>
</template>