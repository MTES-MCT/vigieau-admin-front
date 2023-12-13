<script setup lang="ts">
import { ArreteCadre } from "~/dto/arrete_cadre.dto";
import { helpers, required } from "@vuelidate/validators/dist";
import useVuelidate from "@vuelidate/core";

const props = defineProps<{
  arreteCadre: ArreteCadre,
}>();

const rules = computed(() => {
  return {
    numero: {
      required: helpers.withMessage("Le numéro de l'arrêté est obligatoire.", required)
    }
  };
});

const v$ = useVuelidate(rules, props.arreteCadre);
</script>

<template>
  <form @submit.prevent="">
    <h6>Généralité</h6>
    <DsfrInputGroup>
      <DsfrInput
        id="numero"
        v-model="arreteCadre.numero"
        label="Numéro de l'arrêté"
        label-visible
        type="text"
        name="numero"
        required
      />
    </DsfrInputGroup>
    {{ arreteCadre.departements }}
  </form>
</template>