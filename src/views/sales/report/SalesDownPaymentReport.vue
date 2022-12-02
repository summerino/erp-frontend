<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Uang Muka Penjualan
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
                          title="Daftar Laporan Uang Muka Penjualan"
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
                Laporan Uang Muka Penjualan - Detail Berdasarkan Pelanggan - {{ this.data.cusInitial }} - {{ this.data.cusName }} ({{ this.data.cusCode }})
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
                          :title="`Daftar Laporan Uang Muka Penjualan - Detail Berdasarkan Pelanggan  - ${ this.data.cusInitial } - ${ this.data.cusName } (${ this.data.cusCode })`"
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
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="data.type"
                  :items="types"                  
                  label="Tipe Laporan"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  @change="clearTable(); setOriginalType();"
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
                <v-autocomplete
                  v-model="data.srcTrans"
                  :items="sources"                  
                  label="Tipe Transaksi"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  @change="clearTable()"
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
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
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" md="6">
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
              <v-col v-if="data.srcTrans == 3" cols="12" md="6" class="pl-1">
                <v-autocomplete
                  v-model="data.status"
                  :items="statuses"
                  label="Status"
                  item-value="id"
                  item-text="name"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
              <v-col v-else cols="12" md="6" class="pl-1">
                <v-autocomplete
                  v-model="data.status"
                  :items="statusesRetur"
                  label="Status"
                  item-value="id"
                  item-text="name"
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
          <template v-slot:[`item.date`]="{ item }">
            {{ item.date | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.srcTrans`]="{ item }">
            {{ item.srcTrans === 3 ? 'Uang Muka' : 'Retur Uang Muka' }}
          </template>
          <template v-slot:[`item.amount`]="{ item }">
            {{ item.amount | formatCurrency }}
          </template>
          <template v-slot:[`item.usedAmount`]="{ item }">
            {{ item.usedAmount | formatCurrency }}
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
    supColumn: [
      { text: 'Kd. Pelanggan', value: 'code', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Nm. Pelanggan', value: 'name', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Jml. Transaksi', value: 'totalTrans', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Nilai Transaksi', value: 'totalAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Digunakan', value: 'paidAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Sisa', value: 'remainderAmount', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    cmColumn: [
      { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
      { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Tipe Trans.', value: 'srcTrans', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kd. Sumber', value: 'srcCode', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kd. Pelanggan', value: 'custCode', divider: true, width: '100', excelColWidth:'18' },
      { text: 'Nm. Pelanggan', value: 'custName', divider: true, width: '300', excelColWidth:'20' },
      { text: 'Nilai Transaksi', value: 'amount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Digunakan', value: 'usedAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Sisa', value: 'remainderAmount', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    types: [{ id: 1, name: 'Berdasarkan Kode' }, { id: 2, name: 'Berdasarkan Pelanggan' }],
    statuses: [{ id: 'PP', name: 'Belum Dibayarkan' }, { id: 'OS', name: 'Belum Habis Terpakai' },
      { id: 'A', name: 'Belum Digunakan' }, { id: 'PU', name: 'Digunakan Sebagian' }, { id: 'CMP', name: 'Digunakan Seluruhnya' }],
    statusesRetur:[{ id: 'PP', name: 'Belum Dibayarkan' }, { id: 'CMP', name: 'Sudah Dibayarkan' }],
    sources: [{ id: 3, name: 'Uang Muka' }, { id: 4, name: 'Retur Uang Muka' }],
    customers: [],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tipe Laporan', value: 'type'},
        {text: 'Tipe Transaksi', value: 'trans'},
        {text: 'Sampai Tanggal', value: 'date'},
        {text: 'Pelanggan', value: 'customer'},
        {text: 'Status', value: 'status'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    },
    originalType: null  
  }),

  created: function () {
    this.reset()
    this.getCustomerLists()
    auth.getAction(this.endpoint, this.menuId.sdpReport)
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
        text: 'Uang Muka Penjualan'
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
        srcTrans: 3,
        date: format(new Date(), 'yyyy-MM-dd'),
        customer: null,
        status: 'A'
      }
      this.originalType = 1
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

      this.grid.columns = this.data.type === 1 ? this.cmColumn : this.supColumn
      
      api.getAll(this.endpoint.sales.sdpReport, {
        params: {
          type: this.data.type,
          date: this.data.date,
          srcTrans: this.data.srcTrans,
          custCode: this.data.customer,
          status: this.data.status,
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
      this.data.srcTrans = this.data.oldSrcTrans
      this.data.date = this.data.oldDate
      this.data.customer = this.data.oldCustomer
      this.data.status = this.data.oldStatus
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
        this.data.oldSrcTrans = this.data.srcTrans
        this.data.oldDate = this.data.date
        this.data.oldCustomer = this.data.customer
        this.data.oldStatus = this.data.status
        this.data.cusCode = item.code
        this.data.cusInitial = item.initial
        this.data.cusName = item.name
        this.data.customer = item.code
        this.data.type = 1
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

      const searchTrans = {
        field: 'trans',
        keyword: '',
        operator: 'eq'
      }

      const searchDate = {
        field: 'date',
        keyword: '',
        operator: 'eq'
      }

      const report = this.types.find(x => x.id === this.originalType)
      searchType.keyword = report.name
      this.exportFilter.searches.push(searchType)

      const trans = this.sources.find(x => x.id === this.data.srcTrans)
      searchTrans.keyword = trans.name
      this.exportFilter.searches.push(searchTrans)

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

      const sts = this.statuses.find(x => x.id === this.data.status)
      if (sts) {
        const searchSts = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchSts.field = 'status'
        searchSts.keyword = sts.name
        this.exportFilter.searches.push(searchSts)
      }
    },
    clearTable() {
      this.grid.data = []
      this.grid.columns = []
    },
    setOriginalType() {
      this.originalType = this.data.type
    }
  }
}

</script>
