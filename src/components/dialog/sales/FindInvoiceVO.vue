<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    :width="options.width"
    persistent
    scrollable
    @keydown.esc="close"
  >
    <v-card :style="{ background: $vuetify.theme.themes[theme].surface }">
      <v-toolbar
        color="indigo darken-1"
        max-height="64"
        dark
      >
        <v-toolbar-title>Invoice</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          dark
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 py-0">
        <v-row dense>
          <v-col cols="12">
            <v-card>
              <v-card-text>
                <v-row no-gutters>
                  <v-col cols="12" md="4">
                    <v-autocomplete
                      v-model="data.by"
                      :items="data.items"
                      label="Cari Berdasarkan"
                      class="mt-0"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" md="8" class="pl-md-1">
                    <v-text-field
                      ref="search"
                      v-if="data.by !== 'date'"
                      v-model="data.value"
                      label="Teks Pencarian"
                      class="mt-0"
                      @keyup.enter="search"
                    ></v-text-field>
                    <v-menu
                      v-else
                      v-model="menu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      min-width="290px"
                      offset-y
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          ref="search"
                          v-bind="attrs"
                          v-on="on"
                          :value="formatDate"
                          label="Teks Pencarian"
                          class="mt-0"
                          readonly
                          @keyup.enter="search"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="data.value"
                        no-title
                        scrollable
                        @change="searchDateChange"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>

                <v-card>
                  <v-data-table
                    :headers="grid.columns"
                    :items="grid.data"
                    :items-per-page="-1"
                    height="300"
                    class="elevation-1 row-pointer"
                    dense
                    disable-sort
                    fixed-header
                    hide-default-footer
                    @dblclick:row="dblclickRow"
                  >
                    <template v-slot:[`item.initial`]="{ item }">
                      <v-text-field
                        v-model="item.initial"
                        class="text-body-2 mt-0 no-border"
                        dense
                        readonly
                        @keyup.enter="dblclickRow(null, { item })"
                      ></v-text-field>
                    </template>
                    <template v-slot:[`item.date`]="{ item }">
                      {{ item.date | formatDate('dd-MMM-yyyy') }}
                    </template>
                    <template v-slot:[`item.dueDate`]="{ item }">
                      {{ item.dueDate | formatDate('dd-MMM-yyyy') }}
                    </template>
                  </v-data-table>
                </v-card>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

import api from '@/services/axios.service'

export default {
  props: {
    listCustCode: Array,
    listInvCode: Array
  },

  data() {
    return {
      dialog: false,
      valid: false,
      menu: false,     
      data: {
        by: 'name',
        value: '',
        items: [
          { text: 'Kode Invoice', value: 'code' },
          { text: 'Kode Penjualan', value: 'soCode' },
          { text: 'ID Pelanggan', value: 'custCode' }
        ]
      },
      rowItem: {},
      grid: {
        columns: [
          { text: 'Kode Invoice', value: 'code', divider: true, width: '150' },
          { text: 'Tanggal Transaksi', value: 'date', align: 'right', divider: true, width: '110' },
          { text: 'Tanggal Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '110' },
          { text: 'Kode Penjualan', value: 'soCode', divider: true, width: '150' },
          { text: 'Nama Pelanggan', value: 'custName', divider: true, width: '200' },
          { text: 'Dikeluarkan Oleh', value: 'issuedInitial', divider: true, width: '200' }
        ],
        data: []
      },
      options: {
        width: 800
      }
    }
  },

  computed: {
    ...mapState('api', { endpoint: state => state.endpoint }),
    formatDate() {
      return this.data.value ? format(parseISO(this.data.value), 'dd-MMM-yyyy') : ''
    },
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },
  
  methods: {
    reset() {
      this.data.by = 'code'
      this.data.value = ''
      this.grid.data = []      
    },
    open(rowItem) {
      this.dialog = true
      this.rowItem = rowItem
      this.reset()
      setTimeout(() => {
        this.$refs.search.focus()
      }, 500)
    },
    close() {
      this.dialog = false
    },
    search() {
      const filters = [{
        field: this.data.by,
        operator: 'contains',
        keyword: this.data.value
      }, {
        field: 'mark',
        operator: 'eq',
        keyword: 'A'
      }]
      api.getAll(this.endpoint.sales.invoice, {
        params: {
          filters: JSON.stringify(filters),
          sorts: JSON.stringify([{
            field: this.data.by,
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData.filter(x => this.listCustCode.includes(x.custCode) && !this.listInvCode.includes(x.code))
        })
    },
    dblclickRow(event, { item }) {
      this.rowItem.invCode = item.code
      this.rowItem.customerName = item.custName
      this.$emit('dblclick:row', this.rowItem, item)
      this.dialog = false
    }
  }
}
</script>
