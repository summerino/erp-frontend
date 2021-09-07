<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    persistent
    scrollable
    @keydown.esc="close"
  >
    <v-card :style="{ background: $vuetify.theme.themes[theme].surface }">
      <v-toolbar
        color="deep-purple darken-1"
        max-height="64"
        dark
      >
        <v-toolbar-title>Pratinjau Cetak</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          dark
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-0">
        <div id="viewer"></div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import $ from 'jquery'

export default {
  data() {
    return {
      dialog: false,
      code: null
    }
  },

  computed: {
    ...mapState({
      endpoint: state => state.api.endpoint
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },

  methods: {
    open(reportName, code) {
      this.dialog = true
      this.code = code
      setTimeout(() => {
        $('#viewer').boldReportViewer({
          reportServiceUrl: `${process.env.VUE_APP_API_BASE_URL}/report-viewer`,
          reportPath: `${reportName}.rdl`,
          parameters: [{ name: 'code', values: [code] }],
          toolbarSettings: {
            // eslint-disable-next-line no-undef
            items: ~ej.ReportViewer.ToolbarItems.Stop & ~ej.ReportViewer.ToolbarItems.Parameters & ~ej.ReportViewer.ToolbarItems.ExportSetup
          },
          printMode: true,
          ajaxBeforeLoad: this.onAjaxRequest
        })
      }, 0)
    },
    close() {
      this.dialog = false

      const reportviewerObj = $('#viewer').data('boldReportViewer')
      reportviewerObj.destroy()
    },
    onAjaxRequest(args) {
      args.headers.push({ Key: 'Authorization', Value: `Bearer ${localStorage.getItem('accessToken')}` })
    }
  }
}
</script>
