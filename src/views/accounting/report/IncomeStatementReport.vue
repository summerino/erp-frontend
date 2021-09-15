<template>
  <div class="w-full">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Laba Rugi
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
                        <export-excel title="Daftar Laporan Laba Rugi" :grid="grid" :gridDefOpts="gridDefOpts" :filters="exportFilter" ref="exportExcel"></export-excel>
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
              <v-col v-if="mainDet === 1" cols="12" md="6">
                Detail - {{ this.data.coaName }} - {{ this.data.currM }}
              </v-col>
              <v-col v-if="mainDet === 2" cols="12" md="6">
                Akun Detail - {{ this.data.coaCode }} - {{ this.data.coaName }} 
              </v-col>
              <v-col v-if="mainDet === 3" cols="12" md="6">
                Akun Detail - {{ this.data.coaCode }} - {{ this.data.coaName }} - Jurnal Detail - {{ this.data.vouFrom }}
              </v-col>
              <v-col cols="12" md="6" class="text-right">
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
                        <export-excel :title="mainDet === 1 ? `Detail - ${ this.data.coaName } - ${ this.data.currM }` 
                        : mainDet === 2 ? `Akun Detail - ${ this.data.coaCode } - ${ this.data.coaName }` 
                        : mainDet === 3 ? `Akun Detail - ${ this.data.coaCode } - ${ this.data.coaName } - Jurnal Detail - ${ this.data.vouFrom }` : ''" 
                        :grid="grid" :gridDefOpts="gridDefOpts" :filters="exportFilter" ref="exportExcel"></export-excel>
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
              <v-col cols="12" md="6" class="pl-1">
                <v-autocomplete
                  v-model="data.rptBy"
                  :items="types"                  
                  label="Tipe Laporan"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  @change="clearTable()"
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6" class="pl-1">
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
                    @change="menu.date = false; changeDate(); clearTable();"
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
            :height="gridDefOpts.height"
            :items="grid.data"
            :class="['elevation-1', this.mainDet < 3 ? 'row-pointer' : '']"
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
          <template v-slot:[`item.isName`]="{ item }">
            <span v-html="getSpaceName(item)" :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
            </span>
          </template>
          <template v-slot:[`item.isNowAmountIdr`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.isNowAmountIdr | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.isPrevAmountIdr`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.isPrevAmountIdr | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.isYtdAmountIdr`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.isYtdAmountIdr | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amountIdr`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amountIdr | formatCurrency }}
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
import { format, parseISO, startOfMonth, endOfMonth, sub, getYear }  from 'date-fns'

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
      columns: [],
      data: []
    },
    defaultColumn: [
      { text: 'Deskripsi', value: 'isName', divider: true, width: '500', excelColWidth:'70' },
      { text: 'currM', value: 'isNowAmountIdr', align: 'right', divider: true, width: '160', excelColWidth:'20', isCurrency: true },
      { text: 'lastM', value: 'isPrevAmountIdr',  align: 'right', divider: true, width: '160', excelColWidth:'20', isCurrency: true },
      { text: 'ytd', value: 'isYtdAmountIdr',  align: 'right', divider: true, width: '160', excelColWidth:'20', isCurrency: true }
    ],
    detailColumn: [
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
    journalColumn : [
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
    types: [{ id: '1S', name: 'Ringkasan' }, { id: '1D', name: 'Terperinci' }, { id: '2S', name: 'Ringkasan Berdasarkan Akun' }, { id: '2D', name: 'Terperinci Berdasarkan Akun' }],
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
        {text: 'Akun', value: 'coa'},
        {text: 'Periode', value: 'date'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq' }],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    auth.getAction(this.endpoint, this.menuId.isReport)
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
        text: 'Laba Rugi'
      }])
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  computed: {
    ...mapState({
      gridDefOpts: state => state.app.grid,
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    }),
    formatDate() {
      return this.data.date ? format(parseISO(this.data.date), 'MMM-yyyy') : ''
    }
  },
  
  methods:{
    reset() {
      this.data = {        
        rptBy: '1S',
        date: format(new Date(), 'yyyy-MM-dd'),
        vouFrom: null,
        rptDet: 'C',
        acc: null,
        acc2: null,
        sort: 'N',
        curr: 'IDR',
        periodType: 'M',
        plusMinus: null
      }
      this.filter = true
      this.changeDate()
    },
    getList() {
      api.create(`${this.endpoint.accounting.incomeStatementReport}/lists`, this.data)
        .then(response => {
          const cm = this.defaultColumn.find(x => x.text === 'currM')
          if (cm) {
            cm.text = this.data.currM
          }
          const lm = this.defaultColumn.find(x => x.text === 'lastM')
          if (lm) {
            lm.text = this.data.lastM
          }
          const ytd = this.defaultColumn.find(x => x.text === 'ytd')
          if (ytd) {
            ytd.text = `Sejauh Thn. ${getYear(parseISO(this.data.date))}`
          }
          
          this.grid.columns = this.defaultColumn
          this.grid.data = response.data
          this.appendFilter()
        })
    },
    getDetail() {
      api.create(`${this.endpoint.accounting.incomeStatementReport}/detail-lists`, this.data)
        .then(response => {
          
          this.grid.columns = this.detailColumn
          this.grid.data = response.data
          this.appendDetailFilter()
        })
    },
    getLedger() {
      api.create(`${this.endpoint.accounting.generalLedgerReport}/lists`, this.data, {
        params: { caller: this.menuId.isReport } })
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
    getJournal() {
      api.create(`${this.endpoint.accounting.journalReport}/lists`, this.data, {
        params: { caller: this.menuId.isReport } })
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
          this.grid.columns = this.journalColumn
          this.grid.data = response.data
          this.appendJournalFilter()
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

      const searchRpt = {
        field: 'rptBy',
        keyword: '',
        operator: 'eq'
      }

      const rptBy = this.types.find(x => x.id === this.data.rptBy)
      searchRpt.keyword = rptBy.name
      this.exportFilter.searches.push(searchRpt)

      if (this.data.date) {
        this.exportFilter.searches.push({
          field: 'date',
          keyword: format(parseISO(this.data.date), 'MMM-yyyy'),
          operator: 'eq'
        })
      }
    },
    appendDetailFilter() {
      this.exportFilter.searches = []

      const coa = this.coas.find(x => x.code === this.data.acc)
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
    appendJournalFilter() {
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
      if (this.mainDet === 0) {
        this.data.rptBy = `2${this.data.rptBy[1]}`
        this.data.acc = item.isCode
        this.data.coaName = item.isName
        this.data.plusMinus = item.isPm
        this.getDetail()
        this.main = false
        this.filter = false
      } else if (this.mainDet === 1)  {
        this.data.oldAcc = this.data.acc
        this.data.acc = item.coaCode
        this.data.acc2 = item.coaCode
        this.data.coaCode = item.coaCode
        this.data.coaName = item.coaName
        this.data.oldRptBy = this.data.rptBy
        this.data.rptBy = 'DT'
        this.getLedger()
      } else if (this.mainDet === 2)  {
        this.data.oldDateFrom = this.data.dateFrom
        this.data.oldDateTo = this.data.dateTo
        this.data.dateFrom = format(parseISO(item.date), 'yyyy-MM-dd')
        this.data.dateTo = format(parseISO(item.date), 'yyyy-MM-dd')
        this.data.vouFrom = item.accName
        this.getJournal()
      }

      if (this.mainDet < 3) {
        this.mainDet = ++this.mainDet
      } 
    },
    back() {
      this.mainDet = --this.mainDet
      if (this.mainDet === 0) {
        this.data.rptBy = `1${this.data.rptBy[1]}`
        this.getList()
        this.main = true
        this.filter = true
      } else if (this.mainDet === 1) {
        this.data.rptBy = this.data.oldRptBy
        this.data.acc = this.data.oldAcc
        this.getDetail()
      } else if (this.mainDet === 2) {
        this.data.dateFrom = this.data.oldDateFrom
        this.data.dateTo = this.data.oldDateTo
        this.getLedger()
      }
    },
    changeDate() {
      this.data.dateFrom = format(startOfMonth(parseISO(this.data.date)), 'yyyy-MM-dd')
      this.data.dateTo = format(endOfMonth(parseISO(this.data.date)), 'yyyy-MM-dd')
      this.data.currM = format(parseISO(this.data.date), 'MMM-yyyy')
      this.data.lastM = format(sub(parseISO(this.data.date), { months: 1}), 'MMM-yyyy')
    },
    getSpaceName(item) {
      let space = ''
      if (item.isDeep !== null) {
        for (let i = 0; i < item.isDeep; i++) {
          space += '&nbsp;&nbsp;'
        }
      }
      space += item.isName
      return space
    }
  }
}

</script>
