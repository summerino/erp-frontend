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
        <v-toolbar-title v-if="this.srcTrans === 2">Surat Jalan</v-toolbar-title>
        <v-toolbar-title v-else>Penerimaan Barang</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            dark
            text
            @click="save"
          >Simpan & Tutup</v-btn>
        </v-toolbar-items>
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
              :items="srcTrans === 2 ? data.item2 : data.item1"
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
        
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-data-table
                :headers="grid.columns"
                :height="grid.height"
                :items="grid.data"
                :items-per-page="-1"
                class="elevation-1 row-pointer"
                dense
                disable-sort
                fixed-header
                hide-default-footer
                item-key="code"
                v-model="selected"
                show-select
              >
                <template v-slot:[`item.date`]="{ item }">
                  {{ item.date | formatDate('dd-MMM-yyyy') }}
                </template>
                <template v-slot:[`item.total`]="{ item }">
                  {{ item.total | formatCurrency }}
                </template>
              </v-data-table>
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
import { map as _map } from 'lodash'
import { randomNumber } from '@/helpers/math-helpers'

import api from '@/services/axios.service'

export default {
  props: {
    srcTrans: Number,
    listCode: Array,
    gridDetail: Array,
    eiCode: String
  },

  data() {
    return {
      dialog: false,
      menu:  false,
      data: {
        by: 'code',
        value: '',
        item1: [
          { text: 'Kode', value: 'code' },
          { text: 'Tanggal', value: 'date' },
          { text: 'No. Ref.', value: 'refNo' },
          { text: 'Nama Pemasok', value: 'supName' }
        ],
        item2: [
          { text: 'Kode', value: 'code' },
          { text: 'Tanggal', value: 'date' },
          { text: 'Nama Pelanggan', value: 'custName' },
          { text: 'Nama Penjual', value: 'salesName' }
        ]
      },
      grid: {
        columns: [],
        data: [],
        height: 600
      },
      doColumn : [
        { text: 'Kode Transaksi', value: 'code', divider: true, width: '160' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120' },
        { text: 'Nama Pelanggan', value: 'custName', divider: true, width: '160' },
        { text: 'Nama Penjual', value: 'salesName', divider: true, width: '160' },
        { text: 'Status', value: 'mark', align: 'right', width: '120' }
      ],
      rcvColumn : [
        { text: 'Kode Transaksi', value: 'code', divider: true, width: '160' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120' },
        { text: 'Nomor Ref.', value: 'refNo', divider: true, width: '160'},
        { text: 'Nama Pemasok', value: 'supName', divider: true, width: '160' },
        { text: 'Status', value: 'mark', align: 'right', width: '120' }
      ],
      selected: []
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
      this.selected = []
    },
    open() {
      this.dialog = true
      this.reset()
      setTimeout(() => {
        this.$refs.search.focus()
      }, 100)
    },
    close() {
      this.dialog = false
    },
    search() {
      this.grid.columns = this.srcTrans === 1 ? this.rcvColumn : this.doColumn
      
      api.getAll(`${this.endpoint.expedition.invoice}/find-detail`, {
        params: {
          type: this.srcTrans,
          filters: JSON.stringify([{
            field: this.data.by,
            operator: this.data.by === 'date' ? 'eq' : 'contains',
            keyword: this.data.value
          }])
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData.filter(x => !this.listCode.includes(x.code))
        })
    },
    searchByChange() {
      this.data.value = this.data.by === 'date' ? format(new Date(), 'yyyy-MM-dd') : ''
    },
    searchDateChange() {
      this.menu = false
      this.$refs.search.focus()
    },
    save() {
      for (let i = 0; i < this.selected.length; i++) {
        const item = {
          id: randomNumber(-1, -1000, _map(this.gridDetail, 'id')),
          code: this.eiCode,
          transCode: null,
          date: null,
          refNo: null,
          mark: null
        }
        
        item.transCode = this.selected[i].code
        item.date = this.selected[i].date
        item.refNo = this.selected[i].refNo
        item.mark = this.selected[i].mark

        this.gridDetail.push(item)
        this.listCode.push(item.transCode)
      }
      this.dialog = false
    }
  }
}
</script>
