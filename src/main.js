import Vue from 'vue'
import App from './App.vue'
import * as VueGoogleMaps from 'vue2-google-maps'

// Vuex Store
import store from './store'

// Vue Router
import router from './router'

// PLUGINS
import vuetify from './plugins/vuetify'
import i18n from './plugins/vue-i18n'
import './plugins/v-currency-field'
import './plugins/vue-shortkey'
import './plugins/vue-head'
import './plugins/apexcharts'
import './plugins/echarts'
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

// dev account wildan
// Vue.use(VueGoogleMaps, {
//   load: {
//     key: 'AIzaSyD0rOuITAhrCBpsnF6VZnilb3XMSPWxECA',
//     libraries: 'places' // This is required if you use the Autocomplete plugin
//   }
// })

// pro dari user di stack overflow
Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyA9etM9rqnYas63ypURAkvEFn_W_sU0NM4',
    libraries: 'places' // This is required if you use the Autocomplete plugin
  }
})

export default new Vue({
  i18n,
  vuetify,
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')