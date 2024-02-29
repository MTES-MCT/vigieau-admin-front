import { UserApi } from '~/api/user';
import { ZoneAlerteApi } from '~/api/zone-alerte';
import { BaseApi } from '~/api/base-api';
import { ArreteCadreApi } from "~/api/arrete-cadre";
import { ArreteRestrictionApi } from "~/api/arrete-restriction";

export const useApi = () => {
  return {
    arreteCadre: new ArreteCadreApi('arrete-cadre'),
    arreteRestriction: new ArreteRestrictionApi('arrete-restriction'),
    zoneAlerte: new ZoneAlerteApi('zone-alerte'),
    user: new UserApi('user'),
    departement: new UserApi('departement'),
    usage: new BaseApi('usage'),
    thematique: new BaseApi('thematique'),
    commune: new BaseApi('commune'),
  };
};
