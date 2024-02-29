<script setup lang="ts">
import type { Restriction } from '~/dto/restriction.dto';
import { helpers, required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import type { Commune } from '~/dto/commune.dto';

const props = defineProps<{
  restriction: Restriction;
  communes: Commune[];
  zonesAep: Restriction[];
}>();

const emit = defineEmits<{
  createEdit: any;
}>();

const rules = computed(() => {
  return {
    nomGroupementAep: {
      required: helpers.withMessage('Le nom du groupement est obligatoire.', required),
      different: helpers.withMessage('Ce nom de groupement existe déjà, veuillez en choisir un autre.', (value: string) => {
        const existingNames = props.zonesAep.map((r) => r.nomGroupementAep);
        return !existingNames.includes(value);
      })
    },
    communes: {
      required: helpers.withMessage('Le groupement de communes doit contenir au moins un code INSEE.', required),
    },
  };
});
const utils = useUtils();

const parseCommunes = (communesText: string) => {
  const inseeRegex = new RegExp('(0[1-9]|[1-9][ABab\\d])\\d{3}', 'gim');
  const codesExtracted = communesText?.match(inseeRegex);
  if(!codesExtracted) {
    return;
  }
  props.restriction.communes = props.communes.filter((c) => codesExtracted.includes(c.code));
};

const v$ = useVuelidate(rules, props.restriction, { $scope: false });

const submitForm = async () => {
  await v$.value.$validate();
  if (!v$.value.$error) {
    emit('createEdit', props.restriction);
  }
};

defineExpose({
  submitForm,
});

props.restriction.communesText = props.restriction.communes?.map((c) => c.code).join('\n');
</script>

<template>
  <form @submit.prevent="">
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <h6>Informations</h6>
        <DsfrInputGroup :error-message="utils.showInputError(v$, 'nomGroupementAep')">
          <DsfrInput
            v-model="restriction.nomGroupementAep"
            data-cy="GroupementCommunesFormNomInput"
            label="Nom du groupement"
            label-visible
            required
            type="text"
          />
        </DsfrInputGroup>

        <DsfrAlert
          type="info"
          title="Liste des codes INSEE par département"
          description="Pour créer vos groupement de commune, vous allez devoir nous fournir les codes INSEE de chaque commune. Copier / coller à partir de la liste des codes correspondant à un groupement."
          class="fr-mb-2w"
        />

        <DsfrInputGroup :error-message="utils.showInputError(v$, 'communes')">
          <DsfrInput
            :model-value="restriction.communesText"
            @update:modelValue="parseCommunes($event)"
            data-cy="GroupementCommunesFormNomInput"
            label="Coller ici votre la liste de code INSEE  correspondant aux communes de la zone."
            label-visible
            isTextarea
            required
            type="text"
          />
        </DsfrInputGroup>
        
        {{ props.restriction.communes?.length }} communes associées
      </div>
    </div>
  </form>
</template>
