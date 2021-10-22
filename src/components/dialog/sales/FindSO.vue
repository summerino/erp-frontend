<template>
  <v-dialog
    v-model="dialog"
    :width="options.width"
    persistent
    scrollable
    @keydown.esc="close"
  >
    <v-card>
      <v-toolbar
        color="indigo darken-1"
        dark
        dense
      >
        <v-toolbar-title>Order Penjualan</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <v-row no-gutters>
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="data.by"
              :items="data.items"
              label="Cari Berdasarkan"
              class="mt-0"
              @change="searchByChange"
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
                  label="Tanggal Pencarian"
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
            fixed-header
            hide-default-footer
            @dblclick:row="dblclickRow"
          >
            <template v-slot:[`item.code`]="{ item }">
              <v-text-field
                v-model="item.code"
                class="text-body-2 mt-0 no-border"
                dense
                readonly
                @keyup.enter="dblclickRow(null, { item })"
              ></v-text-field>
            </template>
            <template v-slot:[`item.date`]="{ item }">
              {{ item.date | formatDate('dd-MMM-yyyy') }}
            </template>
            <template v-slot:[`item.custName`]="{ item }">
              {{ item.custCode }}- {{ item.custName }}
            </template>
            <template v-slot:[`item.total`]="{ item }">
              {{ item.total | formatCurrency }}
            </template>
          </v-data-table>
        </v-card>
      </v-card-text>

      <v-card-actions class="justify-end pb-2 pr-2">
        <v-btn
          color="red darken-2"
          class="font-weight-regular"
          dark
          small
          tile
          @click="close"
        >
          <v-icon left>mdi-close-circle-outline</v-icon>
          Batal
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

import api from '@/services/axios.service'

export default {
  props: {
    caller: String,
    MarkExclude: Array,
    invCode: String
  },

  data() {
    return {
      dialog: false,
      menu:  false,
      data: {
        by: 'code',
        value: '',
        items: [
          { text: 'Kode', value: 'code' },
          { text: 'Tanggal', value: 'date' },
          { text: 'Pelanggan', value: 'custName' }
        ]
      },
      grid: {
        data: [],
        columns: [
          { text: 'Kode', value: 'code', divider: true, width: '160' },
          { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120' },
          { text: 'Nilai', value: 'total', align: 'right', divider: true, width: '120' },
          { text: 'Pelanggan', value: 'custName', divider: true, width: '200' },
          { text: 'Dijual Oleh', value: 'salesInitial', divider: true, width: '200' }
        ]
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
    }
  },
  
  methods: {
    reset() {
      this.data.by = 'code'
      this.data.value = ''
      this.grid.data = []
    },
    open(options) {
      this.dialog = true
      this.options = Object.assign(this.options, options)
      this.reset()
      setTimeout(() => {
        this.$refs.search.focus()
      }, 0)
    },
    close() {
      this.dialog = false
    },
    search() {
      let url = this.endpoint.sales.order
      let params = {}

      if (this.caller === 'inv') {
        url += '/in-complete-invoice'
        params = {
          searchBy: this.data.by,
          search: this.data.value,
          invCode: this.invCode
        }
      } else {
        params = {
          filters: JSON.stringify({
            field: this.data.by,
            operator: this.data.by === 'date' ? 'eq' : 'contains',
            keyword: this.data.value
          }, {
            field: 'mark',
            operator: 'doesnotcontain',
            keyword: this.MarkExclude
          }),
          sorts: JSON.stringify([{
            field: this.data.by,
            direction: 'asc'
          }])
        }
      }

      api.getAll(url, {
        params: params
      })
        .then(response => {
          this.grid.data = response.data.tableData
        })
    },
    searchByChange() {
      this.data.value = this.data.by === 'date' ? format(new Date(), 'yyyy-MM-dd') : ''
    },
    searchDateChange() {
      this.menu = false
      this.$refs.search.focus()
    },
    dblclickRow(event, { item }) {
      item.called = 'dialog'
      this.$emit('dblclick:row', item)
      this.dialog = false
    }
  }
}
</script>
