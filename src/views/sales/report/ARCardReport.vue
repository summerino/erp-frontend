<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row no-gutters>
              <v-col cols="12" md="6">
                Laporan Kartu Piutang
              </v-col>
              <v-col cols="12" md="6" class="text-right">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      v-shortkey="['ctrl', 'alt', 's']"
                      color="blue darken-1"
                      class="font-weight-regular"
                      dark
                      small
                      tile
                      @click="getList"
                      @shortkey="getList"
                    >
                      <v-icon left>mdi-magnify</v-icon>
                      Cari
                    </v-btn>
                  </template>
                  <span class="text-caption">(Ctrl + Alt + S)</span>
                </v-tooltip>
                <v-menu
                  bottom
                  open-on-hover
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      color="blue darken-1"
                      dark
                      tile
                      small
                      :disabled="!auth.allowPrint"
                    >
                      <v-icon>mdi-menu-down</v-icon>
                    </v-btn>
                  </template>
                  <v-list class="cursor-pointer">
                    <v-list-item>
                      <v-list-item-title>
                        <export-excel
                          ref="exportExcel"
                          :company="companyName"
                          :filters="exportFilter"
                          :grid="grid"
                          :gridDefOpts="gridDefOpts"
                          title="Daftar Laporan Kartu Piutang"
                        ></export-excel>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      v-shortkey="['ctrl', 'alt', 'f']"
                      color="green darken-1"
                      class="font-weight-regular ml-1"
                      dark
                      small
                      tile
                      @click="showfilter"
                      @shortkey="showfilter"
                    >
                      <v-icon left>mdi-filter</v-icon>
                      Filter
                    </v-btn>
                  </template>
                  <span class="text-caption">(Ctrl + Alt + F)</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text v-if="this.filter" class="pa-2">
            <v-form
              ref="form"
              v-model="valid"
            >
              <v-row no-gutters>
                <v-col cols="12" md="3">
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
                        label="Tanggal Mulai"
                        class="mt-0"
                        dense
                        readonly
                        clearable
                        @click:clear="clearDate('start')"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="data.startDate"
                      no-title
                      scrollable
                      @change="menu.startDate = false; changeStartDate();"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" md="3" class="pl-1">
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
                        dense
                        readonly
                        clearable
                        @click:clear="clearDate('end')"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="data.endDate"
                      no-title
                      scrollable
                      @change="menu.endDate = false; changeEndDate();"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" md="3" class="pl-1">
                  <v-autocomplete
                    v-model="data.customer"
                    :items="customers"
                    :item-text="item => `${item.initial} - ${item.name}`"
                    :rules="rules.required"
                    label="Pelanggan"
                    item-value="code"
                    class="mt-0"
                    dense
                    required
                    @change="clearTable()"
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" md="3" class="pl-1">
                  <v-autocomplete
                    v-model="data.sales"
                    :items="employees"
                    :item-text="item => `${item.initial} - ${item.firstName}`"
                    label="Penjual"
                    item-value="id"
                    class="mt-0"
                    clearable
                    dense
                    @change="clearTable()"
                  ></v-autocomplete>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12">
          <v-card>
          <v-data-table  
            :headers="grid.columns"
            :height="grid.height"
            :items="grid.data"
            :items-per-page="-1"
            :options.sync="grid.options"
            :sort-by="grid.options.sortBy"
            :sort-desc="grid.options.sortDesc"
            class="elevation-1"
            fixed-header
            hide-default-footer
            disable-pagination
            disable-sort
          >
          <template v-slot:[`item.code`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.code }}
            </span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            {{ item.date | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.debitAmount`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.debitAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.creditAmount`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.creditAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.remainingAmount`]="{ item }">
           <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.remainingAmount | formatCurrency }}
            </span>
          </template>
          </v-data-table>
        </v-card>
      </v-col> 
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import ExportExcel from '@/components/common/ExportExcel.vue'

export default {
  components:{
    ExportExcel
  },

  data: () => ({
    main: true,
    menu: {
      startDate: false,
      endDate: false
    },
    grid: {
      height: 100,
      columns: [
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Kd. Trans.', value: 'code', divider: true, width: '120', excelColWidth:'12' },
        { text: 'Keterangan', value: 'notes', divider: true, width: '300', excelColWidth:'40' },
        { text: 'Debit', value: 'debitAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
        { text: 'Kredit', value: 'creditAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
        { text: 'Saldo Akhir', value: 'remainingAmount', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0
    },
    filter: false,
    customers: [],
    employees: [],
    valid: false,
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tanggal Mulai', value: 'startDate'},
        {text: 'Tanggal Akhir', value: 'endDate'},
        {text: 'Pelanggan', value: 'customer'},
        {text: 'Penjual', value: 'sales'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getCustomerLists()
    this.getSalesmanLists()
    auth.getAction(this.endpoint, this.menuId.arcReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Pembelian'
      }, {
        text: 'Laporan'
      }, {
        text: 'Kartu Piutang'
      }])
      this.setGridDefaultHeight()
    }, 0)
  },

  computed: {
    ...mapState({
      gridDefOpts: state => state.app.grid,
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint,
      companyName: state => state.api.companyName,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    }),
    formatStartDate() {
      return this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
    },
    formatEndDate() {
      return this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
    }
  },
  
  methods:{
    setGridDefaultHeight() {
      this.grid.height = 100
      setTimeout(() => {
        this.grid.height = this.$el.clientHeight - this.$refs.filter.clientHeight - 61
      }, 0)
    },
    reset() {
      this.data = {        
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        customer: null,
        sales: null
      }
      this.filter = true
    },
    getList() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      api.getAll(this.endpoint.sales.arcReport, {
        params: {
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          custCode: this.data.customer,
          salesId: this.data.sales
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          this.appendFilter()
        })
    },
    showfilter() {
      this.filter = !this.filter
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    getCustomerLists() {
      api.getAll(`${this.endpoint.general.customer.customer}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.customers = response.data.tableData
        })
    },
    getSalesmanLists() {
      api.getAll(`${this.endpoint.general.employee}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'type',
            operator: 'eq',
            keyword: 2
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.employees = response.data.tableData
        })
    },
    appendFilter() {
      this.exportFilter.searches = []
      const searchStartDate = {
        field: 'startDate',
        keyword: '',
        operator: 'eq'
      }

      const searchEndDate = {
        field: 'endDate',
        keyword: '',
        operator: 'eq'
      }
      
      searchStartDate.keyword = this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchStartDate)

      searchEndDate.keyword = this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchEndDate)

      const cust = this.customers.find(x => x.code === this.data.customer)
      if (cust) {
        const searchCust = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchCust.field = 'customer'
        searchCust.keyword = cust.name
        this.exportFilter.searches.push(searchCust)
      }

      const sls = this.sales.find(x => x.id === this.data.sales)
      if (sls) {
        const searchSales = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchSales.field = 'sales'
        searchSales.keyword = cust.firstName
        this.exportFilter.searches.push(searchSales)
      }
    },
    clearTable() {
      this.grid.data = []
    },
    changeStartDate() {
      if (this.data.startDate > this.data.endDate) {
        this.data.endDate = this.data.startDate
      }
      this.clearTable()
    },
    changeEndDate() {
      if (this.data.endDate < this.data.startDate) {
        this.data.startDate = this.data.endDate
      }
      this.clearTable()
    },
    clearDate(item) {
      if (item === 'end') {
        this.data.endDate = null
      } else if (item === 'start') {
        this.data.startDate = null
      }
      this.clearTable()
    }
  }
}

</script>
