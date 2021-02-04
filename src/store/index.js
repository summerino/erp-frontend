import Vue from 'vue'
import Vuex from 'vuex'

// Module
import AppModule from './app'
import ApiModule from './api'
import AuthModule from './auth'

Vue.use(Vuex)

/**
 * Main Vuex Store
 */
const store = new Vuex.Store({
  modules: {
    app: AppModule,
    api: ApiModule,
    auth: AuthModule
  }
})

export default store
