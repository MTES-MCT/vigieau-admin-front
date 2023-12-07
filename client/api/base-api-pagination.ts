import { BaseApi } from '~/api/base-api'

export class BaseApiPagination extends BaseApi {
  paginate (pageToGet: number = 1, query?: string) {
    const params = {
      page: `${pageToGet}`,
      limit: '9',
      query: query || '',
    }

    return useFetch(`/${this.resource}/search`, {
      method: 'GET',
      baseURL: '/api',
      params,
    })
  }
}
