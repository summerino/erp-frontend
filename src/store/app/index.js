import configs from '../../configs'
import mutations from './mutations'
import actions from './actions'

const { product, time, theme, currency, filter } = configs

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
      (v) => !!v || 'Wajib diisi'
    ],
    above0: [
      (v) => parseFloat((v || '0').toString().replace(/,/g, '')) > 0 || 'Nilai harus lebih dari 0 (nol)'
    ],
    cannot0: [
      (v) => parseFloat((v || '0').toString().replace(/,/g, '')) !== 0 || 'Nilai tidak boleh 0 (nol)'
    ],
    max15chars: [
      (v) => (v || '').length <= 15 || 'Maksimal 15 karakter'
    ],
    max20chars: [
      (v) => (v || '').length <= 20 || 'Maksimal 20 karakter'
    ],
    max30chars: [
      (v) => (v || '').length <= 30 || 'Maksimal 30 karakter'
    ],
    max50chars: [
      (v) => (v || '').length <= 50 || 'Maksimal 50 karakter'
    ],
    max100chars: [
      (v) => (v || '').length <= 100 || 'Maksimal 100 karakter'
    ],
    max256chars: [
      (v) => (v || '').length <= 256 || 'Maksimal 256 karakter'
    ],
    max1000chars: [
      (v) => (v || '').length <= 1000 || 'Maksimal 1000 karakter'
    ],
    email: [
      (v) => !v || /.+@.+\..+/.test(v) || 'Format email tidak valid'
    ]
  },

  // App.vue data table
  grid: {
    height: 300,
    pageSize: 50,
    pageSizes: [50, 100, 150, 200]
  },

  // App.vue loading overlay
  loadOverlay: false,

  // App.vue advanced search filter
  filter
  
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
