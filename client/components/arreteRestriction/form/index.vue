<script setup lang="ts">
import type { Ref } from 'vue';
import { ArreteRestriction } from '~/dto/arrete_restriction.dto';
import { ArreteCadre } from '~/dto/arrete_cadre.dto';

const props = defineProps<{
  duplicate?: boolean;
}>();

const arreteRestriction: Ref<ArreteRestriction> = ref();

const route = useRoute();
const api = useApi();
const isNewArreteRestriction = route.params.id === 'nouveau';
const mounted = ref(false);
const isInitSticky = ref(false);

const initSticky = () => {
  window.onscroll = function () {
    isStickyButtons();
  };
  const ro = new ResizeObserver(() => {
    isStickyButtons();
  });
  const tabs = document.querySelector('.fr-tabs');
  if (tabs) {
    ro.observe(tabs);
    isInitSticky.value = true;
  }
  let footer = document.getElementsByTagName('footer')[0];
  const sticky = footer.offsetHeight;

  const isStickyButtons = () => {
    const buttons = document.getElementsByClassName('fr-btns-group--sticky')[0];
    const buttonsShadow = document.getElementsByClassName('fr-btns-group--shadow-sticky')[0];
    if (!buttons || !buttonsShadow) {
      return;
    }
    if (document.documentElement.offsetHeight - document.documentElement.clientHeight - window.scrollY < sticky) {
      buttonsShadow.classList.remove('visible');
      buttons.classList.remove('sticky');
      buttons.style['padding-left'] = 'initial';
    } else {
      buttonsShadow.classList.add('visible');
      buttons.classList.add('sticky');
      buttons.style['padding-left'] = buttonsShadow.getBoundingClientRect().left + 'px';
    }
  };
};

if (isNewArreteRestriction && !route.query.arreterestriction) {
  const newAr = new ArreteRestriction();
  if (route.query.arretecadre) {
    const { data, error } = await api.arreteCadre.get(route.query.arretecadre.toString());
    if (data.value) {
      newAr.arretesCadre = [data.value];
      newAr.departement = data.value?.departements[0];
    }
  }
  arreteRestriction.value = newAr;
} else {
  const { data, error } = await api.arreteRestriction.get(
    isNewArreteRestriction && route.query.arreterestriction ? <string>route.query.arreterestriction : <string>route.params.id,
  );
  if (data.value) {
    const ar = <ArreteRestriction>data.value;
    // Format restrictions
    ar.restrictions = ar.restrictions.map((r) => {
      if (!r.zoneAlerte) {
        r.isAep = true;
      }
      return r;
    });
    // Format périmètre AR
    if (ar.restrictions.length < 1) {
      ar.perimetreAr = null;
    } else if (ar.restrictions.some((r) => r.isAep) && ar.restrictions.some((r) => !r.isAep)) {
      ar.perimetreAr = 'all';
    } else if (ar.restrictions.some((r) => r.isAep)) {
      ar.perimetreAr = 'aep';
    } else {
      ar.perimetreAr = 'zones';
    }
    if (route.query.arreterestriction) {
      ar.arreteRestrictionAbroge = <ArreteRestriction>{
        id: data.value.id,
        numero: data.value.numero,
      };
    }
    if (props.duplicate || route.query.arreterestriction) {
      ar.id = null;
      ar.statut = 'a_valider';
      ar.dateDebut = null;
      ar.dateFin = null;
      ar.dateSignature = null;
      ar.fichier = null;
      ar.restrictions = ar.restrictions.filter((r) => {
        return !r.zoneAlerte || !r.zoneAlerte.disabled;
      });
      ar.restrictions.map((r) => {
        r.id = null;
        r.usagesArreteRestriction.map((u) => {
          u.id = null;
          return u;
        });
        return r;
      });
    }
    arreteRestriction.value = ar;
  }
}
if (mounted.value && !isInitSticky.value) {
  initSticky();
}

onMounted(() => {
  mounted.value = true;
  if (arreteRestriction.value && !isInitSticky.value) {
    initSticky();
  }
});
</script>

<template>
  <MixinsAlerts class="fr-mb-2w" />
  <h1>
    {{ duplicate ? 'Duplication' : isNewArreteRestriction ? 'Création' : 'Edition' }} d'un arrêté de restriction
    <MixinsStatutBadge :statut="arreteRestriction.statut" />
  </h1>
  <ArreteRestrictionFormWrapper v-if="arreteRestriction" :arreteRestriction="arreteRestriction" />
</template>

<style lang="scss">
.fr-btns-group--sticky {
  &.sticky {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    z-index: 1000;
    background-color: var(--grey-1000-50);
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    padding-top: 1rem;
  }
}

.fr-btns-group--shadow-sticky {
  display: none;
  margin-top: 32px;
  height: 56px;

  &.visible {
    display: block;
  }
}
</style>
