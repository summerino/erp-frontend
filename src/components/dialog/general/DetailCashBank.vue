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
                <template v-slot:[`item.total`]="{ item }">
                  {{ item.total | formatCurrency }}
                </template>
                <template v-slot:[`item.amount`]="{ item }">
                  {{ item.amount | formatCurrency }}
                </template>
                <template v-slot:[`item.paidAmount`]="{ item }">
                  {{ item.paidAmount | formatCurrency }}
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
                    :readonly="!selected.find(x => x.code === item.code) || data.type === 'DPC' || data.type === 'DPS'"
                    @keydown="changeAmount"
                    @keyup="changeAmount"
                    @keypress="changeAmount"
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
          <v-form ref="form" v-model="valid">
            <v-row no-gutters>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="data.typeAmount"
                  :items="transType"
                  label="D/C"
                  class="mt-0"
                  :rules="rules.required"
                  required
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
                  :rules="rules.required"
                  required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="pl-md-1">
                <v-currency-field
                  v-model="data.amount"
                  label="Nilai"
                  class="text-right mt-0"
                  :rules="rules.required"
                  required
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
                  :rules="rules.required"
                  required
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
          
        </v-card>
      </v-card-text>

      <v-card-actions class="justify-end pb-2 pr-2">
        <v-btn
          color="blue darken-2"
          class="font-weight-regular"
          dark
          small
          tile
          @click="save"
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
import { randomNumber } from '@/helpers/math-helpers'

export default {
  props: ['coas', 'cashBankTypes', 'coaCodes', 'cashBankCode'],
  created: function () {
    this.rules = this.$store.state.app.rules
  },
  data() {
    return {
      rules: {},
      valid: false,
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
        total: 0,
        typeAmount: 'D'
      },
      grid: {
        columns: [],
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
          value: 'code' 
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
          value: 'code' 
        }
      ],      
      transType: [
        {
          value: 'D',
          text: 'Debit'
        },
        {
          value: 'C',
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
      this.data.type = this.cashBankTypes[0].code
      this.data.total = 0
      this.data.startDate = null
      this.data.endDate = null
      this.filters = this.customerFilters 
      this.selected = []
      this.bindColumn()
      this.resetGeneralTransaction()
    },
    resetGeneralTransaction() {
      this.data.id = randomNumber(-1, -1000)
      this.data.notes = ''
      this.data.amount = 0
      this.data.total = 0
      this.data.typeAmount = 'D'
      this.data.coaCode = null
      this.data.transAmount = 0
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
      const filter = this.getFilters()
      
      
      api.getAll(`${url}`, {
        params: {
          filters: JSON.stringify(filter),
          sorts: JSON.stringify([{
            field: this.data.by,
            direction: 'asc'
          }]),
          cashBankCode: this.cashBankCode
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
        })
    },
    getUrl() {
      let url = ''
      if (this.data.type === 'AP') {
        url = `${this.endpoint.finance.cashBank}/ap`
      } else if (this.data.type === 'AR') {
        url = `${this.endpoint.finance.cashBank}/ar`
      } else if (this.data.type === 'DPC' || this.data.type === 'RDPC' || this.data.type === 'SR') {
        url = `${this.endpoint.finance.cashBank}/credit-memo`
      } else if (this.data.type === 'DPS' || this.data.type === 'RDPS' || this.data.type === 'PR') {
        url = `${this.endpoint.finance.cashBank}/debit-memo`
      }
      return url
    },
    getFilters() {
      const filter = []
      if (this.data.value) {
        filter.push(
          {
            field: this.data.by,
            operator: 'contains',
            keyword: this.data.value
          }
        )
      }
      if (this.data.type === 'RDPC' || this.data.type === 'RDPS') {
        filter.push(
          {
            field: 'SrcTrans',
            operator: 'eq',
            keyword: '1'
          }
        )
        filter.push(
          {
            field: 'remaining',
            operator: 'gt',
            keyword: '0'
          }
        )
        filter.push(
          {
            field: 'Mark',
            operator: 'eq',
            keyword: 'A'
          }
        )
      } else if (this.data.type === 'DPC' || this.data.type === 'DPS') {
        filter.push(
          {
            field: 'SrcTrans',
            operator: 'eq',
            keyword: '1'
          }
        )
        filter.push(
          {
            field: 'Mark',
            operator: 'eq',
            keyword: 'PP'
          }
        )
      } else if (this.data.type === 'SR' || this.data.type === 'PR') {
        filter.push(
          {
            field: 'SrcTrans',
            operator: 'neq',
            keyword: '1'
          }
        )
        filter.push(
          {
            field: 'Mark',
            operator: 'eq',
            keyword: 'PP'
          }
        )
      }
      
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

      return filter
    },
    changeType() {
      this.bindColumn()
      this.grid.data = []
      this.selected = []
      this.data.startDate = null
      this.data.endDate = null
      this.resetGeneralTransaction()
    },
    bindColumn() {
      if (this.data.type === 'AR') {
        this.grid.columns = [
          { text: 'Kode', value: 'code', divider: true, width: '170' },
          { text: 'Pelanggan', value: 'custName', divider: true, width: '200' },
          { text: 'Tanggal', value: 'date', divider: true, width: '120' },
          { text: 'Nilai', value: 'amount', divider: true, align: 'right', width: '120' },
          { text: 'Nilai Sudah Diterima', value: 'paidAmount', align: 'right', divider: true, width: '120' },
          { text: 'Sisa', value: 'remaining', divider: true, align: 'right', width: '120' },
          { text: 'Saat Ini Diterima', value: 'transAmount', align: 'right', divider: true, width: '150' },
          { text: 'Catatan', value: 'notes', divider: true, width: '150' }        
        ]
        this.filters = this.customerFilters
        this.data.by = 'custName'
      } else if (this.data.type === 'DPC' || this.data.type === 'RDPC' || this.data.type === 'SR') {
        this.grid.columns = [
          { text: 'Kode', value: 'code', divider: true, width: '170' },
          { text: 'Pelanggan', value: 'custName', divider: true, width: '200' },
          { text: 'Tanggal', value: 'date', divider: true, width: '120' },
          { text: 'Nilai', value: 'amount', divider: true, width: '120' },
          { text: 'Nilai Sudah Dipakai', value: 'used', align: 'right', divider: true, width: '120' },
          { text: 'Sisa', value: 'remaining', divider: true, align: 'right', width: '120' },
          { text: 'Saat Ini Diterima', value: 'transAmount', align: 'right', divider: true, width: '150' },
          { text: 'Catatan', value: 'notes', divider: true, width: '150' }        
        ]
        this.filters = this.customerFilters
        this.data.by = 'custName'
      } else if (this.data.type === 'AP') {
        this.grid.columns = [
          { text: 'Kode', value: 'code', divider: true, width: '170' },
          { text: 'Pemasok', value: 'supName', divider: true, width: '200' },
          { text: 'Tanggal', value: 'date', divider: true, width: '120' },
          { text: 'Nilai', value: 'amount', divider: true, align: 'right', width: '120' },
          { text: 'Nilai Sudah Dibayar', value: 'paidAmount', divider: true, width: '120' },
          { text: 'Sisa', value: 'remaining', divider: true, align: 'right', width: '120' },
          { text: 'Saat Ini Dibayar', value: 'transAmount', align: 'right', divider: true, width: '150' },
          { text: 'Catatan', value: 'notes', divider: true, width: '150' }        
        ]
        this.filters = this.supplierFilters
        this.data.by = 'supName'
      } else if (this.data.type === 'DPS' || this.data.type === 'RDPS' || this.data.type === 'PR') {
        this.grid.columns = [
          { text: 'Kode', value: 'code', divider: true, width: '170' },
          { text: 'Pemasok', value: 'supName', divider: true, width: '200' },
          { text: 'Tanggal', value: 'date', divider: true, width: '120' },
          { text: 'Nilai', value: 'amount', divider: true, align: 'right', width: '120' },
          { text: 'Nilai Sudah Dibayar', value: 'used', divider: true, align: 'right', width: '120' },
          { text: 'Sisa', value: 'remaining', divider: true, align: 'right', width: '120' },
          { text: 'Saat Ini Dibayar', value: 'transAmount', divider: true, width: '150' },
          { text: 'Catatan', value: 'notes', divider: true, width: '150' }        
        ]
        this.filters = this.supplierFilters
        this.data.by = 'supName'
      } else if (this.data.type === 'TU') {
        setTimeout(() => {
          // Validate form first
          this.$refs.form.validate()
        }, 0)
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
    save() {

      if (this.data.type === 'TU') {

        if (!this.$refs.form.validate()) {
          this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
          return
        }

        let coaName = ''
        const temp = this.coas.find(x => x.code === this.data.coaCode)
        if (temp) {
          coaName = `${temp.name}` 
        }
        const model = {
          id: randomNumber(-1, -1000),
          transAmount: this.data.amount,
          notes: this.data.notes,
          type: this.data.type,
          currCode: 'IDR',
          rate: 1,
          transCode: '',
          remaining: 0,
          amount: this.data.amount,
          typeAmount: this.data.typeAmount,
          coaCode: this.data.coaCode,
          coaName: coaName
        }
        this.selected.push(model)
      }
      this.$emit('saveItem', this.selected)
      this.close()
    },
    bindAdditionalData() {
      if (this.data.type !== 'TU') {
        const field = this.getFieldForNote()
        for (let i = 0; i < this.selected.length; i++) {
          this.selected[i].id = randomNumber(-1, -1000)
          this.selected[i].notes = this.selected[i][field]
          const type = this.getFindType()
          const temp = this.coaCodes.find(x => x.code === `${type}_COA`)
          const coas = this.coas
          if (temp) {
            this.selected[i].coaCode = temp.value
            const tempName = coas.find(x => x.code === temp.value)
            if (tempName) {
              this.selected[i].coaName = `${tempName.name}` 
            }
          }
          this.selected[i].type = this.data.type
          this.selected[i].typeAmount = this.getTypeAmount()
          this.selected[i].transAmount = this.selected[i].remaining
          this.selected[i].transCode = this.selected[i].code
        }
      }
    },
    getTypeAmount() {
      if (this.data.type === 'AR' || this.data.type === 'DPC' || this.data.type === 'RDPS' || this.data.type === 'PR') {
        return 'C'
      } else {
        return 'D'
      }
    },
    
    getFieldForNote() {
      if (this.data.type === 'AR' || this.data.type === 'DPC' || this.data.type === 'RDPC' || this.data.type === 'SR') {
        return 'custName'
      } else {
        return 'supName'
      }
    },
    changeAmount() {
      this.calculateTotal()
    },
    calculateTotal() {
      this.data.total = _sumBy(this.selected, 'transAmount')
    },
    getFindType() {
      let type = this.data.type
      if (type === 'RDPC') {
        type = 'DPC'
      } else if (type === 'RDPS') {
        type = 'DPS'
      }
      return type
    }
  }
}
</script>
