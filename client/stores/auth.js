import { defineStore } from 'pinia'
import api from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const isAuthenticated = computed(async () => {
    if (user.value) {
      return true
    }
    // GET USER
    const { data, error } = await api.getUser()
    if (data.value) {
      user.value = data.value
      return true
    }
    return false
  })

  const isMte = computed(() => {
    if (user.value) {
      return user.value.role === 'mte'
    }
    return false
  })

  const logout = () => {
    user.value = null
  }

  return { user, isAuthenticated, isMte, logout }
},
{ persist: true },
)
