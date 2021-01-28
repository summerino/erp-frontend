import axios from '@/axios'

export default {
  lists(filter) {
    return axios.post('/salesman/lists', { filter })
  }
}
