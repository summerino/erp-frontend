import configs from '../../configs'
import mutations from './mutations'
import actions from './actions'

const { product, time, theme, currency } = configs

const { globalTheme, menuTheme, toolbarTheme, isToolbarDetached, isContentBoxed, isRTL } = theme

// state initial values
const state = {
  product,

  time,

  currency,

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
    icon: '',
    message: '',
    timeout: 3000
  },

  // App.vue data table
  grid: {
    height: 300
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
