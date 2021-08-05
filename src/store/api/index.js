import configs from '../../configs'
const { action, endpoint, menus } = configs
import mutations from './mutations'

// state initial values
const state = {
  endpoint,
  action,
  menus,
  actions: [],
  authorization: {}
  // authorization: {
  //   allowCreate: false,
  //   allowUpdate: false,
  //   allowDelete: false,
  //   allowVoid: false,
  //   allowChangeWarehouse: false,
  //   allowChangeDate: false,
  //   allowPost: false,
  //   allowApprove: false,
  //   allowPrint: false
  // }
}

export default {
  namespaced: true,
  state,
  mutations
}
