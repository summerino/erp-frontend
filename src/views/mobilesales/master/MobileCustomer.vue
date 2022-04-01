<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="2">
            Pelanggan
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
                title="Daftar Pelanggan"
              ></export-excel>
            </v-row>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'alt', 's']"
                  :disabled="selected.length === 0 || !auth.allowApprove"
                  color="green darken-1"
                  class="font-weight-regular"
                  dark
                  small
                  tile
                  @click="approve"
                  @shortkey="approve"
                >
                  Setujui
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + Alt + S)</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'alt', 't']"
                  :disabled="selected.length === 0 || !auth.allowReject"
                  color="red darken-1"
                  class="font-weight-regular ml-1"
                  dark
                  small
                  tile
                  @click="reject"
                  @shortkey="reject"
                >
                  Tolak
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + Alt + T)</span>
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
      <template v-slot:[`item.action`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                small
                color="orange lighten-1"
                @click="edit(item)"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Ubah</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.lat`]="{ item }">
          <v-tooltip v-if="item.lat !== null" bottom>
            <template v-if="item.lat !== null" v-slot:activator="{ on, attrs }">
              <span @click="showMap(`${item.lat} : ${item.lng}`)" v-bind="attrs" v-on="on">
                <v-icon small >mdi-eye-outline</v-icon>
              </span>
            </template>
            <span class="text-caption">Tampilkan di map</span>
          </v-tooltip>
          <p v-if="item.lat !== null">{{ `${item.lat} : ${item.lng}` }}</p>
        </template>
        <template v-slot:[`item.mark`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon 
                v-bind="attrs" 
                v-on="on" 
                :color="item.mark === 'A' ? 'green' : 'red'"
              >
                {{ item.mark === 'A'? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline' }}
              </v-icon>
            </template>
            <span class="text-caption">
                {{ item.mark === 'A' ? 'Aktif' : 'Ditolak' }}
            </span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <span>Ubah Pelanggan</span>
          </v-col>
          <v-col cols="12" md="8" class="text-right">
            <label
              class="text-caption mr-1"
            >
              Tanggal Diperbarui: {{ data.updatedDate }} oleh {{ data.updatedInitial }}
            </label>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 's']"
                  color="blue darken-2"
                  class="font-weight-regular"
                  :disabled="isRejected || !auth.allowUpdate"
                  dark
                  small
                  tile
                  @click="save"
                  @shortkey="save"
                >
                  <v-icon left>
                    mdi-content-save
                  </v-icon>
                  Simpan
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + S)</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['esc']"
                  class="font-weight-regular ml-1"
                  small
                  tile
                  @click="back"
                  @shortkey="back"
                >
                  <v-icon left>
                    mdi-undo-variant
                  </v-icon>
                  Kembali
                </v-btn>
              </template>
              <span class="text-caption">(Esc)</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
        >
          <v-card>
            <v-container fluid grid-list-md>
              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-text-field
                    v-model="data.code"
                    :counter="17"
                    :rules="[rules.required[0], rules.max17chars[0]]"
                    label="Kode"
                    class="mt-0"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-text-field
                    ref="initial"
                    v-model="data.initial"
                    :rules="[rules.required[0], rules.max20chars[0]]"
                    :counter="20"
                    label="Inisial"
                    class="mt-0"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-text-field
                    v-model="data.name"
                    :rules="[rules.required[0], rules.max50chars[0]]"
                    :counter="50"
                    label="Nama"
                    class="mt-0"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-autocomplete
                    v-model="data.typeId"
                    :items="types"
                    :item-text="item => `${item.initial} - ${item.name}`"
                    :rules="rules.required"
                    label="Tipe"
                    item-value="id"
                    class="mt-0"
                    required
                  ></v-autocomplete>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-text-field
                    v-model="data.initialAddress"
                    :rules="[rules.required[0], rules.max20chars[0]]"
                    :counter="20"
                    label="Inisial Alamat"
                    class="mt-0"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-text-field
                    v-model="data.address1"
                    :rules="[rules.required[0], rules.max100chars[0]]"
                    :counter="100"
                    label="Alamat 1"
                    class="mt-0"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-text-field
                    v-model="data.address2"
                    :rules="rules.max100chars"
                    :counter="100"
                    label="Alamat 2"
                    class="mt-0"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-text-field
                    v-model="data.contactPerson"
                    :rules="rules.max50chars"
                    :counter="50"
                    label="Kontak Person"
                    class="mt-0"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-text-field
                    v-model="data.phone"
                    :rules="[rules.required[0], rules.max30chars[0]]"
                    :counter="30"
                    label="Telepon"
                    class="mt-0"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-text-field
                    v-model="data.fax"
                    :rules="rules.max15chars"
                    :counter="15"
                    label="Fax"
                    class="mt-0"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-form>
      </v-card-text>
    </v-card>
    <confirm ref="confirm"></confirm>
    <attendance-map ref="attendanceMap"></attendance-map>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import AttendanceMap from '@/components/dialog/attendance/AttendanceMap.vue'

export default {
  components:{
    AdvancedSearch,
    ExportExcel,
    Confirm,
    AttendanceMap
  },

  data: () => ({
    main: true,
    filterFields: [{
      text: 'Kode', value: 'code', dataType: 'text'
    }, {
      text: 'Inisial', value: 'initial', dataType: 'text'
    }, {
      text: 'Name', value: 'name', dataType: 'text'
    }],
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '10' },
        { text: 'Kode', value: 'code', divider: true, width: '150', excelColWidth:'15' },
        { text: 'Inisial', value: 'initial', divider: true, width: '150', excelColWidth:'15'},
        { text: 'Nama', value: 'name', divider: true, width: '200', excelColWidth:'20' },
        { text: 'Alamat', value: 'address1', divider: true, width: '180', excelColWidth:'18' },
        { text: 'Telepon', value: 'phone', divider: true, width: '120', excelColWidth:'12' },
        { text: 'Koordinat', value: 'lat', divider: true, width: '100', excelColWidth:'18' },
        { text: 'Status', value: 'mark', width: '150', excelColWidth:'15' }
      ],
      data: [],
      options: {
        sortBy: ['mark', 'updatedDate'],
        sortDesc: [false, true]
      },
      total: 0,
      search: null
    },
    valid: false,
    selected: [],
    types: []
  }),
  created: function () {
    this.reset()
    this.getList()
    this.getTypesList()
    auth.getAction(this.endpoint, this.menuId.mobileCustomer)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    this.$store.commit('app/setFilterFields', this.filterFields)
  },
  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Mobile Penjual'
      }, {
        text: 'Data Master'
      }, {
        text: 'Pelanggan'
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
    }),
    isRejected() {
      return this.data.mark === 'REJ'
    }
  },
  methods:{
    reset() {
      this.data = {
        code: null,
        custCode: null,
        initial: null,
        name: null,
        typeId: null,
        initialAddress: null,
        address1: null,
        address2: null,
        contactPerson: null,
        phone: null,
        fax: null,
        updatedInitial: null,
        areaId1: null,
        areaId2: null,
        areaId3: null,
        areaId4: null,
        areaId5: null
      }
      this.selected = []
    },
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
        operator: 'contains',
        keyword: ['A', 'REJ']
      })
      
      api.getAll(this.endpoint.mobileSales.customer, {
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
    async approve() {
      let result = { success: false, message: '' }
      const resp = await api.updatemaster(`${this.endpoint.mobileSales.customer}/approve`, this.selected)
      result = resp.data
      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.reset()
        this.getList()
      }
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    edit(item) {
      if (!item) return

      this.main = false
      this.reset()

      this.data = {
        ...item,
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }
    },
    async save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = this.data

      let result = { success: false, message: '' }
      const resp = await api.update(this.endpoint.mobileSales.customer, data.code, data)
      result = resp.data

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.back()
        this.reset()
        this.getList()
      }
    },
    back() {
      this.main = true
    },
    getTypesList() {
      api.getAll(`${this.endpoint.general.customer.type}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.types = response.data.tableData
        })
    },
    async reject() {
      let result = { success: false, message: '' }
      const resp = await api.updatemaster(`${this.endpoint.mobileSales.customer}/reject`, this.selected)
      result = resp.data
      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.reset()
        this.getList()
      }
    },
    showMap(coordinat) {
      const arr = coordinat.split(' : ')
      const latitude = Number(arr[0])
      const longitude = Number(arr[1])
      this.$refs.attendanceMap.show(latitude, longitude)
    }
  }
}
</script>
