import { BaseApiPagination } from '~/api/base-api-pagination'
import { UserApi } from '~/api/user'
import { ZoneAlerteApi } from '~/api/zone-alerte'

export const useApi = () => {
  return {
    arreteCadre: new BaseApiPagination('arrete-cadre'),
    zoneAlerte: new ZoneAlerteApi('zone-alerte'),
    user: new UserApi('user'),
    departement: new UserApi('departement'),
  }
}
