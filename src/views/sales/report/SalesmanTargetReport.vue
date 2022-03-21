<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Target Penjual
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
                          title="Daftar Laporan Target Penjual"
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
                Detail - {{ this.data.salesName }} - {{ this.data.groupName }} - {{ this.data.subGroupName }}
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
                          :title="`Daftar Laporan Target Penjual - Detail - ${ this.data.salesName } - ${ this.data.groupName } - ${ this.data.subGroupName }`"
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
              <v-col cols="12" md="4">
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
              <v-col cols="12" md="4" class="pl-1">
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
                      @click:clear="clearDate('end')"
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
              <v-col cols="12" md="4" class="pl-1">
                <v-autocomplete
                  v-model="data.salesId"
                  :items="salesmans"
                  :item-text="item => `${item.initial} - ${item.firstName}`"
                  label="Penjual"
                  item-value="id"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="data.groupId"
                  :items="itemGroups"
                  label="Grup Barang"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  clearable
                  @change="groupIdChange(); clearTable();"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
                <v-autocomplete
                  v-model="data.subGroupId"
                  :items="itemSubGroups"
                  label="Sub Grup Barang"
                  item-value="id"
                  item-text="name"
                  class="mt-0"
                  dense
                  clearable
                  @change="subGroupIdChange(); clearTable()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
                <v-autocomplete
                  v-model="data.groupSubGroup"
                  :items="itemGroupSubGroup"
                  label="Nilai Sub Grup Barang"
                  item-value="name"
                  item-text="name"
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
            :height="grid.height"
            :items="grid.data"
            :items-per-page="-1"
            :options.sync="grid.options"
            :sort-by="grid.options.sortBy"
            :sort-desc="grid.options.sortDesc"
            :class="['elevation-1', this.main ? 'row-pointer' : '']"
            fixed-header
            hide-default-footer
            disable-pagination
            disable-sort
            @dblclick:row="dblclickRow"
          >
          <template v-slot:[`item.code`]="{ item }">
            <span :class="item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.code }}
            </span>
          </template>
          <template v-slot:[`item.itemGroup`]="{ item }">
            <span :class="item.itemGroup === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.itemGroup }}
            </span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            {{ item.date | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.dueDate`]="{ item }">
            {{ item.dueDate | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.qty`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qty | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.subTotal`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.subTotal | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.disc`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.disc | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.discHeader`]="{ item }">
           <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.discHeader | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.dpp`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.dpp | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.taxAmount`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.taxAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.total`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.total | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.grossAmount`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.grossAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.nettPrice`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.nettPrice | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalGrossAmount`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalGrossAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalDisc`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalDisc | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalDiscHeader`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalDiscHeader | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalAfterDisc`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalAfterDisc | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalDpp`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalDpp | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalTaxAmount`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalTaxAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalNettPrice`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalNettPrice | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.targetAmount`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.targetAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.realAmount`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.realAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.targetPercent`]="{ item }">
            <span :class="item.itemGroup === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.targetPercent | formatCurrency }}
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
      startDate: false,
      endDate: false
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
    salesColumn: [
      { text: 'Penjual', value: 'salesName', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Grup Barang', value: 'itemGroup', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Sub Grup Barang', value: 'itemSubGroup', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Nilai Sub Grup Barang', value: 'itemSubGroup2', divider: true, width: '160', excelColWidth:'20' },
      { text: 'EC Pelanggan', value: 'totalCustomers', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Target', value: 'targetAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Riil', value: 'realAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Pencapaian (%)', value: 'targetPercent', align: 'right', width: '100', excelColWidth:'20' }
    ],
    detailColumn: [
      { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
      { text: 'Tgl. Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
      { text: 'Kd. Faktur', value: 'code', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kd. Order', value: 'orderCode', divider: true, width: '160', excelColWidth:'20' },
      { text: 'No. Fkt. Pajak', value: 'taxInvoiceNo', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Tgl. Fkt. Pajak', value: 'taxInvoiceDate', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
      { text: 'Kd. Pelanggan', value: 'custCode', divider: true, width: '100', excelColWidth:'18' },
      { text: 'Nm. Pelanggan', value: 'custName', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Kd. Pengiriman', value: 'doCode', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Ins. Barang', value: 'itemInitial', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Nm. Barang', value: 'itemName', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Ins. Kategori', value: 'categoryInitial', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Satuan', value: 'unitName', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Harga Kotor', value: 'grossAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Diskon', value: 'disc', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Diskon H', value: 'discHeader', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Sub Total', value: 'subTotal', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'DPP', value: 'dpp', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Pajak', value: 'taxAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Harga Nett', value: 'nettPrice', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Harga Kotor', value: 'totalGrossAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Diskon', value: 'totalDisc', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Diskon H', value: 'totalDiscHeader', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Stlh. Diskon', value: 'totalAfterDisc', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total DPP', value: 'totalDpp', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Pajak', value: 'totalTaxAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Harga Nett', value: 'totalNettPrice', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    itemGroups: [],
    itemSubGroups: [],
    itemGroupSubGroup: [],
    listSubSubGroups: [],
    salesmans: [],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tanggal Mulai', value: 'startDate'},
        {text: 'Tanggal Akhir', value: 'endDate'},
        {text: 'Penjual', value: 'sales'},
        {text: 'Grup Barang', value: 'group'},
        {text: 'Sub Grup Barang', value: 'subGroup'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getSalesmanLists()
    this.getItemGroupLists()
    auth.getAction(this.endpoint, this.menuId.salesTargetReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Penjualan'
      }, {
        text: 'Laporan'
      }, {
        text: 'Target Penjual'
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
    formatStartDate() {
      return this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
    },
    formatEndDate() {
      return this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
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
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        salesId: null,
        groupId: null,
        subGroupId: null,
        groupSubGroup: null,
        isDetail: false,
        salesName: null,
        groupName: null,
        subGroupName: null
      }
      this.filter = true
    },
    getList() {
      if (this.main) {
        this.grid.columns = this.salesColumn
      } else {
        this.grid.columns = this.detailColumn
      }
      
      //const subGroup = this.itemSubGroups.find(x => x.id === this.data.subGroupId)

      api.getAll(this.endpoint.sales.stReport, {
        params: {
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          salesId: this.data.salesId,
          groupId: this.data.groupId,
          subGroupId: this.data.subGroupId,
          groupSubGroup: this.data.groupSubGroup,
          isDetail: !this.main
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          this.appendFilter()
        })
    },
    back() {
      this.data.startDate = this.data.oldStartDate
      this.data.endDate = this.data.oldEndDate
      this.data.salesId = this.data.oldSalesId
      this.data.groupId = this.data.oldGroupId
      this.data.subGroupId = this.data.oldSubGroupId
      this.filter = true
      this.main = true
      this.getList()
      this.setGridDefaultHeight()
    },
    showfilter() {
      this.filter = !this.filter
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    getSalesmanLists() {
      api.getAll(`${this.endpoint.general.employee}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'type',
            operator: 'eq',
            keyword: 2
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.salesmans = response.data.tableData
        })
    },
    getItemGroupLists() {
      api.getAll(`${this.endpoint.inventory.item.group}/lists`)
        .then(response => {
          this.itemGroups = response.data.tableData
        })
    },
    async getItemSubGroupLists() {
      const response = await api.getAll(`${this.endpoint.inventory.item.group}/item-by-id`, {
        params: { id: this.data.groupId }
      })

      const subGroup = response.data.tableData
      for (let i = 0; i < subGroup.length; i++) {
        const splitted = subGroup[i].value.split(';')
        for (let j = 0; j < splitted.length; j++) {
          this.listSubSubGroups.push(
            {
              id: subGroup[i].id,
              name: splitted[j]
            }
          )
          
        }
      }
      return subGroup
    },
    async groupIdChange() {
      this.data.subGroupId = null
      const listSubGroup = await this.getItemSubGroupLists()
      this.itemSubGroups = listSubGroup
    },
    subGroupIdChange() {
      this.data.groupSubGroup = null
      this.itemGroupSubGroup = this.listSubSubGroups.filter(x => x.id === this.data.subGroupId)
    },
    dblclickRow(event, { item }) {
      if (this.main) {
        this.data.oldStartDate = this.data.startDate
        this.data.oldEndDate = this.data.endDate
        this.data.oldSalesId = this.data.salesId
        this.data.oldGroupId = this.data.groupId
        this.data.oldSubGroupId = this.data.subGroupId
        this.data.salesId = item.salesId
        this.data.groupId = item.itemGroupId
        this.data.subGroupId = item.itemSubGroupId
        this.data.groupSubGroup = item.itemSubGroup2
        this.data.salesName = item.salesName
        this.data.groupName = item.itemGroup
        this.data.subGroupName = item.itemSubGroup
        this.filter = false
        this.main = false
        this.getList()
        this.setGridDefaultHeight()
      }
    },
    appendFilter() {
      this.exportFilter.searches = []
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

      searchStartDate.keyword = this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchStartDate)

      searchEndDate.keyword = this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchEndDate)

      const grp = this.itemGroups.find(x => x.id === this.data.groupId)
      if (grp) {
        const searchGrp = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchGrp.field = 'group'
        searchGrp.keyword = grp.name
        this.exportFilter.searches.push(searchGrp)
      }

      const subGrp = this.itemSubGroups.find(x => x.id === this.data.subGroupId)
      if (subGrp) {
        const searchSubGrp = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchSubGrp.field = 'subGroup'
        searchSubGrp.keyword = subGrp.name
        this.exportFilter.searches.push(searchSubGrp)
      }

      const sls = this.salesmans.find(x => x.id === this.data.salesId)
      if (sls) {
        const searchSales = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchSales.field = 'sales'
        searchSales.keyword = sls.firstName
        this.exportFilter.searches.push(searchSales)
      }
    },
    clearTable() {
      this.grid.data = []
      this.grid.columns = []
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
      if (item === 'end') {
        this.data.endDate = null
      } else if (item === 'start') {
        this.data.startDate = null
      }
      this.clearTable()
    }
  }
}

</script>
