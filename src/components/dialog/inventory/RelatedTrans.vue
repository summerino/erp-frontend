<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    width="800"
    persistent
    @keydown.esc="close"
  >
    <v-card>
      <v-toolbar
        color="indigo darken-1"
        max-height="64"
        dark
      >
        <v-toolbar-title>Transaksi Terkait</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
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
                <template v-slot:[`item.date`]="{ item }">
                  {{ item.date | formatDate('dd-MMM-yyyy') }}
                </template>
                <template v-slot:[`item.custName`]="{ item }">
                  {{ item.custCode }}- {{ item.custName }}
                </template>
                </v-data-table>
              </v-col>
            </v-row>
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
      menu:  false,
      grid: {
        columns: [],
        data: [],
        height: 100
      },
      data: []
    }
  },

  computed: {
    ...mapState({
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint
    })
  },
  
  methods: {
    reset() {
      this.grid.data = []
      this.data = []
    },
    open(item, from) {
      this.reset()
      this.dialog = true
      if (from === 1) {
        this.grid.columns = [
          { text: 'No. Dokumen', value: 'code', divider: true, width: '100' },
          { text: 'Tgl. Transaksi', value: 'date', divider: true, width: '100' },
          { text: 'Tipe', value: 'type', divider: true, width: '100' },
          { text: 'Pelanggan', value: 'custName', divider: true, width: '100' },
          { text: 'Qty Dipesan', value: 'qty', divider: true, width: '100' },
          { text: 'Qty Terkirim', value: 'qtyDlv', divider: true, width: '100' },
          { text: 'Qty Sisa', value: 'qtyRemain', divider: true, width: '100' }
        ]
      } else if (from === 2) {
        this.grid.columns = [
          { text: 'No. Dokumen', value: 'code', divider: true, width: '100' },
          { text: 'Tgl. Transaksi', value: 'date', divider: true, width: '100' },
          { text: 'Tipe', value: 'type', divider: true, width: '100' },
          { text: 'Qty Indent', value: 'qty', divider: true, width: '100' },
          { text: 'Qty Terima', value: 'qtyRcv', divider: true, width: '100' },
          { text: 'Qty Sisa', value: 'qtyRemain', divider: true, width: '100' }
        ]
      } else {
        this.grid.columns = [
          { text: 'No. Dokumen', value: 'code', divider: true, width: '100' },
          { text: 'Tgl. Transaksi', value: 'date', divider: true, width: '100' },
          { text: 'Tipe', value: 'type', divider: true, width: '100' },
          { text: 'Qty Transfer', value: 'qty', divider: true, width: '100' }
        ]
      }
      this.getRelatedTrans(item, from)
      setTimeout(() => {
        this.grid.height = this.$refs.dialog.$refs.content.clientHeight - 158
      }, 100)
    },
    close() {
      this.dialog = false
    },
    getRelatedTrans(item, from) {
      api.getAll(`${this.endpoint.inventory.item.item}/related`, {
        params: {
          whid: item.warehouseCode,
          itemid: item.itemId,
          from: from
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
        })
    }
  }
}
</script>
