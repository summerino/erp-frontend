<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Umur Hutang
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
                          title="Daftar Laporan Umur Hutang"
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
                Laporan Umur Hutang - Detail Berdasarkan Pemasok - {{ this.data.supName }} ({{ this.data.supCode }})
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
                          :title="`Daftar Laporan Umur Hutang - Detail Berdasarkan Pemasok - ${ this.data.supName } (${ this.data.supCode })`"
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
                  v-model="data.supplier"
                  :items="suppliers"
                  :item-text="item => `${item.initial} - ${item.name}`"
                  label="Pemasok"
                  item-value="code"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-autocomplete
                  v-model="data.duration"
                  :items="durations"
                  label="Durasi"
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
          <template v-slot:[`item.supName`]="{ item }">
            <span :class="item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.supName }}
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
          <template v-slot:[`item.remainderAmount`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.remainderAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.past90`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.past90 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.past61To90`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.past61To90 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.past31To60`]="{ item }">
           <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.past31To60 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.past15To30`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.past15To30 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.past8To14`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.past8To14 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.past1To7`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.past1To7 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.dueToday`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.dueToday | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.due1To7`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.due1To7 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.due8To14`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.due8To14 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.due15To30`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.due15To30 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.due31To60`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.due31To60 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.due61To90`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.due61To90 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.due90`]="{ item }">
            <span :class="item.name === 'Total' || item.supName === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.due90 | formatCurrency }}
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
      { text: 'Kd. Pemasok', value: 'code', divider: true, width: '100', excelColWidth:'18' },
      { text: 'Nm. Pemasok', value: 'name', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Jml. Transaksi', value: 'totalTrans', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Sisa Hutang', value: 'remainderAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat > 90 Hari', value: 'past90', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat 61-90 Hari', value: 'past61To90', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat 31-60 Hari', value: 'past31To60', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat 15-30 Hari', value: 'past15To30', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat 8-14 Hari', value: 'past8To14', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat 1-7 Hari', value: 'past1To7', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo Hari Ini', value: 'dueToday', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo 1-7 Hari', value: 'due1To7', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo 8-14 Hari', value: 'due8To14', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo 15-30 Hari', value: 'due15To30', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo 31-60 Hari', value: 'due31To60', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo 61-90 Hari', value: 'due61To90', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo > 90 Hari', value: 'due90', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    invColumn: [
      { text: 'Kd. Pemasok', value: 'supCode', divider: true, width: '100', excelColWidth:'18' },
      { text: 'Nm. Pemasok', value: 'supName', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
      { text: 'Tgl. Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '120', excelColWidth:'18', isDateTime: true },
      { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kd. Order', value: 'orderCode', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Sisa Hutang', value: 'remainderAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat > 90 Hari', value: 'past90', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat 61-90 Hari', value: 'past61To90', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat 31-60 Hari', value: 'past31To60', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat 15-30 Hari', value: 'past15To30', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat 8-14 Hari', value: 'past8To14', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Lewat 1-7 Hari', value: 'past1To7', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo Hari Ini', value: 'dueToday', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo 1-7 Hari', value: 'due1To7', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo 8-14 Hari', value: 'due8To14', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo 15-30 Hari', value: 'due15To30', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo 31-60 Hari', value: 'due31To60', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo 61-90 Hari', value: 'due61To90', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Jth. Tempo > 90 Hari', value: 'due90', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    durations: [{ id: 'Past90', name: 'Lewat > 90 Hari' }, { id: 'Past61To90', name: 'Lewat 61-90 Hari' }, { id: 'Past31To60', name: 'Lewat 31-60 Hari' },
      { id: 'Past15To30', name: 'Lewat 15-30 Hari' }, { id: 'Past8To14', name: 'Lewat 8-14 Hari' }, { id: 'Past1To7', name: 'Lewat 1-7 Hari' },
      { id: 'DueToday', name: 'Jth. Tempo Hari Ini' }, { id: 'Due1To7', name: 'Jth. Tempo 1-7 Hari' }, { id: 'Due8To14', name: 'Jth. Tempo 8-14 Hari' },
      { id: 'Due15To30', name: 'Jth. Tempo 15-30 Hari' }, { id: 'Due31To60', name: 'Jth. Tempo 31-60 Hari' }, { id: 'Due61To90', name: 'Jth. Tempo 61-90 Hari' },
      { id: 'Due90', name: 'Jth. Tempo > 90 Hari' }],
    suppliers: [],
    types: [{ id: 1, name: 'Berdasarkan Faktur' }, { id: 2, name: 'Berdasarkan Pemasok' }],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tipe Laporan', value: 'type'},
        {text: 'Sampai Tanggal', value: 'date'},
        {text: 'Pemasok', value: 'supplier'},
        {text: 'Durasi', value: 'duration'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    },
    originalType: null  
  }),

  created: function () {
    this.reset()
    this.getSupplierLists()
    auth.getAction(this.endpoint, this.menuId.apaReport)
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
        text: 'Umur Hutang'
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
        supplier: null,
        duration: null
      }
      this.originalType = 1
      this.filter = true
    },
    getList() {
      this.grid.columns = this.data.type === 1 ? this.invColumn : this.supColumn
      
      api.getAll(this.endpoint.purchase.apaReport, {
        params: {
          type: this.data.type,
          date: this.data.date,
          supCode: this.data.supplier,
          duration: this.data.duration
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
      this.data.supplier = this.data.oldSupplier
      this.data.duration = this.data.oldDuration
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
    getSupplierLists() {
      api.getAll(`${this.endpoint.general.supplier.supplier}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.suppliers = response.data.tableData
        })
    },
    dblclickRow(event, { item }) {
      if (this.data.type === 2) {
        this.data.oldType = this.data.type
        this.data.oldDate = this.data.date
        this.data.oldSupplier = this.data.supplier
        this.data.oldDuration = this.data.duration
        this.data.supCode = item.code
        this.data.supInitial = item.initial
        this.data.supName = item.name
        this.data.supplier = item.code
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
      const searchDate = {
        field: 'date',
        keyword: '',
        operator: 'eq'
      }

      const report = this.types.find(x => x.id === this.originalType)
      searchType.keyword = report.name
      this.exportFilter.searches.push(searchType)

      searchDate.keyword = this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchDate)

      const sup = this.suppliers.find(x => x.code === this.data.supplier)
      if (sup) {
        const searchSup = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchSup.field = 'supplier'
        searchSup.keyword = sup.name
        this.exportFilter.searches.push(searchSup)
      }

      const dtn = this.durations.find(x => x.id === this.data.duration)
      if (dtn) {
        const searchDuration = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchDuration.field = 'duration'
        searchDuration.keyword = dtn.name
        this.exportFilter.searches.push(searchDuration)
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
