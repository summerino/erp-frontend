<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model.trim="grid.search"
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
            <span class="text-caption">Edit</span>
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
            <span class="text-caption">Delete</span>
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
          <v-toolbar-title>Sales Return W/O Doc.</v-toolbar-title>
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
              <v-col cols="12" md="4">
                <v-card>
                  <v-card-title>General</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="code"
                          v-model.trim="data.code"
                          label="Return Code"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.returnDate"
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
                              :value="formatReturnDate"
                              label="Return Date"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
                            no-title
                            scrollable
                            @change="menu.returnDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                          v-model="data.type"
                          :items="types"
                          :rules="rules.required"
                          label="Type"
                          item-text="name"
                          item-value="id"
                          class="mt-0"
                          required
                          @change="typeChange"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="6" >
                        <v-checkbox
                          v-model="data.nonTax"
                          label="Non Tax"
                          class="shrink ml-1"
                          :disabled="data.type !== 1"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                          v-model="data.taxIncluded"
                          label="Tax Included"
                          class="shrink ml-1"
                          :disabled="data.type !== 1"
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.cust">
                    <v-tab key="cust">Customer</v-tab>
                    <v-tab key="location">Location</v-tab>
                    <v-tab key="notes">Notes</v-tab>
                    <v-tab key="user">User</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.cust" class="pa-2">
                    <v-tab-item
                      key="cust"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="3">
                          <v-autocomplete
                            v-model="data.custCode"
                            :items="customers"
                            :item-text="item => `${item.code} - ${item.initial}`"
                            :rules="rules.required"
                            label="Code"
                            item-value="code"
                            class="mt-0"
                            @change="custCodeChange"
                            required
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="9" class="pl-1">
                          <v-text-field
                            v-model="data.custName"
                            label="Name"
                            class="mt-0"
                            readonly
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model="data.custAddr"
                            label="Address"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.custPhone"
                            label="Phone"
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
                      key="location"
                      transition="false"
                      eager
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.warehouseCode"
                            :items="warehouses"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            :rules="rules.required"
                            item-value="code"
                            label="Location"
                            class="mt-0"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                    </v-tab-item>

                    <v-tab-item
                      key="notes"
                      transition="false"
                      eager
                    >
                      <v-row no-gutters>
                        <v-textarea
                          v-model="data.notes"
                          :rules="[rules.max256chars, rules.required[0]]"
                          label="Notes"
                          counter="256"
                          class="mt-0"
                          rows="4"
                          required
                        ></v-textarea>
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
                            v-model="data.salesBy"
                            :items="employees"
                            :item-text="item => `${item.initial} - ${item.firstName}`"
                            :rules="rules.required"
                            label="Sales By"
                            item-value="id"
                            class="mt-0"
                            required
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                      
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.approveBy"
                            :items="employees"
                            :item-text="item => `${item.initial} - ${item.firstName}`"
                            label="Approved By"
                            item-value="id"
                            class="mt-0"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.updatedInitial"
                            label="Updated By"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.updatedDate"
                            label="Updated Date"
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
                    <v-tab key="item">Item</v-tab>
                    <v-tab key="related-trans">Related Transaction(s)</v-tab>
                    <v-tab key="tax">Tax Invoice</v-tab>

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
                                Add
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
                                  :disabled="isVoid || hasRelatedTrans"
                                  color="red"
                                  icon
                                  small
                                  @click="removeItem(item)"
                                >
                                  <v-icon small>mdi-close-thick</v-icon>
                                </v-btn>
                              </template>
                              <span class="text-caption">Delete</span>
                            </v-tooltip>
                          </template>
                          <template v-slot:[`item.itemId`]="{ item }">
                            <v-autocomplete
                              ref="itemId"
                              v-model="item.itemId"
                              :items="items"
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
                                  :disabled="hasRelatedTrans"
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
                          <template v-slot:[`item.itemReplacement`]="{ item }">
                            <v-text-field
                              v-model="item.itemReplacement"
                              class="text-body-2 mt-0"
                              :rules="rules.required"
                              required
                              readonly
                              dense
                            >
                              <template v-slot:append>
                                  <v-btn
                                    color="primary"
                                    icon
                                    x-small
                                    @click="showAddItemReplacement(item)"
                                  >
                                    <v-icon>
                                      mdi-settings-helper
                                    </v-icon>
                                  </v-btn>
                                </template>
                            </v-text-field>
                              
                          </template>
                          <template v-slot:[`item.qty`]="{ item }">
                            <v-currency-field
                              v-model="item.qty"
                              :decimal-length="0"
                              :min="1"
                              :readonly="hasRelatedTrans"
                              class="text-body-2 text-right mt-0"
                              dense
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.unitName`]="{ item }">
                            <v-autocomplete
                              v-model="item.unitId"
                              :items="item.units"
                              item-text="unitEquivalent"
                              item-value="id"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="unitItemChange(item)"
                            ></v-autocomplete>
                          </template>
                          <template v-slot:[`item.unitPrice`]="{ item }">
                            <v-currency-field
                              v-model="item.unitPrice"
                              :readonly="hasRelatedTrans"
                              class="text-body-2 text-right mt-0"
                              dense
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.disc`]="{ item }">
                            <v-currency-field
                              v-model="item.disc"
                              :readonly="hasRelatedTrans"
                              class="text-body-2 text-right mt-0"
                              dense
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.taxAmount`]="{ item }">
                            {{ item.taxAmount | formatCurrency }}
                          </template>
                          <template v-slot:[`item.nettPrice`]="{ item }">
                            {{ item.nettPrice | formatCurrency }}
                          </template>
                          <template v-slot:[`item.total`]="{ item }">
                            {{ item.total | formatCurrency }}
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
                      </v-data-table>
                    </v-tab-item>

                    <v-tab-item
                      key="tax"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="data.taxInvoidNo"
                                label="Tax Invoice No"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6" class="pl-md-1">
                              <v-menu
                                v-model="menu.invoiceDate"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                min-width="290px"
                                offset-y
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-bind="attrs"
                                    v-on="on"
                                    :value="formatInvoiceDate"
                                    label="Tax Invoice Date"
                                    class="mt-0"
                                    readonly
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="data.invoiceDate"
                                  no-title
                                  scrollable
                                  @change="menu.invoiceDate = false"
                                ></v-date-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" md="6">
                              <v-currency-field
                                label="Before Tax"
                                v-model="data.beforeTax"
                                readonly
                                class="text-body-2 text-right mt-0"
                              ></v-currency-field>
                            </v-col>
                            <v-col cols="12" md="6" class="pl-md-1">
                              <v-currency-field
                                label="Tax"
                                v-model="data.taxAmount"
                                readonly
                                class="text-body-2 text-right mt-0"
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
    <find-item
      ref="findItem"
      @dblclick:row="bindItemData"
    ></find-item>
    <add-item-replacement 
      ref="addItemReplacement" 
      :items="items"
      @save="saveItemReplacement" 
    ></add-item-replacement>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'

import Confirm from '@/components/dialog/Confirm'
import FindItem from '@/components/dialog/inventory/FindItem'
import AddItemReplacement from '../../../components/dialog/sales/AddItemReplacement.vue'

export default {
  components: {
    Confirm,
    FindItem,
    AddItemReplacement
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      returnDate: false,
      invoiceDate: false
    },
    tab: {
      cust: null,
      location: null,
      notes: null,
      user: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Code', value: 'code', divider: true, width: '160' },
        { text: 'Date', value: 'date', align: 'right', divider: true, width: '120' },
        { text: 'Supplier', value: 'supName', divider: true, width: '200' },
        { text: 'Rcv. Code', value: 'rcvCode', divider: true, width: '100' },
        { text: 'Shipped By', value: 'shippedInitial', divider: true, width: '200' },
        { text: 'Ref. No.', value: 'refNo', width: '150' }
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
      columns: [],
      data: []
    },
    gridRelated: {
      columns: [
        { text: 'Code', value: 'code', divider: true },
        { text: 'Date', value: 'date', align: 'right', divider: true },
        { text: 'Status', value: 'mark' }
      ],
      data: []
    },
    valid: false,
    defTaxInc: false,
    defWarehouseCode: '',
    types: [{ id: 1, name: 'Exchange Memo' }, { id: 2, name: 'Exchange Same Item' }, { id: 3, name: 'Exchange Diff Item' }],
    employees: [],
    warehouses: [],
    taxes: [],
    items: [],
    data: {},
    customers: []
  }),

  created: function () {
    this.getList()
    //this.getDefTaxIncSetting()
    this.getEmployeeLists()
    this.getCustomerLists()
    this.getWarehouseLists()
    this.getTaxLists()
    this.getItemLists()
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
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
    formatReturnDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    formatInvoiceDate() {
      return this.data.invoiceDate ? format(parseISO(this.data.invoiceDate), 'dd-MMM-yyyy') : ''
    },
    hasRelatedTrans() {
      return (this.gridRelated?.data?.length > 0)
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
        type: 1,
        nonTax: false,
        taxIncluded: false,
        custCode: null,
        custName: null,
        custAddr: null,
        custPhone: null,
        custFax: null,
        warehouseCode: null,
        notes: null,
        salesBy: null,
        approveBy: null
      }
      this.gridItem.data = []
      this.gridRelated.data = []
      this.tab.cust = 0
      this.tab.location = 0
      this.tab.notes = 0
      this.tab.user = 0

      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }

      // Define column
      this.typeChange()
    },
    getList(bindToForm = false) {
      const sorts = []
      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }

      api.getAll(this.endpoint.sales.return, {
        params: {
          search: this.grid.search,
          skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
          take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
          filters: JSON.stringify([{
            field: 'rcvCode',
            operator: 'isnullorempty'
          }]),
          sorts: JSON.stringify(sorts)
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
    getDefTaxIncSetting() {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'systemParameter',
          fieldNames: 'code,value',
          filters: JSON.stringify([{
            field: 'code',
            operator: 'equal',
            keyword: 'DEF_PURC_TAX_INC'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.defTaxInc = (response.data.tableData[0].value === '1')
        })
    },
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
          
          // Set default warehouse
          const defWarehouse = this.warehouses.find(w => w.isDefault)
          if (defWarehouse) {
            this.defWarehouseCode = defWarehouse.code
          }
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
    getUnitItemLists(item) {
      api.getAll(`${this.endpoint.inventory.uom}/item`, {
        params: { uomId: item.uomId }
      })
        .then(response => {
          item.units = response.data.tableData
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
        // Set focus to return code field
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

      // Get supplier details
      this.supCodeChange()
      
      // Get item details
      api.getAll(`${this.endpoint.sales.return}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data
        })

      // Get related transaction details
      api.getAll(`${this.endpoint.sales.return}/related-trans`, {
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
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Void?',
          'Are you sure want to void this data?')
      ) {
        api.delete(this.endpoint.sales.return, item.code)
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
        this.$store.dispatch('app/showInfo', 'Please kindly check mandatory fields or fields that have an error.')
        return
      }

      const data = this.data
      data.itemDetails = this.gridItem.data

      if (data.itemDetails) {
        this.$store.dispatch('app/showInfo', 'Detail item cannot be empty.')
        return
      }

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.return, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.return, data.code, data)
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
      
      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0]?.itemId ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.data.code,
          itemId: null,
          itemName: null,
          itemReplacement: null,
          itemReplacements: [],
          qty: 1,
          qtyDlv: 0,
          length: null,
          width: null,
          height: null,
          weight: null,
          dimensionMeasurement: null,
          weightMeasurement: null,
          units: [],
          uomId: null,
          oldUnitId: null,
          oldUnitName: null,
          oldUnitPrice: 0,
          unitId: null,
          unitName: null,
          unitPrice: 0,
          disc: 0,
          taxAmount: 0,
          nettPrice: 0,
          total: 0,
          dpp: 0,
          totTax: 0,
          totDPP: 0,
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
          'Delete?',
          'Are you sure want to delete this data?')
      ) {
        const idx = this.gridItem.data.findIndex(i => i.id === item.id)
        this.gridItem.data.splice(idx, 1)

        // Calc price
        this.calcPrice()
      }
    },
    typeChange() {
      this.data.taxIncluded = false
      this.data.nonTax = false
      this.gridItem.data = []
      if (this.data.type === 1) {
        this.gridItem.columns = [
          { value: 'action', sortable: false, divider: true, width: '90' },
          { text: 'Item', value: 'itemId', divider: true, width: '100' },
          { text: 'Name', value: 'itemName', divider: true, width: '280' },
          { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
          { text: 'Unit', value: 'unitName', divider: true, width: '90' },
          { text: 'Unit Price', value: 'unitPrice', align: 'right', divider: true, width: '120' },
          { text: 'Tax', value: 'taxAmount', align: 'right', divider: true, width: '120' },
          { text: 'Nett Price', value: 'nettPrice', align: 'right', divider: true, width: '120' },
          { text: 'Total Price', value: 'total', align: 'right', divider: true, width: '120' }
        ]
      } else if (this.data.type === 2) {
        this.gridItem.columns = [
          { value: 'action', sortable: false, divider: true, width: '90' },
          { text: 'Item', value: 'itemId', divider: true, width: '100' },
          { text: 'Name', value: 'itemName', divider: true, width: '280' },
          { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
          { text: 'Qty Dlv.', value: 'qtyDlv', align: 'right', divider: true, width: '90' },
          { text: 'Unit', value: 'unitName', divider: true, width: '90' }
        ]
      } else {
        this.gridItem.columns = [
          { value: 'action', sortable: false, divider: true, width: '90' },
          { text: 'Item', value: 'itemId', divider: true, width: '100' },
          { text: 'Item Replacements', value: 'itemReplacement', divider: true, width: '100' },
          { text: 'Name', value: 'itemName', divider: true, width: '280' },
          { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
          { text: 'Unit', value: 'unitName', divider: true, width: '90' },
          { text: 'Unit Price', value: 'unitPrice', align: 'right', divider: true, width: '120' },
          { text: 'Tax', value: 'taxAmount', align: 'right', divider: true, width: '120' },
          { text: 'Nett Price', value: 'nettPrice', align: 'right', divider: true, width: '120' },
          { text: 'Total Price', value: 'total', align: 'right', divider: true, width: '120' }
        ]
      }
    },
    itemIdChange(item) {
      const data_i = this.items.find(i => i.id === item.itemId)
      if (data_i) {
        item.itemName = data_i.name
        item.qty = 1
        item.length = data_i.length
        item.width = data_i.width
        item.height = data_i.height
        item.weight = data_i.weight
        item.dimensionMeasurement = data_i.dimensionMeasurement
        item.weightMeasurement = data_i.weightMeasurement
        item.uomId = data_i.uomId
        item.oldUnitId = data_i.uomSellId
        item.oldUnitName = data_i.uomSellName
        item.oldUnitPrice = data_i.sellPrice
        item.unitId = data_i.uomSellId
        item.unitName = data_i.uomSellName
        item.unitPrice = data_i.sellPrice
        item.disc = 0
        item.taxId = data_i.purchaseTaxId
        item.taxAmount = 0
        item.nettPrice = data_i.sellPrice
        item.dpp = data_i.sellPrice
        if (item.state !== 'A') {
          item.state = 'M'
        }

        // Get unit item lists
        this.getUnitItemLists(item)

        // Calc item price
        this.calcItemPrice(item)
      }
    },
    itemReplacementChange(item) {
      const data_i = this.items.find(i => i.id === item.itemId)
      if (data_i) {
        item.itemName = data_i.name
        item.qty = 1
        item.length = data_i.length
        item.width = data_i.width
        item.height = data_i.height
        item.weight = data_i.weight
        item.dimensionMeasurement = data_i.dimensionMeasurement
        item.weightMeasurement = data_i.weightMeasurement
        item.uomId = data_i.uomId
        item.oldUnitId = data_i.uomSellId
        item.oldUnitName = data_i.uomSellName
        item.oldUnitPrice = data_i.sellPrice
        item.unitId = data_i.uomSellId
        item.unitName = data_i.uomSellName
        item.unitPrice = data_i.sellPrice
        item.disc = 0
        item.taxId = data_i.purchaseTaxId
        item.taxAmount = 0
        item.nettPrice = data_i.sellPrice
        item.dpp = data_i.sellPrice
        if (item.state !== 'A') {
          item.state = 'M'
        }
      }
    },
    unitItemChange(item) {
      const oldUnit = item.units.find(u => u.id === item.oldUnitId)
      const unit = item.units.find(u => u.id === item.unitId)

      if (oldUnit.seq < unit.seq) {
        item.uomConversion = unit.conversion
        if (unit.unitToConvert !== item.oldUnitName) {
          this.calcUomConversion(true, item, unit.unitToConvert)
        }
        item.unitPrice = item.oldUnitPrice * item.uomConversion
      } else {
        item.uomConversion = 1
        if (unit.unitEquivalent !== item.oldUnitName) {
          this.calcUomConversion(false, item, unit.unitEquivalent)
        }
        item.unitPrice = item.oldUnitPrice / item.uomConversion
      }

      // Calc item price
      this.calcItemPrice(item)
    },
    calcUomConversion(seqSmaller, item, unitCode) {
      if (seqSmaller) {
        const data = item.units.find(u => u.unitEquivalent === unitCode)
        item.uomConversion *= data.conversion

        if (data.unitToConvert !== item.oldUnitName) {
          this.calcUomConversion(seqSmaller, item, data.unitToConvert)
        }
      } else {
        const data = item.units.find(u => u.unitToConvert === unitCode && !u.isBaseUnit)
        item.uomConversion *= data.conversion

        if (data.unitEquivalent !== item.oldUnitName) {
          this.calcUomConversion(seqSmaller, item, data.unitEquivalent)
        }
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
    calcTax() {
      for (let i = 0; i < this.gridItem.data.length; i++) {
        this.calcItemPrice(this.gridItem.data[i], false)
      }
      this.calcPrice()
    },
    calcPrice() {
      this.data.subTotal = _sumBy(this.gridItem.data, 'total')
      this.data.taxAmount = _sumBy(this.gridItem.data, 'totTax')
      this.data.dpp = _sumBy(this.gridItem.data, 'totDPP')
      this.data.total = this.data.subTotal + this.data.taxAmount
    },
    showFindItemDialog(item) {
      this.$refs.findItem.open(item)
    },
    showAddItemReplacement(item) {
      this.$refs.addItemReplacement.open(item)
    },
    bindItemData(rowItem) {
      this.itemIdChange(rowItem)
    },
    saveItemReplacement(rowItem, itemReplacements) {
      const item = this.gridItem.data.find(x => x.id === rowItem.id)
      if (item) {
        item.itemReplacements = itemReplacements
        item.itemReplacement = itemReplacements.length > 1 ? 'Multi Item' : itemReplacements[0].itemName
      }
    },
    custCodeChange() {
      const customer = this.customers.find(s => s.code === this.data.custCode)
      if (customer) {
        this.data.custName = customer.name
        this.data.custAddr = customer.address1
        this.data.custPhone = customer.phone
        this.data.custFax = customer.fax
      }
    }
  }
}
</script>
