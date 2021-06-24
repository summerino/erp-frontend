<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="2">
            Aktiva Tetap
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
              <export-excel title="Daftar Aktiva Tetap" :grid="grid" :gridDefOpts="gridDefOpts" :filters="filter" ref="exportExcel"></export-excel>
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
                :disabled="item.mark.toUpperCase() === 'CLS'"
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
                :disabled="item.mark.toUpperCase() !== 'A' || !auth.allowVoid"
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
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :disabled="item.mark.toUpperCase() !== 'PR' && item.mark.toUpperCase() !== 'A'  || !auth.allowClose"
                color="blue darken-2"
                icon
                small
                @click="closeOrder(item)"
              >
                <v-icon small>mdi-lock</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Tutup</span>
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
                :color="item.mark.toUpperCase() === 'CLS' ? 'grey darken-1' : item.mark.toUpperCase() === 'V' ? 'error' : 'green'"
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
          <v-toolbar-title>Aktiva Tetap</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="isVoid || (data.action === 'edit' && !auth.allowUpdate)"
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
                  :disabled="isVoid || (data.action === 'edit' && !auth.allowUpdate)"
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
                      <v-col cols="6">
                        <v-text-field
                          v-model="data.initial"
                          label="Initial"
                          class="mt-0"
                          :rules="rules.required"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="6" class="pl-1">
                        <v-text-field
                          ref="code"
                          v-model="data.code"
                          label="Kode Aktiva"
                          class="mt-0"
                          :rules="rules.required"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="6">
                        <v-text-field
                          v-model="data.name"
                          label="Nama"
                          class="mt-0"
                          :rules="rules.required"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="6" class="pl-1">
                        <v-autocomplete
                          v-model="data.typeId"
                          :items="assetTypes"
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
                      <v-col cols="6">
                        <v-menu
                          v-model="menu.purchaseDate"
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
                              :value="formatPurchaseDate"
                              label="Tgl. Perolehan"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.purchaseDate"
                            no-title
                            scrollable
                            @change="menu.purchaseDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col cols="6" class="pl-1">
                        <v-menu
                          v-model="menu.startDepreciateOn"
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
                              :value="formatStartDepreciateOn"
                              label="Mulai Depresiasi Pada"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.startDepreciateOn"
                            no-title
                            scrollable
                            @change="menu.startDepreciateOn = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="6">
                        <v-currency-field
                          v-model="data.purchasedValue"
                          :rules="rules.required"
                          :allow-negative="true"
                          label="Nilai Perolehan"
                          class="text-right mt-0"
                          required
                        ></v-currency-field>
                      </v-col>
                      <v-col cols="6" class="pl-1">
                        <v-currency-field
                          v-model="data.acquiredValue"
                          :rules="rules.required"
                          :allow-negative="true"
                          label="Nilai Residu"
                          class="text-right mt-0"
                          required
                        ></v-currency-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="6">
                        <v-currency-field
                          v-model="data.salvageValue"
                          :rules="rules.required"
                          label="Bln. Sdh. Terdepr"
                          class="text-right mt-0"
                          :max="500"
                          :decimal-length="0"
                          required
                        ></v-currency-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card>
                  <v-tabs v-model="tab.sup">
                    <v-tab key="sup">Pemasok</v-tab>
                    <v-tab key="others">Info Pembelian</v-tab>
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
                            :readonly="hasRelatedTrans"
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
                            <template v-slot:append-outer>
                              <v-btn
                                :disabled="hasRelatedTrans"
                                color="primary"
                                icon
                                @click="showFindSupDialog"
                              >
                                <v-icon>
                                  mdi-account-search
                                </v-icon>
                              </v-btn>
                            </template>
                          </v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model="data.supAddr"
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
                      key="others"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model="data.purchaseOrderNo"
                            label="No. Order Pembelian"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model="data.invoiceNo"
                            label="No. Faktur"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model="data.paymentVoucherNo"
                            label="No. Bukti Pembayaran"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.yearWarranty"
                            label="Masa Garansi"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.codeWaranty"
                            label="Kode Garansi"
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
                  <v-tabs v-model="tab.item">
                    <v-tab key="info">Info Depresiasi</v-tab>
                    <v-tab key="history">Sejarah Depresiasi</v-tab>

                    <v-tab-item
                      key="info"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-currency-field
                                v-model="data.estimatedLife"
                                :rules="rules.required"
                                label="Masa Manfaat"
                                class="text-right mt-0"
                                :max="500"
                                :decimal-length="0"
                                required
                              ></v-currency-field>
                            </v-col>
                            <v-col cols="6" class="pl-1">
                              <v-autocomplete
                                v-model="data.depreciationMethod"
                                :items="depretiationMethods"
                                item-text="text"
                                :rules="rules.required"
                                label="Metode Depresiasi"
                                item-value="value"
                                class="mt-0"
                                required
                              ></v-autocomplete>
                            </v-col>
                          </v-row>
                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-currency-field
                                v-model="data.initDepreciationExpense"
                                :rules="rules.required"
                                label="Beban Depresiasi Awal"
                                class="text-right mt-0"
                                required
                              ></v-currency-field>
                            </v-col>
                            <v-col cols="6" class="pl-1">
                              <v-currency-field
                                v-model="data.temp4"
                                label="Akumulasi Depresiasi"
                                class="text-right mt-0"
                                required
                              ></v-currency-field>
                            </v-col>
                          </v-row>
                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-currency-field
                                v-model="data.bookValue"
                                label="Nilai Sisa Buku"
                                class="text-right mt-0"
                                required
                              ></v-currency-field>
                            </v-col>
                            <v-col cols="6" class="pl-1">
                              <v-autocomplete
                                v-model="data.temp3"
                                :items="depretiationMethods"
                                item-text="text"
                                label="Akun Beban Depresiasi"
                                item-value="value"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>
                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-autocomplete
                                v-model="data.temp2"
                                :items="depretiationMethods"
                                item-text="text"
                                label="Akun Akumulasi Depresiasi"
                                item-value="value"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-1">
                              <v-autocomplete
                                v-model="data.temp1"
                                :items="depretiationMethods"
                                item-text="text"
                                label="Akun Biaya"
                                item-value="value"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="history"
                      transition="false"
                    >
                      <v-data-table
                        :headers="gridHistory.columns"
                        :items="gridHistory.data"
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
    <find-supplier
      ref="findSup"
      @dblclick:row="bindSupData"
    ></find-supplier>
    <find-item
      ref="findItem"
      :warehouseCode="data.warehouseCode"
      @dblclick:row="bindItemData"
    ></find-item>
    <po-save-receive
     ref="poSr"
     @closeParent="closeRcv"
     ></po-save-receive>
     <po-save-invoice
     ref="poSi"
     @closeParent="closeRcv"
     ></po-save-invoice>      
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import FindSupplier from '@/components/dialog/general/FindSupplier'
import FindItem from '@/components/dialog/inventory/FindItem'
import PoSaveReceive from '@/components/dialog/purchase/POSaveReceive'
import PoSaveInvoice from '@/components/dialog/purchase/POSaveInvoice'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    FindSupplier,
    FindItem,
    PoSaveReceive,
    PoSaveInvoice
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      orderDate: false
    },
    tab: {
      sup: null,
      item: null,
      foot: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '120', excelColWidth:'10' },
        { text: 'No. Ord. Pembelian', value: 'code', divider: true, width: '160', excelColWidth:'18' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Diminta Oleh', value: 'requestInitial', divider: true, width: '200', excelColWidth:'23' },
        { text: 'Pemasok', value: 'supName', divider: true, width: '200', excelColWidth:'23' },
        { text: 'Total', value: 'total', align: 'right', divider: true, width: '120', excelColWidth:'15', isNumber: true },
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
    gridHistory: {
      columns: [
        { text: 'Tahun Fiskal', value: 'fiscalYear', divider: true },
        { text: 'Bulan Penyusutan', value: 'numberOfMonth', divider: true },
        { text: 'Periode', value: 'period', divider: true },
        { text: 'Tgl. Penyusutan', value: 'depreciateDate', divider: true },
        { text: 'Depresiasi', value: 'depreciateValue', divider: true },
        { text: 'Nilai Buku', value: 'bookValue', divider: true }
      ],
      data: []
    },
    filterfields: [
      {
        text: 'No Order', value: 'code', dataType: 'text'
      },
      {
        text: 'Tanggal', value: 'date', dataType: 'datetime'
      },
      {
        text: 'Diminta Oleh', value: 'requestInitial', dataType: 'text'
      },
      {
        text: 'Pemasok', value: 'supName', dataType: 'text'
      }
    ],
    valid: false,
    defTaxInc: false,
    employees: [],
    currencies: [],
    suppliers: [],
    warehouses: [],
    taxes: [],
    items: [],
    data: {},
    allowInsertPurchaseReceive: false,
    allowInsertPurchaseInvoice: false,
    assetTypes: []
  }),

  created: function () {
    this.getList()
    this.getSupplierLists()
    auth.getAction(this.endpoint, this.menuId.purchaseorder, [this.action.insert, this.action.update, this.action.void, this.action.close])
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    this.$store.commit('app/setFilterFields', this.filterfields)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Aktiva'
      }, {
        text: 'Aktiva Tetap'
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
    formatPurchaseDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    formatStartDepreciateOn() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    }
  },

  methods: {
    
    reset(resetValidation = true) {
      this.data = {
        action: '',
        initial: null,
        code: null,
        purchaseDate: format(new Date(), 'yyyy-MM-dd'),
        startDepreciateOn: format(new Date(), 'yyyy-MM-dd'),
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        purchasedValue: 0,
        acquiredValue: 0,
        salvageValue: 0,
        purchaseOrderNo: 0,
        invoiceNo: 0,
        paymentVoucherNo: 0,
        yearWarranty: 0,
        codeWaranty: 0,
        bookValue:0
      }
      this.gridHistory.data = []
      this.tab.sup = 0
      this.tab.item = 0
      this.tab.foot = 0
      
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
      api.getAll(this.endpoint.purchase.order, {
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
    edit(item) {
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        createdDate: (item.createdDate === null) ? null : format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: (item.updatedDate === null) ? null : format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss'),
        approvedDate: (item.approvedDate === null) ? null : format(parseISO(item.approvedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get supplier details
      this.supCodeChange()

      // Get related transaction details
      api.getAll(`${this.endpoint.purchase.order}/related-trans`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridHistory.data = response.data.tableData
        })

      // Set focus to order code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Void?',
          'Apakah anda yakin ingin membuat void data ini?')
      ) {
        api.delete(this.endpoint.purchase.order, item.code)
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
        this.$store.dispatch('app/showInfo', 'Silahkan periksa kembali data yang wajib diisi.')
        return
      }

      const data = this.data
      data.itemDetails = this.gridItem.data
      
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.purchase.order, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.purchase.order, data.code, data)
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
    supCodeChange() {
      const supplier = this.suppliers.find(s => s.code === this.data.supCode)
      if (supplier) {
        this.data.supName = supplier.name
        this.data.supAddr = supplier.address1
        this.data.supPhone = supplier.phone
        this.data.supFax = supplier.fax
      }
    },
    showFindSupDialog() {
      this.$refs.findSup.open()
    },
    bindSupData(item) {
      this.data.supCode = item.code
      this.data.supName = item.name
      this.data.supAddr = item.address1
      this.data.supPhone = item.phone
      this.data.supFax = item.fax
    },
    async exportExcel() {
      this.exportExcel.export()
    }
  }
}
</script>
