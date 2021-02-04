import configs from '../../configs'

const { endpoint } = configs

// state initial values
const state = {
  endpoint
}

export default {
  namespaced: true,
  state
}
