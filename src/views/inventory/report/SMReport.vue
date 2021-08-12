<template>
  <div class="w-full">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Mutasi Stok
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
                        <export-excel title="Daftar Laporan Mutasi Stok" :grid="grid" :gridDefOpts="gridDefOpts" :filters="exportFilter" ref="exportExcel"></export-excel>
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
                Laporan Mutasi Stok - Detail Berdasarkan {{ this.data.filterName }} - {{ this.data.initial }} - {{ this.data.name }}
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
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.startDate"
                    no-title
                    scrollable
                    @change="menu.startDate = false"
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
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.endDate"
                    no-title
                    scrollable
                    @change="menu.endDate = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="2" class="pl-1">
                <v-autocomplete
                  v-model="data.itemId"
                  :items="items"
                  :item-text="item => `${item.initial} - ${item.name}`"
                  label="Barang"
                  item-value="id"
                  class="mt-0"
                  dense
                  clearable
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="2" class="pl-1">
                <v-autocomplete
                  v-model="data.typeUnit"
                  :items="typeUnits"                  
                  label="Satuan"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
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
            :sort-by="grid.options.sortBy"
            :sort-desc="grid.options.sortDesc"
            :class="['elevation-1', this.data.type === 2 ? 'row-pointer' : !this.data.isSM ? 'row-pointer' : '']"
            fixed-header
            hide-default-footer
            disable-pagination
            @dblclick:row="dblclickRow"
          >
          <template v-slot:[`item.date`]="{ item }">
            {{ item.date | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.invBegin`]="{ item }">
            {{ item.invBegin | formatCurrency }}
          </template>
          <template v-slot:[`item.invIn`]="{ item }">
            {{ item.invIn | formatCurrency }}
          </template>
          <template v-slot:[`item.invOut`]="{ item }">
            {{ item.invOut | formatCurrency }}
          </template>
          <template v-slot:[`item.invEnd`]="{ item }">
            {{ item.invEnd | formatCurrency }}
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
      columns: [],
      data: [],
      options: {
        sortBy: ['initial'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    filter: false,
    whColumn: [
      { text: 'Kode', value: 'code', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Inisial', value: 'initial', divider: true, width: '100', excelColWidth:'20'},
      { text: 'Nama', value: 'name', divider: true, width: '100', excelColWidth:'20'},
      { text: 'Qty Awal', value: 'qtyBegin', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Masuk', value: 'qtyIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Keluar', value: 'qtyOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Akhir', value: 'qtyEnd', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Awal', value: 'invBegin', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Masuk', value: 'invIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Keluar', value: 'invOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Akhir', value: 'invEnd', align: 'right', width: '100', excelColWidth:'20', isNumber: true }
    ],
    itemColumn: [
      { text: 'Inisial', value: 'initial', divider: true, width: '100', excelColWidth:'20'},
      { text: 'Nama', value: 'name', divider: true, width: '100', excelColWidth:'20'},
      { text: 'Satuan', value: 'unit', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Qty Awal', value: 'qtyBegin', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Masuk', value: 'qtyIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Keluar', value: 'qtyOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Akhir', value: 'qtyEnd', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Awal', value: 'invBegin', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Masuk', value: 'invIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Keluar', value: 'invOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Akhir', value: 'invEnd', align: 'right', width: '100', excelColWidth:'20', isNumber: true }
    ],
    smColumn: [
      { text: 'Tgl. Transaksi', value: 'date', align: 'right', divider: true, width: '100', excelColWidth:'20', isDateTime: true},
      { text: 'Kode Transaksi', value: 'transCode', divider: true, width: '100', excelColWidth:'20'},
      { text: 'Tipe Transaksi', value: 'srcTrans', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Qty Masuk', value: 'qtyIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Keluar', value: 'qtyOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Akhir', value: 'qtyEnd', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Masuk', value: 'invIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Keluar', value: 'invOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Akhir', value: 'invEnd', align: 'right', width: '100', excelColWidth:'20', isNumber: true }
    ],
    types: [{ id: 1, name: 'Berdasarkan Barang' }, { id: 2, name: 'Berdasarkan Gudang' }],
    typeUnits: [{ id: 1, name: 'Satuan Terkecil' }, { id: 2, name: 'Satuan Beli' }, { id: 3, name: 'Satuan Jual' }],
    items: [],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tipe Laporan', value: 'type'},
        {text: 'Tanggal Mulai', value: 'startDate'},
        {text: 'Tanggal Akhir', value: 'endDate'},
        {text: 'Barang', value: 'item'},
        {text: 'Satuan', value: 'unit'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getItemLists()
    this.getList()
    auth.getAction(this.endpoint, this.menuId.smReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Persediaan'
      }, {
        text: 'Laporan'
      }, {
        text: 'Mutasi Stok'
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
        type: 1,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: null,
        whCode: null,
        itemId: null,
        typeUnit: 2,
        isSM: false
      }
      this.filter = true
      this.grid.columns = this.data.type === 1 ? this.itemColumn : this.whColumn
    },
    getList() {
      const sorts = []
      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }
      
      this.grid.columns = this.data.type === 1 ? this.data.isSM ? this.smColumn : this.itemColumn : this.whColumn
      
      api.getAll(this.endpoint.inventory.smReport, {
        params: {
          type: this.data.type,
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          whCode: this.data.whCode,
          itemId: this.data.itemId,
          typeUnit: this.data.typeUnit,
          isSM: this.data.isSM,
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
      this.grid.options.sortBy = ['initial']
      this.getList()
      this.main = true
    },
    showfilter() {
      this.filter = !this.filter
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    getItemLists() {
      api.getAll(this.endpoint.inventory.item.item)  
        .then(response => {
          this.items = response.data.tableData
        })
    },
    dblclickRow(event, { item }) {
      if (!this.data.isSM) {
        if (this.data.type === 1) {
          this.data.filterName = 'Barang'
          this.data.initial = item.initial
          this.data.name = item.name
          this.data.type = 1
          this.data.itemId = item.id
          this.data.isSM = true
          this.filter = false
          this.grid.options.sortBy = ['date']
          this.getList()
          this.main = false
        } else {
          this.data.filterName = 'Gudang'
          this.data.initial = item.initial
          this.data.name = item.name
          this.data.type = 1
          this.data.whCode = item.code
          this.data.isSM = false
          this.filter = false
          this.grid.options.sortBy = ['initial']
          this.getList()
          this.main = false
        }
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
      const searchUnit = {
        field: 'unit',
        keyword: '',
        operator: 'eq'
      }

      const report = this.types.find(x => x.id === this.data.type)
      searchType.keyword = report.name
      this.exportFilter.searches.push(searchType)

      searchStartDate.keyword = this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchStartDate)

      searchEndDate.keyword = this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
      if (searchEndDate.keyword !== '') {
        this.exportFilter.searches.push(searchEndDate)
      }

      const item = this.items.find(x => x.id === this.data.itemId)
      if (item) {
        const searchItem = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchItem.field = 'item'
        searchItem.keyword = item.name
        this.exportFilter.searches.push(searchItem)
      }

      const unitType = this.typeUnits.find(x => x.id === this.data.typeUnit)
      searchUnit.keyword = unitType.name
      this.exportFilter.searches.push(searchUnit)
    },
    clearTable() {
      this.grid.data = []
    }
  }
}

</script>
