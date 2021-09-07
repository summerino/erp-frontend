<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="3">
            Pemindahan Dana
          </v-col>
          <v-col cols="12" md="5">
            <v-row no-gutters>
              <v-text-field
                v-model="grid.search"
                :readonly="filter.isAdvancedSearch"
                append-icon="mdi-magnify"
                label="Cari..."
                class="font-weight-regular mt-0 pt-0"
                single-line
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
              <export-excel title="Daftar Pemindahan Dana" :grid="grid" :gridDefOpts="gridDefOpts" :filters="filter" ref="exportExcel"></export-excel>
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
                :disabled="!auth.allowVoid || item.mark !== 'A'"
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
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.coaCode`]="{ item }">
          {{ `${item.coaCode} - ${item.coaNameFrom}` }}
        </template>
        <template v-slot:[`item.coaDetail`]="{ item }">
          {{ `${item.coaDetail} - ${item.coaNameTo}` }}
        </template>
        <template v-slot:[`item.amount`]="{ item }">
          {{ item.amount | formatCurrency }}
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
          <v-toolbar-title>Pemindahan Dana</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="(data.action === 'edit' && !auth.allowUpdate) || data.mark !== 'A'"
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
                  :disabled="(data.action === 'edit' && !auth.allowUpdate) || data.mark !== 'A'"
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
              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Umum</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="Code"
                          v-model="data.code"
                          :counter="20"
                          label="Kode"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-menu
                          v-model="menu.cbDate"
                          :close-on-content-click="false"
                          :disabled="!auth.allowChangeDate || data.mark !== 'A'"
                          transition="scale-transition"
                          min-width="290px"
                          offset-y
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-bind="attrs"
                              v-on="on"
                              :rules="rules.required"
                              :value="formatCBDate"
                              label="Tanggal"
                              class="mt-0"
                              :readonly="data.mark !== 'A'"
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
                            :min="dataStartDate"
                            no-title
                            scrollable
                            @change="menu.cbDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="Notes"
                          v-model="data.notes"
                          :rules="[rules.required[0], rules.max256chars[0]]"
                          :readonly="data.mark !== 'A'"
                          label="Catatan"
                          counter="256"
                          class="mt-0"
                          required                          
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card>
                  <v-tabs v-model="tab.advancedItem">
                    <v-tab key="user">Pengguna</v-tab>

                    <v-tab-item
                      key="user"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
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
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                  </v-tabs>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12">
                        <v-row no-gutters>
                          <v-col class="pr-md-1">
                            <h2><b>Pindah dari</b></h2>
                          </v-col>
                          <v-col cols="12" md="6" class="pl-md-1">
                            <h2><b>Pindah ke</b></h2>
                          </v-col>
                        </v-row>
                        <br/><br/>
                        <v-row no-gutters>
                          <v-col class="pr-md-1">
                            <v-autocomplete
                              ref="Account1"
                              v-model="data.coaCode"
                              :items="coaRef"
                              :item-text="item => `${item.code} - ${item.name}`"
                              :readonly="data.action === 'edit' || data.mark !== 'A'"
                              :rules="rules.required"
                              item-value="code"
                              label="Akun"
                              class="mt-0"
                              required
                              @change="onAccountFromChange"
                            ></v-autocomplete>
                          </v-col>

                          <v-divider vertical ></v-divider>

                          <v-col cols="12" md="6" class="pl-md-1">
                            <v-autocomplete
                              ref="Account2"
                              v-model="details.coaCode"
                              :items="coaRef"
                              :item-text="item => `${item.code} - ${item.name}`"
                              :readonly="data.action === 'edit' || data.mark !== 'A'"
                              :rules="rules.required"
                              item-value="code"
                              label="Akun"
                              class="mt-0"
                              required
                              @change="onAccountToChange"
                            ></v-autocomplete>
                          </v-col>
                        </v-row>

                        <v-row no-gutters>
                          <v-col class="pr-md-1">
                            <v-text-field
                              ref="Currency1"
                              v-model="data.currCode"
                              :rules="rules.required"
                              label="Mata Uang"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </v-col>

                          <v-divider vertical ></v-divider>

                          <v-col cols="12" md="6" class="pl-md-1">
                            <v-text-field
                              ref="Currency2"
                              v-model="details.currCode"
                              :rules="rules.required"
                              label="Mata Uang"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </v-col>
                        </v-row>

                        <v-row no-gutters>
                          <v-col class="pr-md-1">
                            <v-currency-field
                              ref="Value1"
                              v-model="data.amount"
                              :min="1"
                              :rules="rules.required"
                              :readonly="data.mark !== 'A'"
                              label="Nilai"
                              class="text-body-2 text-right mt-0"
                              required
                            ></v-currency-field>
                          </v-col>

                          <v-divider vertical ></v-divider>

                          <v-col cols="12" md="6" class="pl-md-1">
                            <v-currency-field
                              ref="Value2"
                              v-model="data.amount"
                              :min="1"
                              label="Nilai"
                              class="text-body-2 text-right mt-0"
                              readonly
                            ></v-currency-field>
                          </v-col>
                        </v-row>

                        <v-row no-gutters>
                          <v-col class="pr-md-1">
                            <v-text-field
                              ref="ChequeNo"
                              v-model="data.chequeNo"
                              :readonly="data.mark !== 'A'"
                              label="No. Cek"
                              class="mt-0"
                            ></v-text-field>
                          </v-col>

                          <v-divider vertical ></v-divider>

                          <v-col cols="12" md="6" class="pl-md-1">
                            &nbsp;
                          </v-col>
                        </v-row>

                        <v-row no-gutters>
                          <v-col class="pr-md-1">
                            <v-menu
                              v-model="menu.chDate"
                              :close-on-content-click="false"
                              :disabled="data.mark !== 'A'"
                              transition="scale-transition"
                              min-width="290px"
                              offset-y
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-bind="attrs"
                                  v-on="on"
                                  :value="formatChDate"
                                  :readonly="data.mark !== 'A'"
                                  label="Tanggal No. Cek"
                                  class="mt-0"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                v-model="data.chequeDate"
                                no-title
                                scrollable
                                @change="menu.chDate = false"
                              ></v-date-picker>
                            </v-menu>
                          </v-col>

                          <v-divider vertical ></v-divider>

                          <v-col cols="12" md="6" class="pl-md-1">
                            &nbsp;
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card-text>
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
import { format, parseISO }  from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm
  },

  data: () => ({
    filterFields: [{
      text: 'Kode', value: 'code', dataType: 'text'
    }, {
      text: 'Tanggal', value: 'date', dataType: 'datetime'
    }, {
      text: 'Kd. Akun Asal', value: 'coaCode', dataType: 'text'
    }, {
      text: 'Nama Akun Asal', value: 'coaNameFrom', dataType: 'text'
    }, {
      text: 'Kd. Akun Tujuan', value: 'coaDetail', dataType: 'text'
    }, {
      text: 'Nama Akun Tujuan', value: 'coaNameTo', dataType: 'text'
    }],
    dialog: {
      add: false
    },
    menu: {
      cbDate: false,
      chDate: false
    },
    tab: {
      advancedItem: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Kode', value: 'code', divider: true, width: '130', excelColWidth:'18' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '110', excelColWidth:'15', isDateTime: true },
        { text: 'Akun Asal', value: 'coaCode', divider: true, width: '180', excelColWidth:'40', customValues: ['coaCode', 'coaNameFrom'] },
        { text: 'Akun Tujuan', value: 'coaDetail', divider: true, width: '180', excelColWidth:'40', customValues: ['coaDetail', 'coaNameTo'] },
        { text: 'Nilai', value: 'amount', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
        { text: 'Status', value: 'mark', align: 'center', width: '50' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    dataStartDate: null,
    coaRef: [],
    itemDetails: [],
    data: {},
    details: {}
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getCOA()
    auth.getAction(this.endpoint, this.menuId.interCashBank)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    this.$store.commit('app/setFilterFields', this.filterFields)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Keuangan'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Kas Bank'
      }, {
        text: 'Pemindahan Dana'
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
    formatCBDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    formatChDate() {
      return this.data.chequeDate ? format(parseISO(this.data.chequeDate), 'dd-MMM-yyyy') : ''
    },
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        code: null,
        vouCode: null,
        type: null,
        date: null,
        coaCode: null,
        currCode: null,
        rate: null,
        amount: null,
        chequeNo: null,
        chequeDate: null,
        notes: null,
        typeDetail: null,
        transCode: null,
        coaDetail: null,
        currDetail: null,
        rateDetail: null,
        amountDetail: null,
        typeAmount: null,
        transAmount: null,
        notesDetail: null,
        coaNameFrom: null,
        coaNameTo: null
      }

      this.details = {
        code: null,
        type: null,
        transCode: null,
        coaCode: null,
        currCode: null,
        rate: null,
        amount: null,
        typeAmount: null,
        transAmount: null,
        notes: null,
        coaName: null
      }
      this.tab.advancedItem = 0
      this.itemDetails = []

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

      api.getAll(this.endpoint.finance.interCashBank, {
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
    close() {
      this.dialog.add = false
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'  
      this.data.mark = 'A'    

      setTimeout(() => {
        // Set focus to receive initial field
        this.$refs.Notes.focus()

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    async edit(item) {
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        originalDate: item.date,
        createdDate: format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: (item.updatedDate) ? format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss') : null,
        approvedDate: (item.approvedDate) ? format(parseISO(item.approvedDate), 'dd-MMM-yyyy HH:mm:ss') : null
      }

      // Mapping account detail
      this.mappingDetail()

      // Set focus to receive code field
      setTimeout(() => {
        this.$refs.Notes.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Void?',
          'Apakah anda yakin ingin membuat void data ini?')
      ) {
        api.delete(this.endpoint.finance.interCashBank, item.code, {data: item})
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async save(closeDialog) {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      if (this.data.coaCode === this.details.coaCode) {
        this.$store.dispatch('app/showInfo', 'Akun asal dan akun tujuan tidak boleh sama.')
        return
      }

      const data = this.data
      this.setDetail(data)
      data.itemDetails = this.itemDetails

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.finance.interCashBank, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.finance.interCashBank, data.code, data)
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
    },
    getCOA() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'typeId',
            operator: 'eq',
            keyword: 2
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.coaRef = response.data.tableData
        })
    },
    onAccountFromChange() {
      const items = this.coaRef.find(x => x.code === this.data.coaCode)

      if (items) {
        this.data.currCode = items.currCode
        this.data.vouCode = items.vouCode
        this.data.rate = 1
        this.data.type = 'C'
      }
    },
    onAccountToChange() {
      const items = this.coaRef.find(x => x.code === this.details.coaCode)

      if (items) {
        this.details.currCode = items.currCode
        this.details.vouCode = items.vouCode
        this.details.rate = 1
        this.details.type = 'ICBO'
      }
    },
    setDetail(data) {
      for (let i = 0; i < 2; i++) {
        this.itemDetails.push({
          code: (i === 1) ? this.details.transCode : data.code,
          lineNo: i,
          type: (i === 0) ? this.details.type : 'ICBI',
          transCode: (i === 0) ? this.details.transCode : data.code,
          coaCode: (i === 0) ? this.details.coaCode : data.coaCode,
          currCode: (i === 0) ? this.details.currCode : data.currCode,
          rate: (i === 0) ? this.details.rate : data.rate,
          amount: data.amount,
          typeAmount: (i === 0) ? 'D' : 'C',
          transAmount: 0,
          notes: data.notes
        })
      }
    },
    mappingDetail() {
      const data = this.data
      this.details = {
        code: data.code,
        type: data.typeDetail,
        transCode: data.transCode,
        coaCode: data.coaDetail,
        currCode: data.currDetail,
        rate: data.rateDetail,
        amount: data.amountDetail,
        typeAmount: data.typeAmount,
        transAmount: data.transAmount,
        notes: data.notesDetail,
        coaNameFrom: data.coaNameFrom,
        coaNameTo: data.coaNameTo
      }
    },
    async exportExcel() {
      this.exportExcel.export()
    }
  }
}
</script>
