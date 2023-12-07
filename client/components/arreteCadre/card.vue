<script setup lang="ts">
import type { ArreteCadre } from '~/dto/arrete_cadre.dto'

const props = defineProps<{
  arreteCadre: ArreteCadre,
}>()
</script>

<template>
  <div class="fr-card">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <a href="#">{{ arreteCadre.numero }}</a>
        </h3>
        <p class="fr-card__desc">
          Dep&nbsp;:
          <template v-for="dep in arreteCadre.departements">
            {{ dep.nom }}&nbsp;
          </template>
        </p>
        <div class="fr-card__start">
          <ul class="fr-badges-group">
            <li>
              <DsfrBadge
                :label="arreteCadre.statut"
                type="success"
                :no-icon="true"
              />
            </li>
            <li>
              <DsfrBadge
                label="Restrictions associés"
                type="new"
                :no-icon="true"
              />
            </li>
          </ul>
          <p class="fr-card__detail fr-icon-warning-fill">
            {{ arreteCadre.dateDebut }}
          </p>
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
