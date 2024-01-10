import { BaseApiPagination } from "~/api/base-api-pagination";

export class ArreteCadreApi extends BaseApiPagination {
  publish = (id: string, payload: any) => {
    payload = JSON.parse(JSON.stringify(payload));
    console.log(payload);
    return useFetch(`/${this.resource}/${id}/publier`, {
      method: 'POST',
      baseURL: '/api',
      body: payload,
    });
  };
}
