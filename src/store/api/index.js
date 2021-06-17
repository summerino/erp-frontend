import configs from '../../configs'
const { endpoint, actions, menus } = configs

// state initial values
const state = {
  endpoint,
  actions,
  menus
}

export default {
  namespaced: true,
  state
}
