<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="3">
            Biaya Sales
          </v-col>
          <v-col cols="12" md="5" >
            <v-row no-gutters>
              <v-text-field
                append-icon="mdi-magnify"
                label="Cari..."
                class="font-weight-regular mt-0 pt-0"
                single-line
                v-model="grid.search"
                :readonly="filter.isAdvancedSearch"
                @click:append-outer="advancedSearch"
                @keyup.enter="getList(false)"
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
                title="Daftar Biaya Sales"
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
                color="orange lighten-1"
                icon
                small
                @click="edit(item)"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Ubah</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.total`]="{ item }">
          {{ item.total | formatCurrency }}
        </template>
        <template v-slot:[`item.mark`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                v-bind="attrs"
                v-on="on"
                :color="item.mark.toUpperCase() === 'REJ' ? 'error' : 'green'"
                class="px-1"
                dark
                small
              >
                {{ item.mark }}
              </v-chip>
            </template>
            <span class="text-caption">{{ item.status }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog
      v-model="dialog.add"
      transition="dialog-bottom-transition"
      fullscreen
      hide-overlay
      persistent
      scrollable
      @keydown.esc="close"
    >
      <v-card :style="{ background: $vuetify.theme.themes[theme].surface }">
        <v-toolbar
          color="primary"
          max-height="64"
          dark
        >
          <v-btn icon dark @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Biaya Sales</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="isRejected || !auth.allowUpdate"
                  dark
                  text
                  @click="save(true)"
                  @shortkey="save(true)"
                >Simpan & Tutup</v-btn>
              </template>
              <span class="text-caption">(Ctrl + Enter)</span>
            </v-tooltip>
            <v-divider vertical></v-divider>
            <v-menu
              bottom
              eager
              left
              open-on-hover
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  dark
                  icon
                >
                  <v-icon>mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list class="cursor-pointer">
                <v-list-item
                  v-shortkey="['ctrl', 's']"
                  :disabled="isRejected || !auth.allowUpdate"
                  @click="save(false)"
                  @shortkey="save(false)"
                >
                  <v-list-item-title>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                        >
                          Simpan
                        </span>
                      </template>
                      <span class="text-caption">(Ctrl + S)</span>
                    </v-tooltip>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text class="px-2">
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-row dense>
              <v-col cols="12" md="4">
                <v-card>
                  <v-card-title>Umum</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="code"
                          v-model="data.code"
                          label="Kode"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          :rules="rules.required"
                          :value="formatDate"
                          label="Tanggal"
                          class="mt-0"
                          readonly
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                          v-model="data.salesmanId"
                          :items="employees"
                          :item-text="item => `${item.initial} - ${item.firstName}`"
                          :rules="rules.required"
                          label="Penjual"
                          item-value="id"
                          class="mt-0"
                          readonly
                          required
                        ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-currency-field
                          v-model="data.total"
                          :decimal-length="0"
                          :min="1"
                          class="text-right mt-0"
                          label="Nilai Total"
                          readonly
                          required
                        ></v-currency-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.user">
                    <v-tab key="user">Pengguna</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.user" class="pa-2">
                    <v-tab-item
                      key="user"
                      transition="false"
                      eager
                    >

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.createdInitial"
                            label="Dibuat Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.createdDate"
                            label="Tanggal Dibuat"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.updatedInitial"
                            label="Diperbarui Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.updatedDate"
                            label="Tanggal Diperbarui"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.approvedInitial"
                            label="Disetujui Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.approvedDate"
                            label="Tanggal Disetujui"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.rejectedInitial"
                            label="Ditolak Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.rejectedDate"
                            label="Tanggal Ditolak"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-tab-item>
                  </v-tabs-items>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-tabs v-model="tab.det">
                    <v-tab key="detail-trans">Detail</v-tab>
                    <v-tab key="image">Gambar</v-tab>

                    <v-tab-item
                      key="detail-trans"
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
                                :disabled="isRejected || !auth.allowUpdate"
                                class="blue--text"
                                small
                                tile
                                @click="addItem"
                                @shortkey="addItem"
                              >
                                <v-icon left>mdi-plus</v-icon>
                                Tambah
                              </v-btn>
                            </template>
                            <span class="text-caption">(Ctrl + I)</span>
                          </v-tooltip>
                        </v-app-bar>

                        <v-data-table
                          :headers="gridDet.columns"
                          :items="gridDet.data"
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
                                  :disabled="isRejected || !auth.allowUpdate"
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
                          <template v-slot:[`item.coaCode`]="{ item }">
                            <v-autocomplete
                              v-model="item.coaCode"
                              :items="coas"
                              :item-text="item => `${item.code} - ${item.name}`"
                              label="Akun"
                              item-value="code"
                              class="text-body-2 mt-0"
                              :rules="rules.required"
                              required
                              dense
                            ></v-autocomplete>
                          </template>
                          <template v-slot:[`item.amount`]="{ item }">
                            <v-currency-field
                              v-model="item.amount"
                              :decimal-length="0"
                              :min="1"
                              :readonly="isRejected"
                              class="text-body-2 text-right mt-0"
                              dense
                            ></v-currency-field>
                          </template>
                        </v-data-table>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="image"
                      transition="false"
                    >
                      <v-card>
                        <v-data-table
                          :headers="gridImg.columns"
                          :items="gridImg.data"
                          :items-per-page="-1"
                          height="300"
                          class="elevation-1"
                          dense
                          disable-sort
                          fixed-header
                          hide-default-footer
                        >
                          <template v-slot:[`item.image`]="{ item }">
                            <span v-if="item.image.length > 0">
                              <v-btn small color="blue darken-1" dark @click="showImage(item.image)">
                                Tampilkan gambar 
                              </v-btn>
                            </span>
                            <span v-else>
                              -
                            </span>
                          </template>
                        </v-data-table>
                      </v-card>
                    </v-tab-item>
                  </v-tabs>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <confirm ref="confirm"></confirm>
    <approval-cost
    ref="approval"
    @closeApprove="closeApprove"
    :selected="this.selected"
    ></approval-cost>
    <display-image ref="displayImage"></display-image>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import ApprovalCost from '@/components/dialog/mobilesales/ApprovalCost'
import DisplayImage from '@/components/dialog/attendance/DisplayImage.vue'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    ApprovalCost,
    DisplayImage
  },

  data: () => ({
    filterfields: [{
      text: 'Kode', value: 'code', dataType: 'text'
    }, {
      text: 'Tanggal', value: 'date', dataType: 'datetime'
    }],
    dialog: {
      add: false
    },
    tab: {
      user: null,
      det: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'20' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Penjual', value: 'salesmanInitial', divider: true, width: '150', excelColWidth:'18' },
        { text: 'Nilai Total', value: 'total', divider: true, align:'right', width: '100', excelColWidth:'15', isCurrency: true },
        { text: 'Status', value: 'mark', width: '50' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [true]
      },
      total: 0,
      search: null
    },
    gridDet: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Akun', value: 'coaCode', divider: true, width: '150' },
        { text: 'Nilai', value: 'amount', align: 'right', width: '70' }
      ],
      data: []
    },
    gridImg: {
      columns: [
        { text: 'Gambar', value: 'image', width: '100'}
      ],
      data: []
    },
    valid: false,
    coas: [],
    employees: [],
    selected: [],
    data: {}
  }),

  created: function () {
    this.reset()
    this.getList()
    this.getCOAList()
    this.getSalesmanLists()
    auth.getAction(this.endpoint, this.menuId.mobileCost)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    this.$store.commit('app/setFilterFields', this.filterfields)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Mobile Penjual'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Biaya Sales'
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
    },
    'gridDet.data': {
      handler() {
        this.calculateTotal()
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
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    isRejected() {
      return (this.data?.mark?.toUpperCase() === 'REJ')
    }
  },

  methods: {
    reset() {
      this.data = {
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        cbDate: format(new Date(), 'yyyy-MM-dd'),
        coaCode: null,
        currCode: 'IDR',
        rate: 1,
        notes: null,
        salesmanId: null,
        total: 0
      }
      this.gridDet.data = []
      this.tab.user = 0
      this.tab.det = 0
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
      this.getList(vm.bindToForm, vm.filters)
    },
    getList(bindToForm = false, filters = []) {
      const sorts = []

      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }
      
      api.getAll(this.endpoint.mobileSales.salesCost, {
        params: {
          search: this.grid.search,
          skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
          take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
          sorts: JSON.stringify(sorts),
          filters: JSON.stringify(filters)
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          if (bindToForm) {
            const item = this.grid.data.find(h => h.code === this.data.code)
            this.edit(item)
          }
        })
    },
    close() {
      this.dialog.add = false
      this.reset()
    },
    edit(item) {
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        createdDate: (item.createdDate === null) ? null : format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: (item.updatedDate === null) ? null : format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss'),
        approvedDate: (item.approvedDate === null) ? null : format(parseISO(item.approvedDate), 'dd-MMM-yyyy HH:mm:ss'),
        rejectedDate: (item.rejectedDate === null) ? null : format(parseISO(item.rejectedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get item details
      api.getAll(`${this.endpoint.mobileSales.salesCost}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridDet.data = response.data.tableData
        })

      // Get image details
      api.getAll(`${this.endpoint.mobileSales.salesCost}/image`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridImg.data = response.data.tableData
        })
    },
    async save(closeDialog) {
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      if (!(this.gridDet.data.length > 0)) {
        this.$store.dispatch('app/showInfo', 'Data akun tidak boleh kosong.')
        return
      }
      
      const data = this.data
      data.itemDetails = this.gridDet.data
      
      let result = { success: false, message: '' }
      const resp = await api.update(this.endpoint.mobileSales.salesCost, data.code, data)
      result = resp.data

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else {
          this.data.code = result.data
        }
        this.getList(!closeDialog)
      }
    },
    addItem() {
      if (this.gridDet.data.length === 0 || (this.gridDet.data.slice(-1)[0]?.coaCode ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.data.code,
          coaCode: null,
          amount: 0
        }
        this.gridDet.data.push(item)
      }
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridDet.data.findIndex(i => i.id === item.id)
        this.gridDet.data.splice(idx, 1)
      }
    },
    getCOAList() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }, {
            field: 'showInMobile',
            operator: 'eq',
            keyword: true
          }])
        }
      })
        .then(response => {
          this.coas = response.data.tableData
        })
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
          this.employees = response.data.tableData
        })
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    approve() {
      this.$refs.approval.open(this.data)
    },
    async reject() {
      let result = { success: false, message: '' }
      const resp = await api.updatemaster(`${this.endpoint.mobileSales.salesCost}/reject`, this.selected)
      result = resp.data
      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.reset()
        this.getList()
      }
    },
    calculateTotal() {
      this.data.total = _sumBy(this.gridDet.data, 'amount')
    },
    closeApprove() {
      this.reset()
      this.getList()
    },
    showImage(link) {
      this.$refs.displayImage.show(link)
    }
  }
}
</script>
