<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row no-gutters>
              <v-col cols="12" md="6">
                Laporan Jurnal
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
                          title="Daftar Laporan Jurnal"
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
            <v-row no-gutters>
              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="data.rptBy"
                  :items="types"                  
                  label="Tipe Laporan"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  @change="changeRptBy()"
                >
                </v-autocomplete>
              </v-col>
              <v-col v-if="this.data.rptBy === 'DT'" cols="12" md="2" class="pl-1">
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
              <v-col v-if="this.data.rptBy === 'DT'" cols="12" md="2" class="pl-1">
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
              <v-col v-if="this.data.rptBy === 'N'" cols="12" md="2" class="pl-1">
                 <v-text-field
                  v-model="data.vouFrom"
                  class="mt-0"
                  label="Kode Jurnal"
                  required
                  dense
                ></v-text-field>
              </v-col>
              <v-col v-if="this.data.rptBy === 'N'" cols="12" md="2" class="pl-1">
                 <v-autocomplete
                  v-model="data.rptDet"
                  :items="detTypes"                  
                  label="Detail"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  @change="clearTable()"
                >
                </v-autocomplete>
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
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="2" class="pl-1">
                <v-autocomplete
                  v-model="data.sort"
                  :items="sortTypes"                  
                  label="Urutkan"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
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
            :footer-props="{ itemsPerPageOptions: gridDefOpts.rptPageSizes }"
            :height="grid.height"
            :items="grid.data"
            :items-per-page="gridDefOpts.rptPageSize"
            class="elevation-1"
            fixed-header
          >
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
      dateFrom: false,
      dateTo: false
    },
    grid: {
      height: 100,
      columns: [
        { text: 'Tanggal', value: 'sortDate', divider: true, width: '120', excelColWidth:'15' },
        { text: 'Kode', value: 'sortCode', divider: true, width: '200', excelColWidth:'36' },
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
      data: []
    },
    coas: [],
    filter: false,
    types: [{ id: 'N', name: 'Berdasarkan Kode' }, { id: 'DT', name: 'Berdasarkan Tanggal' }],
    detTypes: [{ id: 'C', name: 'Kode' }, { id: 'CR', name: 'Kode dan Ref' }],
    sortTypes: [{ id: 'N', name: 'Kode Jurnal' }, { id: 'DT', name: 'Tanggal Jurnal' }],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tipe Laporan', value: 'rptBy'},
        {text: 'Tanggal Mulai', value: 'dateFrom'},
        {text: 'Tanggal Akhir', value: 'dateTo'},
        {text: 'Kode Jurnal', value: 'vouFrom'},
        {text: 'Detail', value: 'rptDet'},
        {text: 'Akun', value: ' coa'},
        {text: 'Urutkan', value: 'sort'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getCOAList()
    auth.getAction(this.endpoint, this.menuId.journalReport)
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
        text: 'Jurnal'
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
    formatDateFrom() {
      return this.data.dateFrom ? format(parseISO(this.data.dateFrom), 'dd-MMM-yyyy') : ''
    },
    formatDateTo() {
      return this.data.dateTo ? format(parseISO(this.data.dateTo), 'dd-MMM-yyyy') : ''
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
        rptBy: 'N',
        dateFrom: format(new Date(), 'yyyy-MM-dd'),
        dateTo:  format(new Date(), 'yyyy-MM-dd'),
        vouFrom: null,
        rptDet: 'C',
        coaCode: null,
        sort: 'N'
      }
      this.filter = true
    },
    getList() {
      if (this.data.rptBy === 'N' && this.data.vouFrom === null) {
        this.$store.dispatch('app/showInfo', 'Kode jurnal harus diisi jika tipe laporan berdasarkan kode.')
        return
      }

      api.create(`${this.endpoint.accounting.journalReport}/lists`, this.data)
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
          this.grid.data = response.data
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
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.coas = response.data.tableData
        })
    },
    appendFilter() {
      this.exportFilter.searches = []

      const type = this.types.find(x => x.id === this.data.rptBy)
      if (type) {
        const searchType = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchType.field = 'rptBy'
        searchType.keyword = type.name
        this.exportFilter.searches.push(searchType)
      }

      if (this.data.rptBy === 'DT') {
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
      } else if (this.data.rptBy === 'N') {
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
      }
      
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
    changeRptBy() {
      this.data.dateFrom = format(new Date(), 'yyyy-MM-dd')
      this.data.dateTo = format(new Date(), 'yyyy-MM-dd')
      this.data.vouFrom = null
      this.clearTable()
    }
  }
}

</script>
