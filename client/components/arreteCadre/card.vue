<script setup lang="ts">
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";
import { ArreteCadreStatutFr } from "~/dto/arrete_cadre.dto";
import type { Ref } from "vue";

const props = defineProps<{
  arreteCadre: ArreteCadre,
}>();

const arreteCadreStatutFr = ArreteCadreStatutFr;
const frBadgeClass: Ref<string> = ref("");
const actionsOpened: Ref<boolean> = ref(false);
const arreteCadreActions: Ref<any> = ref([
  {
    text: "Créer un arrêté de restriction associé",
    onclick: () => {
      console.log("click");
    }
  },
  {
    text: "Modifier",
    onclick: () => {
      navigateTo(`/arrete-cadre/${props.arreteCadre.id}/edition`)
    }
  },
  {
    text: "Exporter",
    onclick: () => {
      console.log("click");
    }
  },
  {
    text: "Dupliquer",
    onclick: () => {
      navigateTo(`/arrete-cadre/${props.arreteCadre.id}/duplication`)
    }
  },
  {
    text: "Supprimer",
    onclick: () => {
      console.log("click");
    }
  }
]);

switch (props.arreteCadre.statut) {
  case "a_valider":
    frBadgeClass.value = "fr-badge--info";
    break;
  case "publie":
    frBadgeClass.value = "fr-badge--success";
    break;
  case "abroge":
    frBadgeClass.value = "";
    break;
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    actionsOpened.value = false;
  }
}

const onDocumentClick = (e: MouseEvent) => {
  handleElementClick(e.target as HTMLElement)
}

const handleElementClick = (el: HTMLElement) => {
  if (el === document.getElementById(`action_${props.arreteCadre.id}`)) {
    return
  }

    if (!el?.parentNode) {
      actionsOpened.value = false;
    return
  }

  handleElementClick(el.parentNode as HTMLElement)
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="fr-card">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <NuxtLink :to="'/arrete-cadre/' + arreteCadre.id">
            {{ arreteCadre.numero }}
          </NuxtLink>
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
          </ul>
          <p class="fr-card__detail">
            <VIcon name="ri-calendar-fill" />
            &nbsp;
            {{ arreteCadre.dateDebut }}
            <span v-if="arreteCadre.dateFin">
              &nbsp;au {{ arreteCadre.dateFin }}
            </span>
          </p>
          <div class="fr-card__actions"
               :id="'action_' + arreteCadre.id">
            <DsfrButton label="Actions"
                        icon-only
                        secondary
                        icon="ri-more-2-fill"
                        @click="actionsOpened = !actionsOpened" />
            <div class="fr-card__actions__menu"
                 v-if="actionsOpened">
              <div class="fr-menu">
                <ul class="fr-menu__list">
                  <li v-for="action of arreteCadreActions">
                    <a class="fr-nav__link" @click="action.onclick(); actionsOpened = false;">
                      {{ action.text }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
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

.fr-card__actions {
  position: absolute;
  top: 2rem;
  right: 2rem;

  &__menu {
    z-index: 1;
    position: absolute;
    top: 40px;
    
    ul {
      list-style-type: none;
      
      li {
        padding: 0;
      }
    }

    a:not([href]) {
      color: inherit;
      
      &:hover {
        background-color: var(--hover-tint);
        --underline-hover-width: var(--underline-max-width);
      }
    }
  }
}
</style>
