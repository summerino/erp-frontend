<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Mutasi Piutang
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
                          title="Daftar Laporan Mutasi Piutang"
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
                Laporan Mutasi Piutang - Detail Berdasarkan Pelanggan - {{ this.data.custName }} ({{ this.data.custCode }})
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
              <v-col cols="12" md="2">
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
              <v-col cols="12" md="2" class="pl-1">
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
              <v-col cols="12" md="2" class="pl-1">
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
              <v-col cols="12" md="2" class="pl-1">
                <v-autocomplete
                  v-model="data.slsId"
                  :items="salesmen"
                  :item-text="item => `${item.initial} - ${item.firstName}`"
                  label="Penjual"
                  item-value="id"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="2" class="pl-1">
                <v-autocomplete
                  v-model="data.custCode"
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
              <v-col cols="12" md="2" class="pl-1">
                <v-autocomplete
                  v-model="data.status"
                  :items="statuses"
                  label="Status"
                  item-text="name"
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
            disable-sort
            @dblclick:row="dblclickRow"
          >
          <template v-slot:[`item.code`]="{ item }">
            <span :class="item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.code }}
            </span>
          </template>
          <template v-slot:[`item.name`]="{ item }">
            <span :class="item.name === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.name }}
            </span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            {{ item.date | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.dueDate`]="{ item }">
            {{ item.dueDate | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.beginningBalance`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.beginningBalance | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.transAmount`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.transAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.paidAmount`]="{ item }">
           <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.paidAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.endingBalance`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.endingBalance | formatCurrency }}
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
      { text: 'Nama', value: 'name', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Jml. Transaksi', value: 'totalTrans', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Saldo Awal', value: 'beginningBalance', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Nilai Transaksi', value: 'transAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Nilai Bayar', value: 'paidAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Saldo Akhir', value: 'endingBalance', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
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
      { text: 'Saldo Awal', value: 'beginningBalance', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Nilai Transaksi', value: 'transAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Nilai Bayar', value: 'paidAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Saldo Akhir', value: 'endingBalance', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    invColumn: [
      { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
      { text: 'Tgl. Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '120', excelColWidth:'18', isDateTime: true },
      { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kd. Order', value: 'srcCode', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Penjual', value: 'slsName', divider: true, width: '150', excelColWidth:'20' },
      { text: 'Kd. Pelanggan', value: 'custCode', divider: true, width: '100', excelColWidth:'18' },
      { text: 'Nm. Pelanggan', value: 'custName', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Saldo Awal', value: 'beginningBalance', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Nilai Transaksi', value: 'transAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Nilai Bayar', value: 'paidAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Saldo Akhir', value: 'endingBalance', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    customers: [],
    salesmen: [],
    statuses: [{ id: 'NP', name: 'Belum Lunas' }, { id: 'P', name: 'Lunas' }],
    typesDlv: [{ id: 1, name: 'Berdasarkan Surat Jalan / Penjualan Langsung' }, { id: 2, name: 'Berdasarkan Pelanggan' }],
    typesInv: [{ id: 1, name: 'Berdasarkan Faktur / Saldo Awal' }, { id: 2, name: 'Berdasarkan Pelanggan' }],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tipe Laporan', value: 'type'},
        {text: 'Tanggal Mulai', value: 'startDate'},
        {text: 'Tanggal Akhir', value: 'endDate'},
        {text: 'Penjual', value: 'salesman'},
        {text: 'Pelanggan', value: 'customer'},
        {text: 'Status Lunas', value: 'status'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    },
    arRecogTime: null  
  }),

  created: function () {
    this.reset()
    this.getSalesmanLists()
    this.getCustomerLists()
    auth.getAction(this.endpoint, this.menuId.armReport)
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
        text: 'Mutasi Piutang'
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
        this.grid.height = this.$el.clientHeight - this.$refs.filter.clientHeight - 120
      }, 0)
    },
    reset() {
      this.data = {        
        type: 1,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        slsId: null,
        custCode: null,
        status: 'NP'
      }
      this.filter = true
    },
    getList() {
      this.grid.columns = this.data.type === 1 ? this.arRecogTime !== 'SI' ? this.dlvColumn : this.invColumn : this.custColumn
      
      api.getAll(this.endpoint.sales.armReport, {
        params: {
          type: this.data.type,
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          slsId: this.data.slsId,
          custCode: this.data.custCode,
          status: this.data.status
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
      this.data.startDate = this.data.oldStartDate
      this.data.endDate = this.data.oldEndDate
      this.data.slsId = this.data.oldSlsId
      this.data.custCode = this.data.oldCustCode
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
          this.salesmen = response.data.tableData
        })
    },
    dblclickRow(event, { item }) {
      if (this.data.type === 2) {
        this.data.oldType = this.data.type
        this.data.oldStartDate = this.data.startDate
        this.data.oldEndDate = this.data.endDate
        this.data.oldSlsId = this.data.slsId
        this.data.oldCustCode = this.data.custCode
        this.data.oldStatus = this.data.status
        this.data.custCode = item.code
        this.data.custName = item.name
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

      const report = this.types.find(x => x.id === this.data.type)
      searchType.keyword = report.name
      this.exportFilter.searches.push(searchType)

      searchStartDate.keyword = this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchStartDate)

      searchEndDate.keyword = this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchEndDate)

      const sls = this.salesmen.find(x => x.id === this.data.slsId)
      if (sls) {
        const searchSls = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchSls.field = 'salesman'
        searchSls.keyword = sls.firstName
        this.exportFilter.searches.push(searchSls)
      }

      const cust = this.customers.find(x => x.code === this.data.custCode)
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
        const searchStatus = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchStatus.field = 'status'
        searchStatus.keyword = sts.name
        this.exportFilter.searches.push(searchStatus)
      }
    },
    clearTable() {
      this.grid.data = []
      this.grid.columns = []
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
