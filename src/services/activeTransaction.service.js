import axios from '@/axiosnoload'
import store from '../store'

class ActiveTransactionService {
  locked(src, code) {
    return axios.put(`${store.state.api.endpoint.general.activeTransaction}/locked`, {
      src,
      code
    })
  }

  released(src, code) {
    return axios.put(`${store.state.api.endpoint.general.activeTransaction}/released`, {
      src,
      code
    })
  }
}

export default new ActiveTransactionService
