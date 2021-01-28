import axios from '@/axios'

export default {
  lists() {
    return axios.post('/currency/lists')
  }
}
