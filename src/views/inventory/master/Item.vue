<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="grid.search"
              append-icon="mdi-magnify"
              label="Search..."
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
                  New
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
            <span class="text-caption">Edit</span>
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
            <span class="text-caption">Delete</span>
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
                {{ item.isActive === true ? 'Active' : 'Inactive' }}
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
          <v-toolbar-title>Inventory</v-toolbar-title>
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
                >Save & Close</v-btn>
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
                          Save
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
                  <v-card-title>General</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="Initial"
                          v-model="data.initial"
                          label="Initial"
                          class="mt-0"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="Name"
                          v-model="data.name"
                          label="Name"
                          class="mt-0"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                            v-model="data.categoryId"
                            :items="itemCtg"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            label="Category"
                            item-value="id"
                            class="mt-0"
                          ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="Description"
                          v-model="data.description"
                          label="Description"
                          class="mt-0"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                            v-model="data.valuationMethod"
                            :items="valuationMethodRef"
                            :item-text="item => `${item.text}`"
                            label="Valuation Method"
                            item-value="value"
                            class="mt-0"
                          ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Others</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                            v-model="data.uomId"
                            :items="uom"
                            :item-text="item => `${item.initial}`"
                            label="Unit of Measurement"
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
                            label="Unit"
                            item-value="id"
                            class="mt-0"
                          ></v-autocomplete>
                      </v-col>
                      <v-col cols="9" class="pl-md-1">
                        <v-currency-field
                          ref="SellPrice"
                          v-model="data.sellPrice"
                          label="Selling Price"
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
                            label="Unit"
                            item-value="id"
                            class="mt-0"
                          ></v-autocomplete>
                      </v-col>
                      <v-col cols="9" class="pl-md-1">
                        <v-currency-field
                          ref="BuyPrice"
                          v-model="data.buyPrice"
                          label="Buying Price"
                          class="mt-0"
                        ></v-currency-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                            v-model="data.salesTaxId"
                            :items="slsTaxes"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            label="Selling Tax"
                            item-value="id"
                            class="mt-0"
                          ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                            v-model="data.purchaseTaxId"
                            :items="purcTaxes"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            label="Buying Tax"
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
                    <v-tab key="dimension">Dimension</v-tab>
                    <v-tab key="account">Account</v-tab>

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
                                label="Length"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" class="pl-md-1">
                              <v-text-field
                                ref="Width"
                                v-model="data.width"
                                label="Width"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" class="pl-md-1">
                              <v-text-field
                                ref="Height"
                                v-model="data.height"
                                label="Height"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" offset-md="1" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.dimensionMeasurement"
                                :items="dimensionOfMeasurement"
                                :item-text="item => `${item.text}`"
                                label="Dimension of Measurement"
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
                                label="Weight"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" offset-md="5" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.weightMeasurement"
                                :items="weightOfMeasurement"
                                :item-text="item => `${item.text}`"
                                label="Weight of Measurement"
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
                                label="COA Purchase"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaSls"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="COA Sales"
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
                                label="COA Purchase Disc."
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaSlsDisc"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="COA Sales Disc."
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
                                label="COA Purchase Return"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaSlsReturn"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="COA Sales Return"
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
                                label="COA Inventory"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaCogs"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="COA COGS"
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
                                label="COA Cost"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaExpense"
                                :items="coa"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="COA Expense"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
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
        { text: 'Initial', value: 'initial', divider: true, width: '110' },
        { text: 'Name', value: 'name', divider: true, width: '270' },
        { text: 'Category', value: 'categoryName', divider: true, width: '270' },
        { text: 'Unit of Measurement', value: 'uomInitial', divider: true, width: '270' },
        { text: 'Unit Sell', value: 'uomSellName', divider: true, width: '60' },
        { text: 'Sell Price', value: 'sellPrice', align: 'right', divider: true, width: '150' },
        { text: 'Unit Buy', value: 'uomBuyName', divider: true, width: '60' },
        { text: 'Buy Price', value: 'buyPrice', align: 'right', divider: true, width: '150' },
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
    valuationMethodRef: [{text: 'Average', value: '1'}, {text: 'FIFO', value: '2'}, {text: 'LIFO', value: '3'}],
    coa: [],
    data: {
      initial: '',
      name: '',
      description: '',
      categoryId: 0,
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
            keyword: this.data.uomId
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
      api.getAll(this.endpoint.master, {
        params: {
          param: 'itemcategory',
          fieldNames: 'id,initial,name',
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
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
      api.getAll(this.endpoint.master, {
        params: {
          param: 'coa',
          fieldNames: 'id,code,name,lod',
          filters: JSON.stringify([{
            field: 'typeid',
            operator: 'not_equal',
            keyword: 2
          },
          {
            field: 'lod',
            operator: 'equal',
            keyword: 5
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }]),
          includeMetaData: false
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
        action: 'edit'
      }

      this.getUnitSellingOrBuying()

      // Set focus to receive code field
      setTimeout(() => {
        this.$refs.Initial.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Delete?',
          'Are you sure want to delete this data?')
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
      if (!this.dialog.add) return

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
    }
  }
}
</script>
