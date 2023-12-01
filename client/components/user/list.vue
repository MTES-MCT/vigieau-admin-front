<script setup lang="ts">
import type { Ref } from 'vue'
import api from '../../api'
import type { User } from '~/dto/user.dto'
import { UserRole } from '~/dto/user.dto'
import { useAuthStore } from '~/stores/auth'

const title = 'Utilisateurs'
const headers = ['Nom', 'Prénom', 'Email', 'Rôle', '', '']
const noCaption = false
const pagination = true
const users: Ref<User[]> = ref([])
const rows: Ref<any[]> = ref([])
const loading: Ref<boolean> = ref(false)
const modalEditOpened: Ref<boolean> = ref(false)
const modalDeleteOpened: Ref<boolean> = ref(false)
const modalTitle: Ref<string> = ref('')
const modalText: Ref<string> = ref('')
const modalIcon: Ref<string> = ref('')
const modalActions: Ref<any[]> = ref([])
const userToEdit: Ref<User> = ref(null)
const userFormRef = ref(null)
const componentKey = ref(0)

const authStore = useAuthStore()

const generateRows = () => {
  rows.value = [...users.value.map((d: User) => {
    return [
      d.lastName || '', d.firstName || '', d.email,
      `${UserRole[d.role]} ${d.role === 'departement' ? ` (${d.roleDepartement})` : ''}`, 
      authStore.isMte ? {
        component: 'DsfrButton',
        label: 'Modifier',
        icon: 'ri-ball-pen-line',
        iconOnly: true,
        onclick: () => askEditUser(d),
      } : '', {
        component: 'DsfrButton',
        label: 'Supprimer',
        icon: 'ri-delete-bin-5-line',
        iconOnly: true,
        onclick: () => askDeleteUser(d),
      },
    ]
  })]
  componentKey.value += 1
}

const { data, error } = await api.getUsers()
if (data.value) {
  users.value = data.value
  generateRows()
}

const askEditUser = (user) => {
  modalDeleteOpened.value = false
  modalEditOpened.value = true
  modalTitle.value = 'Modification d\'un utilisateur'
  modalIcon.value = 'ri-ball-pen-line'
  userToEdit.value = user
  modalActions.value = [
    {
      label: 'Annuler',
      onclick: closeModal,
    },
    {
      label: 'Enregistrer',
      onclick: validateEditUserForm,
    },
  ]
}

const askAddUser = () => {
  modalDeleteOpened.value = false
  modalEditOpened.value = true
  modalTitle.value = 'Ajout d\'un utilisateur'
  modalIcon.value = 'ri-ball-pen-line'
  userToEdit.value = null
  modalActions.value = [
    {
      label: 'Annuler',
      onclick: closeModal,
    },
    {
      label: 'Enregistrer',
      onclick: validateEditUserForm,
    },
  ]
}

const askDeleteUser = (user) => {
  modalEditOpened.value = false
  modalDeleteOpened.value = true
  modalTitle.value = 'Suppression d\'un utilisateur'
  modalIcon.value = 'ri-delete-bin-5-line'
  modalText.value = `<p>Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName || ''} ${user.lastName || ''} (${user.email}) ?</p>`
  userToEdit.value = user
  modalActions.value = [
    {
      label: 'Annuler',
      onclick: closeModal,
    },
    {
      label: 'Supprimer',
      onclick: deleteUser,
    },
  ]
}
const closeModal = () => {
  modalEditOpened.value = false
  modalDeleteOpened.value = false
}

const deleteUser = async () => {
  const { data, error } = await api.deleteUser(userToEdit.value.email)
  closeModal()
  if (!error.value) {
    users.value = users.value.filter((u: User) => u.email !== userToEdit.value.email)
    generateRows()
  } else {
    // TODO DISPLAY ERROR
  }
}

const createEditUser = async (user: any) => {
  const { data, error } = user.isNewUser ? await api.createUser(user) : await api.editUser(user)
  closeModal()
  if (!error.value) {
    if (user.isNewUser) {
      users.value.push(data.value)
    } else {
      users.value = users.value.map((u: User) => u.email === user.email ? data.value : u)
    }
    generateRows()
  } else {
    // TODO DISPLAY ERROR
  }
}

const validateEditUserForm = () => {
  userFormRef.value.submitForm()
}
</script>

<template>
  <DsfrButton
    label="Ajouter un utilisateur"
    @click="askAddUser()"
  />
  <DsfrTable
    :title="title"
    :headers="headers"
    :rows="rows"
    :no-caption="noCaption"
    :pagination="pagination"
    :key="componentKey"
  />
  <DsfrModal
    :opened="modalEditOpened"
    :title="modalTitle"
    :icon="modalIcon"
    :actions="modalActions"
    @close="closeModal"
  >
    <UserForm
      ref="userFormRef"
      :user="userToEdit"
      :loading="loading"
      @createEdit="createEditUser($event)"
    />
  </DsfrModal>
  <DsfrModal
    :opened="modalDeleteOpened"
    :title="modalTitle"
    :icon="modalIcon"
    :actions="modalActions"
    @close="closeModal"
  >
    <div v-html="modalText" />
  </DsfrModal>
</template>
