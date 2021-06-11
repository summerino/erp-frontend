<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Penerimaan
          </v-col>
          <!-- <v-col cols="12" md="4">
            <v-text-field
              v-model="grid.search"
              append-icon="mdi-magnify"
              label="Cari..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList()"
            ></v-text-field>
          </v-col> -->
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
              <export-excel title="Data Penerimaan" :grid="grid" :gridDefOpts="gridDefOpts" ref="exportExcel"></export-excel>
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
                :disabled="item.mark.toUpperCase() !== 'A'"
                color="red"
                icon
                small
                @click="remove(item)"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Hapus</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
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
          <v-toolbar-title>Penerimaan Barang</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="isVoid"
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
                  :disabled="isVoid"
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
                      <v-col cols="12">
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
                    </v-row>
                    
                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="code"
                          v-model="data.code"
                          label="Kode"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.rcvDate"
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
                              :value="formatRcvDate"
                              label="Tanggal"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
                            no-title
                            scrollable
                            @change="menu.rcvDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="data.transCode"
                          :label="lblTransCode"
                          :readonly="hasRelatedTrans"
                          :rules="rules.required"
                          class="mt-0"
                          required
                          @change="transCodeChange"
                        >
                          <template v-slot:append>
                              <v-btn
                                :disabled="hasRelatedTrans"
                                color="primary"
                                icon
                                small
                                @click="showFindTransDialog"
                              >
                                <v-icon>
                                  mdi-shopping-search
                                </v-icon>
                              </v-btn>
                            </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          v-model="data.refNo"
                          :rules="rules.max30chars"
                          label="No. Ref."
                          counter="30"
                          class="mt-0"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.sup">
                    <v-tab key="sup">Pemasok</v-tab>
                    <v-tab key="user">Pelanggan</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.sup" class="pa-2">
                    <v-tab-item
                      key="sup"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="3">
                          <v-text-field
                            v-model="data.supCode"
                            :rules="rules.required"
                            label="Kode"
                            class="mt-0"
                            readonly
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="9" class="pl-1">
                          <v-text-field
                            v-model="data.supName"
                            label="Nama"
                            class="mt-0"
                            readonly
                          ></v-text-field>
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
                      key="user"
                      transition="false"
                      eager
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.receiveBy"
                            :items="employees"
                            :item-text="item => `${item.initial} - ${item.firstName}`"
                            :rules="rules.required"
                            label="Diterima Oleh"
                            item-value="id"
                            class="mt-0"
                            required
                          ></v-autocomplete>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model.trim="data.approveInitial"
                            label="Disetujui Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model.trim="data.createdInitial"
                            label="Dibuat Oleh"
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
                  </v-tabs-items>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-tabs v-model="tab.item">
                    <v-tab key="item">Barang</v-tab>
                    <v-tab key="related-trans">Transaksi Terkait</v-tab>

                    <v-tab-item
                      key="item"
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
                                :disabled="isVoid || hasRelatedTrans"
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
                                  :disabled="item.type == 0 || isVoid || hasRelatedTrans"
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
                          <template v-slot:[`item.itemId`]="{ item }">
                            <v-autocomplete
                              ref="itemId"
                              v-model="item.itemId"
                              :items="items"
                              :readonly="item.type == 0 || hasRelatedTrans || isPurchaseReturn"
                              :rules="rules.required"
                              item-text="initial"
                              item-value="id"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="itemIdChange(item)"
                            >
                              <template v-slot:append>
                                <v-btn
                                  :disabled="item.type == 0 || hasRelatedTrans || isPurchaseReturn"
                                  color="primary"
                                  icon
                                  x-small
                                  @click="showFindItemDialog(item)"
                                >
                                  <v-icon>
                                    mdi-settings-helper
                                  </v-icon>
                                </v-btn>
                              </template>
                            </v-autocomplete>
                          </template>
                          <template v-slot:[`item.qty`]="{ item }">
                            <v-currency-field
                              v-model="item.qty"
                              :decimal-length="0"
                              :readonly="hasRelatedTrans"
                              class="text-body-2 text-right mt-0"
                              dense
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.warehouseInitial`]="{ item }">
                            <v-autocomplete
                              v-model="item.warehouseCode"
                              :items="warehouses"
                              :rules="rules.required"
                              item-text="initial"
                              item-value="code"
                              class="text-body-2 text-right mt-0"
                              dense
                              required
                            ></v-autocomplete>
                          </template>
                        </v-data-table>
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
    <find-po
      ref="findPO"
      :mark-exclude="['V', 'CLS', 'CMP']"
      @dblclick:row="bindTransData"
    ></find-po>
    <find-return
      ref="findReturn"
      :type="[2,3]"
      :mark-exclude="['V', 'CLS', 'CMP']"
      @dblclick:row="bindTransData"
    ></find-return>
    <find-item
      ref="findItem"
      @dblclick:row="bindItemData"
    ></find-item>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import FindPo from '@/components/dialog/purchase/FindPO'
import FindReturn from '@/components/dialog/purchase/FindReturn'
import FindItem from '@/components/dialog/inventory/FindItem'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    FindPo,
    FindReturn,
    FindItem
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      rcvDate: false
    },
    tab: {
      sup: null,
      item: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'19' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15' },
        { text: 'Pemasok', value: 'supName', divider: true, width: '200', excelColWidth:'23' },
        { text: 'Kode Transaksi', value: 'transCode', divider: true, width: '150', excelColWidth:'18' },
        { text: 'Diterima Oleh', value: 'receiveInitial', divider: true, width: '200', excelColWidth:'23' },
        { text: 'No. Ref.', value: 'refNo', width: '150', excelColWidth:'18' },
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
    gridItem: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Inisial', value: 'itemId', divider: true, width: '120' },
        { text: 'Nama', value: 'itemName', divider: true, width: '300' },
        { text: 'Qty Pesanan', value: 'orderQty', align: 'right', divider: true, width: '90' },
        { text: 'Outstanding', value: 'outstandingQty', align: 'right', divider: true, width: '90' },
        { text: 'Qty Diterima', value: 'qty', align: 'right', divider: true, width: '90' },
        { text: 'Satuan', value: 'unitName', divider: true, width: '90' },
        { text: 'Gudang', value: 'warehouseInitial', divider: true, width: '180' },
        { text: 'Tipe', value: 'typeName', width: '90' }
      ],
      data: []
    },
    gridRelated: {
      columns: [
        { text: 'Code', value: 'code', divider: true },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true },
        { text: 'Nilai', value: 'total', align: 'right', divider: true }
      ],
      data: []
    },
    filterfields: [
      {
        text: 'Kode', value: 'code', dataType: 'text'
      },
      {
        text: 'Tanggal', value: 'date', dataType: 'dateTime'
      },
      {
        text: 'Pemasok', value: 'supName', dataType: 'text'
      },
      {
        text: 'Kode Transaksi', value: 'transCode', dataType: 'text'
      },
      {
        text: 'Diterima Oleh', value: 'receiveInitial', dataType: 'text'
      },
      {
        text: 'No. Ref.', value: 'refNo', dataType: 'text'
      }
    ],
    valid: false,
    lblTransCode: null,
    sources: [{ id: 1, name: 'Order Pembelian' }, { id: 2, name: 'Retur Pembelian' }],
    employees: [],
    taxes: [],
    items: [],
    warehouses: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.getEmployeeLists()
    this.getTaxLists()
    this.getItemLists()
    this.getWarehouseLists()
    this.$store.commit('app/setFilterFields', this.filterfields)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Pembelian'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Order'
      }, {
        text: 'Penerimaan'
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
      filter: state => state.app.filter
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatRcvDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    hasRelatedTrans() {
      return (this.gridRelated?.data?.length > 0)
    },
    isVoid() {
      return (this.data?.mark?.toUpperCase() === 'V')
    },
    isPurchaseReturn() {
      return (this.data.srcTrans === 2)
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        srcTrans: 1,
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        transCode: null,
        refNo: null,
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        receiveBy: null,
        approveBy: null,
        currCode: 'IDR',
        rate: 1,
        dpp: 0,
        subTotal: 0,
        finalDiscPercent: 0,
        finalDisc: 0,
        taxAmount: 0,
        total: 0
      }
      this.lblTransCode = 'Kode Order Pembelian'
      this.gridItem.data = []
      this.gridRelated.data = []
      this.tab.sup = 0
      this.tab.item = 0

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
      api.getAll(this.endpoint.purchase.receive, {
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
    // getList(bindToForm = false) {
    //   const sorts = []
    //   for (let i = 0; i < this.grid.options.sortBy.length; i++) {
    //     sorts.push({
    //       field: this.grid.options.sortBy[i],
    //       direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
    //     })
    //   }

    //   api.getAll(this.endpoint.purchase.receive, {
    //     params: {
    //       search: this.grid.search,
    //       skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
    //       take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
    //       sorts: JSON.stringify(sorts)
    //     }
    //   })
    //     .then(response => {
    //       this.grid.data = response.data.tableData
    //       this.grid.total = response.data.rowCount
    //       if (bindToForm) {
    //         const item = this.grid.data.find(h => h.code === this.data.code)
    //         this.edit(item)
    //       }
    //     })
    // },
    getEmployeeLists() {
      api.getAll(`${this.endpoint.general.employee}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'type',
            operator: 'eq',
            keyword: 1
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
    getTaxLists() {
      api.getAll(this.endpoint.general.tax, {
        params: {
          filters: JSON.stringify([{
            field: 'typeId',
            operator: 'eq',
            keyword: 1
          }])
        }
      })
        .then(response => {
          this.taxes = response.data.tableData
        })
    },
    getItemLists() {
      api.getAll(this.endpoint.inventory.item.item)
        .then(response => {
          this.items = response.data.tableData
        })
    },
    getWarehouseLists() {
      api.getAll(`${this.endpoint.inventory.warehouse}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.warehouses = response.data.tableData
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
        // Set focus to receive code field
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
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Define label trans code
      if (this.data.srcTrans === 1) {
        this.lblTransCode = 'Kode Order Pembelian'
      } else {
        this.lblTransCode = 'Kode Retur'
      }

      // Get supplier details
      this.bindSupData(this.data)

      // Get item details
      api.getAll(`${this.endpoint.purchase.receive}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data.tableData
        })

      // Get related transaction details
      api.getAll(`${this.endpoint.purchase.receive}/related-trans`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridRelated.data = response.data.tableData
        })

      // Set focus to receive code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        api.delete(this.endpoint.purchase.receive, item.code)
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

      if (_sumBy(this.gridItem.data.filter(x => x.type === 0), 'qty') <= 0) {
        this.$store.dispatch('app/showInfo', 'Total qty penerimaan tidak boleh 0.')
        return
      }

      const data = this.data
      data.itemDetails = this.gridItem.data

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.purchase.receive, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.purchase.receive, data.code, data)
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
    addItem() {
      if (!this.data.transCode) {
        this.$store.dispatch('app/showInfo', 'Mohon input pembelian terlebih dahulu.')
        return
      }

      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0]?.itemId ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.data.code,
          itemId: null,
          itemName: null,
          orderQty: 0,
          outstandingQty: 0,
          qty: 1,
          uomId: null,
          oldUnitId: null,
          oldUnitName: null,
          oldUnitPrice: 0,
          unitId: null,
          unitName: null,
          unitPrice: 0,
          disc: 0,
          taxId: null,
          taxAmount: 0,
          nettPrice: 0,
          total: 0,
          dpp: 0,
          totTax: 0,
          totDPP: 0,
          warehouseCode: null,
          type: 1,
          typeName: 'Bonus',
          state: 'A'
        }
        this.gridItem.data.push(item)

        setTimeout(() => {
          this.$refs.itemId.focus()
        }, 0)
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

        // Calc price
        this.calcPrice()
      }
    },
    srcTransChange() {
      if (this.data.srcTrans === 1) {
        this.lblTransCode = 'Kode Order Pembelian'
      } else {
        this.lblTransCode = 'Kode Retur'
      }
      this.data.transCode = null
      this.data.supCode = null
      this.data.supName = null
      this.data.supAddr = null
      this.data.supPhone = null
      this.data.dpp = 0
      this.data.subTotal = 0
      this.data.finalDiscPercent = 0
      this.data.finalDisc = 0
      this.data.taxAmount = 0
      this.data.total = 0
      this.gridItem.data = []
      this.gridRelated.data = []
    },
    transCodeChange() {
      if (this.data.srcTrans === 1) {
        // Get purchase order details
        api.getAll(this.endpoint.purchase.order, {
          params: {
            filters: JSON.stringify([{
              field: 'code',
              operator: 'eq',
              keyword: this.data.transCode
            }, {
              field: 'mark',
              operator: 'doesnotcontain',
              keyword: ['V', 'CLS', 'CMP']
            }])
          }
        })
          .then(response => {
            this.bindTransData(response.data.tableData[0] ?? null)
          })
      } else {
        // Get purchase return details
        api.getAll(this.endpoint.purchase.return, {
          params: {
            filters: JSON.stringify([{
              field: 'code',
              operator: 'eq',
              keyword: this.data.transCode
            }, {
              field: 'type',
              operator: 'contains',
              keyword: [2, 3]
            }, {
              field: 'mark',
              operator: 'doesnotcontain',
              keyword: ['V', 'CLS', 'CMP']
            }])
          }
        })
          .then(response => {
            this.bindTransData(response.data.tableData[0] ?? null)
          })
      }
    },
    itemIdChange(item) {
      const data_i = this.items.find(i => i.id === item.itemId)
      if (data_i) {
        item.itemId = data_i.id
        item.itemName = data_i.name
        item.orderQty = 0
        item.outstandingQty = 0
        item.qty = 1
        item.length = data_i.length
        item.width = data_i.width
        item.height = data_i.height
        item.weight = data_i.weight
        item.dimensionMeasurement = data_i.dimensionMeasurement
        item.weightMeasurement = data_i.weightMeasurement
        item.uomId = data_i.uomId
        item.oldUnitId = data_i.uomBuyId
        item.oldUnitName = data_i.uomBuyName
        // item.oldUnitPrice = data_i.buyPrice
        item.unitId = data_i.uomBuyId
        item.unitName = data_i.uomBuyName
        // item.unitPrice = data_i.buyPrice
        // item.disc = 0
        // item.taxId = data_i.purchaseTaxId
        // item.taxAmount = 0
        // item.nettPrice = data_i.buyPrice
        // item.total = data_i.buyPrice
        // item.dpp = data_i.buyPrice
        // item.totTax = 0
        // item.totDPP = data_i.buyPrice
        if (item.state !== 'A') {
          item.state = 'M'
        }

        // Calc item price
        // this.calcItemPrice(item)
      }
    },
    calcItemTax(item) {
      const tax = this.taxes.find(t => t.id === item.taxId)
      if (tax) {
        if (this.data.includeTax) {
          item.taxAmount = Math.round((item.unitPrice - item.disc) - ((item.unitPrice - item.disc) / (1 + (tax.rate / 100))))
          item.nettPrice = item.unitPrice - item.disc
          item.dpp = item.unitPrice - item.disc - item.taxAmount
        } else {
          item.taxAmount = Math.round((item.unitPrice - item.disc) * (tax.rate / 100))
          item.nettPrice = item.unitPrice - item.disc + item.taxAmount
          item.dpp = item.unitPrice - item.disc
        }
      }
    },
    calcItemPrice(item, calcPrice = true) {
      this.calcItemTax(item)
      item.total = item.qty * item.nettPrice
      item.totTax = item.qty * item.taxAmount
      item.totDPP = item.qty * item.dpp

      if (calcPrice) {
        this.calcPrice()
      }
    },
    calcPrice() {
      this.data.subTotal = _sumBy(this.gridItem.data, 'total')
      this.data.taxAmount = _sumBy(this.gridItem.data, 'totTax')
      this.data.dpp = _sumBy(this.gridItem.data, 'totDPP') - this.data.finalDisc
      this.calcGrandTotal()
    },
    calcGrandTotal() {
      if (this.data.includeTax) {
        this.data.total = this.data.subTotal - this.data.finalDisc
      } else {
        this.data.total = this.data.subTotal - this.data.finalDisc + this.data.taxAmount
      }
    },
    showFindTransDialog() {
      if (this.data.srcTrans === 1) {
        this.$refs.findPO.open()
      } else {
        this.$refs.findReturn.open()
      }
    },
    showFindItemDialog(item) {
      this.$refs.findItem.open(item)
    },
    bindTransData(item) {
      if (item) {
        this.data.transCode = item.code
        this.data.supCode = item.supCode
        this.data.supName = item.supName
        this.data.currCode = item.currCode
        this.data.rate = item.rate
        this.data.dpp = item.dpp
        this.data.subTotal = item.subTotal
        this.data.finalDisc = item.finalDisc
        this.data.includeTax = item.includeTax
        this.data.taxAmount = item.taxAmount
        this.data.total = item.total

        // Get supplier details
        this.bindSupData(this.data)

        if (this.data.srcTrans === 1) {
          // Get purchase order item details
          api.getAll(`${this.endpoint.purchase.order}/item`, {
            params: {
              code: item.code,
              fullReceived: false
            }
          })
            .then(response => {
              this.gridItem.data = [...response.data.tableData]
              for (let i = 0; i < this.gridItem.data.length; i++) {
                this.gridItem.data[i].transDetailId = this.gridItem.data[i].id
                this.gridItem.data[i].id = randomNumber(-1, -1000)
                this.gridItem.data[i].orderQty = this.gridItem.data[i].qty
                this.gridItem.data[i].outstandingQty = this.gridItem.data[i].qty - this.gridItem.data[i].qtyRcv
                this.gridItem.data[i].qty = this.gridItem.data[i].outstandingQty
                this.gridItem.data[i].warehouseCode = item.warehouseCode
                this.gridItem.data[i].typeName = 'Normal'
                this.calcItemPrice(this.gridItem.data[i], false)
              }
              this.calcPrice()
            })
        } else {
          // Get purchase return item details
          api.getAll(`${this.endpoint.purchase.return}/item`, {
            params: {
              code: item.code,
              fullReceived: false
            }
          })
            .then(response => {
              this.gridItem.data = [...response.data.tableData]
              for (let i = 0; i < this.gridItem.data.length; i++) {
                this.gridItem.data[i].transDetailId = this.gridItem.data[i].id
                this.gridItem.data[i].id = randomNumber(-1, -1000)
                this.gridItem.data[i].orderQty = this.gridItem.data[i].qty
                this.gridItem.data[i].outstandingQty = this.gridItem.data[i].qty - this.gridItem.data[i].qtyRcv
                this.gridItem.data[i].qty = this.gridItem.data[i].outstandingQty
                this.gridItem.data[i].warehouseCode = item.warehouseCodeIn
                this.gridItem.data[i].type = 0
                this.gridItem.data[i].typeName = 'Normal'
                this.calcItemPrice(this.gridItem.data[i], false)
              }
              this.calcPrice()
            })
        }
      } else {
        this.data.supCode = null
        this.data.supName = null
        this.data.supAddr = null
        this.data.supPhone = null
        this.data.supFax = null
        this.data.dpp = 0
        this.data.subTotal = 0
        this.data.finalDiscPercent = 0
        this.data.finalDisc = 0
        this.data.taxAmount = 0
        this.data.total = 0
        this.gridItem.data = []
      }
    },
    bindSupData(item) {
      api.getOne(this.endpoint.general.supplier.supplier, item.supCode)
        .then(response => {
          if (response.data) {
            item.supAddr = response.data.address1
            item.supPhone = response.data.phone
            item.supFax = response.data.fax
          }
        })
    },
    bindItemData(rowItem) {
      this.itemIdChange(rowItem)
    },
    async exportExcel() {
      this.exportExcel.export()
    }
  }
}
</script>
