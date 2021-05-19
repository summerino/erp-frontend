import Vuetify from '../../plugins/vuetify'
import { format } from 'date-fns'

export default {
  /**
   * Main Toast
   */
  showToast: (state, toast) => {
    const { color, timeout, icon, message } = toast

    state.toast = {
      icon,
      message,
      color,
      timeout,
      show: true
    }
  },
  hideToast: (state) => {
    state.toast.show = false
  },
  resetToast: (state) => {
    state.toast = {
      show: false,
      color: 'black',
      icon: '',
      message: '',
      timeout: 3000
    }
  },

  /**
   * Theme and Layout
   */
  setGlobalTheme: (state, theme) => {
    Vuetify.framework.theme.dark = theme === 'dark'
    state.globalTheme = theme
  },
  setRTL: (state, isRTL) => {
    Vuetify.framework.rtl = isRTL
    state.isRTL = isRTL
  },
  setContentBoxed: (state, isBoxed) => {
    state.isContentBoxed = isBoxed
  },
  setMenuTheme: (state, theme) => {
    state.menuTheme = theme
  },
  setToolbarTheme: (state, theme) => {
    state.toolbarTheme = theme
  },
  setTimeZone: (state, zone) => {
    state.time.zone = zone
  },
  setTimeFormat: (state, format) => {
    state.time.format = format
  },
  setCurrency: (state, currency) => {
    state.currency = currency
  },
  setToolbarDetached: (state, isDetached) => {
    state.isToolbarDetached = isDetached
  },

  /**
   * Data table
   */
  setGridDefaultHeight: (state, contentHeight) => {
    state.grid.height = contentHeight - 154
  },

  /**
   * Filter
   */
  setFilterFields: (state, fields) => {
    state.filter.fields = fields
  },
  addSearch: (state) => {
    const search = { field: '', operator:'', keyword: '', show: false}
    state.filter.searches.push(search)
  },
  advSearch: (state) =>  {
    state.filter.searches = []
    state.filter.isAdvancedSearch = !state.filter.isAdvancedSearch
  },
  resetAdvancedFilter: (state) => {
    state.filter.searches = []
    state.filter.isAdvancedSearch = true
  },
  removeSearch: (state, index) => {
    state.filter.searches.splice(index, 1)
    if (state.filter.searches.length === 0) state.filter.isAdvancedSearch = false
  },
  onChangeField: (state, vm) => {
    if (vm.category === 'datetime') {
      // state.filter.searches[vm.index].keyword = new Date()
      state.filter.searches[vm.index].keyword = format(new Date(), 'yyyy-MM-dd')
    } else {
      state.filter.searches[vm.index].keyword = ''
    }
    state.filter.searches[vm.index].operators = state.filter.operator.filter(x => x.allowedCategoryTypes.includes(vm.category))
  }
}
