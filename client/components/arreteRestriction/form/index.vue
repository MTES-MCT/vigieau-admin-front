<script setup lang="ts">
import type { Ref } from 'vue';
import { ArreteRestriction } from "~/dto/arrete_restriction.dto";

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

if (isNewArreteRestriction) {
  arreteRestriction.value = new ArreteRestriction();
} else {
  const { data, error } = await api.arreteRestriction.get(<string>route.params.id);
  if (data.value) {
    arreteRestriction.value = <ArreteRestriction>data.value;
    if (props.duplicate) {
      arreteRestriction.value.id = null;
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
