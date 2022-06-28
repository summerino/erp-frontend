<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="2">
            Uang Muka Penjualan
          </v-col>
          <v-col cols="12" md="6">
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
                title="Daftar Uang Muka Penjualan"
              ></export-excel>
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
                :disabled="(item.mark.toUpperCase() !== 'PP') || !auth.allowVoid"
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
        <template v-slot:[`item.custName`]="{ item }">
          {{ item.custCode }} - {{ item.custName }}
        </template>
        <template v-slot:[`item.amount`]="{ item }">
          {{ item.amount | formatCurrency }}
        </template>
        <template v-slot:[`item.used`]="{ item }">
          {{ item.used | formatCurrency }}
        </template>
        <template v-slot:[`item.remaining`]="{ item }">
          {{ item.remaining | formatCurrency }}
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
          <v-btn icon dark @click="dialog.add = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Uang Muka Penjualan</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="data.action === 'edit' && !auth.allowUpdate"
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
                  :disabled="data.action === 'edit' && !auth.allowUpdate"
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
                          label="Kode"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.date"
                          :close-on-content-click="false"
                          :disabled="!auth.allowChangeDate"
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
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1" v-if="!isReturn">
                        <v-text-field
                          v-model="data.transCode"
                          :rules="rules.required"
                          label="Kode Transaksi Sumber"
                          class="mt-0"
                          required
                          readonly
                        >
                          <template v-slot:append>
                            <v-btn
                              color="primary"
                              icon
                              small
                              @click="showFindSODialog">
                              <v-icon>
                                mdi-shopping-search
                              </v-icon>
                            </v-btn>
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1" v-else>
                        <v-text-field
                          v-model="data.transCode"
                          :rules="rules.required"
                          label="Kode Transaksi Sumber"
                          class="mt-0"
                          required
                          readonly
                        >
                          <template v-slot:append>
                            <v-btn
                              color="primary"
                              icon
                              small
                              @click="showFindSDPDialog">
                              <v-icon>
                                mdi-shopping-search
                              </v-icon>
                            </v-btn>
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                    
                    <v-row no-gutters v-if="!isReturn">
                      <v-col cols="6">
                        <v-checkbox
                          v-model="data.noTax"
                          :readonly="hasRelatedTrans || isReturn"
                          label="Tidak Ada Pajak"
                          class="shrink ml-1"
                          @change="noTaxChange"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                          v-model="data.includeTax"
                          :disabled="data.noTax"
                          :readonly="hasRelatedTrans || isReturn"
                          label="Termasuk Pajak"
                          class="shrink ml-1"
                          @change="calcTax"
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.cust">
                    <v-tab key="cust">Pelanggan</v-tab>
                    <v-tab key="user">Pengguna</v-tab>
                    <v-tab key="notes">Catatan</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.cust" class="pa-2">
                    <v-tab-item
                      key="cust"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="3">                          
                          <v-text-field
                            v-model="data.custCode"
                            :rules="rules.required"
                            label="Kode"
                            class="mt-0"
                            readonly
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="9" class="pl-1">
                          <v-text-field
                            v-model="data.custName"
                            label="Nama"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model.trim="data.custAddr"
                            label="Alamat"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.custPhone"
                            label="Telepon"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.custFax"
                            label="Fax"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-tab-item>

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
                    </v-tab-item>

                    <v-tab-item
                      key="notes"
                      transition="false"
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
                  </v-tabs-items>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-tabs v-model="tab.related">
                    <v-tab key="detail">Detail</v-tab>
                    <v-tab key="related-trans">Transaksi Terkait</v-tab>

                    <v-tab-item
                      key="detail"
                      transition="false"
                    >
                        <v-card>
                            <v-card-text>
                                <v-row no-gutters>
                                    <v-col cols="12" md="6">
                                        <v-currency-field
                                        v-model="data.amount"
                                        label="Nilai"
                                        class="text-right mt-0"
                                        readonly
                                        ></v-currency-field>
                                    </v-col>
                                    <v-col cols="12" md="6" class="pl-md-1">
                                        <v-currency-field
                                        v-model="data.used"
                                        label="Digunakan"
                                        class="text-right mt-0"
                                        readonly
                                        ></v-currency-field>
                                    </v-col>
                                </v-row>

                                <v-row no-gutters>
                                    <v-col cols="12">
                                        <v-currency-field
                                        v-model="data.outstanding"
                                        label="Saldo"
                                        class="text-right mt-0"
                                        readonly
                                        ></v-currency-field>
                                    </v-col>
                                </v-row>

                                <v-row no-gutters v-if="!isReturn">
                                    <v-col cols="12" md="6">
                                        <v-currency-field
                                        v-model="data.dpp"
                                        label="Total Sebelum Pajak"
                                        class="text-right mt-0"
                                        readonly
                                        ></v-currency-field>
                                    </v-col>
                                    <v-col cols="12" md="6" class="pl-md-1">
                                        <v-currency-field
                                        v-model="data.taxAmount"
                                        label="Total Pajak"
                                        class="text-right mt-0"
                                        readonly
                                        ></v-currency-field>
                                    </v-col>
                                </v-row>

                                <v-row no-gutters v-if="!isReturn">
                                    <v-col cols="12">
                                        <v-currency-field
                                        v-model="data.total"
                                        label="Total"
                                        class="text-right mt-0"
                                        readonly
                                        ></v-currency-field>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="related-trans"
                      transition="false"
                    >
                      <v-data-table
                        :headers="gridRelated.columns"
                        :items="gridRelated.data"
                        :items-per-page="-1"
                        height="300"
                        class="elevation-1"
                        dense
                        disable-sort
                        fixed-header
                        hide-default-footer
                      >
                        <template v-slot:[`item.date`]="{ item }">
                          {{ item.date | formatDate('dd-MMM-yyyy') }}
                        </template>
                        <template v-slot:[`item.total`]="{ item }">
                          {{ item.total | formatCurrency }}
                        </template>
                      </v-data-table>
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
    <!-- <memo-to-cashbank ref="cashBank" :memo="data" source="credit-memo" :transactionType="transactionType" @closeParent="close"></memo-to-cashbank> -->
    <find-so
      ref="findSO"
      :invCode="data.code"
      caller="inv"
      @dblclick:row="bindSOData"
    ></find-so>
    <find-sdp
      ref="findSDP"
      @dblclick:row="bindSDPData"
    ></find-sdp>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import Confirm from '@/components/dialog/Confirm'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
// import MemoToCashbank from '@/components/dialog/finance/MemoToCashbank'
import FindSo from '@/components/dialog/sales/FindSO'
import FindSdp from '@/components/dialog/sales/FindSDP'

export default {
  components:{
    AdvancedSearch,
    ExportExcel,
    Confirm,
    FindSo,
    FindSdp
    // MemoToCashbank
  },
  data: () => ({
    filterFields: [{
      text: 'Kode', value: 'code', dataType: 'text'
    }, {
      text: 'Tanggal', value: 'date', dataType: 'datetime'
    }, {
      text: 'Kd. Pelanggan', value: 'custCode', dataType: 'text'
    }, {
      text: 'Nama Pelanggan', value: 'custName', dataType: 'text'
    }, {
      text: 'Sumber Transaksi', value: 'srcTrans', dataType: 'bit',
      options: [{ 
        text: 'Uang Muka',
        value: 3
      }, { 
        text: 'Retur Uang Muka',
        value: 4
      }]
    }, {
      text: 'Kode Transaksi Sumber', value: 'transCode', dataType: 'text'
    }, {
      text: 'Nilai', value: 'amount', dataType: 'text'
    }, {
      text: 'Digunakan', value: 'used', dataType: 'text'
    }, {
      text: 'Saldo', value: 'outstanding', dataType: 'text'
    }, {
      text: 'Status', value: 'mark', dataType: 'text'
    }],
    dialog: {
      add: false
    },
    menu: {
      date: false
    },
    tab: {
      cust: null,
      related: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'19' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Pelanggan', value: 'custName', divider: true, width: '200', excelColWidth:'35', customValues: ['custCode', 'custName'] },
        { text: 'Sumber Transaksi', value: 'srcTransName', divider: true, width: '100', excelColWidth:'19' },
        { text: 'Kode Transaksi Sumber', value: 'transCode', divider: true, width: '100', excelColWidth:'22' },
        { text: 'Nilai', value: 'amount', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
        { text: 'Digunakan', value: 'used', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
        { text: 'Saldo', value: 'remaining', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
        { text: 'Status', value: 'mark', width: '50', excelColWidth:'10' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [true]
      },
      total: 0,
      search: null
    },
    gridRelated: {
      columns: [
        { text: 'Kode Trans.', value: 'code', divider: true },
        { text: 'Tgl. Trans.', value: 'date', align: 'right', divider: true },
        { text: 'Nilai', value: 'total', align: 'right', divider: true }
      ],
      data: []
    },
    valid: false,
    dataStartDate: null,
    sources: [{ id: 3, name: 'Uang Muka' }, { id: 4, name: 'Retur Uang Muka' }],
    data: {},
    customers: [],
    transactionType: '',
    allowInsertCashBank: false,
    listTaxId: [],
    highestRate: 0
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getCustomerLists()
    auth.getAction(this.endpoint, this.menuId.salesDownPayment)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    auth.getAction(this.endpoint, this.menuId.cashBank, [1])
      .then((response) => {
        this.allowInsertCashBank = response.data.find(x => x)
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
        text: 'Uang Muka Penjualan'
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
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    hasRelatedTrans() {
      return (this.gridRelated?.data?.length > 0)
    },
    isReturn() {
      return this.data.srcTrans === 4
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        srcTrans: 3,
        transCode: null,
        custCode: null,
        custName: null,
        custAddr: null,
        custPhone: null,
        custFax: null,
        amount: 0,
        used: 0,
        outstanding: 0,
        dpp: 0,
        includeTax: false,
        noTax: false,
        taxId: 0,
        taxAmount: 0,
        total: 0
      }
      this.gridRelated.data = []
      this.tab.cust = 0
      this.tab.related = 0

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

      filters.push({
        field: 'srcTrans',
        operator: 'contains',
        keyword: [3, 4]
      })

      api.getAll(this.endpoint.sales.creditMemo, {
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
            if (item) {
              this.edit(item)
            } else {
              api.getAll(this.endpoint.sales.creditMemo, {
                params: {
                  search: this.grid.search,
                  skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
                  take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
                  sorts: JSON.stringify(sorts),
                  filters: JSON.stringify([{
                    field: 'code',
                    operator: 'eq',
                    keyword: this.data.code
                  }])
                }
              })
                .then(response => {
                  this.edit(response.data.tableData[0])
                })
            }
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
    getCustomerLists() {
      api.getAll(`${this.endpoint.general.customer.customer}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.customers = response.data.tableData
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
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        originalDate: item.date
        // updatedDate: (item.updatedDate === null) ? null : format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss'),
        // approvedDate: (item.approvedDate === null) ? null : format(parseISO(item.approvedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get customer details
      this.bindCustData(this.data)
      
      if (!this.isReturn) {
        this.data.dpp = this.data.total - this.data.taxAmount
        this.data.tempDpp = this.data.dpp
        this.data.tempTotal = this.data.total
        this.data.tempTaxAmount = this.data.taxAmount

        // Get Tax From Order Detail
        api.getAll(`${this.endpoint.sales.order}/item`, {
          params: { code: item.transCode }
        })
          .then(response => {
            this.listTaxId = response.data.tableData.map(x => x.taxId)
            // Get Highest Tax Rates
            api.getAll(this.endpoint.general.tax, {
              params: { 
                filters: JSON.stringify([
                  {
                    field: 'id',
                    operator: 'contains',
                    keyword: this.listTaxId
                  }
                ])
              }
            })
              .then(response => {
                this.highestRate = Math.max(response.data.tableData.map(x => x.rate), 0)
              })
          })
      }

      // Calculate Outstanding
      this.amountChange()

      // Get related transaction details
      api.getAll(`${this.endpoint.sales.creditMemo}/related-trans`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridRelated.data = response.data.tableData
        })

      // Set focus to return code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
    },
    bindCustData(item) {
      api.getOne(this.endpoint.general.customer.customer, item.custCode)
        .then(response => {
          if (response.data) {
            item.custAddr = response.data.address1
            item.custPhone = response.data.phone
            item.custFax = response.data.fax
            item.paymentTermId = response.data.paymentTermId
          }
        })
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    amountChange() {
      this.data.outstanding = this.data.amount - this.data.used
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
        api.delete(this.endpoint.sales.creditMemo, item.code, {data: item})
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async save(closeDialog) {
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      this.$refs.code.focus()
      const data = this.data
      data.currCode = 'IDR'
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.creditMemo, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.creditMemo, data.code, data)
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
    bindSOData(item) {
      if (item) {
        this.data.transCode = item.code
        this.data.custCode = item.custCode
        this.data.custName = item.custName
        this.data.currCode = item.currCode

        this.data.total = item.total
        this.data.tempTotal = item.total
        this.data.taxAmount = item.taxAmount
        this.data.tempTaxAmount = item.taxAmount
        this.data.dpp = item.dpp
        this.data.tempDpp = item.dpp
        this.data.noTax = (item.taxAmount === 0)
        this.data.includeTax = item.includeTax

        // Get Tax From Order Detail
        api.getAll(`${this.endpoint.sales.order}/item`, {
          params: { code: item.code }
        })
          .then(response => {
            this.listTaxId = response.data.tableData.map(x => x.taxId)
            // Get Highest Tax Rates
            api.getAll(this.endpoint.general.tax, {
              params: { 
                filters: JSON.stringify([
                  {
                    field: 'id',
                    operator: 'contains',
                    keyword: this.listTaxId
                  }
                ])
              }
            })
              .then(response => {
                this.highestRate = Math.max(response.data.tableData.map(x => x.rate), 0)
              })
          })
  
        if (!item.called) {
          // Get customer details
          this.bindCustData(this.data)
        }

        this.amountChange()
      } else {
        this.data.custCode = null
        this.data.custName = null
        this.data.custAddr = null
        this.data.custPhone = null
        this.data.custFax = null
        this.data.currCode = null

        this.data.total = 0
        this.data.taxAmount = 0
        this.data.dpp = 0
        this.data.noTax = false
        this.data.includeTax = false
      }
    },
    showFindSODialog() {
      this.$refs.findSO.open()
    },
    showFindSDPDialog() {
      this.$refs.findSDP.open()
    },
    noTaxChange() {
      if (this.data.noTax) {
        this.data.taxAmount = 0
        this.data.includeTax = false
        this.data.dpp = this.data.tempDpp
        this.data.total = this.data.tempDpp
      } else {
        this.data.taxAmount = this.data.tempTaxAmount
      }
      this.calcTax()
    },
    calcTax() {
      if ((!this.data.includeTax || this.data.includeTax) && this.data.noTax) {
        this.data.dpp = this.data.tempTotal
        this.data.total = this.data.dpp
      } else if (this.data.includeTax) {
        this.data.taxAmount = (this.data.tempTotal) - ((this.data.tempTotal) / (1 + (this.highestRate / 100)))
        this.data.dpp = this.data.tempTotal - this.data.taxAmount
        this.data.total = this.data.dpp + this.data.taxAmount
      } else {
        this.data.taxAmount = (this.data.tempTotal) * (this.highestRate / 100)
        this.data.dpp = this.data.tempTotal
        this.data.total = this.data.dpp + this.data.taxAmount
      }
    },
    bindSDPData(item) {
      this.data.transCode = item.code
      this.data.custCode = item.custCode
      this.data.custName = item.custName
      this.data.currCode = item.currCode

      this.data.amount = item.remaining
      this.data.outstanding = item.remaining

      this.bindCustData(this.data)
    }
  }
}
</script>
