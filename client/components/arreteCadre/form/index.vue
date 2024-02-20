<script setup lang="ts">
import { ArreteCadre } from '~/dto/arrete_cadre.dto';
import type { Ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

const props = defineProps<{
  duplicate?: boolean;
}>();

const arreteCadre: Ref<ArreteCadre> = ref();

const route = useRoute();
const api = useApi();
const isNewArreteCadre = route.params.id === 'nouveau';
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

if (isNewArreteCadre && !route.query.arretecadre) {
  arreteCadre.value = new ArreteCadre();
} else {
  const { data, error } = await api.arreteCadre.get(isNewArreteCadre ? <string>route.query.arretecadre : <string>route.params.id);
  if (data.value) {
    arreteCadre.value = <ArreteCadre>data.value;
    if(route.query.arretecadre) {
      arreteCadre.value.arreteCadreAbroge = <ArreteCadre>{
        id: data.value.id,
        numero: data.value.numero
      };
    }
    if (props.duplicate || route.query.arretecadre) {
      arreteCadre.value.id = null;
      arreteCadre.value.statut = 'a_valider';
      arreteCadre.value.dateDebut = null;
      arreteCadre.value.dateFin = null;
      arreteCadre.value.fichier = null;
      arreteCadre.value.usagesArreteCadre.map((u) => {
        u.id = null;
        return u;
      });
      arreteCadre.value.zonesAlerte = arreteCadre.value.zonesAlerte.filter(za => !za.disabled);
    }
    if (arreteCadre.value.departements.length > 1 && arreteCadre.value.departementPilote?.code) {
      const depPiloteIndex = arreteCadre.value.departements.findIndex((d) => d.code === arreteCadre.value.departementPilote.code);
      const depPilote = arreteCadre.value.departements[depPiloteIndex];
      arreteCadre.value.departements.splice(depPiloteIndex, 1);
      arreteCadre.value.departements.splice(0, 0, depPilote);
    }
    if(route.query.arretecadre) {
      // Mettre l'id de l'arrêté abrogeant
    }
  }
}
if (mounted.value) {
  initSticky();
}

onMounted(() => {
  mounted.value = true;
  if (arreteCadre.value) {
    initSticky();
  }
})
</script>

<template>
  <MixinsAlerts class="fr-mb-2w" />
  <h1>
    {{ duplicate ? 'Duplication' : isNewArreteCadre ? 'Création' : 'Edition' }} d'un arrêté cadre
    <MixinsStatutBadge :statut="arreteCadre.statut" />
  </h1>
  <ArreteCadreFormWrapper v-if="arreteCadre" :arreteCadre="arreteCadre" />
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
