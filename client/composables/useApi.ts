import { BaseApiPagination } from '~/api/base-api-pagination';
import { UserApi } from '~/api/user';
import { ZoneAlerteApi } from '~/api/zone-alerte';
import { BaseApi } from '~/api/base-api';

export const useApi = () => {
  return {
    arreteCadre: new BaseApiPagination('arrete-cadre'),
    arreteRestriction: new BaseApiPagination('arrete-restriction'),
    zoneAlerte: new ZoneAlerteApi('zone-alerte'),
    user: new UserApi('user'),
    departement: new UserApi('departement'),
    usage: new BaseApi('usage'),
    thematique: new BaseApi('thematique'),
  };
};
