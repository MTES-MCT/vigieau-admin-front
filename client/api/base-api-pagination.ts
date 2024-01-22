import { BaseApi } from '~/api/base-api';
import { useCustomFetch } from "~/composables/useCustomFetch";

export class BaseApiPagination extends BaseApi {
  paginate(pageToGet: number = 1, query?: string, filter?: any[]) {
    const params: any = {
      page: `${pageToGet}`,
      limit: '9',
      search: query || '',
    };

    if (filter) {
      filter.forEach(f => {
        params['filter.' + f.attribute] = f.filter;        
      })
    }

    return useCustomFetch(`/${this.resource}/search`, {
      method: 'GET',
      baseURL: '/api',
      params,
    });
  }
}
