import axios from '@/axios'

export default {
  lists(src) {
    return axios.post('/tax/lists', { src })
  }
}
