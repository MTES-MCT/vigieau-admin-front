<script setup lang="ts">
import type { ArreteCadre } from '~/dto/arrete_cadre.dto'
import { ArreteCadreStatutFr } from "~/dto/arrete_cadre.dto";
import type { Ref } from "vue";

const props = defineProps<{
  arreteCadre: ArreteCadre,
}>()

const emit = defineEmits<{
  clickArreteCadre: any;
}>()

const arreteCadreStatutFr = ArreteCadreStatutFr
const frBadgeClass: Ref<string> = ref('')
const arreteCadreActions: Ref<any> = ref({
  title: 'plep',
  links: [
    {
      text : "Lien 1",
      to : "#"
    }
  ]
})

switch (props.arreteCadre.statut) {
  case 'a_valider':
    frBadgeClass.value = 'fr-badge--info'
    break;
  case 'publie':
    frBadgeClass.value = 'fr-badge--success'
    break;
  case 'abroge':
    frBadgeClass.value = ''
    break;
}
</script>

<template>
  <div class="fr-card">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <a href="#" @click="emit('clickArreteCadre')">{{ arreteCadre.numero }}</a>
        </h3>
        <p class="fr-card__desc">
          Dep&nbsp;:
          <template v-for="dep in arreteCadre.departements">
            {{ dep.nom }}&nbsp;;
          </template>
        </p>
        <div class="fr-card__start">
          <ul class="fr-badges-group">
            <li>
              <DsfrBadge
                :label="arreteCadreStatutFr[arreteCadre.statut]"
                :class="frBadgeClass"
                :type="null"
                :no-icon="true"
              />
            </li>
            <li>
              <DsfrBadge
                label="Restrictions associés"
                class="fr-badge--restrictions"
                :no-icon="true"
              />
            </li>
          </ul>
          <p class="fr-card__detail">
            <VIcon name="ri-arrow-right-line"/>
            {{ arreteCadre.dateDebut }}
            <span v-if="arreteCadre.dateFin">
              &nbsp;au {{ arreteCadre.dateFin}}
            </span>
          </p>
          <div class="fr-card__actions">
<!--            <DsfrNavigation :nav-items="[arreteCadreActions]"/>-->
<!--            <DsfrButton :icon-only="true"-->
<!--                        :secondary="true"-->
<!--                        icon="ri-more-2-fill"/>-->
          </div>
        </div>
      </div>
      <div class="fr-card__footer">
        <ul class="fr-links-group">
          <li>
            <a
              class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
              href="#"
            >
              Arrêté de restriction 1
            </a>
          </li>
          <li>
            <a
              class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
              href="#"
            >
              Arrêté de restriction 2
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fr-badge--restrictions {
  background-color: var(--purple-glycine-950-100);
  color: var(--purple-glycine-sun-319-moon-630);
}
</style>
