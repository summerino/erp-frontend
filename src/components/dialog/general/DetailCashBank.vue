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
        <v-toolbar-title>Detail Kas Bank</v-toolbar-title>
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
              v-model="data.type"
              :items="cashBankTypes"
              label="Tipe Transaksi"
              class="mt-0"
              item-text="name"
              item-value="code"
              @change="changeType"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="4" class="pl-md-1" v-if="data.type !== 'TU'">
            <v-menu
              v-model="menu.startDate"
              :close-on-content-click="false"
              transition="scale-transition"
              min-width="290px"
              offset-y
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-bind="attrs"
                  v-on="on"
                  :value="formatStartDate"
                  label="Tanggal Awal"
                  class="mt-0"
                  readonly
                  required
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="data.startDate"
                no-title
                scrollable
                @change="menu.startDate = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="4" class="pl-md-1" v-if="data.type !== 'TU'">
            <v-menu
              v-model="menu.endDate"
              :close-on-content-click="false"
              transition="scale-transition"
              min-width="290px"
              offset-y
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-bind="attrs"
                  v-on="on"
                  :value="formatEndDate"
                  label="Tanggal Akhir"
                  class="mt-0"
                  readonly
                  required
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="data.endDate"
                no-title
                scrollable
                @change="menu.endDate = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
        <v-row no-gutters v-if="data.type !== 'TU'">
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="data.by"
              :items="filters"
              label="Cari Berdasarkan"
              class="mt-0"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="8" class="pl-md-1">
            <v-text-field
              ref="search"
              v-model="data.value"
              label="Teks Pencarian"
              class="mt-0"
              @keyup.enter="search"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-card v-if="data.type !== 'TU'">
          
          <v-row no-gutters>
            <v-col cols="12" md="12">
              <v-data-table
                v-model="selected"
                :headers="grid.columns"
                :items="grid.data"
                :items-per-page="-1"
                height="300"
                class="elevation-1 row-pointer"
                dense
                disable-sort
                fixed-header
                hide-default-footer
                show-select
                item-key="code"
              >
                <template v-slot:[`item.date`]="{ item }">
                  {{ item.date | formatDate('dd-MMM-yyyy') }}
                </template>
                <template v-slot:[`item.amount`]="{ item }">
                  {{ item.amount | formatCurrency }}
                </template>
                <template v-slot:[`item.used`]="{ item }">
                  {{ item.used | formatCurrency }}
                </template>
                <template v-slot:[`item.remaining`]="{ item }">
                  {{ item.remaining | formatCurrency }}
                </template>
                <template v-slot:[`item.transAmount`]="{ item }">
                  <v-currency-field
                    v-model="item.transAmount"
                    class="text-body-2 text-right mt-0"
                    :readonly="!selected.find(x => x.code === item.code)"
                    @keydown="changeTransAmount"
                    @keyup="changeTransAmount"
                    @keypress="changeTransAmount"
                  ></v-currency-field>
                </template>
                <template v-slot:[`item.notes`]="{ item }">
                  <v-text-field v-model="item.notes" :readonly="!selected.find(x => x.code === item.code)"></v-text-field>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
          <v-row no-gutters class="pt-2">
            <v-col md="6" cols="12" >
              <h3>Total</h3>
            </v-col>
            <v-col md="6" cols="12">
              <h3>{{ data.total | formatCurrency }}</h3>
            </v-col>
          </v-row>
        </v-card>
        <v-card v-if="data.type === 'TU' ">
          <v-row no-gutters>
            <v-col cols="12" md="4">
              <v-autocomplete
                
                :items="transType"
                label="D/C"
                class="mt-0"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="4" class="pl-md-1">
              <v-autocomplete
                v-model="data.coaCode"
                :items="coas"
                :item-text="item => `${item.code} - ${item.name}`"
                label="Akun"
                item-value="code"
                class="mt-0"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="4" class="pl-md-1">
              <v-currency-field
                v-model="data.amount"
                label="Nilai"
                class="text-right mt-0"
              ></v-currency-field>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12" md="12" class="pl-md-1">
              <v-textarea
                v-model="data.notes"
                label="Catatan"
                counter="256"
                class="mt-0"
                rows="4"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card>
      </v-card-text>

      <v-card-actions class="justify-end pb-2 pr-2">
        <v-btn
          color="blue darken-2"
          class="font-weight-regular"
          dark
          small
          tile
          @click="select"
        >
          <v-icon left>mdi-check-outline</v-icon>
            Simpan
          </v-btn>
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
import api from '@/services/axios.service'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

export default {
  props: ['coas', 'cashBankTypes'],
  data() {
    return {
      menu: {
        startDate: false,
        endDate: false
      },
      dialog: false,
      data: {
        by: 'name',
        value: '',
        startDate: null,
        endDate: null,
        type: 0,
        total: 0
      },
      grid: {
        columns: [
          { text: 'Kode', value: 'code', divider: true, width: '120' },
          { text: 'Pelanggan', value: 'custName', divider: true, width: '150' },
          { text: 'Tanggal', value: 'date', divider: true, width: '120' },
          { text: 'Nilai', value: 'amount', divider: true, width: '120' },
          { text: 'Nilai Sudah Diterima', value: 'used', divider: true, width: '120' },
          { text: 'Sisa', value: 'remaining', divider: true, width: '120' },
          { text: 'Saat Ini Diterima', value: 'transAmount', divider: true, width: '150' },
          { text: 'Catatan', value: 'notes', divider: true, width: '150' }
        ],
        data: []
      },
      options: {
        width: 800
      },
      filters: [],
      supplierFilters: [
        {
          text: 'Inisial Supplier',
          value: 'supInitial' 
        },
        {
          text: 'Nama Supplier',
          value: 'supName' 
        },
        {
          text: 'Kode Transaksi',
          value: 'transCode' 
        }
      ],
      customerFilters: [
        {
          text: 'Inisial Customer',
          value: 'custInitial' 
        },
        {
          text: 'Nama Customer',
          value: 'custName' 
        },
        {
          text: 'Kode Transaksi',
          value: 'transCode' 
        }
      ],
      sources: [
        {
          text: 'Piutang Usaha',
          value: 1
        },
        {
          text: 'Hutang Usaha',
          value: 2
        },
        {
          text: 'Uang Muka Penjualan',
          value: 3
        },
        {
          text: 'Retur Uang Muka Penjualan',
          value: 4
        },
        {
          text: 'Uang Muka Pembelian',
          value: 5
        },
        {
          text: 'Retur Uang Muka Pembelian',
          value: 6
        },
        {
          text: 'Transaksi Umum',
          value: 7
        }
      ],
      transType: [
        {
          value: 'Debit',
          text: 'Debit'
        },
        {
          value: 'Credit',
          text: 'Credit'
        }
      ],
      selected: []
    }
  },
  watch: {
    'selected': {
      handler() {
        this.calculateTotal()
        this.bindAdditionalData()
      },
      deep: true
    }
  },
  computed: {
    ...mapState('api', { 
      endpoint: state => state.endpoint,
      rules: state => state.app.rules,
      formatStartDate() {
        return this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
      },
      formatEndDate() {
        return this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
      }  
    })
  },

  methods: {
    reset() {
      this.data.by = 'custName'
      this.data.value = ''
      this.grid.data = []
      this.data.type = 1
      this.data.total = 0
      this.data.startDate = null
      this.data.endDate = null
      this.filters = this.customerFilters 
      console.log('this.cashBankTypes from detail', this.cashBankTypes)
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
      const url = this.getUrl()

      const filter = []
      filter.push(
        {
          field: this.data.by,
          operator: 'contains',
          keyword: this.data.value
        },
        {
          field: 'Mark',
          operator: 'eq',
          keyword: 'PP'
        }
      )
      if (this.data.startDate) {
        filter.push(
          {
            field: 'date',
            operator: 'gte',
            keyword: this.data.startDate
          }
        )
      }
      if (this.data.endDate) {
        filter.push(
          {
            field: 'date',
            operator: 'lte',
            keyword: this.data.endDate
          }
        )
      }
      api.getAll(`${url}`, {
        params: {
          filters: JSON.stringify(filter),
          sorts: JSON.stringify([{
            field: this.data.by,
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
        })
    },
    getUrl() {
      let url = ''
      if (this.data.type === 2 || this.data.type === 4 || this.data.type === 5) {
        url = this.endpoint.sales.invoice
      } else if (this.data.type === 2) {
        url = this.endpoint.purchase.invoice
      } else if (this.data.type === 2) {
        url = this.endpoint.purchase.debitMemo
      } else if (this.data.type === 2) {
        url = this.endpoint.sales.creditMemo
      }
      return url
    },
    changeType() {
      this.bindColumn()
      this.grid.data = []
    },
    bindColumn() {
      if (this.data.type === 'AR') {
        this.grid.columns = [
          { text: '', value: 'action', divider: true, width: '90' },
          { text: 'Kode', value: 'code', divider: true, width: '120' },
          { text: 'Pelanggan', value: 'custName', divider: true, width: '150' },
          { text: 'Tanggal', value: 'date', divider: true, width: '120' },
          { text: 'Nilai', value: 'amount', divider: true, width: '120' },
          { text: 'Nilai Sudah Diterima', value: 'used', divider: true, width: '120' },
          { text: 'Sisa', value: 'remaining', divider: true, width: '120' },
          { text: 'Saat Ini Diterima', value: 'transAmount', divider: true, width: '150' },
          { text: 'Catatan', value: 'notes', divider: true, width: '150' }        
        ]
        this.filters = this.customerFilters
        this.data.by = 'custName'
      } else if (this.data.type === 'AP') {
        this.grid.columns = [
          { text: '', value: 'action', divider: true, width: '90' },
          { text: 'Kode', value: 'code', divider: true, width: '120' },
          { text: 'Pemasok', value: 'supName', divider: true, width: '150' },
          { text: 'Tanggal', value: 'date', divider: true, width: '120' },
          { text: 'Nilai', value: 'amount', divider: true, width: '120' },
          { text: 'Nilai Sudah Dibayar', value: 'used', divider: true, width: '120' },
          { text: 'Sisa', value: 'remaining', divider: true, width: '120' },
          { text: 'Saat Ini Dibayar', value: 'transAmount', divider: true, width: '150' },
          { text: 'Catatan', value: 'notes', divider: true, width: '150' }        
        ]
        this.filters = this.supplierFilters
        this.data.by = 'supName'
      } else if (this.data.type === 'DPC') {
        this.grid.columns = [
          { text: '', value: 'action', divider: true, width: '90' },
          { text: 'Kode', value: 'code', divider: true, width: '120' },
          { text: 'Pelanggan', value: 'custName', divider: true, width: '150' },
          { text: 'Tanggal', value: 'date', divider: true, width: '120' },
          { text: 'Nilai', value: 'amount', divider: true, width: '120' },
          { text: 'Nilai Sudah Diterima', value: 'used', divider: true, width: '120' },
          { text: 'Sisa', value: 'remaining', divider: true, width: '120' },
          { text: 'Saat Ini Diterima', value: 'transAmount', divider: true, width: '150' },
          { text: 'Catatan', value: 'notes', divider: true, width: '150' }        
        ]
        this.filters = this.customerFilters
        this.data.by = 'custName'
      } else if (this.data.type === 'RDPC') {
        this.grid.columns = [
          { text: '', value: 'action', divider: true, width: '90' },
          { text: 'Kode', value: 'code', divider: true, width: '120' },
          { text: 'Pemasok', value: 'supName', divider: true, width: '150' },
          { text: 'Tanggal', value: 'date', divider: true, width: '120' },
          { text: 'Nilai', value: 'amount', divider: true, width: '120' },
          { text: 'Nilai Sudah Dibayar', value: 'used', divider: true, width: '120' },
          { text: 'Sisa', value: 'remaining', divider: true, width: '120' },
          { text: 'Saat Ini Dibayar', value: 'transAmount', divider: true, width: '150' },
          { text: 'Catatan', value: 'notes', divider: true, width: '150' }        
        ]
        this.filters = this.supplierFilters
        this.data.by = 'supName'
      } else if (this.data.type === 'DPS') {
        this.grid.columns = [
          { text: '', value: 'action', divider: true, width: '90' },
          { text: 'Kode', value: 'code', divider: true, width: '120' },
          { text: 'Pemasok', value: 'supName', divider: true, width: '150' },
          { text: 'Tanggal', value: 'date', divider: true, width: '120' },
          { text: 'Nilai', value: 'amount', divider: true, width: '120' },
          { text: 'Nilai Sudah Dibayar', value: 'used', divider: true, width: '120' },
          { text: 'Sisa', value: 'remaining', divider: true, width: '120' },
          { text: 'Saat Ini Dibayar', value: 'transAmount', divider: true, width: '150' },
          { text: 'Catatan', value: 'notes', divider: true, width: '150' }        
        ]
        this.filters = this.supplierFilters
        this.data.by = 'supName'
      } else if (this.data.type === 'RDPS') {
        this.grid.columns = [
          { text: '', value: 'action', divider: true, width: '90' },
          { text: 'Kode', value: 'code', divider: true, width: '120' },
          { text: 'Pelanggan', value: 'custName', divider: true, width: '150' },
          { text: 'Tanggal', value: 'date', divider: true, width: '120' },
          { text: 'Nilai', value: 'amount', divider: true, width: '120' },
          { text: 'Nilai Sudah Dipakai', value: 'used', divider: true, width: '120' },
          { text: 'Sisa', value: 'remaining', divider: true, width: '120' },
          { text: 'Saat Ini Diterima', value: 'transAmount', divider: true, width: '150' },
          { text: 'Catatan', value: 'notes', divider: true, width: '150' }        
        ]
        this.filters = this.customerFilters
        this.data.by = 'custName'
      } else if (this.data.type === 'TU') {
        this.grid.columns = [
          { text: '', value: 'action', divider: true, width: '90' },
          { text: 'Tipe D/C', value: 'type', divider: true, width: '120' },
          { text: 'Akun', value: 'account', divider: true, width: '150' },
          { text: 'Catatan', value: 'notess', divider: true, width: '300' },
          { text: 'Nilai', value: 'amount', divider: true, width: '120' }
        ]
      }            
    },
    bindDate() {
      const tempDate = new Date()
      this.data.endDate = format(tempDate, 'yyyy-MM-dd')
      const tempMonth = tempDate.getMonth()
      let month = tempMonth < 10 ? `0${tempMonth}` : tempMonth 
      month++
      const tempStartDate = `${tempDate.getFullYear()}-${month}-01`
      this.data.startDate = format(new Date(tempStartDate), 'yyyy-MM-dd')
    },
    select() {
      this.$emit('save', this.selected)
      this.close()
    },
    bindAdditionalData() {
      for (let i = 0; i < this.selected.length; i++) {
        this.selected[i].transAmount = this.selected[i].remaining
        this.selected[i].notes = this.selected[i].code
      }
    },
    changeTransAmount() {
      this.calculateTotal()
    },
    calculateTotal() {
      this.data.total = _sumBy(this.selected, 'transAmount')
    }
  }
}
</script>
