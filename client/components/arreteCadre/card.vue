<script setup lang="ts">
import type { Ref } from 'vue';
import type { ArreteCadre } from '~/dto/arrete_cadre.dto';
import { ArreteCadreStatutFr } from '~/dto/arrete_cadre.dto';
import { useAuthStore } from "~/stores/auth";

const props = defineProps<{
  arreteCadre: ArreteCadre;
}>();

const emit = defineEmits<{
  delete: any;
}>();

const authStore = useAuthStore();
const arreteCadreStatutFr = ArreteCadreStatutFr;
const frBadgeClass: Ref<string> = ref('');
const actionsOpened: Ref<boolean> = ref(false);
const arreteCadreActions: Ref<any> = ref([
  // {
  //   text: 'Créer un arrêté de restriction associé',
  //   disabled: true,
  //   onclick: () => {
  //     console.log('click');
  //   },
  // },
  {
    text: 'Modifier',
    hide: props.arreteCadre.statut === 'abroge',
    onclick: () => {
      askEditArreteCadre(props.arreteCadre);
    },
  },
  // {
  //   text: 'Exporter',
  //   disabled: true,
  //   onclick: () => {
  //     console.log('click');
  //   },
  // },
  {
    text: 'Dupliquer',
    onclick: () => {
      navigateTo(`/arrete-cadre/${props.arreteCadre.id}/duplication`);
    },
  },
  {
    text: 'Abroger',
    hide: ['a_valider', 'abroge'].includes(props.arreteCadre.statut),
    onclick: () => {
      repealModalOpened.value = true;
    },
  },
  {
    text: 'Supprimer',
    hide: !authStore.isMte && props.arreteCadre.arretesRestriction.length > 0,
    onclick: () => {
      askDeleteArreteCadre(props.arreteCadre);
    },
  },
]);

switch (props.arreteCadre.statut) {
  case 'a_valider':
    frBadgeClass.value = 'fr-badge--info';
    break;
  case 'a_venir':
    frBadgeClass.value = 'fr-badge--new';
    break;
  case 'publie':
    frBadgeClass.value = 'fr-badge--success';
    break;
  case 'abroge':
    frBadgeClass.value = '';
    break;
}

const arEnVigueur = computed(() => {
  return props.arreteCadre.arretesRestriction?.filter((ar) => ['a_venir', 'publie'].includes(ar.statut));
});
const arBrouillon = computed(() => {
  return props.arreteCadre.arretesRestriction?.filter((ar) => ['a_valider'].includes(ar.statut));
});
const arAbroges = computed(() => {
  return props.arreteCadre.arretesRestriction?.filter((ar) => ['abroge'].includes(ar.statut));
});

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    actionsOpened.value = false;
  }
};

const onDocumentClick = (e: MouseEvent) => {
  handleElementClick(e.target as HTMLElement);
};

const handleElementClick = (el: HTMLElement) => {
  if (el === document.getElementById(`action_${props.arreteCadre.id}`)) {
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
const askDeleteArreteCadre = async(arreteCadre: ArreteCadre) => {
  modalActions.value = [
    {
      label: 'Confirmer',
      onclick: () => {
        deleteArreteCadre(arreteCadre.id);
      }
    },
    {
      label: 'Annuler',
      secondary: true,
      onclick: () => {
        modalOpened.value = false;
      },
    },
  ];
  modalTitle.value = `Suppression d’un arrêté cadre`;
  modalDescription.value = `Vous confirmez que la suppression de cet arrêté cadre est justifiée par une erreur de saisie.`;
  if(arreteCadre.arretesRestriction.length > 0) {
    modalDescription.value += `<br/><br/>Les arrêtés de restriction suivant seront supprimés :`;
    arreteCadre.arretesRestriction.forEach((ar) => {
      modalDescription.value += `<br/>${ar.numero} - ${arreteCadreStatutFr[ar.statut]}`;
    });
  }
  modalOpened.value = true;
};

const deleteArreteCadre = async (id: string) => {
  const { data, error } = await api.arreteCadre.delete(id);
  if (!error.value) {
    emit('delete');
  }
};

// Permet de faire un retour à la ligne sur les underscores
const numeroToDisplay = computed(() => {
  let num = props.arreteCadre.numero;
  num = num?.replace(/_/g, '_<wbr/>');
  return num;
});

const askEditArreteCadre = async (arreteCadre: ArreteCadre) => {
  modalActions.value = [
    {
      label: 'Confirmer',
      onclick: () => {
        editArreteCadre(arreteCadre.id);
      }
    },
    {
      label: 'Annuler',
      secondary: true,
      onclick: () => {
        modalOpened.value = false;
      },
    },
  ];
  if(arreteCadre.statut === 'a_valider' && arreteCadre.arretesRestriction.length > 0) {
    modalTitle.value = `Modification d’un arrêté cadre avec au moins un arrêté de restriction associé`;
    modalDescription.value = `Vous confirmez prendre en compte que les modifications faites à cet arrêté vont être reportées sur le ou les arrêtés de restriction associés.`;
    modalOpened.value = true;
  } else if (arreteCadre.statut === 'a_valider' && arreteCadre.arretesRestriction.length < 1) {
    editArreteCadre(arreteCadre.id);
  } else if(arreteCadre.arretesRestriction.length < 1) {
    modalTitle.value = `Modification d’un arrêté cadre en vigueur`;
    modalDescription.value = `Vous confirmez que les modifications concernent uniquement une erreur de saisie et que cette modification ne nécessite pas la création d’un nouvel arrêté cadre.`;
    modalOpened.value = true;
  } else {
    modalTitle.value = `Modification d’un arrêté cadre en vigueur avec au moins un arrêté de restriction associé`;
    modalDescription.value = `Vous confirmez que les modifications concernent uniquement une erreur de saisie et que cette modification ne nécessite pas la création d’un nouvel arrêté cadre.<br/><br/>
Vous confirmez prendre en compte que les modifications faites à cet arrêté vont être reportées sur le ou les arrêtés de restriction associés.`;
    modalOpened.value = true;
  }
}

const editArreteCadre = (id: string) => {
  navigateTo(`/arrete-cadre/${id}/edition`);  
}

const modalOpened: Ref<boolean> = ref(false);
const modalTitle: Ref<string> = ref('');
const modalDescription: Ref<string> = ref('');
const modalActions: Ref<any[]> = ref([]);

const abrogerFormRef = ref(null);
const loading = ref(false);
const repealModalOpened: Ref<boolean> = ref(false);
const repealModalActions: Ref<any[]>  = ref([
  {
    label: 'Abroger',
    onclick: () => {
      abrogerFormRef.value?.submitForm();
    },
  },
  {
    label: 'Annuler',
    secondary: true,
    onclick: () => {
      repealModalOpened.value = false;
    },
  },
]);

const repealArrete = async (ac: ArreteCadre) => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  const { data, error } = await api.arreteCadre.repeal(ac.id?.toString(), ac)
  if(data.value) {
    repealModalOpened.value = false;
  }
  loading.value = false;
};
</script>

<template>
  <div class="fr-card" data-cy="ArreteCadreListCard">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <NuxtLink :to="`/arrete-cadre/${arreteCadre.id}${arreteCadre.statut === 'a_valider' ? '/edition' : ''}`" v-html="numeroToDisplay"></NuxtLink>
        </h3>
        <p class="fr-card__desc">
          Dep&nbsp;:
          <template v-for="dep in arreteCadre.departements"> {{ dep.nom }}&nbsp;;</template>
        </p>
        <div class="fr-card__start">
          <ul class="fr-badges-group">
            <li>
              <DsfrBadge :label="arreteCadreStatutFr[arreteCadre.statut]" :class="frBadgeClass" :type="null" :no-icon="true" />
            </li>
          </ul>
          <p class="fr-card__detail">
            <VIcon name="ri-calendar-fill" />
            &nbsp;
            {{ arreteCadre.dateDebut }}
            <span v-if="arreteCadre.dateFin"> &nbsp;au {{ arreteCadre.dateFin }} </span>
          </p>
          <div :id="'action_' + arreteCadre.id" class="fr-card__actions">
            <DsfrButton label="Actions" icon-only secondary icon="ri-more-2-fill" @click="actionsOpened = !actionsOpened" />
            <div v-if="actionsOpened" class="fr-card__actions__menu">
              <div class="fr-menu">
                <ul class="fr-menu__list">
                  <template v-for="action of arreteCadreActions">
                    <li v-if="!action.hide">
                      <a
                        class="fr-nav__link"
                        @click="
                        action.onclick();
                        actionsOpened = false;
                      "
                      >
                        {{ action.text }}
                      </a>
                    </li>                    
                  </template>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="fr-card__footer fr-grid-row" v-if="arreteCadre.arretesRestriction.length > 0">
        <NuxtLink :to="'/arrete-restriction?query=' + arreteCadre.numero"
                  v-if="arEnVigueur.length > 0"
                  class="fr-link fr-icon-arrow-right-line fr-link--icon-right">
          {{ arEnVigueur.length }} arrêté(s) de restriction en vigueur
        </NuxtLink>
        <NuxtLink :to="'/arrete-restriction?query=' + arreteCadre.numero"
                  v-if="arBrouillon.length > 0"
                  class="fr-link fr-icon-arrow-right-line fr-link--icon-right">
          {{ arBrouillon.length }} arrêté(s) de restriction brouillon(s)
        </NuxtLink>
        <NuxtLink :to="'/arrete-restriction?query=' + arreteCadre.numero"
                  v-if="arAbroges.length > 0"
                  class="fr-link fr-icon-arrow-right-line fr-link--icon-right">
          {{ arAbroges.length }} arrêté(s) de restriction abrogé(s)
        </NuxtLink>
      </div>
    </div>
  </div>
  <DsfrModal :opened="modalOpened"
             icon="ri-arrow-right-line"
             :title="modalTitle"
             :actions="modalActions"
             @close="modalOpened = false">
    <div v-html="modalDescription"></div>
  </DsfrModal>
  <DsfrModal :opened="repealModalOpened"
             icon="ri-arrow-right-line"
             :title="`Abroger l'arrêté ${arreteCadre.numero}`"
             :actions="repealModalActions"
             @close="repealModalOpened = false">
    <ArreteCadreFormAbroger ref="abrogerFormRef"
                            :arrete-cadre="arreteCadre"
                            :loading="loading"
                            @abroger="repealArrete($event)" />
  </DsfrModal>
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
