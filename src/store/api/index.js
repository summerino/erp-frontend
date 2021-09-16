import configs from '../../configs'
const { endpoint, menus } = configs
import mutations from './mutations'

// state initial values
const state = {
  endpoint,
  companyName: null,
  menus,
  action: [],
  authorization: {}
}

export default {
  namespaced: true,
  state,
  mutations
}
