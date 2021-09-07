<template>
  <div class="w-full">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Neraca Percobaan
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
                        <export-excel title="Daftar Laporan Neraca Percobaan" :grid="grid" :gridDefOpts="gridDefOpts" :filters="exportFilter" ref="exportExcel"></export-excel>
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
                Akun Detail - {{ this.data.coaCode }} - {{ this.data.coaName }}
              </v-col>
              <v-col v-if="mainDet === 2" cols="12" md="6">
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
                        <export-excel :title=" mainDet === 1 ? 'Daftar Laporan Buku Besar - Neraca Percobaan' : 'Daftar Laporan Jurnal Detail - Buku Besar - Neraca Percobaan'" :grid="grid" :gridDefOpts="gridDefOpts" :filters="exportFilter" ref="exportExcel"></export-excel>
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
                <v-menu
                  v-model="menu.dateFrom"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatDateFrom"
                      label="Tanggal Mulai"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearDate('from')"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.dateFrom"
                    no-title
                    scrollable
                    @change="menu.dateFrom = false; changeDateFrom();"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="6" class="pl-1">
                <v-menu
                  v-model="menu.dateTo"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatDateTo"
                      label="Tanggal Akhir"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearDate('to')"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.dateTo"
                    no-title
                    scrollable
                    @change="menu.dateTo = false; changeDateTo();"
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
    main : true,
    mainDet: 0,
    menu: {
      dateFrom: false,
      dateTo: false
    },
    grid: {
      columns: [],
      data: []
    },
    defaultColumn: [
      { text: 'Kode Akun', value: 'coaCode', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Nama Akun', value: 'coaName', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Saldo Awal', value: 'beginBalIdr',  align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Debit', value: 'debetIdr',  align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Kredit', value: 'creditIdr',  align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Saldo Akhir', value: 'endBalIdr',  align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    ledgerColumn: [
      { text: 'Tanggal', value: 'accCode', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Kode', value: 'accName', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Catatan', value: 'notes', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Kode Ref 1', value: 'refCode1', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Debit', value: 'debetOc',  align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Kredit', value: 'creditOc',  align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Saldo Akhir', value: 'endBalOc',  align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Kode Ref 2', value: 'refCode2', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Kode Ref 3', value: 'refCode3', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Kode Ref 4', value: 'refCode4', width: '100', excelColWidth:'20' }
    ],
    detailColumn : [
      { text: 'Kode Akun', value: 'accCode', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Nama Akun', value: 'accName', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Catatan', value: 'notes', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Kode Ref 1', value: 'refCode1', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Debit', value: 'debetOc',  align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Kredit', value: 'creditOc',  align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Kode Ref 2', value: 'refCode2', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Kode Ref 3', value: 'refCode3', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Kode Ref 4', value: 'refCode4', width: '100', excelColWidth:'20' }
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
        {text: 'Urutkan', value: 'sort'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq' }],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    auth.getAction(this.endpoint, this.menuId.tbReport)
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
        text: 'Neraca Percobaan'
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
    formatDateFrom() {
      return this.data.dateFrom ? format(parseISO(this.data.dateFrom), 'dd-MMM-yyyy') : ''
    },
    formatDateTo() {
      return this.data.dateTo ? format(parseISO(this.data.dateTo), 'dd-MMM-yyyy') : ''
    }
  },
  
  methods:{
    reset() {
      this.data = {        
        rptBy: 'DT',
        dateFrom: format(new Date(), 'yyyy-MM-dd'),
        dateTo:  format(new Date(), 'yyyy-MM-dd'),
        vouFrom: null,
        rptDet: 'C',
        acc: null,
        acc2: null,
        sort: 'N',
        curr: 'IDR'
      }
      this.filter = true
    },
    getList() {
      api.create(`${this.endpoint.accounting.trialBalanceReport}/lists`, this.data)
        .then(response => {
          for (let index = 0; index < response.data.length; index++) {
            response.data[index].isBold = response.data[index].isBold === '1'
          }
          this.grid.columns = this.defaultColumn
          this.grid.data = response.data
          this.appendFilter()
        })
    },
    getLedger() {
      api.create(`${this.endpoint.accounting.generalLedgerReport}/lists`, this.data, {
        params: { caller: this.menuId.tbReport } })
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
        params: { caller: this.menuId.tbReport } })
        .then(response => {
          for (let index = 0; index < response.data.length; index++) {
            if (response.data[index].accCode !== null) {
              if (response.data[index].accCode.indexOf(' ') === -1) {
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

      const sortType = this.sortTypes.find(x => x.id === this.data.sort)
      if (sortType) {
        const searchSortType = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchSortType.field = 'sort'
        searchSortType.keyword = sortType.name
        this.exportFilter.searches.push(searchSortType)
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

      const sortType = this.sortTypes.find(x => x.id === this.data.sort)
      if (sortType) {
        const searchSortType = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchSortType.field = 'sort'
        searchSortType.keyword = sortType.name
        this.exportFilter.searches.push(searchSortType)
      }
    },
    clearTable() {
      this.grid.data = []
    },
    changeDateFrom() {
      if (this.data.dateFrom > this.data.dateTo) {
        this.data.dateTo = this.data.dateFrom
      }
      this.clearTable()
    },
    changeDateTo() {
      if (this.data.dateTo < this.data.dateFrom) {
        this.data.dateFrom = this.data.dateTo
      }
      this.clearTable()
    },
    clickDetail(event, { item }) {
      if (!this.main) {
        if (item.accCode !== undefined && item.accCode !== null) {
          this.data.oldDateFrom = this.data.dateFrom
          this.data.oldDateTo = this.data.dateTo
          this.data.dateFrom = format(parseISO(item.date), 'yyyy-MM-dd')
          this.data.dateTo = format(parseISO(item.date), 'yyyy-MM-dd')
          this.data.vouFrom = item.accName
          this.mainDet = 2
          this.getDetail()
        }
      } else if (item.coaCode !== undefined && item.coaCode !== null)  {
        this.data.acc = item.coaCode
        this.data.acc2 = item.coaCode
        this.data.coaCode = item.coaCode
        this.data.coaName = item.coaName
        this.mainDet = 1
        this.getLedger()
        this.main = false
        this.filter = false
      }
    },
    back() {
      this.mainDet = --this.mainDet
      if (this.mainDet === 1) {
        this.data.dateFrom = this.data.oldDateFrom
        this.data.dateTo = this.data.oldDateTo
        this.getLedger()
      } else if (this.mainDet === 0) {
        this.getList()
        this.main = true
        this.filter = true
      }
    },
    clearDate(item) {
      if (item === 'from') {
        this.data.dateFrom = null
      } else if (item === 'to') {
        this.data.dateTo = null
      }
      this.clearTable()
    }
  }
}

</script>
