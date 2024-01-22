<script setup lang="ts">
import type { Ref } from "vue";
import { type ArreteRestriction, ArreteRestrictionStatutFr } from "~/dto/arrete_restriction.dto";
import { useAuthStore } from "~/stores/auth";

const props = defineProps<{
  arreteRestriction: ArreteRestriction;
}>();

const emit = defineEmits<{
  delete: any;
  repeal: any;
}>();

const authStore = useAuthStore();
const isArOnDepartementUser: boolean = authStore.isMte || props.arreteRestriction.arretesCadre.some(ac => ac.departements.some(d => d.code === authStore.user.roleDepartement));
const arreteRestrictionStatutFr = ArreteRestrictionStatutFr;
const actionsOpened: Ref<boolean> = ref(false);
const arreteRestrictionActions: Ref<any> = ref([
  {
    text: "Modifier",
    show: authStore.isMte
      || (props.arreteRestriction.statut !== "abroge" && isArOnDepartementUser),
    onclick: () => {
      askEditArreteRestriction(props.arreteRestriction);
    }
  },
  // {
  //   text: 'Exporter',
  //   onclick: () => {
  //     console.log('click');
  //   },
  // },
  {
    text: "Dupliquer",
    onclick: () => {
      navigateTo(`/arrete-restriction/${props.arreteRestriction.id}/duplication`);
    },
    show: true
  },
  {
    text: "Abroger",
    show: ["a_venir", "publie"].includes(props.arreteRestriction.statut) && isArOnDepartementUser,
    onclick: () => {
      repealModalOpened.value = true;
    }
  },
  {
    text: "Supprimer",
    show: authStore.isMte || isArOnDepartementUser,
    onclick: () => {
      askDeleteArreteRestriction(props.arreteRestriction);
    }
  }
]);

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
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
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeyDown);
});
onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onKeyDown);
});

const api = useApi();
const askDeleteArreteRestriction = async (arreteRestriction: ArreteRestriction) => {
  modalActions.value = [
    {
      label: "Confirmer",
      onclick: () => {
        deleteArreteRestriction(arreteRestriction.id);
      }
    },
    {
      label: "Annuler",
      secondary: true,
      onclick: () => {
        modalOpened.value = false;
      }
    }
  ];
  modalTitle.value = `Suppression d’un arrêté de restriction`;
  modalDescription.value = `Vous confirmez que la suppression de cet arrêté de restriction est justifiée par une erreur de saisie.`;
  modalOpened.value = true;
};
const deleteArreteRestriction = async (id: string) => {
  const { data, error } = await api.arreteRestriction.delete(id);
  if (!error.value) {
    emit("delete");
  }
  modalOpened.value = false;
};

// Permet de faire un retour à la ligne sur les underscores
const numeroToDisplay = computed(() => {
  let num = props.arreteRestriction.numero;
  num = num.replace(/_/g, "_<wbr/>");
  return num;
});

const askEditArreteRestriction = async (arreteRestriction: ArreteRestriction) => {
  modalActions.value = [
    {
      label: "Confirmer",
      "data-cy": "ConfirmEditFormBtn",
      onclick: () => {
        editArreteRestriction(arreteRestriction.id);
      }
    },
    {
      label: "Annuler",
      secondary: true,
      onclick: () => {
        modalOpened.value = false;
      }
    }
  ];
  if (arreteRestriction.statut === "a_valider") {
    editArreteRestriction(arreteRestriction.id);
  } else {
    modalTitle.value = `Modification d’un arrêté de restriction en vigueur`;
    modalDescription.value = `Vous confirmez que les modifications concernent uniquement une erreur de saisie et que cette modification ne nécessite pas la création d’un nouvel arrêté de restriction.`;
    modalOpened.value = true;
  }
};

const editArreteRestriction = (id: string) => {
  navigateTo(`/arrete-restriction/${id}/edition`);
};

const modalOpened: Ref<boolean> = ref(false);
const modalTitle: Ref<string> = ref("");
const modalDescription: Ref<string> = ref("");
const modalActions: Ref<any[]> = ref([]);

const abrogerFormRef = ref(null);
const loading = ref(false);
const repealModalOpened: Ref<boolean> = ref(false);
const repealModalActions: Ref<any[]> = ref([
  {
    label: "Abroger",
    "data-cy": "RepealFormRepealBtn",
    onclick: () => {
      abrogerFormRef.value?.submitForm();
    }
  },
  {
    label: "Annuler",
    secondary: true,
    onclick: () => {
      repealModalOpened.value = false;
    }
  }
]);

const repealArrete = async (ar: ArreteRestriction) => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  const { data, error } = await api.arreteRestriction.repeal(ar.id?.toString(), ar);
  if (!error.value) {
    repealModalOpened.value = false;
    emit("repeal");
  }
  loading.value = false;
};
</script>

<template>
  <div class="fr-card">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          <NuxtLink
            :to="`/arrete-restriction/${arreteRestriction.id}${arreteRestriction.statut === 'a_valider' ? '/edition' : ''}`"
            v-html="numeroToDisplay"
          ></NuxtLink>
        </h3>
        <!--        <p class="fr-card__desc">-->
        <!--          Dep&nbsp;:-->
        <!--          <template v-for="dep in arreteRestriction.departements"> {{ dep.nom }}&nbsp;;</template>-->
        <!--        </p>-->
        <div class="fr-card__start">
          <ul class="fr-badges-group">
            <li>
              <MixinsStatutBadge :statut="arreteRestriction.statut" />
            </li>
          </ul>
          <p class="fr-card__detail">
            <div class="fr-grid-row">
              <VIcon name="ri-calendar-fill" />
              &nbsp;
              {{ arreteRestriction.dateDebut }}
              <span v-if="arreteRestriction.dateFin"> &nbsp;au {{ arreteRestriction.dateFin }} </span>
              <div class="fr-col-12" v-if="arreteRestriction.dateSignature">
                signé le {{ arreteRestriction.dateSignature }}
              </div>
            </div>
          </p>
          <div :id="'action_' + arreteRestriction.id" class="fr-card__actions">
            <DsfrButton 
              label="Actions"
              data-cy="ArreteRestrictionCardActionsBtn"
              icon-only
              secondary 
              icon="ri-more-2-fill" 
              @click="actionsOpened = !actionsOpened" />
            <div v-if="actionsOpened" class="fr-card__actions__menu">
              <div class="fr-menu">
                <ul class="fr-menu__list">
                  <template v-for="action of arreteRestrictionActions">
                    <li v-if="action.show">
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
      <!--      <div class="fr-card__footer">-->
      <!--        <ul class="fr-links-group">-->
      <!--          <li>-->
      <!--            <a class="fr-link fr-icon-arrow-right-line fr-link&#45;&#45;icon-right" href="#"> Arrêté de restriction 1 </a>-->
      <!--          </li>-->
      <!--        </ul>-->
      <!--      </div>-->
    </div>
  </div>
  <DsfrModal :opened="modalOpened" icon="ri-arrow-right-line" :title="modalTitle" :actions="modalActions" @close="modalOpened = false">
    <div v-html="modalDescription"></div>
  </DsfrModal>
  <DsfrModal
    :opened="repealModalOpened"
    icon="ri-arrow-right-line"
    :title="`Abroger l'arrêté ${arreteRestriction.numero}`"
    :actions="repealModalActions"
    @close="repealModalOpened = false"
  >
    <ArreteRestrictionFormAbroger ref="abrogeFormRef" :arreteRestriction="arreteRestriction" @abroger="repealArrete($event)" />
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
