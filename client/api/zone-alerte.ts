import { BaseApi } from '~/api/base-api'

export class ZoneAlerteApi extends BaseApi {
  importTmp = (departementCode: string, zoneType: string, file: any) => {
    let formData = new FormData();
    formData.append('file', file);
    
    return useFetch(`/${this.resource}/${departementCode}/${zoneType}/check`, {
      method: 'POST',
      baseURL: '/api',
      body: formData,
    })
  }

  check = (departementCode: string, typeZone: any) => {
    return useFetch(`/${this.resource}/${departementCode}/${typeZone}/check`, {
      method: 'GET',
      baseURL: '/api',
    })
  }
}
