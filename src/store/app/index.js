import configs from '../../configs'
import mutations from './mutations'
import actions from './actions'

const { product, time, theme } = configs

const { globalTheme, menuTheme, toolbarTheme, isToolbarDetached, isContentBoxed, isRTL } = theme

// state initial values
const state = {
  product,

  time,

  // themes and layout configurations
  globalTheme,
  menuTheme,
  toolbarTheme,
  isToolbarDetached,
  isContentBoxed,
  isRTL,

  // App.vue main toast
  toast: {
    show: false,
    color: 'black',
    message: '',
    timeout: 3000
  },

  // App.vue main dialog
  dialog: {
    show: false
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
