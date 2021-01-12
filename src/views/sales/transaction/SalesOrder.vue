<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="6">
            <span class="mx-1">this is main</span>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <v-btn
              dark
              small
              tile
              color="green darken-1"
              class="font-weight-regular"
              @click="add()"
            >
              <v-icon left>
                mdi-plus
              </v-icon>
              New
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-data-table
        :headers="grid.columns"
        :items="grid.data"
        :items-per-page="5"
        class="elevation-1"
      >
        <template v-slot:[`item.action`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                small
                color="orange lighten-1"
                @click="edit(item)"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Edit</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                small
                color="red"
                @click="remove(item)"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-icon color="indigo lighten-2">mdi-square-edit-outline</v-icon>
            <span class="mx-1">Item Group</span>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <v-btn
              dark
              small
              tile
              color="blue darken-2"
              class="font-weight-regular">
              <v-icon left>
                mdi-content-save
              </v-icon>
              Save
            </v-btn>
            <v-btn
              small
              tile
              class="font-weight-regular ml-1">
              <v-icon left>
                mdi-undo-variant
              </v-icon>
              Back
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-form v-model="valid">
          <v-container class="px-1 pt-0 pb-1">
            <v-row dense>
              <v-col
                cols="12"
                class="pt-0">
                <v-text-field
                  v-model="code"
                  :rules="rules.code"
                  :counter="100"
                  label="Code"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col
                cols="12"
                class="pt-0">
                <v-text-field
                  v-model="name"
                  :rules="rules.name"
                  :counter="500"
                  label="Name"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="dialog.add"
      transition="dialog-bottom-transition"
      fullscreen
      hide-overlay
      scrollable
    >
      <v-card :style="{ background: $vuetify.theme.themes[theme].surface }">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialog.add = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Sales Order</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="dialog.add = false">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text class="px-2">
          <v-form v-model="valid">
            <v-row dense>
              <v-col cols="12" md="4">
                <v-card>
                  <v-card-title>General</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-text-field
                        v-model="data.code"
                        label="Order Code"
                        class="mt-0"
                        readonly
                      ></v-text-field>
                      <v-checkbox
                        v-model="data.includeTax"
                        label="Tax Included"
                        class="shrink ml-1"
                      ></v-checkbox>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-menu
                          v-model="menu.orderDate"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          min-width="290px"
                          offset-y
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="data.orderDate"
                              v-bind="attrs"
                              v-on="on"
                              :rules="rules.date"
                              label="Order Date"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.orderDate"
                            no-title
                            scrollable
                            @input="menu.orderDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                          v-model="data.sales"
                          :items="salesmans"
                          :rules="rules.sales"
                          :search-input.sync="searchSalesman"
                          label="Salesman"
                          item-text="name"
                          item-value="code"
                          class="mt-0"
                          required
                          @click="ctrlSalesmanClicked()"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="5">
                        <v-combobox
                          v-model="data.curr"
                          :items="currencies"
                          :rules="rules.curr"
                          label="Currrency"
                          item-text="code"
                          item-value="code"
                          class="mt-0"
                        ></v-combobox>
                      </v-col>

                      <v-col cols="7" class="pl-1">
                        <v-currency-field
                          v-model="data.rate"
                          :rules="rules.rate"
                          label="Rate"
                          class="text-right mt-0"
                          required
                        ></v-currency-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.cust">
                    <v-tab key="cust">Customer</v-tab>
                    <v-tab key="cust-delivery">Delivery</v-tab>
                    <v-tab key="cust-payment">Payment</v-tab>
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
                            label="Code"
                            class="mt-0"
                            readonly
                            required
                          ></v-text-field>
                        </v-col>

                        <v-col cols="9" class="pl-1">
                          <v-text-field
                            v-model="data.custName"
                            label="Name"
                            class="mt-0"
                            readonly
                            required
                          >
                            <template v-slot:append-outer>
                              <v-btn
                                icon
                                color="primary"
                                @click="showFindCustDialog"
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
                      key="cust-delivery"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-select
                            v-model="data.deliveryAddr"
                            :items="deliveries"
                            label="Delivery Address"
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model="data.custDeliveryAddr"
                            label="Address"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.custDeliveryPhone"
                            label="Phone"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>

                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.custDeliveryFax"
                            label="Fax"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-menu
                            v-model="menu.deliveryDate"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            min-width="290px"
                            offset-y
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-model="data.deliveryDate"
                                v-bind="attrs"
                                v-on="on"
                                :rules="rules.date"
                                label="Delivery Date"
                                class="mt-0"
                                readonly
                                required
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="data.deliveryDate"
                              no-title
                              scrollable
                              @input="menu.deliveryDate = false"
                            ></v-date-picker>
                          </v-menu>
                        </v-col>
                      </v-row>
                    </v-tab-item>

                    <v-tab-item
                      key="cust-payment"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-select
                            v-model="data.billAddr"
                            :items="deliveries"
                            label="Biling Address"
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-select
                            v-model="data.paymentTerm"
                            :items="data.top"
                            label="Payment Term"
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-select
                            v-model="data.tax"
                            :items="data.taxs"
                            label="Tax"
                          ></v-select>
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
                  <v-tabs>
                    <v-tab key="item">Item</v-tab>
                    <v-tab key="related-trans">Related Transaction(s)</v-tab>

                    <v-tab-item
                      key="item"
                      transition="false"
                    >
                      <v-card>
                        <v-app-bar dense flat>
                          <v-spacer></v-spacer>
                          <v-btn
                            class="blue--text"
                            small
                            tile
                            @onclick="addItem"
                          >
                            <v-icon left>mdi-plus</v-icon>
                            Add
                          </v-btn>
                        </v-app-bar>

                        <v-data-table
                          :headers="gridItem.columns"
                          :items="gridItem.data"
                          :items-per-page="5"
                          class="elevation-1"
                        >
                          <template v-slot:[`item.action`]="{ item }">
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  v-bind="attrs"
                                  v-on="on"
                                  icon
                                  small
                                  color="orange lighten-1"
                                  @click="editItem(item)"
                                >
                                  <v-icon small>mdi-pencil</v-icon>
                                </v-btn>
                              </template>
                              <span>Edit</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  v-bind="attrs"
                                  v-on="on"
                                  icon
                                  small
                                  color="red"
                                  @click="removeItem(item)"
                                >
                                  <v-icon small>mdi-close-thick</v-icon>
                                </v-btn>
                              </template>
                              <span>Delete</span>
                            </v-tooltip>
                          </template>
                        </v-data-table>
                      </v-card>              
                    </v-tab-item>

                    <v-tab-item
                      key="related-trans"
                      transition="false"
                    >
                      this is related transactions
                    </v-tab-item>
                  </v-tabs>
                </v-card>
              </v-col>
            </v-row>
            
            <v-row dense>
              <v-col cols="12" md="5">
                <v-card>
                  <v-tabs v-model="tab.foot">
                    <v-tab key="notes">Notes</v-tab>
                    <v-tab key="detail">Detail</v-tab>
                    <v-tab key="dp">Down Payment</v-tab>
                    <v-tab key="fee">Fee</v-tab>
                    <v-tab key="user">User</v-tab>
                  </v-tabs>
                  
                  <v-tabs-items v-model="tab.foot" class="pa-2">
                    <v-tab-item
                      key="notes"
                      transition="false"
                    >
                      <v-textarea
                        v-model="data.notes"
                        :rules="rules.notes"
                        label="Notes"
                        counter="2000"
                        class="mt-0"
                        rows="4"
                      ></v-textarea>
                    </v-tab-item>

                    <v-tab-item
                      key="detail"
                      transition="false"
                    >
                      <v-currency-field
                        v-model="data.dpp"
                        label="Total Before Tax"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-tab-item>

                    <v-tab-item
                      key="dp"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-currency-field
                          v-model="data.downPayment"
                          :allow-negative="false"
                          label="Down Payment"
                          class="text-right mt-0"
                        ></v-currency-field>
                        <v-checkbox
                          v-model="data.applyTax"
                          label="Apply Tax"
                          class="shrink ml-1"
                        ></v-checkbox>
                      </v-row>
                      <v-currency-field
                        v-model="data.dpTax"
                        label="Tax"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                      <v-currency-field
                        v-model="data.dpTotal"
                        label="Total DP"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-tab-item>

                    <v-tab-item
                      key="fee"
                      transition="false"
                    >
                      <v-currency-field
                        v-model="data.shipmentFee"
                        :allow-negative="false"
                        label="Shipment Fee"
                        class="text-right mt-0"
                      ></v-currency-field>
                      <v-currency-field
                        v-model="data.handlingFee"
                        :allow-negative="false"
                        label="Handling Fee"
                        class="text-right mt-0"
                      ></v-currency-field>
                    </v-tab-item>

                    <v-tab-item
                      key="user"
                      transition="false"
                    >
                      <v-text-field
                        v-model="data.updatedBy"
                        label="Updated By"
                        class="mt-0"
                        readonly
                      ></v-text-field>
                      <v-text-field
                        v-model="data.updatedDate"
                        label="Updated Date"
                        class="mt-0"
                        readonly
                      ></v-text-field>
                    </v-tab-item>
                  </v-tabs-items>
                </v-card>
              </v-col>

              <v-col cols="12" md="7">
                <v-card>
                  <v-card-text>
                    <v-row no-gutters>
                      <v-currency-field
                        v-model="data.subTotal"
                        label="Total Price"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="4">
                        <v-currency-field
                          v-model="data.finalDiscPercent"
                          :allow-negative="false"
                          label="Disc Percent"
                          suffix="%"
                          class="text-right mt-0"
                        ></v-currency-field>
                      </v-col>
                      <v-col cols="8" class="pl-1">
                        <v-currency-field
                          v-model="data.finalDisc"
                          :allow-negative="false"
                          label="Final Discount"
                          class="text-right mt-0"
                        ></v-currency-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="4">
                        <v-currency-field
                          v-model="data.taxPercent"
                          :allow-negative="false"
                          label="Tax Percent"
                          suffix="%"
                          class="text-right mt-0"
                          readonly
                        ></v-currency-field>
                      </v-col>
                      <v-col cols="8" class="pl-1">
                        <v-currency-field
                          v-model="data.taxAmount"
                          :allow-negative="false"
                          label="Tax Amount"
                          class="text-right mt-0"
                          readonly
                        ></v-currency-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-currency-field
                        v-model="data.fee"
                        label="Fee"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-row>

                    <v-row no-gutters>
                      <v-currency-field
                        v-model="data.grandTotal"
                        label="Grand Total"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
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
    <find-customer
      ref="findCust"
      @dblclick:row="bindCustData"
    ></find-customer>
  </div>
</template>

<script>
import axios from '@/axios'
import moment from 'moment'
import { debounce as _debounce } from 'lodash'

import Confirm from '@/components/dialog/Confirm'
import FindCustomer from '@/components/dialog/FindCustomer'

export default {
  components: {
    Confirm,
    FindCustomer
  },

  data: () => ({
    main: true,
    dialog: {
      add: true
    },
    menu: {
      orderDate: false,
      deliveryDate: false
    },
    tab: {
      cust: null,
      foot: null
    },
    test: '',
    grid: {
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Code', value: 'code', divider: true, width: '300' },
        { text: 'Name', value: 'name' }
      ]
    },
    gridItem: {
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Item', value: 'code', divider: true, width: '100' },
        { text: 'Name', value: 'name', divider: true, width: '300' },
        { text: 'Qty', value: 'qty', divider: true, width: '90' },
        { text: 'Unit', value: 'unit', divider: true, width: '90' },
        { text: 'Unit Price', value: 'unitrice', divider: true, width: '120' },
        { text: 'Disc', value: 'disc', divider: true, width: '120' },
        { text: 'Nett Price', value: 'nettPrice', divider: true, width: '120' },
        { text: 'Total Price', value: 'total', divider: true, width: '120' },
        { text: 'Description', value: 'description' }
      ]
    },
    valid: false,
    searchSalesman: null,
    salesmans: [],
    currencies: [],
    deliveries: [],
    data: {
      code: null,
      orderDate: moment().format('DD-MMM-YYYY'),
      sales: null,
      curr: 'IDR',
      rate: 1,
      includeTax: true,
      custCode: null,
      custName: null,
      custAddr: null,
      custPhone: null,
      custFax: null,
      deliveryAddr: null,
      custDeliveryAddr: null,
      custDeliveryPhone: null,
      custDeliveryFax: null,
      deliveryDate: moment().format('DD-MMM-YYYY'),
      billAddr: null,
      paymentTerm: null,
      tax: null,
      dpp: 0,
      downPayment: 0,
      applyTax: false,
      dpTax: 0,
      dpTotal: 0,
      shipmentFee: 0,
      handlingFee: 0,
      subTotal: 0,
      finalDiscPercent: 0,
      finalDisc: 0,
      taxPercent: 0,
      taxAmount: 0,
      fee: 0,
      grandTotal: 0
    },
    rules: {
      date: [
        (v) => !!v || 'Order Date is required'
      ],
      notes: [
        (v) => (v || '').length <= 2000 || 'Notes must be less than 2000 characters'
      ]
    }
  }),

  mounted: function () {
    this.getList()
    this.getCurrLists()
  },

  computed: {
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },

  watch: {
    searchSalesman: _debounce(
      function (value) {
        // eslint-disable-next-line no-invalid-this
        this.getSalesmanLists(value)
      }, 1000)
  },
  
  methods: {
    getList() {
      axios.post('/item/list')
        .then(response => {
          this.grid.data = response.data
          this.gridItem.data = response.data
        })
    },
    getSalesmanLists(filter) {
      axios.post('/salesman/lists', { filter })
        .then(response => {
          this.salesmans = response.data
        })
    },
    getCurrLists() {
      axios.post('/currency/lists')
        .then(response => {
          this.currencies = response.data
        })
    },
    add() {
      this.dialog.add = true
    },
    edit(item) {
      console.log(item)
    },
    remove() {
      this.$refs.confirm.open('Delete?', 'Are you sure want to delete this data?')
      // console.log(item)
    },
    addItem() {
      this.dialog.add = true
    },
    editItem(item) {
      console.log(item)
    },
    removeItem() {
      this.$refs.confirm.open('Delete?', 'Are you sure want to delete this data?')
      // console.log(item)
    },
    ctrlSalesmanClicked() {
      if (this.salesmans.length === 0) {
        this.getSalesmanLists('')
      }
    },
    showFindCustDialog() {
      this.$refs.findCust.open()
    },
    bindCustData(item) {
      this.data.custCode = item.code
      this.data.custName = item.name
      this.data.custAddr = item.address
      this.data.custPhone = item.phone1
      this.data.custFax = item.fax
      // this.data.deliveryAddr = item.code
      this.data.custDeliveryAddr = item.address
      this.data.custDeliveryPhone = item.phone1
      this.data.custDeliveryFax = item.fax
      // this.data.billAddr = item.code
      // this.data.paymentTerm = item.code
      // this.data.tax = item.code
    }
  }
}
</script>
