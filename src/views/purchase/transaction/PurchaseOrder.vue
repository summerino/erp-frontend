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
        :height="gridDefaultHeight"
        :items="grid.data"
        :items-per-page="5"
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
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 's']"
                  dark
                  text
                  @click="save"
                  @shortkey="save"
                >Save</v-btn>
              </template>
              <span class="text-caption">(Ctrl + S)</span>
            </v-tooltip>
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
                        ref="code"
                        v-model="data.code"
                        label="Order Code"
                        class="mt-0"
                        readonly
                      ></v-text-field>
                      <v-checkbox
                        v-model="data.includeTax"
                        label="Tax Included"
                        class="shrink ml-1"
                        @change="calcPrice"
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
                    <v-tab key="others">Others</v-tab>
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
                            label="Code"
                            item-value="code"
                            class="mt-0"
                            required
                            @change="supCodeChange"
                          ></v-autocomplete>
                        </v-col>

                        <v-col cols="8" class="pl-1">
                          <v-text-field
                            v-model="data.supName"
                            label="Name"
                            class="mt-0"
                            readonly
                            required
                          >
                            <template v-slot:append-outer>
                              <v-btn
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
                      key="others"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.warehouseCode"
                            :items="warehouses"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            label="Location"
                            item-value="code"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.tax"
                            :items="taxes"
                            label="Tax"
                            item-text="name"
                            item-value="code"
                            return-object
                            @change="calcPrice"
                          ></v-autocomplete>
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
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                v-bind="attrs"
                                v-on="on"
                                v-shortkey="['ctrl', 'i']"
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
                              <span class="text-caption">Delete</span>
                            </v-tooltip>
                          </template>
                          <template v-slot:[`item.itemCode`]="{ item }">
                            <v-autocomplete
                              ref="itemCode"
                              v-model="item.itemCode"
                              :items="items"
                              item-text="code"
                              item-value="code"
                              class="mt-0"
                              dense
                              required
                              @change="itemCodeChange(item)"
                            >
                              <template v-slot:append>
                                <v-btn
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
                              class="text-right mt-0"
                              dense
                              required
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.unitName`]="{ item }">
                            <v-autocomplete
                              v-model="item.unitId"
                              :items="item.units"
                              item-text="unitEquivalent"
                              item-value="id"
                              class="mt-0"
                              dense
                              required
                              @change="unitItemChange(item)"
                            ></v-autocomplete>
                          </template>
                          <template v-slot:[`item.disc`]="{ item }">
                            <v-currency-field
                              v-model="item.disc"
                              class="text-right mt-0"
                              dense
                              required
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.description`]="{ item }">
                            <v-text-field
                              v-model="item.description"
                              class="mt-0"
                              dense
                            ></v-text-field>
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

import api from '@/services/axios.service'

import Confirm from '@/components/dialog/Confirm'
import FindSupplier from '@/components/dialog/FindSupplier'
import FindItem from '@/components/dialog/FindItem'

export default {
  components: {
    Confirm,
    FindSupplier,
    FindItem
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
        { text: 'Date', value: 'orderDate', align: 'right', divider: true, width: '120' },
        { text: 'Purchaser', value: 'workerName', divider: true, width: '200' },
        { text: 'Supplier', value: 'supName', divider: true, width: '200' },
        { text: 'Curr.', value: 'curr', divider: true, width: '90' },
        { text: 'Total', value: 'grandTotal', align: 'right', divider: true, width: '120' },
        { text: 'TOP', value: 'paymentTerm', width: '120' }
      ]
    },
    gridItem: {
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Item', value: 'itemCode', divider: true, width: '120' },
        { text: 'Name', value: 'itemName', divider: true, width: '300' },
        { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
        { text: 'Unit', value: 'unitName', divider: true, width: '90' },
        { text: 'Unit Price', value: 'unitPrice', align: 'right', divider: true, width: '120' },
        { text: 'Disc', value: 'disc', align: 'right', divider: true, width: '120' },
        { text: 'Nett Price', value: 'nettPrice', align: 'right', divider: true, width: '120' },
        { text: 'Total Price', value: 'total', align: 'right', divider: true, width: '120' },
        { text: 'Description', value: 'description', width: '200' }
      ]
    },
    valid: false,
    workers: [],
    currencies: [],
    suppliers: [],
    warehouses: [],
    taxes: [],
    items: [],
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
    this.getSupplierLists()
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
        warehouseCode: null,
        tax: this.taxes[0],
        notes: null,
        dpp: 0,
        subTotal: 0,
        finalDiscPercent: 0,
        finalDisc: 0,
        taxPercent: 0,
        taxAmount: 0,
        grandTotal: 0
      }

      // Set default warehouse
      const defWarehouse = this.warehouses.find(w => w.isDefault === 1)
      if (defWarehouse) {
        this.data.warehouseCode = defWarehouse.code
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
    getSupplierLists() {
      api.getAll(this.endpoint.general.supplier)
        .then(response => {
          this.suppliers = response.data
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
    getItemLists() {
      api.getAll(this.endpoint.inventory.item.item)
        .then(response => {
          this.items = response.data
        })
    },
    getUnitItemLists(item) {
      api.getAll(this.endpoint.inventory.uom.conversion, {
        params: { uomId: item.uomId }
      })
        .then(response => {
          item.units = response.data
        })
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset()
      this.data.action = 'add'

      // Set focus to order code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
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
        warehouseCode: item.warehouseCode,
        billAddr: item.billAddr,
        top: item.top,
        tax: this.taxes.find(t => t.code === item.tax),
        notes: item.notes,
        dpp: item.dpp,
        downPayment: item.downPayment,
        applyTax: item.applyTax,
        dpTax: item.dpTax,
        subTotal: item.subTotal,
        finalDiscPercent: item.finalDiscPercent,
        finalDisc: item.finalDisc,
        taxPercent: item.taxPercent,
        taxAmount: item.taxAmount,
        grandTotal: item.grandTotal,
        updatedBy: item.updatedBy,
        updatedDate: item.updatedDate
      }

      // Get supplier details
      this.supCodeChange()

      // Get item details
      api.getAll(`${this.endpoint.purchase.order}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data
        })

      // Set focus to order code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
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
      if (!this.dialog.add) return
      
      const data = this.data
      data.includeTax = this.data.includeTax | 0
      data.warehouseCode = this.data.warehouseCode
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
    addItem() {
      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0].itemId ?? null)) {
        const item = {
          rowId: this.$uuid.v1(),
          code: this.data.code,
          itemId: null,
          itemCode: null,
          itemName: null,
          qty: 0,
          units: [],
          uomId: null,
          unitId: null,
          unitName: null,
          uomBuyName: null,
          unitPrice: 0,
          itemBuyPrice: 0,
          disc: 0,
          nettPrice: 0,
          total: 0,
          description: null,
          state: 'A'
        }
        this.gridItem.data.push(item)

        setTimeout(() => {
          this.$refs.itemCode.focus()
        }, 0)
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
        this.calcPrice()
      }
    },
    supCodeChange() {
      const supplier = this.suppliers.find(s => s.code === this.data.supCode)
      if (supplier) {
        this.data.supName = supplier.name
        this.data.supAddr = supplier.address
        this.data.supPhone = supplier.phone1
        this.data.supFax = supplier.fax
      }
    },
    itemCodeChange(item) {
      const data_i = this.items.find(i => i.code.toLowerCase() === item.itemCode.toLowerCase())
      if (data_i) {
        item.itemId = data_i.id
        item.itemName = data_i.name
        item.qty = 1
        item.uomId = data_i.uomId
        item.unitId = data_i.uomBuyId
        item.unitName = data_i.uomBuyName
        item.uomBuyName = data_i.uomBuyName
        item.unitPrice = data_i.buyPrice
        item.itemBuyPrice = data_i.buyPrice
        item.disc = 0
        item.nettPrice = data_i.buyPrice
        item.total = data_i.buyPrice
        item.description = null
        if (item.state !== 'A') {
          item.state = 'M'
        }

        // Get unit item lists
        this.getUnitItemLists(item)

        // Calc unit item lists
        this.calcItemPrice(item)
      }
    },
    unitItemChange(item) {
      item.uomConversion = 1

      const conversion = item.units.find(u => u.id === item.unitId)
      if (conversion.unitEquivalent !== item.uomBuyName) {
        this.calcUomConversion(item, conversion.unitEquivalent)
      }
      item.unitPrice = item.itemBuyPrice / item.uomConversion

      this.calcItemPrice(item)
    },
    calcUomConversion(item, unitToConvert) {
      const data = item.units.find(u => u.unitToConvert === unitToConvert && u.unitToConvert !== u.unitEquivalent)
      item.uomConversion *= data.conversion
      
      if (data.unitEquivalent !== item.uomBuyName) {
        this.calcUomConversion(item, data.unitEquivalent)
      }
    },
    calcItemPrice(item) {
      item.nettPrice = item.unitPrice - item.disc
      item.total = item.qty * item.nettPrice

      this.data.subTotal = _sumBy(this.gridItem.data, 'total')
      this.data.dpp = this.data.subTotal - this.data.finalDisc
      this.calcPrice()
    },
    discPercentChange() {
      this.data.finalDisc = this.data.subTotal * (this.data.finalDiscPercent / 100)
      this.calcPrice()
    },
    discChange() {
      this.data.finalDiscPercent = this.data.finalDisc / this.data.subTotal * 100
      this.calcPrice()
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
    calcPrice() {
      this.calcTax()
      if (this.data.includeTax) {
        this.data.grandTotal = this.data.subTotal - this.data.finalDisc
      } else {
        this.data.grandTotal = this.data.subTotal - this.data.finalDisc + this.data.taxAmount
      }
    },
    showFindSupDialog() {
      this.$refs.findSup.open()
    },
    showFindItemDialog(item) {
      this.$refs.findItem.open(item)
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
    },
    bindItemData(rowItem) {
      this.itemCodeChange(rowItem)
    }
  }
}
</script>
