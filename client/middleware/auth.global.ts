import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  const isAuthenticated = await authStore.isAuthenticated
  if (to.fullPath !== '/connexion') {
    if (!isAuthenticated) {
      return navigateTo({ path: '/connexion' })
    } else if (to.fullPath === '/') {
      return navigateTo({ path: '/arrete-cadre' })
    }
  } else if (isAuthenticated) {
    return navigateTo({ path: '/' })
  }

  return true
})
