<script setup lang="ts">
import type { Ref } from 'vue';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import { ArreteCadreStatutFr } from '~/dto/arrete_cadre.dto';
import { type ArreteRestriction, ArreteRestrictionStatutFr } from "~/dto/arrete_restriction.dto";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
}>();

const emit = defineEmits<{
  delete: any;
}>();

const arreteRestrictionStatutFr = ArreteRestrictionStatutFr;
const frBadgeClass: Ref<string> = ref('');
const actionsOpened: Ref<boolean> = ref(false);
const arreteRestrictionActions: Ref<any> = ref([
  {
    text: 'Créer un arrêté de restriction associé',
    onclick: () => {
      console.log('click');
    },
  },
  {
    text: 'Modifier',
    onclick: () => {
      navigateTo(`/arrete-restriction/${props.arreteRestriction.id}/edition`);
    },
  },
  {
    text: 'Exporter',
    onclick: () => {
      console.log('click');
    },
  },
  {
    text: 'Dupliquer',
    onclick: () => {
      navigateTo(`/arrete-restriction/${props.arreteRestriction.id}/duplication`);
    },
  },
  {
    text: 'Supprimer',
    onclick: () => {
      deleteArreteCadre(props.arreteRestriction.id);
    },
  },
]);

switch (props.arreteRestriction.statut) {
  case 'a_valider':
    frBadgeClass.value = 'fr-badge--info';
    break;
  case 'publie':
    frBadgeClass.value = 'fr-badge--success';
    break;
  case 'abroge':
    frBadgeClass.value = '';
    break;
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    actionsOpened.value = false;
  }
};

const onDocumentClick = (e: MouseEvent) => {
  handleElementClick(e.target as HTMLElement);
};

const handleElementClick = (el: HTMLElement) => {
  if (el === document.getElementById(`action_${props.arreteRestriction.id}`)) {
    return;
  }

  if (!el?.parentNode) {
    actionsOpened.value = false;
    return;
  }

  handleElementClick(el.parentNode as HTMLElement);
};

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeyDown);
});
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onKeyDown);
});

const api = useApi();
const deleteArreteRestriction = async (id: string) => {
  const { data, error } = await api.arreteRestriction.delete(id);
  if (!error.value) {
    emit('delete');
  }
};

// Permet de faire un retour à la ligne sur les underscores
const numeroToDisplay = computed(() => {
  let num = props.arreteRestriction.numero;
  num = num.replace(/_/g, '_<wbr/>');
  return num;
});
</script>

<template>
  <div class="fr-card">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <NuxtLink :to="'/arrete-restriction/' + arreteRestriction.id" v-html="numeroToDisplay"></NuxtLink>
        </h3>
<!--        <p class="fr-card__desc">-->
<!--          Dep&nbsp;:-->
<!--          <template v-for="dep in arreteRestriction.departements"> {{ dep.nom }}&nbsp;;</template>-->
<!--        </p>-->
        <div class="fr-card__start">
          <ul class="fr-badges-group">
            <li>
              <DsfrBadge :label="arreteRestrictionStatutFr[arreteRestriction.statut]" :class="frBadgeClass" :type="null" :no-icon="true" />
            </li>
          </ul>
          <p class="fr-card__detail">
            <VIcon name="ri-calendar-fill" />
            &nbsp;
            {{ arreteRestriction.dateDebut }}
            <span v-if="arreteRestriction.dateFin"> &nbsp;au {{ arreteRestriction.dateFin }} </span>
          </p>
<!--          <div :id="'action_' + arreteRestriction.id" class="fr-card__actions">-->
<!--            <DsfrButton label="Actions" icon-only secondary icon="ri-more-2-fill" @click="actionsOpened = !actionsOpened" />-->
<!--            <div v-if="actionsOpened" class="fr-card__actions__menu">-->
<!--              <div class="fr-menu">-->
<!--                <ul class="fr-menu__list">-->
<!--                  <li v-for="action of arreteRestrictionActions">-->
<!--                    <a-->
<!--                      class="fr-nav__link"-->
<!--                      @click="-->
<!--                        action.onclick();-->
<!--                        actionsOpened = false;-->
<!--                      "-->
<!--                    >-->
<!--                      {{ action.text }}-->
<!--                    </a>-->
<!--                  </li>-->
<!--                </ul>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
        </div>
      </div>
<!--      <div class="fr-card__footer">-->
<!--        <ul class="fr-links-group">-->
<!--          <li>-->
<!--            <a class="fr-link fr-icon-arrow-right-line fr-link&#45;&#45;icon-right" href="#"> Arrêté de restriction 1 </a>-->
<!--          </li>-->
<!--        </ul>-->
<!--      </div>-->
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
