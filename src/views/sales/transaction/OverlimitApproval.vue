<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="4">
            Persetujuan Kelebihan Batas Kredit
          </v-col>
          <v-col cols="12" md="6">
            <v-row no-gutters>
              <v-text-field
                v-model="grid.search"
                :readonly="filter.isAdvancedSearch"
                label="Cari..."
                append-icon="mdi-magnify"
                class="font-weight-regular mt-0 pt-0"
                single-line
                @click:append-outer="advancedSearch"
                @keyup.enter="getList()"
              ></v-text-field>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    color="blue darken-2 ml-1"
                    class="font-weight-regular"
                    dark
                    small
                    tile
                    @click="advancedSearch"
                  >
                    <v-icon>
                      mdi-magnify-plus-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span class="text-caption">Pencarian Lanjutan</span>
              </v-tooltip>
              <export-excel
                ref="exportExcel"
                :company="companyName"
                :filters="filter"
                :grid="grid"
                :gridDefOpts="gridDefOpts"
                title="Daftar Persetujuan Batas Kredit"
              ></export-excel>
            </v-row>
          </v-col>
          <v-col cols="12" md="2" class="text-right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'alt', 'n']"
                  color="green darken-1"
                  class="font-weight-regular"
                  dark
                  small
                  tile
                  @click="save"
                  @shortkey="save"
                  :disabled="selected.length === 0 || !auth.allowApprove"
                >
                  Setujui
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + Alt + N)</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text v-if="true" class="pb-1">
        <advanced-search @search="search"></advanced-search>
      </v-card-text>

      <v-data-table
        :headers="grid.columns"
        :footer-props="{ itemsPerPageOptions: gridDefOpts.pageSizes }"
        :height="gridDefOpts.height"
        :items="grid.data"
        :items-per-page="gridDefOpts.pageSize"
        :options.sync="grid.options"
        :server-items-length="grid.total"
        :sort-by="grid.options.sortBy"
        :sort-desc="grid.options.sortDesc"
        class="elevation-1"
        fixed-header
        item-key="code"
        v-model="selected"
        show-select
      >
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.total`]="{ item }">
          {{ item.total | formatCurrency }}
        </template>
        <template v-slot:[`item.salesInitial`]="{ item }">
          {{ item.salesInitial }} - {{ item.salesName }}
        </template>
        <template v-slot:[`item.custName`]="{ item }">
          {{ item.custCode }} - {{ item.custName }}
        </template>
      </v-data-table>
    </v-card>
    <confirm ref="confirm"></confirm>
    <overlimit ref="overlimit"
    @closeParent="closePopup"></overlimit>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import Overlimit from '@/components/dialog/sales/Overlimit'


export default {
  components:{
    AdvancedSearch,
    ExportExcel,
    Confirm,
    Overlimit
  },

  data: () => ({
    filterFields: [{ text: 'Kode', value: 'code', dataType: 'text' },
      { text: 'Tanggal', value: 'date', dataType: 'datetime' },
      { text: 'Penjual', value: 'salesInitial', dataType: 'text' },
      { text: 'Kd. Pelanggan', value: 'custCode', dataType: 'text' },
      { text: 'Nama Pelanggan', value: 'custName', dataType: 'text' },
      { text: 'Sumber Transaksi', value: 'sourceTrans', dataType: 'text' }],
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '10' },
        { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'19' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Penjual', value: 'salesInitial', divider: true, width: '180', excelColWidth:'23', customValues: ['salesInitial', 'salesName']  },
        { text: 'Pelanggan', value: 'custName', divider: true, width: '220', excelColWidth:'35', customValues: ['custCode', 'custName'] },
        { text: 'Total', value: 'total', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
        { text: 'Sumber Transaksi', value: 'sourceTrans', width: '200', excelColWidth:'25' }
      ],
      data: [],
      options: {
        sortBy: ['updatedDate'],
        sortDesc: [true]
      },
      total: 0,
      search: null
    },
    selected: []
  }),
  created: function () {
    this.getList()
    auth.getAction(this.endpoint, this.menuId.overlimitApproval)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    this.$store.commit('app/setFilterFields', this.filterFields)
  },
  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Penjualan'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Persetujuan Kelebihan Batas Kredit'
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
      companyName: state => state.api.companyName,
      filter: state => state.app.filter,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    })
  },
  methods:{
    advancedSearch() {
      this.grid.search = null
      this.$store.commit('app/advSearch')
      if (this.filter.isAdvancedSearch) {
        this.$store.commit('app/addSearch')
      }
    },
    search(vm) {
      this.grid.search = vm.search
      this.getList(vm.filters)
    },
    getList(filters = []) {
      const sorts = []
      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }
      
      filters.push({
        field: 'mark',
        operator: 'eq',
        keyword: 'OL'
      })

      api.getAll(this.endpoint.sales.overlimitApproval, {
        params: {
          search: this.grid.search,
          skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
          take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
          filters: JSON.stringify(filters),
          sorts: JSON.stringify(sorts)
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
        })
    },   
    async save() {
      this.$refs.overlimit.open(this.selected)
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    closePopup() {
      this.getList()
    }
  }
}
</script>
