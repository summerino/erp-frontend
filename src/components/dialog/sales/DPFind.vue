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
        <v-toolbar-title>Penjualan Langsung / Surat Jalan</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <v-row v-if="srcTrans !== 3" no-gutters>
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
            :height="grid.height"
            :items="grid.data"
            :items-per-page="-1"
            class="elevation-1 row-pointer"
            dense
            disable-sort
            fixed-header
            hide-default-footer
            @dblclick:row="dblclickRow"
            @click:row="clickRow"
          >
            <template v-slot:[`item.transCode`]="{ item }">
              <v-text-field
                v-model="item.transCode"
                class="text-body-2 mt-0 no-border"
                dense
                readonly
                @keyup.enter="dblclickRow(null, { item })"
              ></v-text-field>
            </template>
            <template v-slot:[`item.date`]="{ item }">
              {{ item.date | formatDate('dd-MMM-yyyy') }}
            </template>
            <template v-slot:[`item.total`]="{ item }">
              {{ item.total | formatCurrency }}
            </template>
          </v-data-table>
        </v-card>
        <v-card>
          <v-data-table
            :headers="gridDetail.columns"
            :height="gridDetail.height"
            :items="gridDetail.data"
            :items-per-page="-1"
            class="elevation-1"
            dense
            disable-sort
            fixed-header
            hide-default-footer
          >
          </v-data-table>
        </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import api from '@/services/axios.service'

export default {
  props: {
    warehouseCode: String,
    srcTrans: Number,
    gridItem: Array
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
          { text: 'Kode Trans.', value: 'soCode' }
        ]
      },
      rowItem: {},
      grid: {
        columns: [
          { text: 'Kode Transaksi', value: 'code', divider: true, width: '160' },
          { text: 'Tipe', value: 'type', divider: true, width: '160' },
          { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120' },
          { text: 'Status', value: 'mark', align: 'right', width: '120' }
        ],
        data: [],
        height: 400
      },
      gridDetail: {
        columns: [
          { text: 'Kode Barang', value: 'itemInitial', divider: true, width: '160' },
          { text: 'Nama Barang', value: 'itemName', divider: true, width: '120' },
          { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '100' },
          { text: 'Unit', value: 'unitName', align: 'right', width: '120' }
        ],
        data: [],
        height: 400
      },
      invoiceDetail: []
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
      this.gridDetail.data = []
      this.invoiceDetail = []
    },
    open(rowItem) {
      this.dialog = true
      this.rowItem = rowItem
      this.reset()
      setTimeout(() => {
        this.$refs.search.focus()
      }, 100)
      if (this.srcTrans === 3) {
        this.getAllTrans()
      }
    },
    close() {
      this.dialog = false
    },
    search() {
      const srcTrans = this.srcTrans
      if (srcTrans === 2) {
        api.getAll(this.endpoint.sales.delivery, {
          params: {
            warehouseCode: this.warehouseCode,
            filters: JSON.stringify([{
              field: this.data.by,
              operator: this.data.by === 'date' ? 'eq' : 'contains',
              keyword: this.data.value
            }, {
              field: 'warehouseCode',
              operator: 'eq',
              keyword: this.warehouseCode
            }, {
              field: 'mark',
              operator: 'doesnotcontain',
              keyword: ['V', 'INV']
            }, {
              field: 'code',
              operator: 'doesnotcontain',
              keyword: this.gridItem
            }]),
            sorts: JSON.stringify([{
              field: this.data.by,
              direction: 'asc'
            }])
          }
        })
          .then(response => {
            for (let j = 0; j < response.data.tableData.length; j++) {
              response.data.tableData[j].type = 'Surat Jalan'
            }
            this.grid.data = response.data.tableData
          })
      } else if (srcTrans === 1) {
        api.getAll(this.endpoint.sales.invoice, {
          params: {
            warehouseCode: this.warehouseCode,
            filters: JSON.stringify([{
              field: this.data.by,
              operator: this.data.by === 'date' ? 'eq' : 'contains',
              keyword: this.data.value
            }, {
              field: 'fromDirectInvoice',
              operator: 'eq',
              keyword: true
            }, {
              field: 'mark',
              operator: 'doesnotcontain',
              keyword: ['V', 'INV']
            }, {
              field: 'code',
              operator: 'doesnotcontain',
              keyword: this.gridItem
            }]),
            sorts: JSON.stringify([{
              field: this.data.by,
              direction: 'asc'
            }])
          }
        })
          .then(response => {
            for (let j = 0; j < response.data.tableData.length; j++) {
              response.data.tableData[j].type = 'Penjualan Langsung'
            }
            this.grid.data = response.data.tableData
          })
      }
    },
    searchByChange() {
      this.data.value = this.data.by === 'date' ? format(new Date(), 'yyyy-MM-dd') : ''
    },
    searchDateChange() {
      this.menu = false
      this.$refs.search.focus()
    },
    getAllTrans() {
      api.getAll(`${this.endpoint.sales.plan}/all-trans`, {
        params: {
          code: this.warehouseCode
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
        })
    },
    dblclickRow(event, { item }) {
      const srcTrans = this.srcTrans
      const data_i = this.invoiceDetail.find(i => i.code === item.code)
      if (data_i) {
        this.rowItem.doCode = data_i.doCode
      }

      this.rowItem.srcTrans = srcTrans
      this.rowItem.transCode = item.code
      this.rowItem.custName = item.custName
      this.rowItem.volume = _sumBy(this.gridDetail.data, 'finalVolume')
      this.rowItem.weight = _sumBy(this.gridDetail.data, 'finalWeight')
      this.$emit('dblclick:row')
      this.dialog = false
    },
    clickRow(event, { item }) {
      const srcTrans = this.srcTrans
      this.gridDetail.data.splice(0, this.gridDetail.data.length)
      if (srcTrans === 2) {
        api.getAll(`${this.endpoint.sales.delivery}/item`, {
          params: { code: item.code }
        })
          .then(response => {
            this.gridDetail.data = response.data.tableData
            for (let i = 0; i < this.gridDetail.data.length; i++) {
              this.gridDetail.data[i].volume = this.gridDetail.data[i].length * this.gridDetail.data[i].width * this.gridDetail.data[i].height
              this.gridDetail.data[i].finalVolume = this.gridDetail.data[i].dimensionMeasurement === 'cm' ? (this.gridDetail.data[i].volume * this.gridDetail.data[i].qty) / 100 : this.gridDetail.data[i].dimensionMeasurement === 'mm' ? (this.gridDetail.data[i].volume * this.gridDetail.data[i].qty) / 1000 : (this.gridDetail.data[i].volume * this.gridDetail.data[i].qty)
              this.gridDetail.data[i].finalWeight = this.gridDetail.data[i].weightMeasurement === 'gr' ? (this.gridDetail.data[i].weight * this.gridDetail.data[i].qty) / 1000 : (this.gridDetail.data[i].weight * this.gridDetail.data[i].qty)
            }
          })
      } else if (srcTrans === 1) { 
        api.getAll(`${this.endpoint.sales.invoice}/detail`, {
          params: { code: item.code }
        })
          .then(response => {
            this.invoiceDetail = response.data.tableData
            for (let i = 0; i < this.invoiceDetail.length; i++) {
              api.getAll(`${this.endpoint.sales.delivery}/item`, {
                params: { code: this.invoiceDetail[i].doCode }
              })
                .then(response => {
                  for (let j = 0; j < response.data.tableData.length; j++) {
                    response.data.tableData[j].volume = response.data.tableData[j].length * response.data.tableData[j].width * response.data.tableData[j].height
                    response.data.tableData[j].finalVolume = response.data.tableData[j].dimensionMeasurement === 'cm' ? (response.data.tableData[j].volume * response.data.tableData[j].qty) / 100 : response.data.tableData[j].dimensionMeasurement === 'mm' ? (response.data.tableData[j].volume * response.data.tableData[j].qty) / 1000 : (response.data.tableData[j].volume * response.data.tableData[j].qty)
                    response.data.tableData[j].finalWeight = response.data.tableData[j].weightMeasurement === 'gr' ? (response.data.tableData[j].weight * response.data.tableData[j].qty) / 1000 : (response.data.tableData[j].weight * response.data.tableData[j].qty)
                    this.gridDetail.data.push(response.data.tableData[j])
                  }
                })
            }
          })
      } else if (srcTrans === 3) {
        if (item.type === 'Surat Jalan') {
          api.getAll(`${this.endpoint.sales.delivery}/item`, {
            params: { code: item.code }
          })
            .then(response => {
              this.gridDetail.data = response.data.tableData
              for (let i = 0; i < this.gridDetail.data.length; i++) {
                this.gridDetail.data[i].volume = this.gridDetail.data[i].length * this.gridDetail.data[i].width * this.gridDetail.data[i].height
                this.gridDetail.data[i].finalVolume = this.gridDetail.data[i].dimensionMeasurement === 'cm' ? (this.gridDetail.data[i].volume * this.gridDetail.data[i].qty) / 100 : this.gridDetail.data[i].dimensionMeasurement === 'mm' ? (this.gridDetail.data[i].volume * this.gridDetail.data[i].qty) / 1000 : (this.gridDetail.data[i].volume * this.gridDetail.data[i].qty)
                this.gridDetail.data[i].finalWeight = this.gridDetail.data[i].weightMeasurement === 'gr' ? (this.gridDetail.data[i].weight * this.gridDetail.data[i].qty) / 1000 : (this.gridDetail.data[i].weight * this.gridDetail.data[i].qty)
              }
            })
        } else {
          api.getAll(`${this.endpoint.sales.invoice}/detail`, {
            params: { code: item.code }
          })
            .then(response => {
              this.invoiceDetail = response.data.tableData
              for (let i = 0; i < this.invoiceDetail.length; i++) {
                api.getAll(`${this.endpoint.sales.delivery}/item`, {
                  params: { code: this.invoiceDetail[i].doCode }
                })
                  .then(response => {
                    for (let j = 0; j < response.data.tableData.length; j++) {
                      response.data.tableData[j].volume = response.data.tableData[j].length * response.data.tableData[j].width * response.data.tableData[j].height
                      response.data.tableData[j].finalVolume = response.data.tableData[j].dimensionMeasurement === 'cm' ? (response.data.tableData[j].volume * response.data.tableData[j].qty) / 100 : response.data.tableData[j].dimensionMeasurement === 'mm' ? (response.data.tableData[j].volume * response.data.tableData[j].qty) / 1000 : (response.data.tableData[j].volume * response.data.tableData[j].qty)
                      response.data.tableData[j].finalWeight = response.data.tableData[j].weightMeasurement === 'gr' ? (response.data.tableData[j].weight * response.data.tableData[j].qty) / 1000 : (response.data.tableData[j].weight * response.data.tableData[j].qty)
                      this.gridDetail.data.push(response.data.tableData[j])
                    }
                  })
              }
            })
        }
      }
    }
    
  }
}
</script>
