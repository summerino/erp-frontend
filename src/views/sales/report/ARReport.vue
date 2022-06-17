<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Piutang
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
                          title="Daftar Laporan Piutang"
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
            <v-row v-else no-gutters>
              <v-col cols="12" md="8">
                Laporan Piutang - Detail Berdasarkan Pelanggan - {{ this.data.custInitial }} - {{ this.data.custName }} ({{ this.data.custCode }})
              </v-col>
              <v-col cols="12" md="4" class="text-right">
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
                          title="Daftar Laporan Piutang - Detail Berdasarkan Pelanggan"
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
                      v-shortkey="['esc']"
                      color="green darken-1"
                      class="font-weight-regular ml-1"
                      dark
                      small
                      tile
                      @click="back"
                      @shortkey="back"
                    >
                      <v-icon left>mdi-undo-variant</v-icon>
                      Kembali
                    </v-btn>
                  </template>
                  <span class="text-caption">(Esc)</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text v-if="this.filter" class="pa-2">
            <v-row no-gutters>
              <v-col cols="12" md="3">
                <v-autocomplete v-if="arRecogTime === 'SI'"
                  v-model="data.type"
                  :items="typesInv"                  
                  label="Tipe Laporan"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  @change="clearTable()"
                >
                </v-autocomplete>
                <v-autocomplete v-else
                  v-model="data.type"
                  :items="typesDlv"                  
                  label="Tipe Laporan"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  @change="clearTable()"
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-menu
                  v-model="menu.date"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatDate"
                      label="Sampai Tanggal"
                      class="mt-0"
                      dense
                      readonly
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.date"
                    no-title
                    scrollable
                    @change="menu.date = false; clearTable();"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-autocomplete
                  v-model="data.customer"
                  :items="customers"
                  :item-text="item => `${item.initial} - ${item.name}`"
                  label="Pelanggan"
                  item-value="code"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-autocomplete
                  v-model="data.sales"
                  :items="salesman"
                  :item-text="item => `${item.initial} - ${item.firstName}`"
                  label="Penjual"
                  item-value="id"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12">
          <v-card>
          <v-data-table
            :headers="grid.columns"
            :footer-props="{ itemsPerPageOptions: gridDefOpts.rptPageSizes }"
            :height="grid.height"
            :items="grid.data"
            :items-per-page="gridDefOpts.rptPageSize"
            :options.sync="grid.options"
            :sort-by="grid.options.sortBy"
            :sort-desc="grid.options.sortDesc"
            :class="['elevation-1', this.data.type === 2 ? 'row-pointer' : '']"
            fixed-header
            @dblclick:row="dblclickRow"
          >
          <template v-slot:[`item.slsName`]="{ item }">
            {{ item.slsInitial }} - {{ item.slsName}}
          </template>
          <template v-slot:[`item.date`]="{ item }">
            {{ item.date | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.dueDate`]="{ item }">
            {{ item.dueDate | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.totalAmount`]="{ item }">
            {{ item.totalAmount | formatCurrency }}
          </template>
          <template v-slot:[`item.paidAmount`]="{ item }">
            {{ item.paidAmount | formatCurrency }}
          </template>
          <template v-slot:[`item.remainderAmount`]="{ item }">
            {{ item.remainderAmount | formatCurrency }}
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
      date: false
    },
    grid: {
      height: 100,
      columns: [],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0
    },
    filter: false,
    custColumn: [
      { text: 'Kode', value: 'code', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Nama', value: 'name', divider: true, width: '300', excelColWidth:'20' },
      { text: 'Jml. Transaksi', value: 'totalTrans', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Nilai Transaksi', value: 'totalAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Nilai Bayar', value: 'paidAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Sisa', value: 'remainderAmount', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    dlvColumn: [
      { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
      { text: 'Tgl. Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '120', excelColWidth:'18', isDateTime: true },
      { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kd. Sumber', value: 'srcCode', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kd. Faktur', value: 'invCode', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Penjual', value: 'slsName', divider: true, width: '150', excelColWidth:'20' },
      { text: 'Kd. Pelanggan', value: 'custCode', divider: true, width: '100', excelColWidth:'18' },
      { text: 'Nm. Pelanggan', value: 'custName', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Nilai Transaksi', value: 'totalAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Nilai Bayar', value: 'paidAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Sisa', value: 'remainderAmount', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    invColumn: [
      { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
      { text: 'Tgl. Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '120', excelColWidth:'18', isDateTime: true },
      { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kd. Order', value: 'orderCode', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Penjual', value: 'salesName', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Kd. Pelanggan', value: 'custCode', divider: true, width: '100', excelColWidth:'18' },
      { text: 'Nm. Pelanggan', value: 'custName', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Nilai Transaksi', value: 'totalAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Nilai Bayar', value: 'paidAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Sisa', value: 'remainderAmount', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    typesDlv: [{ id: 1, name: 'Berdasarkan Surat Jalan / Penjualan Langsung / Saldo Awal' }, { id: 2, name: 'Berdasarkan Pelanggan' }],
    typesInv: [{ id: 1, name: 'Berdasarkan Faktur / Saldo Awal' }, { id: 2, name: 'Berdasarkan Pelanggan' }],
    customers: [],
    salesman: [],
    arRecogTime: null,
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tipe Laporan', value: 'type'},
        {text: 'Sampai Tanggal', value: 'date'},
        {text: 'Pelanggan', value: 'customer'},
        {text: 'Penjual', value: 'sales'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getSysARRecog()
    this.getSalesmanLists()
    this.getCustomerLists()
    auth.getAction(this.endpoint, this.menuId.arReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Penjualan'
      }, {
        text: 'Laporan'
      }, {
        text: 'Piutang'
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
    formatDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    }
  },
  
  methods:{
    setGridDefaultHeight() {
      this.grid.height = 100
      setTimeout(() => {
        this.grid.height = this.$el.clientHeight - this.$refs.filter.clientHeight - 120
      }, 0)
    },
    reset() {
      this.data = {        
        type: 1,
        date: format(new Date(), 'yyyy-MM-dd'),
        customer: null,
        sales: null
      }
      this.filter = true
    },
    getList() {
      const sorts = []
      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }

      this.grid.columns = this.data.type === 1 ? this.arRecogTime === 'SI' ? this.invColumn : this.dlvColumn : this.custColumn
      
      api.getAll(this.endpoint.sales.arReport, {
        params: {
          type: this.data.type,
          date: this.data.date,
          custCode: this.data.customer,
          slsId: this.data.sales,
          sorts: JSON.stringify(sorts)
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          this.appendFilter()
        })
    },
    back() {
      this.data.type = this.data.oldType 
      this.data.date = this.data.oldDate
      this.data.customer = this.data.oldCustomer
      this.data.sales = this.data.oldSales
      this.filter = true
      this.getList()
      this.main = true
      this.setGridDefaultHeight()
    },
    showfilter() {
      this.filter = !this.filter
    },
    async exportExcel() {
      this.exportExcel.export()
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
          this.salesman = response.data.tableData
        })
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
    dblclickRow(event, { item }) {
      if (this.data.type === 2) {
        this.data.oldType = this.data.type
        this.data.oldDate = this.data.date
        this.data.oldCustomer = this.data.customer
        this.data.oldSales = this.data.sales
        this.data.custCode = item.code
        this.data.custInitial = item.initial
        this.data.custName = item.name
        this.data.type = 1
        this.data.customer = item.code
        this.filter = false
        this.getList()
        this.main = false
        this.setGridDefaultHeight()
      }
    },
    appendFilter() {
      this.exportFilter.searches = []
      const searchType = {
        field: 'type',
        keyword: '',
        operator: 'eq'
      }
      const searchDate = {
        field: 'date',
        keyword: '',
        operator: 'eq'
      }

      const report = this.arRecogTime === 'SI' ? this.typesInv.find(x => x.id === this.data.type) : this.typesDlv.find(x => x.id === this.data.type)
      searchType.keyword = report.name
      this.exportFilter.searches.push(searchType)

      searchDate.keyword = this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchDate)

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

      const sls = this.salesman.find(x => x.id === this.data.sales)
      if (sls) {
        const searchSls = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchSls.field = 'sales'
        searchSls.keyword = sls.firstName
        this.exportFilter.searches.push(searchSls)
      }
    },
    clearTable() {
      this.grid.data = []
      this.grid.columns = []
    },
    getSysARRecog() {
      const codes = ['AR_RECOG_TIME']
      api.getAll(`${this.endpoint.systemManagement.parameter}/lists`, {
        params: {
          codes: JSON.stringify(codes)
        }
      })
        .then(response => {
          this.arRecogTime = response.data.tableData[0].value
        })
    }
  }
}

</script>
