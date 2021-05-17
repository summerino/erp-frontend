<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
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
          <v-col cols="12" md="6" class="text-right">
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
                :disabled="item.isActive === false"
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
        <template v-slot:[`item.sellPrice`]="{ item }">
          {{ item.sellPrice | formatCurrency }}
        </template>
        <template v-slot:[`item.buyPrice`]="{ item }">
          {{ item.buyPrice | formatCurrency }}
        </template>
        <template v-slot:[`item.isActive`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon 
                v-bind="attrs" 
                v-on="on" 
                :color="item.isActive === true ? 'green' : 'red'"
              >
                {{ item.isActive === true ? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline' }}
              </v-icon>
            </template>
            <span class="text-caption">
                {{ item.isActive === true ? 'Aktif' : 'Tidak Aktif' }}
            </span>
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
          <v-toolbar-title>Barang</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="isActive"
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
                  :disabled="isActive"
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
                          ref="Initial"
                          v-model="data.initial"
                          label="Inisial"
                          class="mt-0"
                          :rules="[rules.required[0], rules.max20chars[0]]"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="Name"
                          v-model="data.name"
                          label="Nama"
                          class="mt-0"
                          :rules="[rules.required[0], rules.max50chars[0]]"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                            v-model="data.categoryId"
                            :items="itemCtg"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            label="Kategori"
                            item-value="id"
                            class="mt-0"
                            :rules="rules.required"
                            required
                            @change="loadSubGroup"
                          ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="Description"
                          v-model="data.description"
                          label="Deskripsi"
                          class="mt-0"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Lainnya</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                            v-model="data.uomId"
                            :items="uom"
                            :item-text="item => `${item.initial}`"
                            label="Satuan Ukuran"
                            item-value="id"
                            class="mt-0"
                            @change="categoryChanged"
                          ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="3">
                        <v-autocomplete
                            v-model="data.uomSellId"
                            :items="unitUomSell"
                            :item-text="item => `${item.unitequivalent}`"
                            label="Satuan Jual"
                            item-value="id"
                            class="mt-0"
                          ></v-autocomplete>
                      </v-col>
                      <v-col cols="9" class="pl-md-1">
                        <v-currency-field
                          ref="SellPrice"
                          v-model="data.sellPrice"
                          label="Harga Jual"
                          class="mt-0"
                        ></v-currency-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="3">
                        <v-autocomplete
                            v-model="data.uomBuyId"
                            :items="unitUomBuy"
                            :item-text="item => `${item.unitequivalent}`"
                            label="Satuan Beli"
                            item-value="id"
                            class="mt-0"
                          ></v-autocomplete>
                      </v-col>
                      <v-col cols="9" class="pl-md-1">
                        <v-currency-field
                          ref="BuyPrice"
                          v-model="data.buyPrice"
                          label="Harga Beli"
                          class="mt-0"
                        ></v-currency-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-autocomplete
                            v-model="data.salesTaxId"
                            :items="slsTaxes"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            label="Pajak Penjualan"
                            item-value="id"
                            class="mt-0"
                          ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-3">
                        <v-autocomplete
                            v-model="data.purchaseTaxId"
                            :items="purcTaxes"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            label="Pajak Pembelian"
                            item-value="id"
                            class="mt-0"
                          ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-tabs v-model="tab.advancedItem">
                    <v-tab key="dimension">Dimensi</v-tab>
                    <v-tab key="account">Akun</v-tab>
                    <v-tab key="group">Grup</v-tab>
                    <v-tab key="user">Pengguna</v-tab>

                    <v-tab-item
                      key="dimension"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="2">
                              <v-text-field
                                ref="Length"
                                v-model="data.length"
                                label="Panjang"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" class="pl-md-1">
                              <v-text-field
                                ref="Width"
                                v-model="data.width"
                                label="Lebar"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" class="pl-md-1">
                              <v-text-field
                                ref="Height"
                                v-model="data.height"
                                label="Tinggi"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" offset-md="1" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.dimensionMeasurement"
                                :items="dimensionOfMeasurement"
                                :item-text="item => `${item.text}`"
                                label="Satuan Dimensi"
                                item-value="text"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>

                          <v-row no-gutters>
                            <v-col cols="2">
                              <v-text-field
                                ref="Weight"
                                v-model="data.weight"
                                label="Berat"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" offset-md="5" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.weightMeasurement"
                                :items="weightOfMeasurement"
                                :item-text="item => `${item.text}`"
                                label="Satuan Berat"
                                item-value="text"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="account"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-autocomplete
                                v-model="data.coaPurc"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun pembelian"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaSls"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun penjualan"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>

                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-autocomplete
                                v-model="data.coaPurcDisc"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun diskon pembelian"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaSlsDisc"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun diskon penjualan"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>

                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-autocomplete
                                v-model="data.coaPurcReturn"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun pengembalian pembelian"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaSlsReturn"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun pengembalian penjualan"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>

                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-autocomplete
                                v-model="data.coaInventory"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun barang"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaCogs"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun harga pokok penjualan"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>

                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-autocomplete
                                v-model="data.coaCost"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun biaya"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaExpense"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun pengeluaran"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="group"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <template v-for="(items, index) in subGroupRef">
                            <v-row :key="index" no-gutters>
                              <v-col cols="12">
                                <v-autocomplete
                                  v-model="data[`subGroup${index + 1}`]"
                                  :items="items.value.split(';')"
                                  :item-text="item => `${item.value}`"
                                  :label="items.name"
                                  :item-value="item => `${item.value}`"
                                  class="mt-0"
                                ></v-autocomplete>
                              </v-col>
                            </v-row>
                          </template>
                        </v-card-text>
                      </v-card>
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
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-text-field
                                v-model="data.createdDate"
                                label="Dibuat Tanggal"
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
                                label="Diperbarui Tanggal"
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

import Confirm from '@/components/dialog/Confirm'

export default {
  components: {
    Confirm
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      receiveDate: false
    },
    tab: {
      advancedItem: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Inisial', value: 'initial', divider: true, width: '110' },
        { text: 'Nama', value: 'name', divider: true, width: '270' },
        { text: 'Kategori', value: 'categoryName', divider: true, width: '270' },
        { text: 'Satuan Ukuran', value: 'uomInitial', divider: true, width: '270' },
        { text: 'Satuan Jual', value: 'uomSellName', divider: true, width: '60' },
        { text: 'Harga Jual', value: 'sellPrice', align: 'right', divider: true, width: '150' },
        { text: 'Satuan Beli', value: 'uomBuyName', divider: true, width: '60' },
        { text: 'Harga Beli', value: 'buyPrice', align: 'right', divider: true, width: '150' },
        { text: 'Status', value: 'isActive', align: 'center', width: '50' }
      ],
      data: [],
      options: {
        sortBy: ['initial'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    unitUomSell: [],
    unitUomBuy: [],
    itemCtg: [],
    uom: [],
    slsTaxes: [],
    purcTaxes: [],
    dimensionOfMeasurement: [{text: 'mm'}, {text: 'cm'}, {text: 'm'}],
    weightOfMeasurement: [{text: 'g'}, {text: 'ons'}, {text: 'kg'}],
    coa: [],
    subGroupRef: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.getCategory()
    this.getUOM()
    this.getSellingTaxes()
    this.getBuyingTaxes()
    this.getCOATypeId2()
  },

  mounted: function () {
    setTimeout(() => {
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
      endpoint: state => state.api.endpoint
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    isActive() {
      return (this.data?.IsActive?.IsActive === true)
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        initial: '',
        name: '',
        description: '',
        categoryId: '',
        typeId: 0,
        costOfGoodSold: '',
        valuationMethod: 0,
        stockType: 0,
        uomId: 0,
        uomSellId: 0,
        sellPrice: '',
        uomBuyId: 0,
        buyPrice: '',
        salesTaxId: 0,
        purchaseTaxId: 0,
        category1: '',
        category2: '',
        category3: '',
        category4: '',
        category5: '',
        subGroup1: '',
        subGroup2: '',
        subGroup3: '',
        subGroup4: '',
        subGroup5: '',
        coaInventory: '',
        coaCogs: '',
        coaPurc: '',
        coaPurcDisc: '',
        coaPurcReturn: '',
        coaSls: '',
        coaSlsReturn: '',
        coaSlsDisc: '',
        coaOffSet: '',
        coaCost: '',
        coaExpense: '',
        length: 0,
        width: 0,
        height: 0,
        dimensionMeasurement: '',
        weight: 0,
        weightMeasurement: '',
        categoryName: '',
        uomInitial: '',
        uomSellName: '',
        uomBuyName: ''
      }
      this.tab.advancedItem = 0
      this.subGroupRef = []

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

      api.getAll(this.endpoint.inventory.item.item, {
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
    getUnitSellingOrBuying() {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'uomconversion',
          fieldNames: 'id,uomid,unittoconvert,unitequivalent',
          filters: JSON.stringify([{
            field: 'uomid',
            operator: 'equal',
            keyword: (this.data.uomId === null) ? 0 : this.data.uomId
          }]),
          sorts: JSON.stringify([{
            field: 'unittoconvert',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.unitUomSell = response.data.tableData
          this.unitUomBuy = response.data.tableData
        })
    },
    getCategory() {
      api.getAll(`${this.endpoint.inventory.item.category}/lists`, {})
        .then(response => {
          this.itemCtg = response.data.tableData
        })
    },
    getUOM() {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'uom',
          fieldNames: 'id,initial',
          filters: JSON.stringify([{
            field: 'isactive',
            operator: 'equal',
            keyword: 1
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.uom = response.data.tableData
        })
    },
    getSellingTaxes() {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'tax',
          fieldNames: 'id,initial,name,rate',
          filters: JSON.stringify([{
            field: 'typeid',
            operator: 'equal',
            keyword: 2
          },
          {
            field: 'isActive',
            operator: 'equal',
            keyword: 1
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.slsTaxes = response.data.tableData
        })
    },
    getBuyingTaxes() {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'tax',
          fieldNames: 'id,initial,name,rate',
          filters: JSON.stringify([{
            field: 'typeid',
            operator: 'equal',
            keyword: 1
          },
          {
            field: 'isActive',
            operator: 'equal',
            keyword: 1
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.purcTaxes = response.data.tableData
        })
    },
    getCOATypeId2() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'typeid',
            operator: 'neq',
            keyword: 2
          },
          {
            field: 'lod',
            operator: 'eq',
            keyword: 5
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.coa = response.data.tableData
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
        // Set focus to receive initial field
        this.$refs.Initial.focus()

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
        createdDate: format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      this.getUnitSellingOrBuying()
      this.loadSubGroup()

      // Set focus to receive code field
      setTimeout(() => {
        this.$refs.Initial.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        api.delete(this.endpoint.inventory.item.item, item.id)
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
        this.$store.dispatch('app/showInfo', 'Silahkan periksa kembali data yang wajib diisi.')
        return
      }

      const data = this.data
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.inventory.item.item, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.inventory.item.item, data.id, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else {
          this.data.initial = result.data
        }
        this.getList(!closeDialog)
      }
    },
    categoryChanged() {
      this.getUnitSellingOrBuying()
    },
    loadSubGroup() {
      const item = this.itemCtg.find(x => x.id === this.data.categoryId)

      // Get Sub Group
      api.getAll(`${this.endpoint.inventory.item.group}/item-by-id`, {
        params: { id: item.groupId }
      })
        .then(response => {
          this.subGroupRef = response.data.tableData
        })
    }
  }
}
</script>
