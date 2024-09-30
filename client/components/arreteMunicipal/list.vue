<script setup lang="ts">
import type { Ref } from 'vue';
import type { PaginatedResult } from '~/dto/paginated_result.dto';
import type { ArreteMunicipal } from '~/dto/arrete_municipal.dto';
import { MixinsStatutBadge } from '#components';
import { useAlertStore } from '~/stores/alert';
import { useAuthStore } from '~/stores/auth';

const arretesMunicipauxPaginated: Ref<PaginatedResult<ArreteMunicipal> | null> = ref(null);
const alertStore = useAlertStore();
const authStore = useAuthStore();
const currentPage = ref(0);
const rows: Ref<any[]> = ref([]);
const loading = ref(false);
const api = useApi();
const utils = useUtils();
const abrogerFormRef = ref(null);
const arreteMunicipalToRepeal: Ref<any> = ref(null);
const repealModalOpened: Ref<boolean> = ref(false);
const deleteModalOpened: Ref<boolean> = ref(false);
const deleteDescriptionModal: Ref<string> = ref('');
const formLink = `https://admin.${useRuntimeConfig().public.domainName}/arrete-municipal/nouveau/edition`;
const repealModalActions: Ref<any[]> = ref([
  {
    label: 'Abroger',
    'data-cy': 'RepealFormRepealBtn',
    onclick: () => {
      abrogerFormRef.value?.submitForm();
    },
  },
  {
    label: 'Annuler',
    secondary: true,
    onclick: () => {
      utils.closeModal(repealModalOpened);
    },
  },
]);

const paginate = async () => {
  loading.value = true;
  const { data, error } = await api.arreteMunicipal.paginate(currentPage.value + 1, undefined, undefined, 10);
  loading.value = false;
  if (data.value) {
    data.value.meta.dsfrPages = Array.from({ length: data.value.meta.totalPages }, (value, index) => {
      return {
        title: `Page ${index + 1}`,
        label: `${index + 1}`,
      };
    });
    arretesMunicipauxPaginated.value = <any>data.value;
    populateTable();
  }
};

const populateTable = () => {
  rows.value = [];
  arretesMunicipauxPaginated.value?.data?.forEach((am: ArreteMunicipal) => {
    rows.value.push(
      [
        am.communes.map(c => {
          return `${c.nom} (${c.code})`;
        }).join(', '),
        {
          component: MixinsStatutBadge,
          statut: am.statut,
        },
        `Du ${utils.formatDate(am.dateDebut)} au ${utils.formatDate(am.dateFin)}`,
        am.fichier ? {
          component: 'DsfrFileDownload',
          format: 'PDF',
          href: am.fichier.url,
          size: utils.fileSizeString(am.fichier.size),
          download: am.fichier.url,
          title: am.fichier.nom,
        } : '',
        {
          component: 'DsfrButton',
          secondary: true,
          text: 'Abroger',
          onClick: () => {
            arreteMunicipalToRepeal.value = am;
            repealModalOpened.value = true;
          },
        },
        authStore.user && authStore.user.role !== 'commune' ?
          {
            component: 'DsfrButton',
            secondary: true,
            text: 'Supprimer',
            onClick: () => {
              arreteMunicipalToRepeal.value = am;
              deleteDescriptionModal.value = `<p>Êtes-vous sûr de vouloir supprimer l'arrêté municipal ?<br/>
Cette action est irréversible.</p>`;
              deleteModalOpened.value = true;
            },
          } : '',
      ],
    );
  });
};

const repealArrete = async (am: ArreteMunicipal) => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  const { data, error } = await api.arreteMunicipal.repeal(am.id?.toString(), am);
  if (!error.value) {
    utils.closeModal(repealModalOpened);
    alertStore.addAlert({
      description: 'Abrogation réussie',
      type: 'success',
    });
  }
  loading.value = false;
  paginate();
};

const deleteArrete = async () => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  const { data, error } = await api.arreteMunicipal.delete(arreteMunicipalToRepeal.value.id?.toString());
  if (!error.value) {
    utils.closeModal(deleteModalOpened);
    alertStore.addAlert({
      description: 'Suppression réussie',
      type: 'success',
    });
  }
  loading.value = false;
  paginate();
};

const headers = ['Communes', 'Statut', 'Dates', 'Arrêté municipal', '', ''];

paginate();
</script>

<template>
  <div class="fr-grid-row fr-grid-row--space-between fr-grid-row--middle fr-mb-2w">
    <h1 class="fr-my-0">
      Les arrêtés municipaux

      <VIcon v-if="loading" name="ri-loader-4-line" animation="spin" :width="40" :height="40" />
    </h1>
    <NuxtLink to="/arrete-municipal/nouveau/edition">
      <DsfrButton label="Créer un nouvel arrêté municipal" data-cy="ArreteMunicipalListAddBtn" />
    </NuxtLink>
    <div class="fr-col-12">
      <h3>Communiquer auprès des communes</h3>
      <span>
        Si vous souhaitez partager à de nouvelles communes le formulaire,  copiez/collez le lien ci-dessous<br />
        <a :href="formLink"
           rel="noopener external"
           target="_blank"
           class="fr-link">
          Lien vers le formulaire
        </a>
      </span><br /><br />
      <span>
        Vous pouvez gérer ici vos demandes de publication d’arrêtés municipaux.
      </span>
    </div>
  </div>
  <template v-if="arretesMunicipauxPaginated">
    <DsfrTable title=""
               :headers="headers"
               :rows="rows"
               :pagination="false" />
    <div class="fr-grid-row fr-grid-row--center fr-mt-2w">
      <DsfrPagination
        v-model:current-page="currentPage"
        :pages="arretesMunicipauxPaginated.meta.dsfrPages"
        @update:current-page="paginate()"
      />
    </div>
  </template>
  <DsfrModal
    :opened="repealModalOpened"
    icon="ri-arrow-right-line"
    title="Abroger l'arrêté municipal"
    :actions="repealModalActions"
    @close="repealModalOpened = utils.closeModal(repealModalOpened);"
  >
    <ArreteMunicipalFormAbroger ref="abrogerFormRef" :arreteMunicipal="arreteMunicipalToRepeal" @abroger="repealArrete($event)" />
  </DsfrModal>
  <MixinsConfirmationModal
    :opened="deleteModalOpened"
    title="Supprimer l'arrêté municipal"
    :description="deleteDescriptionModal"
    @close="deleteModalOpened = utils.closeModal(deleteModalOpened)"
    @confirm="deleteArrete()"
  />
</template>