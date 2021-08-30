<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="2">
            Faktur Ekspedisi
          </v-col>
          <v-col cols="12" md="6" >
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
                <span class="text-caption">Pencarian lanjutan</span>
              </v-tooltip>
              <export-excel title="Daftar Faktur Ekspedisi" :grid="grid" :gridDefOpts="gridDefOpts" :filters="filter" ref="exportExcel"></export-excel>
            </v-row>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
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
                  :disabled="!auth.allowCreate"
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
      >
        <template v-slot:[`item.action`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :disabled="(item.mark.toUpperCase() === 'V') || (!auth.allowUpdate)"
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
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :disabled="(item.mark.toUpperCase() !== 'A') || (!auth.allowVoid)"
                color="red"
                icon
                small
                @click="remove(item)"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Void</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.mark`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                v-bind="attrs"
                v-on="on"
                :color="item.mark.toUpperCase() === 'V' ? 'error' : 'green'"
                class="px-1"
                dark
                small
              >
                {{ item.mark }}
              </v-chip>
            </template>
            <span class="text-caption">{{ item.mark == 'A' ? 'Aktif' : 'Void' }}</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.dueDate`]="{ item }">
          {{ item.dueDate | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.amount`]="{ item }">
          {{ item.amount | formatCurrency }}
        </template>
        <template v-slot:[`item.paidAmount`]="{ item }">
          {{ item.paidAmount | formatCurrency }}
        </template>
        <template v-slot:[`item.remaining`]="{ item }">
          {{ item.remaining | formatCurrency }}
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
          <v-toolbar-title>Faktur Ekspedisi</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="isVoid || !auth.allowUpdate"
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
                  :disabled="isVoid || !auth.allowUpdate"
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
            <v-divider vertical></v-divider>
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
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="code"
                          v-model.trim="data.code"
                          label="Kode Transaksi"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          v-model.trim="data.refNo"
                          :rules="[rules.required[0], rules.max30chars[0]]"
                          counter="30"
                          label="No. Ref. Transaksi"
                          class="mt-0"
                        ></v-text-field>
                      </v-col>
                    </v-row>

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
                              :disabled="!auth.allowChangeDate"
                              :rules="rules.required"
                              :value="formatDate"
                              label="Tanggal"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
                            :min="dataStartDate"
                            no-title
                            scrollable
                            @change="menu.date = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.dueDate"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          min-width="290px"
                          offset-y
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-bind="attrs"
                              v-on="on"
                              :disabled="!auth.allowChangeDate"
                              :rules="rules.required"
                              :value="formatDueDate"
                              label="Tanggal Jatuh Tempo"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.dueDate"
                            :min="dataStartDate"
                            no-title
                            scrollable
                            @change="menu.dueDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-autocomplete
                          v-model="data.srcTrans"
                          :items="sources"
                          :rules="rules.required"
                          label="Sumber Transaksi"
                          item-text="name"
                          item-value="id"
                          class="mt-0"
                          required
                          @change="srcTransChange"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-currency-field
                          v-model="data.amount"
                          :rules="rules.cannot0"
                          label="Nilai Transaksi"
                          class="text-right mt-0"
                        ></v-currency-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.sup">
                    <v-tab key="sup">Pemasok</v-tab>
                    <v-tab key="notes">Catatan</v-tab>
                    <v-tab key="user">Pengguna</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.sup" class="pa-2">
                    <v-tab-item
                      key="sup"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="4">
                          <v-autocomplete
                            v-model="data.supCode"
                            :items="suppliers"
                            :item-text="item => `${item.code} - ${item.initial}`"
                            :rules="rules.required"
                            label="Kode"
                            item-value="code"
                            class="mt-0"
                            required
                            @change="supCodeChange"
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="8" class="pl-1">
                          <v-text-field
                            v-model="data.supName"
                            :rules="rules.required"
                            label="Nama"
                            class="mt-0"
                            readonly
                            required
                          >
                          </v-text-field>
                        </v-col>
                      </v-row>
                      
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model.trim="data.supAddr"
                            label="Alamat"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.supPhone"
                            label="Telepon"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.supFax"
                            label="Fax"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-tab-item>

                    <v-tab-item
                      key="notes"
                      transition="false"
                      eager
                    >
                      <v-textarea
                        v-model="data.notes"
                        :rules="rules.max256chars"
                        label="Catatan"
                        counter="256"
                        class="mt-0"
                        rows="4"
                      ></v-textarea>
                    </v-tab-item>

                    <v-tab-item
                      key="user"
                      transition="false"
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
                        <v-col cols="6" class="pl-md-1">
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
                        <v-col cols="6" class="pl-md-1">
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
                        <v-col cols="6" class="pl-md-1">
                          <v-text-field
                            v-model="data.approvedDate"
                            label="Tanggal Disetujui"
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
                  <v-tabs v-model="tab.detail">
                    <v-tab key="detail">Detail</v-tab>

                    <v-tab-item
                      key="detail"
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
                                :disabled="isVoid"
                                class="blue--text"
                                small
                                tile
                                @click="addDetail"
                                @shortkey="addDetail"
                              >
                                <v-icon left>mdi-plus</v-icon>
                                Tambah
                              </v-btn>
                            </template>
                            <span class="text-caption">(Ctrl + I)</span>
                          </v-tooltip>
                        </v-app-bar>

                        <v-data-table
                          :headers="gridDetail.columns"
                          :items="gridDetail.data"
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
                                  :disabled="isVoid"
                                  color="red"
                                  icon
                                  small
                                  @click="removeDetail(item)"
                                >
                                  <v-icon small>mdi-close-thick</v-icon>
                                </v-btn>
                              </template>
                              <span class="text-caption">Hapus</span>
                            </v-tooltip>
                          </template>
                          <template v-slot:[`item.transCode`]="{ item }">
                            <v-autocomplete
                              ref="transCode"
                              v-model="item.transCode"
                              :items="data.srcTrans === 1 ? receives : deliveries"
                              :rules="rules.required"
                              item-text="code"
                              item-value="code"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="transCodeChange(item)"
                            >
                            </v-autocomplete>
                          </template>
                          <template v-slot:[`item.date`]="{ item }">
                            {{ item.date | formatDate('dd-MMM-yyyy') }}
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { randomNumber } from '@/helpers/math-helpers'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'


import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
export default {
  components:{
    Confirm,
    AdvancedSearch,
    ExportExcel
  },
  data: () => ({
    filterFields: [{
      text: 'Kode', value: 'code', dataType: 'text'
    }, {
      text: 'Tanggal', value: 'date', dataType: 'datetime'
    }, {
      text: 'Tgl. Jatuh Tempo', value: 'dueDate', dataType: 'datetime'
    }, {
      text: 'Pemasok', value: 'supInitial', dataType: 'text'
    }],
    dialog: {
      add: false
    },
    menu: {
      date: false,
      dueDate: false
    },
    tab: {
      sup: null,
      related: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'18' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Tgl. Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Pemasok', value: 'supInitial', divider: true, width: '200', excelColWidth:'35' },        
        { text: 'Nilai', value: 'amount', align: 'right', divider: true, width: '120', excelColWidth:'15', isNumber: true },
        { text: 'Nilai Sudah Dibayar', value: 'paidAmount', align: 'right', divider: true, width: '120', excelColWidth:'15', isNumber: true },
        { text: 'Sisa', value: 'remaining', align: 'right', divider: true, width: '120', excelColWidth:'15', isNumber: true },
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
    gridDetail: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90'},
        { text: 'Kode Transaksi', value: 'transCode', divider: true, width: '160'},
        { text: 'Tanggal Transaksi', value: 'date', align: 'right', divider: true, width: '120'},
        { text: 'Status', value: 'mark', width: '50'}
      ],
      data: []
    },
    valid: false,
    dataStartDate: null,
    sources: [{ id: 1, name: 'Penerimaan Pembelian' }, { id: 2, name: 'Surat Jalan' }],
    deliveries: [],
    receives: [],
    suppliers: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getDeliveryLists()
    this.getReceiveLists()
    this.getSupplierLists()
    auth.getAction(this.endpoint, this.menuId.expeditionInvoice)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    this.$store.commit('app/setFilterFields', this.filterFields)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Ekspedisi'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Faktur'
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
    formatDueDate() {
      return this.data.dueDate ? format(parseISO(this.data.dueDate), 'dd-MMM-yyyy') : ''
    },
    isVoid() {
      return (this.data?.mark?.toUpperCase() === 'V')
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        currCode: 'IDR',
        rate: 1,
        srcTrans: 1,
        refNo: null,
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        amount: 0,
        notes: null
      }
      this.tab.sup = 0
      this.tab.detail = 0

      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }
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
      api.getAll(this.endpoint.expedition.invoice, {
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
    getSystemParameter() {
      api.getAll(`${this.endpoint.systemManagement.parameter}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'code',
            operator: 'eq',
            keyword: 'DATA_START_DATE'
          }])
        }
      })
        .then(response => {
          this.dataStartDate = response.data.tableData[0].value
        })
    },
    supCodeChange() {
      const supplier = this.suppliers.find(s => s.code === this.data.supCode)
      if (supplier) {
        this.data.supName = supplier.name
        this.data.supAddr = supplier.address1
        this.data.supPhone = supplier.phone
        this.data.supFax = supplier.fax
      }
    },
    edit(item) {
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        originalDate: item.date,
        createdDate: (item.createdDate === null) ? null : format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: (item.updatedDate === null) ? null : format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss'),
        approvedDate: (item.approvedDate === null) ? null : format(parseISO(item.approvedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get supplier details
      this.supCodeChange()

      // Get details
      api.getAll(`${this.endpoint.expedition.invoice}/detail`, {
        params: { code: item.code }
      })
        .then(response => {
          for (let i = 0; i < response.data.tableData.length; i++) {
            let data_t = response.data.tableData[i] 
            if (this.data.srcTrans === 1) {
              data_t = this.receives.find(r => r.code.toUpperCase() === response.data.tableData[i].transCode.toUpperCase())
            } else {
              data_t = this.deliveries.find(d => d.code.toUpperCase() === response.data.tableData[i].transCode.toUpperCase())
            }
            response.data.tableData[i].date = data_t.date
            response.data.tableData[i].mark = data_t.mark
          }
          this.gridDetail.data = response.data.tableData
        })

      // Set focus to return code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
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
    async exportExcel() {
      this.exportExcel.export()
    },
    close() {
      this.dialog.add = false
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'

      setTimeout(() => {
        // Set focus to order code field
        this.$refs.code.focus()

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    addDetail() {
      if (this.gridDetail.data.length === 0 || (this.gridDetail.data.slice(-1)[0]?.transCode ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.data.code,
          transCode: null,
          date: null,
          mark: null
        }
        this.gridDetail.data.push(item)

        setTimeout(() => {
          this.$refs.transCode.focus()
        }, 0)
      }
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Void?',
          'Apakah anda yakin ingin membuat void data ini?')
      ) {
        api.delete(this.endpoint.expedition.invoice, item.code, {data: item})
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async removeDetail(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridDetail.data.findIndex(i => i.id === item.id)
        this.gridDetail.data.splice(idx, 1)
      }
    },
    getReceiveLists() {
      api.getAll(this.endpoint.purchase.receive, {
        params: {
          filters: JSON.stringify([{
            field: 'mark',
            operator: 'neq',
            keyword: 'V'
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.receives = response.data.tableData
        })
    },
    getDeliveryLists() {
      api.getAll(this.endpoint.sales.delivery, {
        params: {
          filters: JSON.stringify([{
            field: 'mark',
            operator: 'neq',
            keyword: 'V'
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.deliveries = response.data.tableData
        })
    },
    srcTransChange() {
      this.gridDetail.data = []
    },
    transCodeChange(item) {
      let data_t = item
      if (this.data.srcTrans === 1) {
        data_t = this.receives.find(r => r.code.toUpperCase() === item.transCode.toUpperCase())
      } else {
        data_t = this.deliveries.find(d => d.code.toUpperCase() === item.transCode.toUpperCase())
      }

      if (data_t) {
        item.date = data_t.date
        item.mark = data_t.mark
      }
    },
    async save(closeDialog) {
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = this.data
      data.details = this.gridDetail.data

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.expedition.invoice, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.expedition.invoice, data.code, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else {
          this.data.code = result.data
        }
        this.getList(!closeDialog)
      }
    }
  }
}
</script>
