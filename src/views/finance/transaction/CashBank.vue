<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Kas Bank
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
              <export-excel title="Daftar Note Debit" :grid="grid" :gridDefOpts="gridDefOpts" :filters="filter" ref="exportExcel"></export-excel>

            </v-row>
            
          </v-col>
          <v-spacer></v-spacer>
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
                >
                  <v-icon left>mdi-plus</v-icon>
                  Data Baru
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + Alt + N)</span>
            </v-tooltip>
          </v-col>
          <!-- <v-col cols="12" md="4">
            <v-text-field
              v-model.trim="grid.search"
              append-icon="mdi-magnify"
              label="Cari..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList()"
            ></v-text-field>
          </v-col> -->
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
                :disabled="!auth.allowVoid"
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
        <template v-slot:[`item.type`]="{ item }">
          {{ item.type === 'D' ? 'Debit' : 'Credit' }}
        </template>
        <template v-slot:[`item.amount`]="{ item }">
          {{ item.amount | formatCurrency }}
        </template>
        <template v-slot:[`item.coaCode`]="{ item }">
          {{ item.coaCode }} - {{ item.coaName }}
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
        <!-- <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.amount`]="{ item }">
          {{ item.amount | formatCurrency }}
        </template>
        <template v-slot:[`item.used`]="{ item }">
          {{ item.used | formatCurrency }}
        </template>
        <template v-slot:[`item.outstanding`]="{ item }">
          {{ item.outstanding | formatCurrency }}
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
        </template> -->
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
          <v-btn icon dark @click="dialog.add = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Kas Bank</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  dark
                  text
                  @click="save(true)"
                  @shortkey="save(true)"
                  :disabled="(data.action === 'edit' && !auth.allowUpdate)"
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
                  @click="save(false)"
                  @shortkey="save(false)"
                  :disabled="(data.action === 'edit' && !auth.allowUpdate)"
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
                      <v-col cols="12" md="12">
                        <v-text-field
                          ref="code"
                          v-model.trim="data.code"
                          label="Kode"
                          class="mt-0"
                          readonly
                          dense
                        ></v-text-field>
                      </v-col>
                      <!-- <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          ref="code"
                          v-model.trim="data.voucode"
                          label="Kode Voucher"
                          class="mt-0"
                          dense
                        ></v-text-field>
                      </v-col> -->
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
                              :rules="rules.required"
                              :value="formatDate"
                              label="Tanggal"
                              class="mt-0"
                              readonly
                              required
                              dense
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
                            no-title
                            scrollable
                            @change="menu.date = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-autocomplete
                          v-model="data.type"
                          :items="types"
                          :rules="rules.required"
                          label="Tipe"
                          class="mt-0"
                          dense
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12" md="12">
                        <v-autocomplete
                          v-model="data.coaCode"
                          :items="coas"
                          label="Akun"
                          :item-text="item => `${item.code} - ${item.name}`"
                          item-value="code"
                          class="mt-0"
                          @change="changeCoaCode"
                          :rules="rules.required"
                          required
                          dense
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                    <v-row no-gutters v-if="isShowCheque">
                      <v-col cols="12" md="6">
                        <v-menu
                          v-model="menu.chequeDate"
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
                              :value="formatChequeDate"
                              label="Tanggal Cek"
                              class="mt-0"
                              readonly
                              required
                              dense
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.chequeDate"
                            no-title
                            scrollable
                            @change="menu.chequeDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          ref="code"
                          v-model.trim="data.chequeNo"
                          label="Kode Cek"
                          class="mt-0"
                          dense
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.note">
                    <v-tab key="notes">Catatan</v-tab>
                    <v-tab key="user">Pengguna</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.note" class="pa-2">
                    <v-tab-item
                      key="notes"
                      transition="false"
                      eager
                    >
                      <v-textarea
                        v-model="data.notes"
                        :rules="[rules.max256chars[0], rules.required[0]]"
                        label="Catatan"
                        counter="256"
                        class="mt-0"
                        rows="4"
                        required
                      ></v-textarea>
                    </v-tab-item>
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
                                dense
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-text-field
                                v-model="data.createdDate"
                                label="Tanggal Dibuat"
                                class="mt-0"
                                readonly
                                dense
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
                                dense
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-text-field
                                v-model="data.updatedDate"
                                label="Tanggal Diperbarui"
                                class="mt-0"
                                readonly
                                dense
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
                                dense
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-text-field
                                v-model="data.approvedDate"
                                label="Tanggal Disetujui"
                                class="mt-0"
                                readonly
                                dense
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
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
                                :disabled="(!auth.allowInsert && (data.action === 'edit' && !auth.allowUpdate))"
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
                                  color="red"
                                  icon
                                  small
                                  @click="removeItem(item)"
                                >
                                  <v-icon small>mdi-close-thick</v-icon>
                                </v-btn>
                              </template>
                              <span class="text-caption">Void</span>
                            </v-tooltip>
                          </template>
                          <template v-slot:[`item.amount`]="{ item }">
                            <v-currency-field
                              v-model="item.amount"
                              class="text-body-2 text-right mt-0"
                              dense
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.notes`]="{ item }">
                            <v-textarea
                              v-model="item.notes"
                              class="mt-0"
                              rows="1"
                            ></v-textarea>
                          </template>
                          <template v-slot:[`item.transAmount`]="{ item }">
                            {{ item.transAmount | formatCurrency }}
                          </template>
                          <template v-slot:[`item.coaCode`]="{ item }">
                            {{ item.coaCode }} - {{ item.coaName }}
                          </template>
                        </v-data-table>
                      </v-card>
                      
                    </v-tab-item>
                  </v-tabs>
                </v-card>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-tabs v-model="tab.summary">
                    <v-tab key="summary">Total</v-tab>

                    <v-tab-item
                      key="summary"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-currency-field
                                label="Total Nilai"
                                v-model="data.amountSummary"
                                class="text-body-2 text-right mt-0"
                                readonly
                              ></v-currency-field>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-currency-field
                                label="Total Nilai Transaksi"
                                v-model="data.transAmountSummary"
                                class="text-body-2 text-right mt-0"
                                readonly
                              ></v-currency-field>
                            </v-col>
                          </v-row>
                        </v-card-text>
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
    <detail-cash-bank ref="detailCashBank" :coas="coas" :cashBankTypes="cashBankTypes" :coaCodes="coaCodes" @saveItem="saveItem"></detail-cash-bank>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import Confirm from '@/components/dialog/Confirm'
import DetailCashBank from '@/components/dialog/general/DetailCashBank'
import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'

export default {
  components:{
    AdvancedSearch,
    ExportExcel,
    Confirm,
    DetailCashBank
  },
  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      date: false,
      chequeDate: false
    },
    tab: {
      note: null,
      detail: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'Kode', value: 'code', divider: true, width: '100', excelColWidth:'19' },
        // { text: 'Kode Voucher', value: 'vouCode', divider: true, width: '160', excelColWidth:'19' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '100', excelColWidth:'15', isDateTime: true },
        { text: 'Nilai', value: 'amount', divider: true, align:'right', width: '100', excelColWidth:'13' },
        { text: 'Tipe', value: 'type', divider: true, width: '50', excelColWidth:'13' },
        { text: 'Akun', value: 'coaCode', divider: true, width: '100', excelColWidth:'20', customValues: ['coaCode', 'coaName'] },
        { text: 'Status', value: 'mark', divider: true, width: '100' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [true]
      },
      total: 0,
      search: null
    },
    gridItem: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '50' },
        { text: 'Akun', value: 'coaCode', divider: true, width: '90' },
        { text: 'Kode Trans.', value: 'transCode', divider: true, width: '120' },
        { text: 'Catatan', value: 'notes', divider: true, width: '200' },
        { text: 'Nilai', value: 'amount', align: 'right', divider: true, width: '120' },
        { text: 'D/C', value: 'typeAmount', divider: true, width: '50' },
        { text: 'Mata Uang', value: 'currCode', divider: true, width: '50' },
        { text: 'Kurs', value: 'rate', align: 'right', divider: true, width: '50' },
        { text: 'Nilai Transaction', value: 'transAmount', align: 'right', divider: true, width: '120' }
      ],
      data: []
    },
    filterfields: [
      {
        text: 'Kode Transaksi', value: 'code', dataType: 'text'
      },
      {
        text: 'Tanggal Transaksi', value: 'date', dataType: 'datetime'
      },
      {
        text: 'Tipe', value: 'type', dataType: 'text'
      }
    ],
    valid: false,
    types: [
      { value: 'D', text: 'Kas Bank Masuk' }, 
      { value: 'C', text: 'Kas Bank Keluar' }
    ],
    coas: [],
    data: {},
    isShowCheque: false,
    cashBankTypes: [],
    coaCodes: []
  }),

  created: function () {
    this.getCashBankTypeList()
    this.getCOAList()
    this.getList()
    auth.getAction(this.endpoint, this.menuId.cashBank, [this.action.insert, this.action.update, this.action.void, this.action.changeDate])
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    this.$store.commit('app/setFilterFields', this.filterfields)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Keuangan'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Kas Bank'
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
      action: state => state.api.action,
      menuId: state => state.api.menus
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    formatChequeDate() {
      return this.data.chequeDate ? format(parseISO(this.data.chequeDate), 'dd-MMM-yyyy') : ''
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        srcTrans: 1,
        type: 'D',
        transCode: null,
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        amount: 0,
        used: 0,
        outstanding: 0,
        transAmountSummary: 0,
        amountSummary: 0
      }
      this.gridItem.data = []
      this.tab.note = 0
      this.tab.related = 0

      // Get item details
      api.getAll(`${this.endpoint.finance.cashBank}/detail`, {
        params: { code: this.data.code }
      })
        .then(response => {
          this.gridData.data = response.data.tableData
        })

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
      api.getAll(this.endpoint.finance.cashBank, {
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
    getCOAList() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'typeid',
            operator: 'eq',
            keyword: 2
          }])
        }
      })
        .then(response => {
          this.coas = response.data.tableData
        })
    },
    getCOACodeList(temp) {
      const codes = []
      for (let i = 0; i < temp.length; i++) {
        codes.push(`${temp[i].code}_COA`)
      }
      api.getAll(`${this.endpoint.systemManagement.parameter}/lists`, {
        params: {
          codes: JSON.stringify(codes)
        }
      })
        .then(response => {
          this.coaCodes = response.data.tableData
        })
    },
    getCashBankTypeList() {
      api.getAll(`${this.endpoint.finance.cashBankType}/lists`, {})
        .then(response => {
          this.cashBankTypes = response.data.tableData
          this.getCOACodeList(this.cashBankTypes)
        })
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'

      setTimeout(() => {

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    edit(item) {
      debugger
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit'
      }

      // Get item details
      api.getAll(`${this.endpoint.finance.cashBank}/detail`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data.tableData
        })

      // Set focus to return code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
    },
    
    async exportExcel() {
      this.exportExcel.export()
    },
    close() {
      this.dialog.add = false
      this.getList()
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Void?',
          'Apakah anda yakin ingin membuat void data ini?')
      ) {
        api.delete(this.endpoint.finance.cashBank, item.code)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridItem.data.findIndex(i => i.id === item.id)
        this.gridItem.data.splice(idx, 1)
      }
    },
    async save(closeDialog) {
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      if (this.gridItem.data.length === 0) {
        this.$store.dispatch('app/showInfo', 'Data detil tidak boleh kosong.')
        return
      }

      const data = this.data
      data.itemDetails = this.gridItem.data
      data.currCode = 'IDR'
      data.rate = 1
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.finance.cashBank, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.finance.cashBank, data.code, data)
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
    saveItem(items) {
      for (let i = 0; i < items.length; i++) {
        if (this.gridItem.data.find(x => x.id === items[i].id) === undefined) {
          this.gridItem.data.push(items[i]) 
          console.log('items', items[i])
        }
      }
    },
    addItem() {
      this.showDetailCashBank()
    },
    showDetailCashBank() {
      this.$refs.detailCashBank.open()
    },
    changeCoaCode() {
      const find = this.coas.find(x => x.code === this.data.coaCode)
      if (find) {
        if (find.cbType === 'C') {
          this.isShowCheque = true 
        } else {
          this.isShowCheque = false
          this.data.chequeDate = null
          this.data.chequeNo = ''
        }
      }
    }
  }
}
</script>
