import { BaseApiPagination } from "~/api/base-api-pagination";

export class ArreteCadreApi extends BaseApiPagination {
  publish = (id: string, payload: any) => {
    const formData = new FormData()
    formData.append('file', payload.file)
    formData.append('dateDebut', payload.dateDebut);
    formData.append('dateFin', payload.dateFin);
    
    return useFetch(`/${this.resource}/${id}/publier`, {
      method: 'POST',
      baseURL: '/api',
      body: formData,
    });
  };
  
  repeal = (id: string, payload: any) => {
    payload = JSON.parse(JSON.stringify(payload));
    return useFetch(`/${this.resource}/${id}/abroger`, {
      method: 'POST',
      baseURL: '/api',
      body: payload,
    });
  };

  updateZones = (id: string, codeDep: string, payload: any) => {
    payload = JSON.parse(JSON.stringify(payload));
    return useFetch(`/${this.resource}/${id}/zones/${codeDep}`, {
      method: 'PATCH',
      baseURL: '/api',
      body: payload,
    });
  };
}
