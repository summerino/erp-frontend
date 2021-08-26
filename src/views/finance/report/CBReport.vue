<template>
  <div class="w-full">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row no-gutters>
              <v-col cols="12" md="6">
                Laporan Kas Bank
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
                        <export-excel title="Daftar Laporan Kas Bank" :grid="grid" :gridDefOpts="gridDefOpts" :filters="exportFilter" ref="exportExcel"></export-excel>
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
                  v-model="data.coaCode"
                  :items="coas"
                  label="Akun"
                  :item-text="item => `${item.code} - ${item.name}`"
                  item-value="code"
                  class="mt-0"
                  clearable
                  dense
                  @change="changeCoa()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-autocomplete
                  v-model="data.type"
                  :items="types"
                  :disabled="this.data.coaCode === null"                  
                  label="Tipe Laporan"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  clearable
                  dense
                  @change="clearTable()"
                >
                </v-autocomplete>
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
            :options.sync="grid.options"
            :sort-by="this.data.type === null ? grid.options.sortBy : null"
            :sort-desc="this.data.type === null ? grid.options.sortDesc : null"
            :disable-sort="this.data.type === null ? false : true"
            class="elevation-1"
            fixed-header
            hide-default-footer
            disable-pagination
          >
          <template v-slot:[`item.code`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.code }}
            </span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            {{ item.date | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.beginningBalance`]="{ item }">
            {{ item.beginningBalance | formatCurrency }}
          </template>
          <template v-slot:[`item.incomingBalance`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.incomingBalance | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.outgoingBalance`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.outgoingBalance | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.endingBalance`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
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
    menu: {
      startDate: false,
      endDate: false
    },
    grid: {
      columns: [],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    filter: false,
    acColumn: [
      { text: 'Kode', value: 'code', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Nama', value: 'name', divider: true, width: '100', excelColWidth:'20'},
      { text: 'Saldo Awal', value: 'beginningBalance', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Saldo Masuk', value: 'incomingBalance', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Saldo Keluar', value: 'outgoingBalance', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Saldo Akhir', value: 'endingBalance', align: 'right', width: '100', excelColWidth:'20', isNumber: true }
    ],
    aColumn: [
      { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '100', excelColWidth:'20', isDateTime: true},
      { text: 'Kode', value: 'code', divider: true, width: '100', excelColWidth:'20'},
      { text: 'Catatan', value: 'notes', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Saldo Masuk', value: 'incomingBalance', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Saldo Keluar', value: 'outgoingBalance', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Saldo Akhir', value: 'endingBalance', align: 'right', width: '100', excelColWidth:'20', isNumber: true }
    ],
    adColumn: [
      { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '100', excelColWidth:'20', isDateTime: true},
      { text: 'Kode', value: 'code', divider: true, width: '100', excelColWidth:'20'},
      { text: 'Catatan', value: 'notes', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Kode Trans.', value: 'transCode', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Kode Akun', value: 'coaCode', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Nama Akun', value: 'coaName', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Saldo Masuk', value: 'incomingBalance', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Saldo Keluar', value: 'outgoingBalance', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Saldo Akhir', value: 'endingBalance', align: 'right', width: '100', excelColWidth:'20', isNumber: true }
    ],
    coas: [],
    types: [{ id: 1, name: 'Rekapan' }, { id: 2, name: 'Terperinci' }],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tipe Laporan', value: 'type'},
        {text: 'Tanggal Mulai', value: 'startDate'},
        {text: 'Tanggal Akhir', value: 'endDate'},
        {text: 'Akun', value: 'coa'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getCOAList()
    auth.getAction(this.endpoint, this.menuId.cbReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Keuangan'
      }, {
        text: 'Laporan'
      }, {
        text: 'Kas Bank'
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
      action: state => state.api.action,
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
    reset() {
      this.data = {        
        type: null,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        coaCode: null
      }
      this.filter = true
    },
    getList() {
      if ((this.data.type === 1 && this.data.coaCode === null) || (this.data.type === 2 && this.data.coaCode === null)) {
        this.$store.dispatch('app/showInfo', 'Akun tidak boleh kosong jika tipe dipilih')
        return
      }
      const sorts = []
      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }
      
      this.grid.columns = this.data.type === 1 ? this.aColumn : this.data.type === 2 ? this.adColumn : this.acColumn
      
      api.getAll(this.endpoint.finance.cbReport, {
        params: {
          type: this.data.type,
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          coaCode: this.data.coaCode,
          sorts: JSON.stringify(sorts)
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
    getCOAList() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'typeid',
            operator: 'eq',
            keyword: 2
          }])
        }
      })
        .then(response => {
          this.coas = response.data.tableData
        })
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
      if (report) {
        searchType.keyword = report.name
        this.exportFilter.searches.push(searchType)
      }

      searchStartDate.keyword = this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchStartDate)

      searchEndDate.keyword = this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
      if (searchEndDate.keyword !== '') {
        this.exportFilter.searches.push(searchEndDate)
      }

      const coa = this.coas.find(x => x.code === this.data.coaCode)
      if (coa) {
        const searchCoa = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchCoa.field = 'coa'
        searchCoa.keyword = `${coa.code} - ${coa.name}`
        this.exportFilter.searches.push(searchCoa)
      }
    },
    clearTable() {
      this.grid.data = []
      this.grid.columns = []
    },
    changeCoa() {
      if (this.data.coaCode !== null) {
        this.data.type = 1
      } else {
        this.data.type = null
      }
      this.clearTable()
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
      if (item === 'start') {
        this.data.startDate = null
      }
      this.clearTable()
    }
  }
}

</script>
