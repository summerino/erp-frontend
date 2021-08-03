import configs from '../../configs'
const { endpoint, menus } = configs
import mutations from './mutations'

// state initial values
const state = {
  endpoint,
  action: {
    insert: 1,
    update: 2,
    delete: 3,
    void: 4,
    changeWarehouse: 5,
    viewRelatedTrans: 6,
    close: 6,
    changeDate: 8,
    approve: 9,
    post: 10,
    print: 41
  },
  menus,
  authorization: {
    allowInsert: false,
    allowUpdate: false,
    allowDelete: false,
    allowVoid: false,
    allowChangeWarehouse: false,
    allowChangeDate: false,
    allowPost: false,
    allowPrint: false
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
