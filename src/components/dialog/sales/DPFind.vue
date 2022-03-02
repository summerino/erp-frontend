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
              :items="srcTrans === 3 ? data.item2 : data.item1"
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
                @click:row="clickRow"
                item-key="code"
                v-model="selected"
                show-select
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
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
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
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { randomNumber } from '@/helpers/math-helpers'
import { sumBy as _sumBy } from 'lodash'

import api from '@/services/axios.service'

export default {
  props: {
    warehouseCode: String,
    srcTrans: Number,
    listCode: Array,
    gridItem: Array,
    dateTrans: String,
    dpCode: String
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
          { text: 'Nama Pelanggan', value: 'custName' },
          { text: 'Wilayah Pelanggan', value: 'custArea' }
        ],
        item2: [
          { text: 'Kode', value: 'code' },
          { text: 'Tanggal', value: 'date' },
          { text: 'Nama Pelanggan', value: 'custName' },
          { text: 'Wilayah Pelanggan', value: 'custArea' },
          { text: 'Tipe Transaksi', value: 'type' }
        ]
      },
      gridData: {},
      grid: {
        columns: [
          { text: 'Kode Transaksi', value: 'code', divider: true, width: '160' },
          { text: 'Tipe', value: 'type', divider: true, width: '160' },
          { text: 'Nama Pelanggan', value: 'custName', divider: true, width: '160' },
          { text: 'Alamat', value: 'custAddress', divider: true, width: '160' },
          { text: 'Wilayah', value: 'custArea', divider: true, width: '160' },
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
      orderData: [],
      invoiceDetail: [],
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
      this.gridDetail.data = []
      this.invoiceDetail = []
      this.selected = []
    },
    open(gridData) {
      this.dialog = true
      this.gridData = gridData
      this.reset()
      this.getOrderData()
      setTimeout(() => {
        this.$refs.search.focus()
      }, 100)
    },
    close() {
      this.dialog = false
    },
    search() {
      const srcTrans = this.srcTrans
      if (srcTrans === 2) {
        api.getAll(`${this.endpoint.sales.plan}/all-trans`, {
          params: {
            warehouseCode: this.warehouseCode,
            filters: JSON.stringify([{
              field: this.data.by,
              operator: this.data.by === 'date' ? 'eq' : 'contains',
              keyword: this.data.value
            }])
          }
        })
          .then(response => {
            this.grid.data = response.data.tableData.filter(x => !this.listCode.includes(x.code) && new Date(x.date) <= new Date(this.dateTrans) && x.type === 'Surat Jalan' && x.mark === 'A')
          })
      } else if (srcTrans === 1) {
        api.getAll(`${this.endpoint.sales.plan}/all-trans`, {
          params: {
            warehouseCode: this.warehouseCode,
            filters: JSON.stringify([{
              field: this.data.by,
              operator: this.data.by === 'date' ? 'eq' : 'contains',
              keyword: this.data.value
            }])
          }
        })
          .then(response => {
            this.grid.data = response.data.tableData.filter(x => !this.listCode.includes(x.code) && new Date(x.date) <= new Date(this.dateTrans) && x.type === 'Penjualan Langsung')
          })
      } else if (srcTrans === 3) {
        api.getAll(`${this.endpoint.sales.plan}/all-trans`, {
          params: {
            warehouseCode: this.warehouseCode,
            filters: JSON.stringify([{
              field: this.data.by,
              operator: this.data.by === 'date' ? 'eq' : 'contains',
              keyword: this.data.value
            }])
          }
        })
          .then(response => {
            this.grid.data = response.data.tableData.filter(x => !this.listCode.includes(x.code) && new Date(x.date) <= new Date(this.dateTrans) && ((x.type === 'Penjualan Langsung' && x.mark === 'A') || (x.type === 'Surat Jalan' && x.mark === 'A')))
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
    save() {
      for (let i = 0; i < this.selected.length; i++) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.dpCode,
          transCode: null,
          volume: 0,
          weight: 0,
          isFailShipment: false,
          failedSendAll: false,
          notesFailShipment: null,
          custName: null,
          undeliveredItems: []
        }

        const srcTrans = this.srcTrans
        let detailData = []
        let invDetail = []
        if (srcTrans === 2) {
          api.getAll(`${this.endpoint.sales.delivery}/item`, {
            params: { code: this.selected[i].code }
          })
            .then(response => {
              detailData = response.data.tableData
              for (let i = 0; i < detailData.length; i++) {
                detailData[i].volume = detailData[i].length * detailData[i].width * detailData[i].height
                detailData[i].finalVolume = detailData[i].dimensionMeasurement === 'cm' ? (detailData[i].volume * detailData[i].qty) / 100 : detailData[i].dimensionMeasurement === 'mm' ? (detailData[i].volume * detailData[i].qty) / 1000 : (detailData[i].volume * detailData[i].qty)
                detailData[i].finalWeight = detailData[i].weightMeasurement === 'gr' ? (detailData[i].weight * detailData[i].qty) / 1000 : (detailData[i].weight * detailData[i].qty)
              }
            })
        } else if (srcTrans === 1) { 
          api.getAll(`${this.endpoint.sales.invoice}/detail`, {
            params: { code: this.selected[i].code }
          })
            .then(response => {
              invDetail = response.data.tableData
              for (let i = 0; i < invDetail.length; i++) {
                api.getAll(`${this.endpoint.sales.delivery}/item`, {
                  params: { code: invDetail[i].doCode }
                })
                  .then(response => {
                    for (let j = 0; j < response.data.tableData.length; j++) {
                      response.data.tableData[j].volume = response.data.tableData[j].length * response.data.tableData[j].width * response.data.tableData[j].height
                      response.data.tableData[j].finalVolume = response.data.tableData[j].dimensionMeasurement === 'cm' ? (response.data.tableData[j].volume * response.data.tableData[j].qty) / 100 : response.data.tableData[j].dimensionMeasurement === 'mm' ? (response.data.tableData[j].volume * response.data.tableData[j].qty) / 1000 : (response.data.tableData[j].volume * response.data.tableData[j].qty)
                      response.data.tableData[j].finalWeight = response.data.tableData[j].weightMeasurement === 'gr' ? (response.data.tableData[j].weight * response.data.tableData[j].qty) / 1000 : (response.data.tableData[j].weight * response.data.tableData[j].qty)
                      detailData.push(response.data.tableData[j])
                    }
                  })
              }
            })
        } else if (srcTrans === 3) {
          if (item.type === 'Surat Jalan') {
            api.getAll(`${this.endpoint.sales.delivery}/item`, {
              params: { code: this.selected[i].code }
            })
              .then(response => {
                detailData = response.data.tableData
                for (let i = 0; i < detailData.length; i++) {
                  detailData[i].volume = detailData[i].length * detailData[i].width * detailData[i].height
                  detailData[i].finalVolume = detailData[i].dimensionMeasurement === 'cm' ? (detailData[i].volume * detailData[i].qty) / 100 : detailData[i].dimensionMeasurement === 'mm' ? (detailData[i].volume * detailData[i].qty) / 1000 : (detailData[i].volume * detailData[i].qty)
                  detailData[i].finalWeight = detailData[i].weightMeasurement === 'gr' ? (detailData[i].weight * detailData[i].qty) / 1000 : (detailData[i].weight * detailData[i].qty)
                }
              })
          } else {
            api.getAll(`${this.endpoint.sales.invoice}/detail`, {
              params: { code: this.selected[i].code }
            })
              .then(response => {
                invDetail = response.data.tableData
                for (let i = 0; i < invDetail.length; i++) {
                  api.getAll(`${this.endpoint.sales.delivery}/item`, {
                    params: { code: invDetail[i].doCode }
                  })
                    .then(response => {
                      for (let j = 0; j < response.data.tableData.length; j++) {
                        response.data.tableData[j].volume = response.data.tableData[j].length * response.data.tableData[j].width * response.data.tableData[j].height
                        response.data.tableData[j].finalVolume = response.data.tableData[j].dimensionMeasurement === 'cm' ? (response.data.tableData[j].volume * response.data.tableData[j].qty) / 100 : response.data.tableData[j].dimensionMeasurement === 'mm' ? (response.data.tableData[j].volume * response.data.tableData[j].qty) / 1000 : (response.data.tableData[j].volume * response.data.tableData[j].qty)
                        response.data.tableData[j].finalWeight = response.data.tableData[j].weightMeasurement === 'gr' ? (response.data.tableData[j].weight * response.data.tableData[j].qty) / 1000 : (response.data.tableData[j].weight * response.data.tableData[j].qty)
                        detailData.push(response.data.tableData[j])
                      }
                    })
                }
              })
          }
        }

        const data_i = invDetail.find(x => x.code === this.selected[i].code)
        if (data_i) {
          item.doCode = data_i.doCode
        }
        if (this.selected[i].type === 'Penjualan Langsung') {
          const data_o = this.orderData.find(x => x.code === this.selected[i].code)
          if (data_o) {
            item.salesName = data_o.salesName
          }
        } else {
          const data_o = this.orderData.find(x => x.code === (srcTrans === 3 ? this.selected[i].soCode : this.selected[i].transCode))
          if (data_o) {
            item.salesName = data_o.salesName
          }
        }
        item.srcTrans = srcTrans
        item.transCode = this.selected[i].code
        item.custName = this.selected[i].custName
        item.custAddress = this.selected[i].custAddress
        item.custArea = this.selected[i].custArea
        item.volume = _sumBy(detailData, 'finalVolume')
        item.weight = _sumBy(detailData, 'finalWeight')

        this.gridItem.push(item)
        this.listCode.push(item.transCode)
      }
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
                      this.gridDetail.data.push(response.data.tableData[j])
                    }
                  })
              }
            })
        }
      }
    },
    getOrderData() {
      api.getAll(this.endpoint.sales.order)
        .then(response => {
          this.orderData = response.data.tableData
        })
    }
    
  }
}
</script>
