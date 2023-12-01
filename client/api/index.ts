import type { User } from '~/dto/user.dto'

const index = {
  getUser (): Promise<User> {
    return useFetch('/user/me', {
      method: 'GET',
      baseURL: '/api',
    })
  },

  getUsers (): Promise<any> {
    return useFetch('/user', {
      method: 'GET',
      baseURL: '/api',
    })
  },

  createUser (user: User): Promise<any> {
    return useFetch('/user', {
      method: 'POST',
      baseURL: '/api',
      body: user,
    })
  },

  editUser (user: User): Promise<any> {
    return useFetch(`/user/${user.email}`, {
      method: 'PATCH',
      baseURL: '/api',
      body: user,
    })
  },

  deleteUser (email: string): Promise<any> {
    return useFetch(`/user/${email}`, {
      method: 'DELETE',
      baseURL: '/api',
    })
  },
}

export default index
