import { BaseApiPagination } from '~/api/base-api-pagination'
import { UserApi } from '~/api/user'

export const useApi = () => {
  return {
    arreteCadre: new BaseApiPagination('arrete-cadre'),
    zoneAlerte: new BaseApiPagination('zone-alerte'),
    user: new UserApi('user'),
  }
}
