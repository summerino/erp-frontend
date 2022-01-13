<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row no-gutters>
              <v-col cols="12" md="6">
                Laporan Giro Mundur (Belum Jth. Tempo)
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
                          title="Daftar Laporan Giro Mundur (Belum Jth. Tempo)"
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
              <v-col cols="12" md="6">
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
              <v-col cols="12" md="6" class="pl-1">
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
            :options.sync="grid.options"
            :sort-by="grid.options.sortBy"
            :sort-desc="grid.options.sortDesc"
            class="elevation-1"
            fixed-header
            hide-default-footer
            disable-pagination
            disable-sort
          >
          <template v-slot:[`item.code`]="{ item }">
            <span :class="item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.code }}
            </span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            {{ item.date | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.chequeDate`]="{ item }">
            {{ item.chequeDate | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.balanceIn`]="{ item }">
            <span :class="item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.balanceIn | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.balanceOut`]="{ item }">
            <span :class="item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.balanceOut | formatCurrency }}
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
      date: false
    },
    grid: {
      height: 100,
      columns: [],
      data: [],
      options: {
        sortBy: ['date'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    filter: false,
    column: [
      { text: 'Tanggal', value: 'date', divider: true, width: '11%', excelColWidth:'20', isDateTime: true },
      { text: 'Tanggal Cek', value: 'chequeDate', divider: true, width: '11%', excelColWidth:'20', isDateTime: true },
      { text: 'Kode', value: 'code', divider: true, width: '11%', excelColWidth:'20' },
      { text: 'Nama Akun', value: 'coaName', divider: true, width: '11%', excelColWidth:'20' },
      { text: 'Kode Cek', value: 'chequeNo', divider: true, width: '11%', excelColWidth:'20' },
      { text: 'Kode Trans.', value: 'transCode', divider: true, width: '11%', excelColWidth:'20' },
      { text: 'Pelanggan/Pemasok', value: 'clientName', divider: true, width: '11%', excelColWidth:'20' },
      { text: 'Saldo Masuk', value: 'balanceIn', align: 'right', divider: true, width: '11%', excelColWidth:'20', isCurrency: true },
      { text: 'Saldo Keluar', value: 'balanceOut', align: 'right', width: '11%', excelColWidth:'20', isCurrency: true }
    ],
    coas: [],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Sampai Tanggal', value: 'date'},
        {text: 'Akun', value: 'coa'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getCOAList()
    auth.getAction(this.endpoint, this.menuId.outstandingchequeReport)
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
        text: 'Giro Mundur (Belum Jth. Tempo)'
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
      action: state => state.api.action,
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
        this.grid.height = this.$el.clientHeight - this.$refs.filter.clientHeight - 61
      }, 0)
    },
    reset() {
      this.data = {        
        coaCode: null,
        date: format(new Date(), 'yyyy-MM-dd')
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
      
      this.grid.columns = this.column
      
      api.getAll(this.endpoint.finance.ocReport, {
        params: {
          coaCode: this.data.coaCode,
          date: this.data.date
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
            field: 'typeId',
            operator: 'neq',
            keyword: 1
          }])
        }
      })
        .then(response => {
          this.coas = response.data.tableData
        })
    },
    appendFilter() {
      this.exportFilter.searches = []
      const searchCoa = {
        field: 'coaCode',
        keyword: '',
        operator: 'eq'
      }
      const searchDate = {
        field: 'date',
        keyword: '',
        operator: 'eq'
      }

      const coa = this.coas.find(x => x.code === this.data.coaCode)
      if (coa) {
        searchCoa.keyword = coa.name
        this.exportFilter.searches.push(searchCoa)
      }

      searchDate.keyword = this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchDate)
    },
    clearTable() {
      this.grid.data = []
      this.grid.columns = []
    }
  }
}

</script>
