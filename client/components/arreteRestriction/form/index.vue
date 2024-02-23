<script setup lang="ts">
import type { Ref } from 'vue';
import { ArreteRestriction } from "~/dto/arrete_restriction.dto";
import { ArreteCadre } from "~/dto/arrete_cadre.dto";

const props = defineProps<{
  duplicate?: boolean;
}>();

const arreteRestriction: Ref<ArreteRestriction> = ref();

const route = useRoute();
const api = useApi();
const isNewArreteRestriction = route.params.id === 'nouveau';
const mounted = ref(false);

const initSticky = () => {
  window.onscroll = function () {
    isStickyButtons();
  };
  const ro = new ResizeObserver(() => {
    isStickyButtons();
  });
  if(document.querySelector('.fr-tabs')) {
    ro.observe(document.querySelector('.fr-tabs'));
  }
  let footer = document.getElementsByTagName('footer')[0];
  const sticky = footer.offsetHeight;

  const isStickyButtons = () => {
    const buttons = document.getElementsByClassName('fr-btns-group--sticky')[0];
    const buttonsShadow = document.getElementsByClassName('fr-btns-group--shadow-sticky')[0];
    if (!buttons) {
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
  if(route.query.arretecadre) {
    const { data, error } = await api.arreteCadre.get(route.query.arretecadre.toString());
    if(data.value) {
      newAr.arretesCadre = [data.value];
      newAr.departement = data.value?.departements[0];
    }
  }
  arreteRestriction.value = newAr;
} else {
  const { data, error } = await api.arreteRestriction.get(isNewArreteRestriction && route.query.arreterestriction ?
    <string>route.query.arreterestriction : <string>route.params.id);
  if (data.value) {
    arreteRestriction.value = <ArreteRestriction>data.value;
    if(route.query.arreterestriction) {
      arreteRestriction.value.arreteRestrictionAbroge = <ArreteRestriction>{
        id: data.value.id,
        numero: data.value.numero
      };
    }
    if (props.duplicate || route.query.arreterestriction) {
      arreteRestriction.value.id = null;
      arreteRestriction.value.statut = 'a_valider';
      arreteRestriction.value.dateDebut = null;
      arreteRestriction.value.dateFin = null;
      arreteRestriction.value.dateSignature = null;
      arreteRestriction.value.fichier = null;
      arreteRestriction.value.restrictions = arreteRestriction.value.restrictions.filter((r) => {
        return !r.zoneAlerte.disabled;
      });
      arreteRestriction.value.restrictions.map((r) => {
        r.id = null;
        return r;
      });
    }
  }
}
if (mounted.value) {
  initSticky();
}

onMounted(() => {
  mounted.value = true;
  if (arreteRestriction.value) {
    initSticky();
  }
})
</script>

<template>
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
