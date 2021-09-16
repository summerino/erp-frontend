<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Neraca
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
                      :disabled="!auth.allowPrint"
                      color="blue darken-1"
                      dark
                      tile
                      small
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
                          title="Daftar Laporan Neraca"
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
              <v-col v-if="mainDet === 1" cols="12" md="10">
                Akun Detail - {{ this.data.coaCode }} - {{ this.data.coaName }}
              </v-col>
              <v-col v-if="mainDet === 2" cols="12" md="10">
                Akun Detail - {{ this.data.coaCode }} - {{ this.data.coaName }} - Jurnal Detail - {{ this.data.vouFrom }}
              </v-col>
              <v-col cols="12" md="2" class="text-right">
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
                          :title="mainDet === 1 ? 'Daftar Laporan Buku Besar - Neraca Keuangan' : 'Daftar Laporan Jurnal Detail - Buku Besar - Neraca Keuangan'"
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
              <v-col cols="12" class="pl-1">
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
                      label="Periode"
                      class="mt-0"
                      dense
                      readonly
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.date"
                    type="month"
                    no-title
                    scrollable
                    @change="menu.date = false; changeDate();"
                  ></v-date-picker>
                </v-menu>
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
            :height="grid.height"
            :items="grid.data"
            :class="['elevation-1', this.mainDet === 0 ? 'row-pointer' : this.mainDet === 1 ? 'row-pointer' : '']"
            disable-sort
            fixed-header
            hide-default-footer
            disable-pagination
            @dblclick:row="clickDetail"
          >
            <template v-slot:[`item.coaCode`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.coaCode }}
              </span>
            </template>
            <template v-slot:[`item.coaName`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.coaName }}
              </span>
            </template>
            <template v-slot:[`item.accCode`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.accCode }}
              </span>
            </template>
            <template v-slot:[`item.accName`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.accName }}
              </span>
            </template>
            <template v-slot:[`item.notes`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.notes }}
              </span>
            </template>
            <template v-slot:[`item.debetOc`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.debetOc | formatCurrency }}
              </span>
            </template>
            <template v-slot:[`item.creditOc`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.creditOc | formatCurrency }}
              </span>
            </template>
            <template v-slot:[`item.endBalOc`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.endBalOc | formatCurrency }}
              </span>
            </template>
            <template v-slot:[`item.debetIdr`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.debetIdr | formatCurrency }}
              </span>
            </template>
            <template v-slot:[`item.creditIdr`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.creditIdr | formatCurrency }}
              </span>
            </template>
            <template v-slot:[`item.beginBalIdr`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.beginBalIdr | formatCurrency }}
              </span>
            </template>
            <template v-slot:[`item.endBalIdr`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.endBalIdr | formatCurrency }}
              </span>
            </template>
            <template v-slot:[`item.amount`]="{ item }">
              <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
                {{ item.amount | formatCurrency }}
              </span>
            </template>
            <template v-slot:[`item.name`]="{ item }">
              <span v-html="getSpaceName(item)" :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
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
import { format, parseISO, startOfMonth, endOfMonth }  from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import ExportExcel from '@/components/common/ExportExcel.vue'

export default {
  components:{
    ExportExcel
  },

  data: () => ({
    main : true,
    mainDet: 0,
    menu: {
      date: false
    },
    grid: {
      height: 100,
      columns: [],
      data: []
    },
    defaultColumn: [
      { text: 'Kode Akun', value: 'code', divider: true, width: '60', excelColWidth:'15' },
      { text: 'Nama Akun', value: 'name', divider: true, width: '400', excelColWidth:'50' },
      { text: 'Nilai', value: 'amount',  align: 'right', divider: true, width: '160', excelColWidth:'20', isCurrency: true }
    ],
    ledgerColumn: [
      { text: 'Tanggal', value: 'accCode', divider: true, width: '120', excelColWidth:'15' },
      { text: 'Kode', value: 'accName', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Catatan', value: 'notes', divider: true, width: '300', excelColWidth:'50' },
      { text: 'Kode Ref 1', value: 'refCode1', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Debit', value: 'debetOc',  align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
      { text: 'Kredit', value: 'creditOc',  align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
      { text: 'Saldo Akhir', value: 'endBalOc',  align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
      { text: 'Kode Ref 2', value: 'refCode2', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kode Ref 3', value: 'refCode3', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kode Ref 4', value: 'refCode4', width: '160', excelColWidth:'20' }
    ],
    detailColumn : [
      { text: 'Kode Akun', value: 'accCode', divider: true, width: '120', excelColWidth:'15' },
      { text: 'Nama Akun', value: 'accName', divider: true, width: '200', excelColWidth:'36' },
      { text: 'Catatan', value: 'notes', divider: true, width: '300', excelColWidth:'50' },
      { text: 'Kode Ref 1', value: 'refCode1', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Debit', value: 'debetOc',  align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
      { text: 'Kredit', value: 'creditOc',  align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
      { text: 'Kode Ref 2', value: 'refCode2', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kode Ref 3', value: 'refCode3', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kode Ref 4', value: 'refCode4', width: '160', excelColWidth:'20' }
    ],
    filter: false,
    types: [{ id: 'N', name: 'Berdasarkan Kode' }, { id: 'DT', name: 'Berdasarkan Tanggal' }],
    detTypes: [{ id: 'C', name: 'Kode' }, { id: 'CR', name: 'Kode dan Ref' }],
    sortTypes: [{ id: 'N', name: 'Kode Jurnal' }, { id: 'DT', name: 'Tanggal Jurnal' }],
    data: {},
    exportFilter: {
      fields : [
        {text: 'Tipe Laporan', value: 'rptBy'},
        {text: 'Tanggal Mulai', value: 'dateFrom'},
        {text: 'Tanggal Akhir', value: 'dateTo'},
        {text: 'Kode Jurnal', value: 'vouFrom'},
        {text: 'Detail', value: 'rptDet'},
        {text: 'Akun Mulai', value: 'acc'},
        {text: 'Akun Akhir', value: 'acc2'},
        {text: 'Periode', value: 'date'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq' }],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    auth.getAction(this.endpoint, this.menuId.bsReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Akuntansi'
      }, {
        text: 'Laporan'
      }, {
        text: 'Neraca Keuangan'
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
      return this.data.date ? format(parseISO(this.data.date), 'MMM-yyyy') : ''
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
        rptBy: 'DT',
        dateFrom: format(new Date(), 'yyyy-MM-dd'),
        dateTo:  format(new Date(), 'yyyy-MM-dd'),
        date: format(new Date(), 'yyyy-MM-dd'),
        vouFrom: null,
        rptDet: 'C',
        acc: null,
        acc2: null,
        sort: 'N',
        curr: 'IDR'
      }
      this.filter = true
      this.changeDate()
    },
    getList() {
      api.create(`${this.endpoint.accounting.balanceSheetReport}/lists`, this.data)
        .then(response => {
          this.grid.columns = this.defaultColumn
          this.grid.data = response.data.tableData
          this.appendFilter()
        })
    },
    getLedger() {
      api.create(`${this.endpoint.accounting.generalLedgerReport}/lists`, this.data, {
        params: { caller: this.menuId.bsReport } })
        .then(response => {
          for (let index = 0; index < response.data.length; index++) {
            if (response.data[index].accCode !== null) {
              response.data[index].debetOc = Number(response.data[index].debetOc)
              response.data[index].creditOc = Number(response.data[index].creditOc)
              response.data[index].endBalOc = Number(response.data[index].endBalOc)
            } else if (response.data[index].accCode === null) {
              if (response.data[index].notes !== null && (response.data[index].notes.includes('Total') || response.data[index].notes.includes('Saldo Awal'))) {
                response.data[index].debetOc = Number(response.data[index].debetOc)
                response.data[index].creditOc = Number(response.data[index].creditOc)
                response.data[index].endBalOc = Number(response.data[index].endBalOc)
              }
            }
          }
          this.grid.columns = this.ledgerColumn
          this.grid.data = response.data
          this.appendGLFilter()
        })
    },
    getDetail() {
      api.create(`${this.endpoint.accounting.journalReport}/lists`, this.data, {
        params: { caller: this.menuId.bsReport } })
        .then(response => {
          for (let index = 0; index < response.data.length; index++) {
            if (response.data[index].accCode !== null) {
              if (response.data[index].accCode.indexOf('-') === -1) {
                response.data[index].debetOc = Number(response.data[index].debetOc)
                response.data[index].creditOc = Number(response.data[index].creditOc)
              }
            } else if (response.data[index].accCode === null) {
              if (response.data[index].accName !== null && response.data[index].accName.includes('Total')) {
                response.data[index].debetOc = Number(response.data[index].debetOc)
                response.data[index].creditOc = Number(response.data[index].creditOc)
              }
            }
          }
          this.grid.columns = this.detailColumn
          this.grid.data = response.data
          this.appendDetailFilter()
        })
    },
    showfilter() {
      this.filter = !this.filter
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    appendFilter() {
      this.exportFilter.searches = []

      if (this.data.date) {
        this.exportFilter.searches.push({
          field: 'date',
          keyword: format(parseISO(this.data.date), 'MMM-yyyy'),
          operator: 'eq'
        })
      }
    },
    appendGLFilter() {
      this.exportFilter.searches = []

      if (this.data.dateFrom) {
        this.exportFilter.searches.push({
          field: 'dateFrom',
          keyword: format(parseISO(this.data.dateFrom), 'dd-MMM-yyyy'),
          operator: 'eq'
        })
      }

      if (this.data.dateTo) {
        this.exportFilter.searches.push({
          field: 'dateTo',
          keyword: format(parseISO(this.data.dateTo), 'dd-MMM-yyyy'),
          operator: 'eq'
        })
      }
      
      const coa = this.coas.find(x => x.code === this.data.acc)
      if (coa) {
        const searchCoa = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchCoa.field = 'acc'
        searchCoa.keyword = coa.name
        this.exportFilter.searches.push(searchCoa)
      }

      const coa2 = this.coas.find(x => x.code === this.data.acc2)
      if (coa2) {
        const searchCoa2 = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchCoa2.field = 'acc2'
        searchCoa2.keyword = coa2.name
        this.exportFilter.searches.push(searchCoa2)
      }
    },
    appendDetailFilter() {
      this.exportFilter.searches = []

      if (this.data.dateFrom) {
        this.exportFilter.searches.push({
          field: 'dateFrom',
          keyword: format(parseISO(this.data.dateFrom), 'dd-MMM-yyyy'),
          operator: 'eq'
        })
      }

      if (this.data.dateTo) {
        this.exportFilter.searches.push({
          field: 'dateTo',
          keyword: format(parseISO(this.data.dateTo), 'dd-MMM-yyyy'),
          operator: 'eq'
        })
      }
      const searchJournalCode = {
        field: 'vouFrom',
        keyword: '',
        operator: 'eq'
      }
      const searchDetail = {
        field: 'rptDet',
        keyword: '',
        operator: 'eq'
      }

      searchJournalCode.keyword = this.data.vouFrom
      this.exportFilter.searches.push(searchJournalCode)

      const detail = this.detTypes.find(x => x.id === this.data.rptDet)
      searchDetail.keyword = detail.name
      this.exportFilter.searches.push(searchDetail)
      
      const coa = this.coas.find(x => x.code === this.data.coaCode)
      if (coa) {
        const searchCoa = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchCoa.field = 'coa'
        searchCoa.keyword = coa.name
        this.exportFilter.searches.push(searchCoa)
      }
    },
    clearTable() {
      this.grid.data = []
    },
    clickDetail(event, { item }) {
      if (!this.main) {
        if (item.accCode !== undefined && item.accCode !== null) {
          this.data.dateFrom = format(parseISO(item.date), 'yyyy-MM-dd')
          this.data.dateTo = format(parseISO(item.date), 'yyyy-MM-dd')
          this.data.vouFrom = item.accName
          this.mainDet = 2
          this.getDetail()
        }
      } else if (item.code !== undefined && item.code !== null && !item.isBold)  {
        this.data.acc = item.code
        this.data.acc2 = item.code
        this.data.coaCode = item.code
        this.data.coaName = item.name
        this.mainDet = 1
        this.getLedger()
        this.main = false
        this.filter = false
        this.setGridDefaultHeight()
      }
    },
    back() {
      this.mainDet = --this.mainDet
      if (this.mainDet === 1) {
        this.getLedger()
      } else if (this.mainDet === 0) {
        this.data.acc = null
        this.data.acc2 = null
        this.getList()
        this.main = true
        this.filter = true
        this.setGridDefaultHeight()
      }
    },
    changeDate() {
      this.data.dateFrom = format(startOfMonth(parseISO(this.data.date)), 'yyyy-MM-dd')
      this.data.dateTo = format(endOfMonth(parseISO(this.data.date)), 'yyyy-MM-dd')
    },
    getSpaceName(item) {
      let space = ''
      if (item.deep !== null) {
        for (let i = 0; i < item.deep; i++) {
          space += '&nbsp;&nbsp;'
        }
      }
      space += item.name
      return space
    }
  }
}
</script>
