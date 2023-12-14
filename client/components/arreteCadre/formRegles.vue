<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators/dist";
import useVuelidate from "@vuelidate/core";
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";

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
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-lg-6">
        <h6>Cas particuliers</h6>
      </div>
    </div>
  </form>
</template>