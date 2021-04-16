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

  // App.vue rule
  rules: {
    required: [
      (v) => !!v || 'required'
    ],
    above0: [
      (v) => parseFloat((v || '0').replace(/,/g, '')) > 0 || 'Value should above 0'
    ],
    max30chars: [
      (v) => (v || '').length <= 30 || 'Max 30 characters'
    ],
    max256chars: [
      (v) => (v || '').length <= 256 || 'Max 256 characters'
    ]
  },

  // App.vue data table
  grid: {
    height: 300,
    pageSize: 50,
    pageSizes: [50, 100, 150, 200]
  },

  // App.vue loading overlay
  loadOverlay: false
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
