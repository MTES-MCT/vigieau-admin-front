<script setup lang="ts">
import useVuelidate from '@vuelidate/core/dist';
import { helpers, required, maxLength } from '@vuelidate/validators/dist';
import { UsageArreteCadre } from '~/dto/usage_arrete_cadre.dto';

const props = defineProps<{
  usageArreteCadre: UsageArreteCadre;
}>();
const utils = useUtils();

console.log(props.usageArreteCadre);

props.usageArreteCadre.concerneParticulier = props.usageArreteCadre.concerneParticulier || false;
props.usageArreteCadre.concerneEntreprise = props.usageArreteCadre.concerneEntreprise || false;
props.usageArreteCadre.concerneCollectivite = props.usageArreteCadre.concerneCollectivite || false;
props.usageArreteCadre.concerneExploitation = props.usageArreteCadre.concerneExploitation || false;

const concernes = [
  {
    attribute: 'concerneParticulier',
    name: 'Particulier',
  },
  {
    attribute: 'concerneEntreprise',
    name: 'Entreprise',
  },
  {
    attribute: 'concerneCollectivite',
    name: 'Collectivité',
  },
  {
    attribute: 'concerneExploitation',
    name: 'Exploitant agricole',
  },
];
const niveauxRestriction = [
  {
    attribute: 'descriptionVigilance',
    name: 'Vigilance',
    badgeType: 'info',
  },
  {
    attribute: 'descriptionAlerte',
    name: 'Alerte',
    badgeType: 'new',
  },
  {
    attribute: 'descriptionAlerteRenforcee',
    name: 'Alerte renforcée',
    badgeType: 'warning',
  },
  {
    attribute: 'descriptionCrise',
    name: 'Crise',
    badgeType: 'error',
  },
];

const rules = computed(() => {
  return {
    concerneParticulier: { required },
    concerneEntreprise: { required },
    concerneCollectivite: { required },
    concerneExploitation: { required },
    descriptionVigilance: {
      maxLength: helpers.withMessage('La description ne doit pas dépasser 1000 caractères.', maxLength(1000)),
    },
    descriptionAlerte: {
      maxLength: helpers.withMessage('La description ne doit pas dépasser 1000 caractères.', maxLength(1000)),
    },
    descriptionAlerteRenforcee: {
      maxLength: helpers.withMessage('La description ne doit pas dépasser 1000 caractères.', maxLength(1000)),
    },
    descriptionCrise: {
      maxLength: helpers.withMessage('La description ne doit pas dépasser 1000 caractères.', maxLength(1000)),
    },
  };
});

const v$ = useVuelidate(rules, props.usageArreteCadre);
</script>

<template>
  <h6>{{ usageArreteCadre.usage.nom }}</h6>
  <div>
    Thématique affichée sur VigiEau&nbsp;: <b>{{ usageArreteCadre.usage.thematique.nom }}</b>
  </div>
  <div>
    <div class="fr-my-2w">Usagers</div>
    <DsfrInputGroup v-for="concerne of concernes" :error-message="utils.showInputError(v$, concerne.attribute)">
      <DsfrCheckbox :label="concerne.name" :name="concerne.attribute" v-model="usageArreteCadre[concerne.attribute]" />
    </DsfrInputGroup>
    <div class="fr-my-2w divider" />
    <h6>Niveau de restriction</h6>
    <DsfrAlert type="warning"
               title="Rédaction des mesures"
               class="fr-mb-2w"
               description="Pour permettre aux usagers de VigiEau une bonne compréhension des mesures&nbsp;: -&nbsp;éviter les acronymes -&nbsp;simplifier au maximum les tournures de phrases -&nbsp;ajouter “voir exceptions listées dans l’arrêté préfectoral” lorsque le texte est trop long"/>
    <template v-for="(niveau, index) of niveauxRestriction">
      <div v-if="index !== 0" class="fr-mb-2w divider" />
      <DsfrBadge :label="niveau.name" :type="niveau.badgeType" />
      <DsfrInputGroup :error-message="utils.showInputError(v$, niveau.attribute)">
        <DsfrInput
          :id="niveau.attribute"
          v-model="usageArreteCadre[niveau.attribute]"
          :is-textarea="true"
          label="Ajouter un texte libre"
          label-visible
          type="text"
          :name="niveau.attribute"
        />
        <span class="fr-input-group__sub-hint">{{ usageArreteCadre[niveau.attribute] ? usageArreteCadre[niveau.attribute].length : 0 }}/1000</span>
      </DsfrInputGroup>
    </template>
  </div>
</template>
