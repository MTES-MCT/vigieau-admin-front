import { BaseApi } from '~/api/base-api';
import { useCustomFetch } from "~/composables/useCustomFetch";

export class ZoneAlerteApi extends BaseApi {
  importTmp = (departementCode: string, zoneType: string, file: any) => {
    let formData = new FormData();
    formData.append('file', file);

    return useCustomFetch(`/${this.resource}/${departementCode}/${zoneType}/check`, {
      method: 'POST',
      baseURL: '/api',
      body: formData,
    });
  };

  check = (departementCode: string, typeZone: any) => {
    return useCustomFetch(`/${this.resource}/${departementCode}/${typeZone}/check`, {
      method: 'GET',
      baseURL: '/api',
    });
  };
}
