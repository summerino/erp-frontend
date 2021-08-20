<template>
  <div class="w-full">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Hutang Ekspedisi
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
                        <export-excel title="Daftar Laporan Hutang Ekspedisi" :grid="grid" :gridDefOpts="gridDefOpts" :filters="exportFilter" ref="exportExcel"></export-excel>
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
              <v-col cols="12" md="6">
                Laporan Hutang Ekspedisi - Detail Berdasarkan Pemasok - {{ this.data.supInitial }} - {{ this.data.supName }} ({{ this.data.supCode }})
              </v-col>
              <v-col cols="12" md="6" class="text-right">
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
              <v-col cols="12" md="4" class="pl-1">
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
            :sort-by="grid.options.sortBy"
            :sort-desc="grid.options.sortDesc"
            :class="['elevation-1', this.data.type === 2 ? 'row-pointer' : '']"
            fixed-header
            hide-default-footer
            disable-pagination
            @dblclick:row="dblclickRow"
          >
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
      { text: 'Kode', value: 'code', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Nama', value: 'name', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Jumlah Transaksi', value: 'totalTrans', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Nilai Transaksi', value: 'totalAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Nilai Bayar', value: 'paidAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Sisa', value: 'remainderAmount', align: 'right', width: '100', excelColWidth:'20', isNumber: true }
    ],
    rcvColumn: [
      { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '100', excelColWidth:'20', isDateTime: true },
      { text: 'Tanggal Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '100', excelColWidth:'20', isDateTime: true },
      { text: 'Kode', value: 'code', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Kode Pemasok', value: 'supCode', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Nama Pemasok', value: 'supName', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Nilai Transaksi', value: 'totalAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Nilai Bayar', value: 'paidAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Sisa', value: 'remainderAmount', align: 'right', width: '100', excelColWidth:'20', isNumber: true }
    ],
    types: [{ id: 1, name: 'Berdasarkan Faktur' }, { id: 2, name: 'Berdasarkan Pemasok' }],
    suppliers: [],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tipe Laporan', value: 'type'},
        {text: 'Sampai Tanggal', value: 'date'},
        {text: 'Pemasok', value: 'supplier'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getSupplierLists()
    this.getList()
    auth.getAction(this.endpoint, this.menuId.epApReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Ekspedisi'
      }, {
        text: 'Laporan'
      }, {
        text: 'Hutang'
      }])
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  watch: {
    'grid.options': {
      handler() {
        this.getList()
      },
      deep: true
    }
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
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    }
  },
  
  methods:{
    reset() {
      this.data = {        
        type: 1,
        date: format(new Date(), 'yyyy-MM-dd'),
        supplier: null
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

      this.grid.columns = this.data.type === 1 ? this.rcvColumn : this.supColumn
      
      api.getAll(this.endpoint.expedition.epApReport, {
        params: {
          type: this.data.type,
          date: this.data.date,
          supCode: this.data.supplier,
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
      this.reset()
      this.getList()
      this.main = true
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
        this.data.supCode = item.code
        this.data.supInitial = item.initial
        this.data.supName = item.name
        this.data.supplier = item.code
        this.data.type = 1
        this.filter = false
        this.getList()
        this.main = false
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

      const report = this.types.find(x => x.id === this.data.type)
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
    },
    clearTable() {
      this.grid.data = []
      this.grid.columns = []
    }
  }
}

</script>
