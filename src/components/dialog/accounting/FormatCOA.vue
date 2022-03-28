<template>
  <v-dialog
    v-model="dialog"
    :width="options.width"
    persistent
    scrollable
    @keydown.esc="close()"
  >
    <v-card>
      <v-toolbar
        color="indigo darken-1"
        dark
        dense
      >
        <v-toolbar-title>Format Laba / Rugi - {{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close()"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

    <v-card-text class="px-2 pt-1">
      <v-row no-gutters>
        <v-col cols="12">
          <v-treeview
            :items="hierarchy.data"
            hoverable
          >
            <template v-slot:append="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    color="green"
                    icon
                    small
                    @click="choose(item)"
                  >
                    <v-icon small>mdi-check</v-icon>
                  </v-btn>
                </template>
                <span class="text-caption">Pilih</span>
              </v-tooltip>
            </template>
          </v-treeview>
        </v-col>
      </v-row>
    </v-card-text>
    
    <v-card-actions class="justify-end pb-2 pr-2">
      <v-btn
        color="red"
        class="font-weight-regular"
        dark
        small
        tile
        @click="close()"
      >
        <v-icon left>mdi-close-circle</v-icon>
        Batal
      </v-btn>
    </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

import api from '@/services/axios.service'

export default {
  data: () => ({
    dialog: false,
    options: {
      width: 800
    },
    data: {},
    hierarchy: {
      data: []
    },
    title: null
  }),
  computed: {
    ...mapState({ 
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint
    })
  },
  methods: {
    open(data) {
      this.dialog = true
      this.data = data
      this.title = this.data.type === 'S' ? 'Ringkasan' : 'Terperinci'
      this.getHierarchy()
    },
    close() {
      this.dialog = false
    },
    choose(item) {
      if (this.data.type === 'S') {
        this.data.isCode = `${item.code} - ${item.name}`
        this.data.isCodeValue = item.code
      } else {
        this.data.isDetCode = `${item.code} - ${item.name}`
        this.data.isDetCodeValue = item.code
      }
      this.close()
    },
    getHierarchy() {
      api.getAll(`${this.endpoint.accounting.incomeStatementFormat}/format-hierarchy`, {
        params: { category: this.data.type }
      })
        .then(response => {
          this.hierarchy.data = response.data
        })
    }
  }
}
</script>
