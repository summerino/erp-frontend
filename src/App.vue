<template>
  <v-app>
    <!-- Layout component -->
    <component :is="currentLayout" v-if="isRouterLoaded">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </component>

    <v-snackbar v-model="toast.show" :timeout="toast.timeout" :color="toast.color" bottom right>
      <v-icon v-if="toast.icon" color="white" class="float-left" style="margin-right:4px">{{ toast.icon }}</v-icon>
      <div class="float-left" v-html="toast.message"></div>
      <v-btn v-if="toast.timeout === 0" color="white" text @click="toast.show = false">{{ $t('common.close') }}</v-btn>
    </v-snackbar>

    <v-overlay :value="loadOverlay" z-index="9999999">
      <dot-loader color="#0051a2" size="80px"></dot-loader>
    </v-overlay>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
import DotLoader from 'vue-spinner/src/DotLoader'

import config from './configs'

// Layouts
import defaultLayout from './layouts/DefaultLayout'
import simpleLayout from './layouts/SimpleLayout'
import authLayout from './layouts/AuthLayout'
import errorLayout from './layouts/ErrorLayout'

/*
|---------------------------------------------------------------------
| Main Application Component
|---------------------------------------------------------------------
|
| In charge of choosing the layout according to the router metadata
|
*/
export default {
  components: {
    DotLoader,
    defaultLayout,
    simpleLayout,
    authLayout,
    errorLayout
  },
  computed: {
    ...mapState('app', ['toast', 'loadOverlay']),
    isRouterLoaded: function () {
      if (this.$route.name !== null) return true

      return false
    },
    currentLayout: function () {
      const layout = this.$route.meta.layout || 'default'

      return `${layout}Layout`
    }
  },
  head: {
    link: [
      // adds config/icons into the html head tag
      ...config.icons.map((href) => ({ rel: 'stylesheet', href })),
      { rel: 'stylesheet', href: 'https://cdn.boldreports.com/3.1.42/content/material/bold.reports.all.min.css'},
      { rel: 'stylesheet', href: 'https://cdn.boldreports.com/3.1.42/content/material/bold.reportdesigner.min.css'}
    ],
    script: [
      { type: 'text/javascript', src: 'https://cdn.boldreports.com/3.1.42/scripts/common/ej2-base.min.js', body: true},
      { type: 'text/javascript', src: 'https://cdn.boldreports.com/3.1.42/scripts/common/ej2-data.min.js', body: true},
      { type: 'text/javascript', src: 'https://cdn.boldreports.com/3.1.42/scripts/common/ej2-pdf-export.min.js', body: true},
      { type: 'text/javascript', src: 'https://cdn.boldreports.com/3.1.42/scripts/common/ej2-svg-base.min.js', body: true}
    ]
  }
}
</script>

<style scoped>
/**
 * Transition animation between pages
 */
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.2s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
