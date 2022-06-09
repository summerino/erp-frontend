<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    fullscreen
    persistent
    scrollable
    @keydown.esc="close"
  >
    <v-card>
      <v-toolbar
        color="indigo darken-1"
        max-height="64"
        dark
      >
        <v-toolbar-title>Batas Kredit</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          class="ma-2"
          v-if="auth.allowOverlimit"
          icon
          @click="save"
        >
          Ya
        </v-btn>
        <v-divider v-if="auth.allowOverlimit" vertical></v-divider>
        <v-btn
          class="ma-2"
          v-if="auth.allowOverlimit"
          icon
          @click="close"
        >
          Tidak
        </v-btn>
        <v-btn
          v-if="!auth.allowOverlimit"
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
          <v-card>
            <v-row dense>
              <v-col cols="12">
                <v-app-bar dense flat>
                  <label>
                    Berikut adalah data pelanggan yang melebihi batas kredit:
                  </label>
                </v-app-bar>

                <v-data-table
                  :headers="grid.columns"
                  :items="grid.data"
                  :items-per-page="-1"
                  height="300"
                  class="elevation-1"
                  dense
                  disable-sort
                  fixed-header
                  hide-default-footer
                >
                  <template v-slot:[`item.custName`]="{ item }">
                    {{ item.custCode }} - {{ item.custName }}
                  </template>
                  <template v-slot:[`item.transAmount`]="{ item }">
                    {{ item.transAmount | formatCurrency }}
                  </template>
                  <template v-slot:[`item.remainingAmount`]="{ item }">
                    {{ item.remainingAmount | formatCurrency }}
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-card>
          <v-card v-if="auth.allowOverlimit">
            <v-card-text>
              <v-form
                ref="form"
                v-model="valid"
              >
                <v-row dense>
                  <v-col cols="12">
                    <v-textarea
                      v-model="reason"
                      :rules="[rules.max256chars[0], rules.required[0]]"
                      label="Alasan"
                      counter="256"
                      class="mt-0"
                      rows="6"
                      required
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

import api from '@/services/axios.service'

export default {
  data() {
    return {
      dialog: false,
      grid: {
        columns: [
          { text: 'Pelanggan', value: 'custName', divider: true, width: '33%', excelColWidth:'35', customValues: ['custCode', 'custName'] },
          { text: 'Sisa Kredit', value: 'remainingAmount', align: 'right', divider: true, width: '33%', excelColWidth:'15', isCurrency: true },
          { text: 'Nilai Transaksi', value: 'transAmount', align: 'right', width: '33%', excelColWidth:'15', isCurrency: true }
        ],
        data: [],
        height: 100
      },
      reason : null,
      data: [],
      valid: false
    }
  },

  computed: {
    ...mapState({
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint,
      auth: state => state.api.authorization
    })
  },
  
  methods: {
    reset() {
      this.grid.data = []
      this.data = []
    },
    open(selected, overlimit) {
      this.dialog = true
      this.reset()
      this.data = selected
      this.grid.data = overlimit
      setTimeout(() => {
        this.grid.height = this.$refs.dialog.$refs.content.clientHeight - 158
      }, 100)
    },
    close() {
      this.dialog = false
    },
    async save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      let result = { success: false, message: '' }
      const resp = await api.updatemaster(`${this.endpoint.mobileSales.order}/approve`, this.data, { params: {
        data: this.data,
        reason: this.reason
      }})
      result = resp.data
      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.close()
        this.$emit('closeParent')
      }
    }
  }
}
</script>
