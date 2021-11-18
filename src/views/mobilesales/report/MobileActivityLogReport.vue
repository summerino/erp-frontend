<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row no-gutters>
              <v-col cols="12" md="6">
                Laporan Log Aktivitas
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
                          title="Daftar Laporan Log Aktivitas"
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
              <v-col cols="12" md="2">
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
              <v-col cols="12" md="2" class="pl-1">
                <v-autocomplete
                  v-model="data.username"
                  :items="users"
                  label="Username"
                  :item-text="item => `${item.username} - ${item.initial}`"
                  item-value="username"
                  class="mt-0"
                  clearable
                  dense
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="2" class="pl-1">
                <v-autocomplete
                  v-model="data.typeCode"
                  :items="typeCodes"
                  label="Tipe Kode"
                  :item-text="item => `${item.id} - ${item.name}`"
                  item-value="id"
                  class="mt-0"
                  clearable
                  dense
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
                <v-text-field
                  v-model="data.note"
                  label="Catatan"
                  class="mt-0"
                  clearable
                  dense
                  @change="clearTable()"
                ></v-text-field>
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
          >
          <template v-slot:[`item.date`]="{ item }">
            {{ item.date | formatDate('dd-MMM-yyyy  HH:mm:ss') }}
          </template>
          <template v-slot:[`item.typeCode`]="{ item }">
            <span v-if="item.typeCode === 'SRV'">
              Server
            </span>
            <span v-else-if="item.typeCode === 'CACHE'">
              Cache
            </span>
            <span v-else-if="item.typeCode === 'CONN'">
              Connectivity
            </span>
            <span v-else-if="item.typeCode === 'HH'">
              Handheld
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
      { text: 'Tanggal', value: 'date', divider: true, width: '25%', excelColWidth:'20', isDateTime: true },
      { text: 'Username', value: 'username', divider: true, width: '25%', excelColWidth:'20' },
      { text: 'Tipe Kode', value: 'typeCode', align: 'right', divider: true, width: '25%', excelColWidth:'20' },
      { text: 'Catatan', value: 'note', align: 'right', width: '25%', excelColWidth:'20' }
    ],
    typeCodes: [{ id: 'SRV', name: 'Server' }, { id: 'CACHE', name: 'Cache' }, { id: 'CONN', name: 'Connectivity' }, { id: 'HH', name: 'Handheld' }],
    users: [],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Username', value: 'username'},
        {text: 'Tanggal Mulai', value: 'startDate'},
        {text: 'Tanggal Akhir', value: 'endDate'},
        {text: 'Tipe Kode', value: 'typeCode'},
        {text: 'Catatan', value: 'note'}

      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getUserLists()
    auth.getAction(this.endpoint, this.menuId.mobileActivityLogReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Mobile Penjual'
      }, {
        text: 'Laporan'
      }, {
        text: 'Log Aktivitas'
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
        username: null,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        typeCode: null,
        note: null
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
      
      api.getAll(this.endpoint.mobileSales.activiyLogReport, {
        params: {
          username: this.data.username,
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          note: this.data.note,
          typeCode: this.data.typeCode
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
    getUserLists() {
      api.getAll(this.endpoint.systemManagement.user, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.users = response.data.tableData
        })
    },
    appendFilter() {
      this.exportFilter.searches = []
      const searchUser = {
        field: 'username',
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
      const searchTypeCode = {
        field: 'typeCode',
        keyword: '',
        operator: 'eq'
      }
      const searchNote = {
        field: 'note',
        keyword: '',
        operator: 'eq'
      }

      const user = this.users.find(x => x.username === this.data.username)
      if (user) {
        searchUser.keyword = user.name
        this.exportFilter.searches.push(searchUser)
      }

      searchStartDate.keyword = this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
      if (searchStartDate.keyword !== '') {
        this.exportFilter.searches.push(searchStartDate)
      }

      searchEndDate.keyword = this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
      if (searchEndDate.keyword !== '') {
        this.exportFilter.searches.push(searchEndDate)
      }

      searchTypeCode.keyword = this.data.typeCode
      if (searchTypeCode.keyword !== null) {
        this.exportFilter.searches.push(searchTypeCode)
      }

      searchNote.keyword = this.data.note
      if (searchNote.keyword !== null) {
        this.exportFilter.searches.push(searchNote)
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
      if (item === 'start') {
        this.data.startDate = null
      } else {
        this.data.endDate = null
      }
      this.clearTable()
    }
  }
}

</script>
