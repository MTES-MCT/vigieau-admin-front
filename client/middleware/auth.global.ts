import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  const isAuthenticated = await authStore.isAuthenticated;
  if (to.path !== '/connexion') {
    if (!isAuthenticated) {
      return navigateTo({ path: '/connexion', query: to.query });
    } else if (to.path === '/') {
      return navigateTo({ path: '/arrete-cadre' });
    }
  } else if (isAuthenticated) {
    return navigateTo({ path: '/' });
  }

  return true;
});
