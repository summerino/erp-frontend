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
        <v-toolbar-title>Pilih Nota</v-toolbar-title>
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
          <v-col cols="12" md="6" v-if="data.type !== 'TU'">
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
          <v-col cols="12" md="6" class="pl-md-1" v-if="data.type !== 'TU'">
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
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="data.by"
              :items="filters"
              label="Cari Berdasarkan"
              class="mt-0"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="6" class="pl-md-1">
            <v-text-field
              ref="search"
              v-model="data.value"
              label="Teks Pencarian"
              class="mt-0"
              @keyup.enter="search"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-card>
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
                <template v-slot:[`item.type`]="{ item }">
                  {{ item.src === 'BB' ? 'Saldo Awal' : item.type === 1 ? 'Deposit' : 'Retur' }}
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
                  {{ item.transAmount === undefined ? 0 : item.transAmount | formatCurrency}}
                </template>
              </v-data-table>
            </v-col>
          </v-row>
          <v-row no-gutters class="pt-2 px-2">
            <v-col cols="12" md="6" >
              <v-currency-field
                label="Nilai Transaksi"
                v-model="amount"
                class="text-body-2 text-right mt-0"
                readonly
              ></v-currency-field>
            </v-col>
            <v-col cols="12" md="6" class="pl-1">
              <v-currency-field
                label="Total"
                v-model="data.total"
                class="text-body-2 text-right mt-0"
                readonly
              ></v-currency-field>
            </v-col>
          </v-row>
        </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import { dateToTick } from '@/helpers/date-helpers'
import api from '@/services/axios.service'

export default {
  props: ['amount', 'transType', 'supOrCustCode'],
  created: function () {
    this.rules = this.$store.state.app.rules
    this.url = this.transType === 'debit' ? `${this.endpoint.purchase.debitMemo}/outstanding` : `${this.endpoint.sales.creditMemo}/outstanding`
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
        endDate: null
      },
      grid: {
        columns: [
          { value: 'action', sortable: false, divider: true, width: '1%' },
          { text: 'Kode', value: 'code', divider: true },
          { text: 'Tanggal', value: 'date', align: 'right', divider: true },
          { text: 'Sumber Transaksi', value: 'type', divider: true },
          { text: 'Nilai', value: 'amount', align: 'right', divider: true },
          { text: 'Sudah digunakan', value: 'used', align: 'right', divider: true },
          { text: 'Saldo', value: 'remaining', align: 'right', divider: true },
          { text: 'Nilai dipakai', value: 'transAmount', align: 'right', divider: true }
        ],
        data: []
      },
      filters: [
        {
          text: 'Kode Nota',
          value: 'code' 
        }],
      selected: [],
      url: ''
    }
  },
  watch: {
    'selected': {
      handler() {
        this.bindAdditionalData()
        this.calculateTotal()
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
      this.data.by = 'code'
      this.data.value = ''
      this.grid.data = []
      this.data.total = 0
      this.data.startDate = null
      this.data.endDate = null
      this.selected = []
      this.resetGeneralTransaction()
    },
    resetGeneralTransaction() {
      this.data.id = -dateToTick()
      this.data.amount = 0
      this.data.total = 0
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
      const filter = this.getFilters()

      api.getAll(`${this.url}`, {
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
    getFilters() {
      const filter = []
      const field = this.transType === 'debit' ? 'supCode' : 'custCode'
      
      filter.push({
        field: field,
        operator: 'eq',
        keyword: this.supOrCustCode
      })

      filter.push({
        field: 'remaining',
        operator: 'gt',
        keyword: 0
      })

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
      this.$emit('bindMemo', this.selected)
      this.close()
    },
    bindAdditionalData() {
      let temp = Number(this.amount)
      for (let i = 0; i < this.grid.data.length; i++) {
        this.grid.data[i].transAmount = 0
      }
      for (let i = 0; i < this.selected.length; i++) {
        this.selected[i].id = -dateToTick()
        if (temp > 0) {
          if (temp > this.selected[i].remaining) {
            this.selected[i].transAmount = this.selected[i].remaining
            temp -= this.selected[i].remaining
          } else {
            this.selected[i].transAmount = temp
            temp = 0
          }
        } else {
          this.selected.splice(i, 1)
          this.$store.dispatch('app/showInfo', 'Nilai melebihi nilai transaksi.')
        }
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
