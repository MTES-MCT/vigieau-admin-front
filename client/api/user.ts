import { BaseApi } from '~/api/base-api';

export class UserApi extends BaseApi {
  me = () => {
    return useFetch(`/${this.resource}/me`, {
      method: 'GET',
      baseURL: '/api',
    });
  };
}
