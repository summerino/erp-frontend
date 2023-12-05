import './global'
import Vue from 'vue'
import App from './App.vue'

// Bold Reports Common
// require('@boldreports/javascript-reporting-controls/Scripts/common/ej2-base.min')
// require('@boldreports/javascript-reporting-controls/Scripts/common/ej2-data.min')
// require('@boldreports/javascript-reporting-controls/Scripts/common/ej2-pdf-export.min')
// require('@boldreports/javascript-reporting-controls/Scripts/common/ej2-svg-base.min')

// Bold Viewer component
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.common.min'
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.widgets.min'
// import '@boldreports/javascript-reporting-controls/Scripts/common/bold.reports.common.min'
// import '@boldreports/javascript-reporting-controls/Scripts/common/bold.reports.widgets.min'

// Report Viewer source
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/bold.report-viewer.min'
// import '@boldreports/javascript-reporting-controls/Scripts/bold.report-viewer.min'
// import '@boldreports/javascript-reporting-controls/Scripts/bold.report-designer.min'

// Data Visualization
// import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.bulletgraph.min'
// import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.chart.min'

// Vuex Store
import store from './store'

// Vue Router
import router from './router'

// PLUGINS
import vuetify from './plugins/vuetify'
import i18n from './plugins/vue-i18n'
import './plugins/v-currency-field'
import './plugins/vue-google-maps'
import './plugins/vue-shortkey'
import './plugins/vue-head'
import './plugins/animate'
import './plugins/clipboard'

// FILTERS
import './filters/capitalize'
import './filters/lowercase'
import './filters/uppercase'
import './filters/formatCurrency'
import './filters/formatDate'

// STYLES
// Main Theme SCSS
import './assets/scss/theme.scss'

// Animation library - https://animate.style/
import 'animate.css/animate.min.css'

// Bold Reports css
import '@boldreports/javascript-reporting-controls/Content/v2.0/material-light/bold.report-viewer.min.css'
// import '@boldreports/javascript-reporting-controls/Content/material/bold.reports.all.min.css'
// import '@boldreports/javascript-reporting-controls/Content/material/bold.reportdesigner.min.css'

// Set this to false to prevent the production tip on Vue startup.
Vue.config.productionTip = false

/*
|---------------------------------------------------------------------
| Main Vue Instance
|---------------------------------------------------------------------
|
| Render the vue application on the <div id="app"></div> in index.html
|
| https://vuejs.org/v2/guide/instance.html
|
*/
export default new Vue({
  i18n,
  vuetify,
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')