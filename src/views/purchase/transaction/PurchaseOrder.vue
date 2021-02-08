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
              @keyup.enter="getList"
            ></v-text-field>
            <v-spacer></v-spacer>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="6" class="text-right">
            <v-btn
              color="green darken-1"
              class="font-weight-regular"
              dark
              small
              tile
              @click="add"
            >
              <v-icon left>mdi-plus</v-icon>
              New
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-data-table
        :headers="grid.columns"
        :height="gridDefaultHeight"
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

    <v-dialog
      v-model="dialog.add"
      transition="dialog-bottom-transition"
      fullscreen
      hide-overlay
      scrollable
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
          <v-toolbar-title>Purchase Order</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="save">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text class="px-2">
          <!-- <v-form v-model="valid"> -->
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
                        @change="calcPrice(true)"
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
                              v-bind="attrs"
                              v-on="on"
                              :rules="rules.date"
                              :value="formatOrderDate"
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
                            @change="menu.orderDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                          v-model="data.workerCode"
                          :items="workers"
                          :rules="rules.purchaser"
                          label="Purchaser"
                          item-text="name"
                          item-value="code"
                          class="mt-0"
                          required
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
                          required
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
                  <v-tabs v-model="tab.sup">
                    <v-tab key="sup">Supplier</v-tab>
                    <v-tab key="sup-delivery">Delivery</v-tab>
                    <v-tab key="sup-payment">Payment</v-tab>
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
                            label="Code"
                            class="mt-0"
                            readonly
                            required
                          ></v-text-field>
                        </v-col>

                        <v-col cols="9" class="pl-1">
                          <v-text-field
                            v-model="data.supName"
                            label="Name"
                            class="mt-0"
                            readonly
                            required
                          >
                            <template v-slot:append-outer>
                              <v-btn
                                icon
                                color="primary"
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
                            label="Address"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model="data.supPhone"
                            label="Phone"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
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
                      key="sup-delivery"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-combobox
                            v-model="data.warehouseCode"
                            :items="warehouses"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            label="Location"
                            item-value="code"
                          ></v-combobox>
                        </v-col>
                      </v-row>
                    </v-tab-item>

                    <v-tab-item
                      key="sup-payment"
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
                            v-model="data.top"
                            :items="tops"
                            label="Payment Term"
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-select
                            v-model="data.tax"
                            :items="taxes"
                            label="Tax"
                            item-text="name"
                            item-value="code"
                            return-object
                            @change="calcPrice(true)"
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
                            @click="$refs.crudItem.add()"
                          >
                            <v-icon left>mdi-plus</v-icon>
                            Add
                          </v-btn>
                        </v-app-bar>

                        <v-data-table
                          :headers="gridItem.columns"
                          :items="gridItem.data"
                          :items-per-page="-1"
                          height="300"
                          class="elevation-1"
                          hide-default-footer
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
                                  @click="$refs.crudItem.edit(item)"
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
                          @change="calcDP"
                        ></v-currency-field>
                        <v-checkbox
                          v-model="data.applyTax"
                          label="Apply Tax"
                          class="shrink ml-1"
                          @change="calcDP"
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
                        @change="calcFee"
                      ></v-currency-field>
                      <v-currency-field
                        v-model="data.handlingFee"
                        :allow-negative="false"
                        label="Handling Fee"
                        class="text-right mt-0"
                        @change="calcFee"
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
                          @change="discPercentChange"
                        ></v-currency-field>
                      </v-col>
                      <v-col cols="8" class="pl-1">
                        <v-currency-field
                          v-model="data.finalDisc"
                          :allow-negative="false"
                          label="Final Discount"
                          class="text-right mt-0"
                          @change="discChange"
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
          <!-- </v-form> -->
        </v-card-text>
      </v-card>
    </v-dialog>

    <confirm ref="confirm"></confirm>
    <find-supplier
      ref="findSup"
      @dblclick:row="bindSupData"
    ></find-supplier>
    <crud-item
      ref="crudItem"
      caller="purc"
      @save="saveItem"
    ></crud-item>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import api from '@/services/axios.service'

import Confirm from '@/components/dialog/Confirm'
import FindSupplier from '@/components/dialog/FindSupplier'
import CrudItem from '@/components/dialog/CrudItem'

export default {
  components: {
    Confirm,
    FindSupplier,
    CrudItem
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
      foot: null
    },
    grid: {
      search: null,
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Code', value: 'code', divider: true, width: '100' },
        { text: 'Date', value: 'orderDate', divider: true, width: '120' },
        { text: 'Purchaser', value: 'workerCode', divider: true, width: '120' },
        { text: 'Supplier', value: 'supCode', divider: true, width: '120' },
        { text: 'Curr.', value: 'curr', divider: true, width: '90' },
        { text: 'Total', value: 'grandTotal', divider: true, width: '120' },
        { text: 'TOP', value: 'paymentTerm', divider: true, width: '120' }
      ]
    },
    gridItem: {
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Item', value: 'itemCode', divider: true, width: '100' },
        { text: 'Name', value: 'itemName', divider: true, width: '300' },
        { text: 'Qty', value: 'qty', divider: true, width: '90' },
        { text: 'Unit', value: 'unitName', divider: true, width: '90' },
        { text: 'Unit Price', value: 'unitPrice', divider: true, width: '120' },
        { text: 'Disc', value: 'disc', divider: true, width: '120' },
        { text: 'Nett Price', value: 'nettPrice', divider: true, width: '120' },
        { text: 'Total Price', value: 'total', divider: true, width: '120' },
        { text: 'Description', value: 'description' }
      ]
    },
    valid: false,
    workers: [],
    currencies: [],
    warehouses: [],
    deliveries:[],
    tops: [],
    taxes: [],
    data: {},
    rules: {
      date: [
        (v) => !!v || 'Order Date is required'
      ],
      notes: [
        (v) => (v || '').length <= 2000 || 'Notes must be less than 2000 characters'
      ]
    }
  }),

  created: function () {
    this.getList()
    this.getPurchaserLists()
    this.getCurrLists()
    this.getWarehouseLists()
    this.getTaxLists()
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  computed: {
    ...mapState({
      gridDefaultHeight: state => state.app.grid.height,
      endpoint: state => state.api.endpoint
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatOrderDate() {
      return this.data.orderDate ? format(parseISO(this.data.orderDate), 'dd-MMM-yyyy') : ''
    }
  },

  methods: {
    reset() {
      this.gridItem.data = []
      this.data = {
        action: '',
        code: null,
        orderDate: format(new Date(), 'yyyy-MM-dd'),
        workerCode: null,
        curr: 'IDR',
        rate: 1,
        includeTax: true,
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        warehouseCode: this.warehouses.find(w => w.isDefault === 1),
        billAddr: null,
        top: null,
        tax: this.taxes[0],
        notes: null,
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
      }
    },
    getList() {
      api.getAll(this.endpoint.purchase.order, {
        params: { search: this.grid.search }
      })
        .then(response => {
          this.grid.data = response.data
        })
    },
    getPurchaserLists() {
      api.getAll(this.endpoint.general.worker)
        .then(response => {
          this.workers = response.data
        })
    },
    getCurrLists() {
      api.getAll(this.endpoint.general.currency)
        .then(response => {
          this.currencies = response.data
        })
    },
    getWarehouseLists() {
      api.getAll(this.endpoint.inventory.warehouse)
        .then(response => {
          this.warehouses = response.data
        })
    },
    getTaxLists() {
      api.getAll(this.endpoint.general.tax, {
        params: { src: 'purc' }
      })
        .then(response => {
          this.taxes = response.data
          this.data.tax = response.data[0]
        })
    },
    add() {
      this.dialog.add = true
      this.reset()
      this.data.action = 'add'
    },
    edit(item) {
      this.dialog.add = true
      this.reset()

      this.data = {
        action: 'edit',
        code: item.code,
        orderDate: format(parseISO(item.orderDate), 'yyyy-MM-dd'),
        workerCode: item.workerCode,
        curr: item.curr,
        rate: item.rate,
        includeTax: item.includeTax,
        supCode: item.supCode,
        // supName: null,
        // supAddr: null,
        // supPhone: null,
        // supFax: null,
        warehouseCode: this.warehouses.find(w => w.code === item.warehouseCode),
        billAddr: item.billAddr,
        top: item.top,
        tax: this.taxes.find(t => t.code === item.tax),
        notes: item.notes,
        dpp: item.dpp,
        downPayment: item.downPayment,
        applyTax: item.applyTax,
        dpTax: item.dpTax,
        shipmentFee: item.shipmentFee,
        handlingFee: item.handlingFee,
        subTotal: item.subTotal,
        finalDiscPercent: item.finalDiscPercent,
        finalDisc: item.finalDisc,
        taxPercent: item.taxPercent,
        taxAmount: item.taxAmount,
        grandTotal: item.grandTotal
      }

      // Get supplier details
      api.getAll(this.endpoint.general.supplier, {
        params: {
          searchBy: 'code',
          search: item.supCode
        }
      })
        .then(response => {
          const data = response.data[0]
          this.data.supName = data.name
          this.data.supAddr = data.address
          this.data.supPhone = data.phone1
          this.data.supFax = data.fax
        })

      // Get item details
      api.getAll(`${this.endpoint.purchase.order}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data
        })

      this.calcDP()
      this.calcFee()
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Delete?',
          'Are you sure want to delete this data?')
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
    save() {
      const data = this.data
      data.includeTax = this.data.includeTax | 0
      data.warehouseCode = this.data.warehouseCode.code
      data.tax = this.data.tax.code
      data.applyTax = this.data.applyTax | 0
      data.itemDetails = this.gridItem.data

      if (data.action === 'add') {
        api.create(this.endpoint.purchase.order, data)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
              this.dialog.add = false
            }
          })
      } else if (data.action === 'edit') {
        api.update(this.endpoint.purchase.order, data)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
              this.dialog.add = false
            }
          })
      }
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Delete?',
          'Are you sure want to delete this data?')
      ) {
        const idx = this.gridItem.data.findIndex(i => i.rowId === item.rowId)
        this.gridItem.data.splice(idx, 1)

        this.data.subTotal = _sumBy(this.gridItem.data, 'total')
        this.data.dpp = this.data.subTotal - this.data.finalDisc
        this.calcPrice(false)
      }
    },
    saveItem(data) {
      if (data.action === 'add') {
        const item = {
          rowId: this.$uuid.v1(),
          code: this.data.code,
          itemId: data.itemId,
          itemCode: data.itemCode,
          itemName: data.itemName,
          qty: data.qty,
          uomId: data.uomId,
          unitId: data.unit.id,
          unitName: data.unit.unitEquivalent,
          uomBuyName: data.uomBuyName,
          unitPrice: data.unitPrice,
          itemBuyPrice: data.itemBuyPrice,
          disc: data.disc,
          nettPrice: data.nettPrice,
          total: data.total,
          description: data.description,
          state: 'A'
        }
        this.gridItem.data.push(item)
      } else {
        const item = this.gridItem.data.find(i => i.rowId === data.rowId)
        item.itemId = data.itemId
        item.itemCode = data.itemCode
        item.itemName = data.itemName
        item.qty = data.qty
        item.unitId = data.unit.id
        item.unitName = data.unit.unitEquivalent
        item.unitPrice = data.unitPrice
        item.disc = data.disc
        item.nettPrice = data.nettPrice
        item.total = data.total
        item.description = data.description
        if (item.state !== 'A') {
          item.state = 'M'
        }
        this.gridItem.data.concat(item)
      }

      this.data.subTotal = _sumBy(this.gridItem.data, 'total')
      this.data.dpp = this.data.subTotal - this.data.finalDisc
      this.calcPrice(false)
    },
    discPercentChange() {
      this.data.finalDisc = this.data.subTotal * (this.data.finalDiscPercent / 100)
      this.calcPrice(false)
    },
    discChange() {
      this.data.finalDiscPercent = this.data.finalDisc / this.data.subTotal * 100
      this.calcPrice(false)
    },
    calcTax() {
      if (this.data.includeTax) {
        this.data.taxPercent = this.data.tax.rate
        this.data.taxAmount = (this.data.subTotal - this.data.finalDisc) - ((this.data.subTotal - this.data.finalDisc) / (1 + (this.data.tax.rate / 100)))
        this.data.dpp = (this.data.subTotal - this.data.finalDisc) - this.data.taxAmount
      } else {
        this.data.taxPercent = this.data.tax.rate
        this.data.taxAmount = (this.data.subTotal - this.data.finalDisc) * (this.data.tax.rate / 100)
        this.data.dpp = (this.data.subTotal - this.data.finalDisc)
      }
    },
    calcDP() {
      if (this.data.applyTax) {
        if (this.data.includeTax) {
          this.data.dpTax = this.data.downPayment - (this.data.downPayment / (1 + (this.data.tax.rate / 100)))
          this.data.dpTotal = this.data.downPayment
        } else {
          this.data.dpTax = this.data.downPayment * (this.data.tax.rate / 100)
          this.data.dpTotal = this.data.downPayment + this.data.dpTax
        }
      } else {
        this.data.dpTax = 0
        this.data.dpTotal = this.data.downPayment
      }
    },
    calcFee() {
      this.data.fee = this.data.shipmentFee + this.data.handlingFee
      this.calcPrice(false)
    },
    calcPrice(calcDP) {
      if (calcDP) {
        this.calcDP()
      }
      this.calcTax()
      if (this.data.includeTax) {
        this.data.grandTotal = this.data.subTotal - this.data.finalDisc + this.data.fee
      } else {
        this.data.grandTotal = this.data.subTotal - this.data.finalDisc + this.data.taxAmount + this.data.fee
      }
    },
    showFindSupDialog() {
      this.$refs.findSup.open()
    },
    bindSupData(item) {
      this.data.supCode = item.code
      this.data.supName = item.name
      this.data.supAddr = item.address
      this.data.supPhone = item.phone1
      this.data.supFax = item.fax
      // this.data.billAddr = item.code
      // this.data.top = item.code
      // this.data.tax = item.code
    }
  }
}
</script>
