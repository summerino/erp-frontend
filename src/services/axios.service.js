import axios from '@/axios'

class AxiosService {
  // constructor() {
  //   this.service = axios.create({
  //     baseURL: process.env.VUE_APP_API_BASE_URL || '',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json' 
  //     }
  //   })
  // }

  getAll(url) {
    return axios.get(`/${url}`)
  }

  getOne(url, id, config) {
    return axios.get(`/${url}/${id}`, config)
  }

  create(url, data, config) {
    return axios.post(`/${url}`, data, config)
  }

  update(url, data, config) {
    return axios.put(`/${url}/${data.id}`, data, config)
  }

  delete(endpoint, id, config) {
    return axios.delete(`/${endpoint}/${id}`, config)
  }
}

export default new AxiosService
