const index = {
  getUser (): Promise<any> {
    return useFetch('/auth/user', {
      method: 'GET',
      baseURL: '/api',
    })
  },
}

export default index
