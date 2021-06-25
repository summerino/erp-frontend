<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Karyawan
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="grid.search"
              append-icon="mdi-magnify"
              label="Cari..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList()"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="1">
            <export-excel title="Daftar Karyawan" :grid="grid" :gridDefOpts="gridDefOpts" ref="exportExcel"></export-excel>
          </v-col>
          <v-col cols="12" md="5" class="text-right">
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
                  @click="add"
                  @shortkey="add"
                  :disabled="!auth.allowInsert"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Data Baru
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + Alt + N)</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-title>

      <v-data-table
        :headers="grid.columns"
        :footer-props="{ itemsPerPageOptions: gridDefOpts.pageSizes }"
        :height="gridDefOpts.height"
        :items="grid.data"
        :items-per-page="gridDefOpts.pageSize"
        :options.sync="grid.options"
        :sort-by="grid.options.sortBy"
        :sort-desc="grid.options.sortDesc"
        class="elevation-1"
        fixed-header
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
          <v-tooltip bottom>
            <template v-if="item.isActive" v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                small
                color="red"
                @click="remove(item)"
                :disabled="!auth.allowDelete"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <template v-else v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                small
                color="green"
                @click="reactivate(item)"
              >
                <v-icon small>mdi-check</v-icon>
              </v-btn>
            </template>
            <span v-if="item.isActive">Nonaktifkan</span>
            <span v-else>Aktifkan Kembali</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.sex`]="{ item }">
          <span v-if="item.sex">Laki-laki</span>
          <span v-else>Perempuan</span>
        </template>
        <template v-slot:[`item.type`]="{ item }">
          <span v-if="item.type === 1">Karyawan</span>
          <span v-else-if="item.type === 2">Penjual</span>
          <span v-else-if="item.type === 3">Supir</span>
          <span v-else>Tidak diketahui</span>
        </template>
        <template v-slot:[`item.isActive`]="{ item }">
          <v-icon v-if="item.isActive" color="green">mdi-toggle-switch-outline</v-icon>
          <v-icon v-else color="red">mdi-toggle-switch-off-outline</v-icon>
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else :style="{ background: $vuetify.theme.themes[theme].surface }">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="6">
            <span>{{ data.action === 'add' ? 'Tambah' : 'Ubah' }} Karyawan</span>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <label
              v-if="data.action == 'edit'"
              class="text-caption mr-1"
            >
              Tanggal Diperbarui : {{ data.updatedDate }} oleh {{ data.updatedInitial }}
            </label>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 's']"
                  color="blue darken-2"
                  class="font-weight-regular"
                  dark
                  small
                  tile
                  @click="save"
                  @shortkey="save"
                  :disabled="(data.action === 'edit' && !auth.allowUpdate)"
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
                    ref="initial"
                    v-model="data.initial"
                    :rules="[rules.required[0], rules.max20chars[0]]"
                    :counter="20"
                    label="Inisial"
                    class="mt-0"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-row no-gutters>
                    <v-col cols="12">
                      <span>Jenis Kelamin</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="3">
                      <input 
                       type="radio" 
                       id="male" 
                       value="true" 
                       v-model="data.sex">
                      <label for="male">&nbsp;Laki-laki</label>
                    </v-col>
                    <v-col cols="9">
                      <input 
                       type="radio" 
                       id="female" 
                       value="false" 
                       v-model="data.sex">
                      <label for="female">&nbsp;Perempuan</label>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-text-field
                    v-model="data.firstName"
                    :rules="rules.required"
                    :counter="50"
                    label="Nama Depan"
                    class="mt-0"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-text-field
                    v-model="data.lastName"
                    :counter="50"
                    label="Nama Belakang"
                    class="mt-0"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-menu
                    v-model="menu.calBirthDate"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    min-width="290px"
                    offset-y
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-bind="attrs"
                        v-on="on"
                        :rules="rules.required"
                        :value="formatBirthDate"
                        label="Tanggal Lahir"
                        class="mt-0"
                        readonly
                        required
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="data.birthDate"
                      no-title
                      scrollable
                      @change="menu.calBirthDate = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-text-field
                    v-model="data.birthPlace"
                    :counter="50"
                    label="Tempat Lahir"
                    class="mt-0"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12">
                  <v-text-field
                    v-model="data.address1"
                    :rules="rules.required"
                    :counter="50"
                    label="Alamat 1"
                    class="mt-0"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12">
                  <v-text-field
                    v-model="data.address2"
                    :counter="50"
                    label="Alamat 2"
                    class="mt-0"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-text-field
                    v-model="data.phone"
                    :counter="30"
                    label="Telepon"
                    class="mt-0"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-text-field
                    v-model="data.identityCardNo"
                    :counter="20"
                    label="Nomor Identitas"
                    class="mt-0"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-autocomplete
                    v-model="data.maritalStatus"
                    :items="maritalStatusRef"
                    :item-text="item => `${item.text}`"
                    :rules="rules.required"
                    label="Status Pernikahan"
                    item-value="value"
                    class="mt-0"
                    required
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-autocomplete
                    v-model="data.religion"
                    :items="religionRef"
                    :item-text="item => `${item.text}`"
                    :rules="rules.required"
                    label="Agama"
                    item-value="value"
                    class="mt-0"
                    required
                  ></v-autocomplete>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-autocomplete
                    v-model="data.type"
                    :items="employeeTypeRef"
                    :item-text="item => `${item.text}`"
                    :rules="rules.required"
                    label="Tipe"
                    item-value="value"
                    class="mt-0"
                    required
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-autocomplete
                    v-model="data.warehouseCode"
                    :items="warehouseRef"
                    :item-text="item => `${item.initial} - ${item.name}`"
                    label="Gudang"
                    item-value="code"
                    class="mt-0"
                  ></v-autocomplete>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-autocomplete
                    v-model="data.salesGroupId"
                    :items="salesmanGroupRef"
                    :item-text="item => `${item.name}`"
                    :rules="data.type === 2 ? rules.required : []"
                    :readonly="data.type !== 2"
                    label="Sales Grup"
                    item-value="id"
                    class="mt-0"
                    required
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  &nbsp;
                </v-col>
              </v-row>
            </v-container>
          </v-card>
          <br/>
          <v-card v-if="data.type === 2">
            <v-tabs v-model="tab.advancedItem">
              <v-tab key="visitOrder">Jadwal Kunjungan</v-tab>
              
              <v-tab-item
                key="visitOrder"
                transition="false"
              >
                <v-card>
                  <v-app-bar dense flat>
                    <v-spacer></v-spacer>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs"
                          v-on="on"
                          v-shortkey="['ctrl', 'i']"
                          :disabled="data.isActive === false"
                          class="blue--text"
                          small
                          tile
                          @click="showVisitScheduleDialog"
                          @shortkey="showVisitScheduleDialog"
                        >
                          <v-icon left>mdi-plus</v-icon>
                          Tambah
                        </v-btn>
                      </template>
                      <span class="text-caption">(Ctrl + I)</span>
                    </v-tooltip>
                  </v-app-bar>
                  <v-container fluid grid-list-md>
                    <v-data-table
                      :headers="gridItem.columns"
                      :items="gridItem.data"
                      :items-per-page="-1"
                      height="300"
                      class="elevation-1"
                      dense
                      disable-sort
                      fixed-header
                      hide-default-footer
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
                              @click="showVisitScheduleDialog(item)"
                            >
                              <v-icon small>mdi-pencil</v-icon>
                            </v-btn>
                          </template>
                          <span>Ubah</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              v-bind="attrs"
                              v-on="on"
                              :disabled="data.isActive === false || item.isDefault === true"
                              color="red"
                              icon
                              small
                              @click="removeItem(item)"
                            >
                              <v-icon small>mdi-close-thick</v-icon>
                            </v-btn>
                          </template>
                          <span class="text-caption">Hapus</span>
                        </v-tooltip>
                      </template>
                      <template v-slot:[`item.startDate`]="{ item }">
                        {{ item.startDate | formatDate('dd-MMM-yyyy') }}
                      </template>
                      <template v-slot:[`item.endDate`]="{ item }">
                        {{ item.endDate | formatDate('dd-MMM-yyyy') }}
                      </template>
                      <template v-slot:[`item.visitDay`]="{ item }">
                        {{ getDayName(item.visitDay) }}
                      </template>
                    </v-data-table>
                  </v-container>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-form>
      </v-card-text>
    </v-card>
    
    <confirm ref="confirm"></confirm>
    <visit-schedule
      ref="schedule"
    ></visit-schedule>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'
import { randomNumber } from '@/helpers/math-helpers'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import VisitSchedule from '@/components/dialog/general/VisitSchedule'

export default {
  components:{
    ExportExcel,
    Confirm,
    VisitSchedule
  },

  data: () => ({
    main: true,
    tab: {
      advancedItem: null
    },
    menu: {
      calBirthDate: false
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'Inisial', value: 'initial', divider: true, width: '150', excelColWidth:'15' },
        { text: 'Nama Depan', value: 'firstName', divider: true, width: '200', excelColWidth:'20' },
        { text: 'Nama Belakang', value: 'lastName', divider: true, width: '200', excelColWidth:'20' },
        { text: 'Jenis Kelamin', value: 'sex', divider: true, width: '60', excelColWidth:'10' },
        { text: 'Alamat', value: 'address1', divider: true, width: '250', excelColWidth:'25' },
        { text: 'Telepon', value: 'phone', divider: true, width: '120', excelColWidth:'15' },
        { text: 'Tipe', value: 'type', divider: true, width: '60', excelColWidth:'10' },
        { text: 'Status', value: 'isActive', width: '90', excelColWidth:'10', isBool: true }
      ],
      data: [],
      options: {
        sortBy: ['initial'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridItem: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Wilayah 1', value: 'areaName1', divider: true, width: '130' },
        { text: 'Wilayah 2', value: 'areaName2', divider: true, width: '130' },
        { text: 'Wilayah 3', value: 'areaName3', divider: true, width: '130' },
        { text: 'Wilayah 4', value: 'areaName4', divider: true, width: '130' },
        { text: 'Wilayah 5', value: 'areaName5', divider: true, width: '130' },
        { text: 'Tanggal Mulai', value: 'startDate', align: 'right', divider: true, width: '100' },
        { text: 'Tanggal Berakhir', value: 'endDate', align: 'right', divider: true, width: '100' },
        { text: 'Hari Kunjungan', value: 'visitDay', divider: true, width: '100' },
        { text: 'Berulang Setiap Minggu', value: 'recurrence', divider: true, width: '120' }
      ],
      data: []
    },
    valid: false,
    daysOfWeek: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    employeeTypeRef: [{text: 'Karyawan', value: 1}, {text: 'Penjual', value: 2}, {text: 'Supir', value: 3}],
    maritalStatusRef: [{text: 'Lajang', value: 1}, {text: 'Menikah', value: 2}, {text: 'Bercerai', value: 3}],
    religionRef: [{text: 'Islam', value: 1}, {text: 'Protestant', value: 2}, {text: 'Catholic', value: 3}, {text: 'Buddha', value: 4}, {text: 'Hindu', value: 5}, {text: 'Konghucu', value: 6}, {text: 'Lainnya', value: 7}],
    salesmanGroupRef: [],
    warehouseRef: [],
    data: {}
  }),

  created: function () {
    this.getList()
    auth.getAction(this.endpoint, this.menuId.employee, [this.action.insert, this.action.update, this.action.delete])
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Umum'
      }, {
        text: 'Data Master'
      }, {
        text: 'Karyawan'
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
    formatBirthDate() {
      return this.data.birthDate ? format(parseISO(this.data.birthDate), 'dd-MMM-yyyy') : ''
    },
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },
  
  methods:{
    reset(resetValidation = true) {
      this.data = {
        action: '',
        id: 0,
        initial: null,
        firstName: null,
        lastName: null,
        sex: true,
        birthDate: null,
        birthPlace: null,
        maritalStatus: null,
        identityCardNo: null,
        religion: null,
        address1: null,
        address2: null,
        phone: null,
        type: null
      }
      this.tab.advancedItem = 0
      this.salesmanGroupRef = []

      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }
    },
    getList(bindToForm = false) {
      const sorts = []
      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }
      
      api.getAll(this.endpoint.general.employee, {
        params: {
          search: this.grid.search,
          skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
          take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
          sorts: JSON.stringify(sorts)
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          if (bindToForm) {
            const item = this.grid.data.find(h => h.initial === this.data.initial)
            this.edit(item)
          }
        })
    },
    back() {
      this.main = true
    },
    add() {
      this.main = false
      this.reset(false)
      this.data.action = 'add'

      this.getSalesmanGroup()
      this.getWarehouse()

      setTimeout(() => {
        // Set focus to initial field
        this.$refs.initial.focus()

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    edit(item) {
      if (!item) return

      this.main = false
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      this.getSalesmanGroup()
      this.getWarehouse()

      if (this.data.type === 2) {
        this.getSalesmanSchedule()
      }
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Nontaktifkan?',
          'Apakah anda yakin untuk menonaktifkan data ini?')
      ) {
        api.delete(this.endpoint.general.employee, item.id)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async reactivate(item) {
      if (
        await this.$refs.confirm.open(
          'Aktifkan Kembali?',
          'Apakah anda yakin untuk mengaktifkan kembali data ini?')
      ) {
        this.data = {
          ...item,
          action: 'edit',
          isActive: true
        }

        api.update(this.endpoint.general.employee, this.data.id, this.data)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      let result = { success: false, message: '' }
      if (this.data.action === 'add') {
        const resp = await api.create(this.endpoint.general.employee, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.general.employee, this.data.initial, this.data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.back()
        this.getList()
      }
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    addItem() {
      const item = {
        id: randomNumber(-1, -1000),
        code: this.data.code,
        initial: '',
        address1: '',
        address2: null,
        contactPerson: '',
        phone: '',
        fax: null,
        isDefault: true,
        state: 'A'
      }
      this.gridItem.data.push(item)

      // setTimeout(() => {
      //   // Set focus to initial address field
      //   this.$refs.InitialAddress.focus()
      // }, 0)
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin untuk menghapus data ini?')
      ) {
        const idx = this.gridItem.data.findIndex(i => i.id === item.id)
        if (idx !== -1) {
          this.gridItem.data.splice(idx, 1)
        }
      }
    },
    getSalesmanSchedule() {
      api.getAll(`${this.endpoint.sales.salesman}/salesman-schedule-by-id`, {
        params: {
          id: this.data.id
        }
      })
        .then(response => {
          this.gridItem.data = response.data.tableData
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
    getDayName(item) {
      return this.daysOfWeek[item]
    },
    getWarehouse() {
      api.getAll(`${this.endpoint.inventory.warehouse}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'name',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.warehouseRef = response.data.tableData
        })
    },
    showVisitScheduleDialog(item) {
      this.$refs.schedule.open(item)
      console.log(item)
    }
  }
}

</script>

<style>
</style>