<template>
  <div class="w-full">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Kehadiran
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
                          title="Daftar Kehadiran"
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
              <v-col cols="12" md="6">
                Laporan Kehadiran {{ this.data.filterName }} - {{ this.data.initial }} - {{ this.data.name }}
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
          <v-card-text class="pa-2">
            <v-row no-gutters>
              <v-col cols="12" md="4" class="pl-1">
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
                      clearable
                      dense
                      readonly
                      @click:clear="clearDate('start')"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.startDate"
                    no-title
                    scrollable
                    @change="changeDate()"
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
                      clearable
                      dense
                      readonly
                      @click:clear="clearDate('end')"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.endDate"
                    no-title
                    scrollable
                    @change="changeDate('end')"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
                <v-text-field
                  v-model="data.employee"
                  label="Nama"
                  class="mt-0"
                  dense
                  clearable
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" md="4" class="pl-1">
                <v-autocomplete
                  v-model="data.employeeType"
                  :items="employeeTypeRef"
                  :item-text="item => `${item.text}`"
                  :rules="rules.required"
                  label="Tipe"
                  item-value="value"
                  class="mt-0"
                  required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="pl-1" v-if="data.employeeType === 2">
                <v-autocomplete
                  v-model="data.salesGroupId"
                  :items="salesmanGroupRef"
                  :item-text="item => `${item.name}`"
                  label="Grup Penjual"
                  item-value="id"
                  class="mt-0"
                  required
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
            :class="['elevation-1', this.data.type === 2 ? 'row-pointer' : !this.data.isSM ? 'row-pointer' : '']"
            fixed-header
            hide-default-footer
            disable-pagination
          >
            <template v-slot:[`item.date`]="{ item }">
              {{ item.date | formatDate('dd-MMM-yyyy') }}
            </template>
            <template v-slot:[`item.checkIn`]="{ item }">
              {{ item.checkIn | formatDate('HH:mm') }}
            </template>
            <template v-slot:[`item.checkOut`]="{ item }">
              {{ item.checkOut | formatDate('HH:mm') }}
            </template>
            <template v-slot:[`item.coordinatIn`]="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span @click="showMap(item.coordinatOut)" v-bind="attrs" v-on="on">
                    <v-icon small >mdi-eye-outline</v-icon>
                  </span>
                </template>
                <span class="text-caption">Tampilkan di map</span>
              </v-tooltip>
              {{ item.coordinatIn }}
            </template>
            <template v-slot:[`item.coordinatOut`]="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span @click="showMap(item.coordinatOut)" v-bind="attrs" v-on="on">
                    <v-icon small >mdi-eye-outline</v-icon>
                  </span>
                </template>
                <span class="text-caption">Tampilkan di map</span>
              </v-tooltip>
              {{ item.coordinatOut }}
            </template>
            <template v-slot:[`item.checkInImage`]="{ item }">
              <span v-if="item.checkInImage.length > 0">
                <v-btn small color="blue darken-1" dark @click="showImage(item.checkInImage)">
                  Tampilkan gambar 
                </v-btn>
              </span>
              <span v-else>
                -
              </span>
            </template>
            <template v-slot:[`item.checkOutImage`]="{ item }">
              <span v-if="item.checkOutImage.length > 0">
                <v-btn small color="blue darken-1" dark @click="showImage(item.checkInImage)">
                  Tampilkan gambar 
                </v-btn>
              </span>
              <span v-else>
                -
              </span>
            </template>
          </v-data-table>
        </v-card>
      </v-col> 
    </v-row>
    <attendance-map ref="attendanceMap"></attendance-map>
    <display-image ref="displayImage"></display-image>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import ExportExcel from '@/components/common/ExportExcel.vue'
import AttendanceMap from '@/components/dialog/attendance/AttendanceMap.vue'
import DisplayImage from '@/components/dialog/attendance/DisplayImage.vue'
export default {
  components:{
    ExportExcel,
    AttendanceMap,
    DisplayImage
  },

  data: () => ({
    main: true,
    menu: {
      startDate: false,
      endDate: false
    },
    grid: {
      columns: [
        { text: 'Tanggal', value: 'date', divider: true, width: '150', excelColWidth:20, isDateTime: true },
        { text: 'Inisial', value: 'initial', divider: true, width: '100', excelColWidth:20 },
        { text: 'Nama', value: 'name', divider: true, width: '100', excelColWidth:20 },
        { text: 'Tipe', value: 'typeName', divider: true, width: '100', excelColWidth:20 },
        { text: 'Jam Masuk', value: 'checkIn', divider: true, width: '100', excelColWidth:20, isTimeOnly: true, align:'center' },
        { text: 'Jam Keluar', value: 'checkOut', divider: true, width: '100', excelColWidth:20, isTimeOnly: true, align:'center' },
        { text: 'Koordinat Masuk', value: 'coordinatIn', divider: true, width: '210', excelColWidth:30 },
        { text: 'Catatan Masuk', value: 'checkInNotes', divider: true, width: '100', excelColWidth:30 },
        { text: 'Gambar Masuk', value: 'checkInImage', divider: true, width: '100', excelColWidth:60 },
        { text: 'Koordinat Keluar', value: 'coordinatOut', divider: true, width: '210', excelColWidth:30 },
        { text: 'Catatan Keluar', value: 'checkOutNotes', divider: true, width: '100', excelColWidth:30 },
        { text: 'Gambar Keluar', value: 'checkOutImage', divider: true, width: '100', excelColWidth:60 }
      ],
      data: [],
      options: {
        sortBy: ['date'],
        sortDesc: [true]
      },
      total: 0,
      search: null
    },
    filter: false,
    items: [],
    data: {},
    exportFilter:{
      fields : [
        { text: 'Nama', value: 'name' },
        { text: 'Tipe', value: 'typeName' },
        { text: 'Tanggal Mulai', value: 'startDate' },
        { text: 'Tanggal Akhir', value: 'endDate' },
        { text: 'Grup Penjual', value: 'salesGroup' }
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    },
    salesmanGroupRef: [],
    employeeTypeRef: [{text: 'Karyawan', value: 1}, {text: 'Penjual', value: 2}, {text: 'Supir', value: 3}, {text: 'Gudang', value: 4}]
  }),

  created: function () {
    this.reset()
    this.getList()
    this.getSalesmanGroup()
    auth.getAction(this.endpoint, this.menuId.attendanceReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Sumber Daya Manusia'
      }, {
        text: 'Laporan'
      }, {
        text: 'Kehadiran'
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
        employeeType: 1,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate:  format(new Date(), 'yyyy-MM-dd'),
        salesGroupId: null,
        employee: null
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
      
      api.getAll(this.endpoint.humanResource.attendanceReport, {
        params: {
          employee: this.data.employee,
          employeeType: this.data.employeeType,
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          salesGroupId: this.data.salesGroupId,
          sorts: JSON.stringify(sorts)
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          this.appendFilter()
        })
    },
    getSalesmanGroup() {
      api.getAll(this.endpoint.sales.salesman, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: 'name',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.salesmanGroupRef = response.data.tableData
        })
    },
    back() {
      this.reset()
      this.grid.options.sortBy = ['date']
      this.getList()
      this.main = true
    },
    showfilter() {
      this.filter = !this.filter
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    appendFilter() {
      this.exportFilter.searches = []
      const searchName = {
        field: 'name',
        keyword: '',
        operator: 'eq'
      }
      const searchType = {
        field: 'typeName',
        keyword: '',
        operator: 'eq'
      }
      const searchSalesGroup = {
        field: 'salesGroup',
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

      searchStartDate.keyword = this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
      if (searchStartDate.keyword) {
        this.exportFilter.searches.push(searchStartDate)
      }

      searchEndDate.keyword = this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
      if (searchEndDate.keyword) {
        this.exportFilter.searches.push(searchEndDate)
      }
      
      searchName.keyword = this.data.employee
      if (searchName.keyword) {
        this.exportFilter.searches.push(searchName)
      }
      
      const employeeType = this.employeeTypeRef.find(x => x.value === this.data.employeeType)
      searchType.keyword = employeeType?.text
      if (searchType.keyword) {
        this.exportFilter.searches.push(searchType)
      }

      const salesMan = this.salesmanGroupRef.find(x => x.id === this.data.employeeType)
      searchSalesGroup.keyword = salesMan?.name
      if (searchSalesGroup.keyword) {
        this.exportFilter.searches.push(searchSalesGroup)
      }
    },
    clearDate(called) {
      if (called === 'end') {
        this.data.endDate = null
      } else {
        this.data.startDate = null
      }
      this.clearTable()
    },
    changeDate(called = null) {
      if (called === 'end') {
        this.menu.endDate = false
        if (this.data.endDate < this.data.startDate) {
          this.data.startDate = this.data.endDate
        }
      } else {
        this.menu.startDate = false
        if (this.data.startDate > this.data.endDate) {
          this.data.endDate = this.data.startDate
        }
      }
      this.clearTable()
    },
    clearTable() {
      this.grid.data = []
    },
    showMap(coordinat) {
      const arr = coordinat.split(' : ')
      const latitude = Number(arr[0])
      const longitude = Number(arr[1])
      this.$refs.attendanceMap.show(latitude, longitude)
    },
    showImage(link) {
      this.$refs.displayImage.show(link)
    }
  }
}
</script>