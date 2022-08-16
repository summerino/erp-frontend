<template>
  <v-dialog
    v-model="dialog"
    transition="dialog-bottom-transition"
    fullscreen
    hide-overlay
    persistent
    scrollable
    @keydown.esc="close"
  >
    <v-card :style="{ background: $vuetify.theme.themes[theme].surface }">
      <v-toolbar
        color="primary"
        max-height="64"
        dark
      >
        <v-btn icon dark @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Detail Kas Bank</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                v-shortkey="['ctrl', 'enter']"
                dark
                text
                @click="save"
                @shortkey="save"
              >Simpan</v-btn>
            </template>
            <span class="text-caption">(Ctrl + Enter)</span>
          </v-tooltip>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="px-2 pt-1">
        <v-row no-gutters>
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="data.type"
              :items="types"
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
                    :readonly="!selected.find(x => x.code === item.code) || data.type === 'DEPC' || data.type === 'DEPS' || data.type === 'SDP' || data.type === 'RSDP'"
                    class="text-body-2 text-right mt-0"
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
          <v-row no-gutters class="pt-2 px-2">
            <v-col cols="12" md="6" offset-md="6">
              <v-currency-field
                label="Total"
                v-model="data.total"
                class="text-body-2 text-right mt-0"
                readonly
              ></v-currency-field>
            </v-col>
          </v-row>
        </v-card>
        <v-card v-if="data.type === 'TU'">
          <v-card-text>
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
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'

export default {
  props: ['cbCode'],
  created: function () {
    this.rules = this.$store.state.app.rules
    this.getTypeLists()
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
        type: null,
        total: 0,
        typeAmount: 'D'
      },
      grid: {
        columns: [],
        data: []
      },
      filters: [],
      supplierFilters: [
        {
          text: 'Kode Supplier',
          value: 'supCode' 
        },
        {
          text: 'Nama Supplier',
          value: 'supName' 
        },
        {
          text: 'Kode Transaksi',
          value: 'code' 
        }],
      customerFilters: [
        {
          text: 'Kode Customer',
          value: 'custCode' 
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
      selected: [],
      types: [],
      typeCoaCode: null,
      typeCoaName: null
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
      formatStartDate() {
        return this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
      },
      formatEndDate() {
        return this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
      },
      theme() {
        return this.$vuetify.theme.isDark ? 'dark' : 'light'
      }
    })
  },

  methods: {
    reset() {
      this.data.by = 'custName'
      this.data.value = ''
      this.grid.data = []
      this.data.type = this.types[0].code
      this.data.total = 0
      this.data.startDate = null
      this.data.endDate = null
      this.filters = this.customerFilters 
      this.selected = []
      this.bindColumn()
      this.resetGeneralTransaction()
      this.getTypeCoaCode()
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
    async getTypeLists() {
      const resp = await api.getAll(`${this.endpoint.finance.cashBankType}/lists`)
      this.types = resp.data.tableData
      this.getCOALists()
    },
    getCOALists() {
      api.getAll(`${this.endpoint.accounting.coa}/list-general-transaction`)
        .then(response => {
          this.coas = response.data.tableData
        })
    },
    getTypeCoaCode() {
      
      const type = this.types.find(x => x.code === this.data.type)
      this.typeCoaCode = type?.coaCode
      this.typeCoaName = type?.coaName
    },
    open() {
      this.dialog = true
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
          cbCode: this.cbCode,
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
      if (this.data.type === 'AR') {
        url = `${this.endpoint.finance.cashBank}/ar`
      } else if (this.data.type === 'AP') {
        url = `${this.endpoint.finance.cashBank}/ap`
      } else if (this.data.type === 'EPAP') {
        url = `${this.endpoint.finance.cashBank}/ep-ap`
      } else if (this.data.type === 'DEPC' || this.data.type === 'RDEPC' || this.data.type === 'SR') {
        url = `${this.endpoint.finance.cashBank}/credit-memo?type=${this.data.type}`
      } else if (this.data.type === 'DEPS' || this.data.type === 'RDEPS' || this.data.type === 'PR') {
        url = `${this.endpoint.finance.cashBank}/debit-memo?type=${this.data.type}`
      } else if (this.data.type === 'SDP' || this.data.type === 'RSDP') {
        url = `${this.endpoint.finance.cashBank}/sdp?type=${this.data.type}`
      }
      return url
    },
    getFilters() {
      const filter = []
      if (this.data.value) {
        filter.push({
          field: this.data.by,
          operator: 'contains',
          keyword: this.data.value
        })
      }
      
      if (this.data.startDate) {
        filter.push({
          field: 'date',
          operator: 'gte',
          keyword: this.data.startDate
        })
      }
      
      if (this.data.endDate) {
        filter.push({
          field: 'date',
          operator: 'lte',
          keyword: this.data.endDate
        })
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
      this.getTypeCoaCode()
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
      } else if (this.data.type === 'AP' || this.data.type === 'EPAP') {
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
      } else if (this.data.type === 'DEPC' || this.data.type === 'RDEPC' || this.data.type === 'SR' || this.data.type === 'SDP' || this.data.type === 'RSDP') {
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
      } else if (this.data.type === 'DEPS' || this.data.type === 'RDEPS' || this.data.type === 'PR') {
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
          coaName: this.coas.find(x => x.code === this.data.coaCode)?.name
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

          this.selected[i].coaCode = this.typeCoaCode
          this.selected[i].coaName = this.typeCoaName
          this.selected[i].id = randomNumber(-1, -1000)
          this.selected[i].notes = this.selected[i][field]
          this.selected[i].type = this.data.type
          this.selected[i].typeAmount = this.getTypeAmount()
          this.selected[i].transAmount = this.selected[i].remaining
          this.selected[i].transCode = this.selected[i].code
        }
      }
    },
    getTypeAmount() {
      if (this.data.type === 'AR' || this.data.type === 'DEPC' || this.data.type === 'RDEPS' || this.data.type === 'PR' || this.data.type === 'SDP') {
        return 'C'
      } else {
        return 'D'
      }
    },
    getFieldForNote() {
      if (this.data.type === 'AR' || this.data.type === 'DEPC' || this.data.type === 'RDEPC' || this.data.type === 'SR' || this.data.type === 'SDP' || this.data.type === 'RSDP') {
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
    }
  }
}
</script>
