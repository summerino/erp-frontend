<template>
  <div class="d-flex flex-grow-1">
    <!-- Navigation -->
    <v-navigation-drawer
      v-model="drawer"
      app
      floating
      class="elevation-1"
      :right="$vuetify.rtl"
      :light="menuTheme === 'light'"
      :dark="menuTheme === 'dark'"
    >
      <!-- Navigation menu info -->
      <template v-slot:prepend>
        <div class="pa-2">
          <div class="title font-weight-bold text-uppercase primary--text">{{ product.name }}</div>
          <div class="overline grey--text">{{ product.version }}</div>
        </div>
      </template>

      <!-- Navigation menu -->
      <main-menu :menu="navigation.menu" />
    </v-navigation-drawer>

    <!-- Toolbar -->
    <v-app-bar
      app
      :color="isToolbarDetached ? 'surface' : undefined"
      :flat="isToolbarDetached"
      :light="toolbarTheme === 'light'"
      :dark="toolbarTheme === 'dark'"
    >
      <v-card class="flex-grow-1 d-flex" :class="[isToolbarDetached ? 'pa-1 mt-3 mx-1' : 'pa-0 ma-0']" :flat="!isToolbarDetached">
        <div class="d-flex flex-grow-1 align-center">
          <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

          <v-spacer class="d-none d-lg-block"></v-spacer>

          <v-spacer class="d-block d-sm-none"></v-spacer>

          <div :class="[$vuetify.rtl ? 'ml-1' : 'mr-1']">
            <toolbar-notifications />
          </div>

          <toolbar-user />
        </div>
      </v-card>
    </v-app-bar>

    <v-main>
      <v-container class="fill-height" :fluid="!isContentBoxed">
        <v-row>
          <v-col cols="12" class="pt-0">
            <v-breadcrumbs :items="breadcrumbs" class="pa-0"></v-breadcrumbs>
          </v-col>
        </v-row>
        <v-layout>
          <slot></slot>
        </v-layout>
      </v-container>

      <v-footer app inset>
        <v-spacer></v-spacer>
        <div class="overline">
          &copy; Sahassa. All right reserved
        </div>
      </v-footer>
    </v-main>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import api from '@/services/axios.service'

import MainMenu from '../components/navigation/MainMenu'
import ToolbarUser from '../components/toolbar/ToolbarUser'
import ToolbarNotifications from '../components/toolbar/ToolbarNotifications'

export default {
  components: {
    MainMenu,
    ToolbarUser,
    ToolbarNotifications
  },
  
  data() {
    return {
      drawer: null,
      navigation: []
    }
  },

  created: function () {
    this.getMenu()
  },
  
  computed: {
    ...mapState({
      product: state => state.app.product,
      isContentBoxed: state => state.app.isContentBoxed,
      menuTheme: state => state.app.menuTheme,
      toolbarTheme: state => state.app.toolbarTheme,
      isToolbarDetached: state => state.app.isToolbarDetached,
      breadcrumbs: state => state.app.breadcrumbs,
      endpoint: state => state.api.endpoint
    })
  },

  methods: {
    getMenu() {
      api.getAll(`${this.endpoint.systemManagement.menu}/navigation`, {})
        .then(response => {
          this.navigation = {
            menu: response.data
          }
        })
    }
  }
}
</script>

<style scoped>
.buy-button {
  box-shadow: 1px 1px 18px #ee44aa;
}
</style>
