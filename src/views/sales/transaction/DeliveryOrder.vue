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
          <v-toolbar-title>Delivery Order</v-toolbar-title>
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
                      <v-col cols="12">
                        <v-text-field
                          ref="code"
                          v-model="data.code"
                          label="Delivery Code"
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
                              v-bind="attrs"
                              v-on="on"
                              :rules="rules.date"
                              :value="formatdeliveryDate"
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
                            @change="menu.deliveryDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          v-model="data.soCode"
                          label="SO Code"
                          class="mt-0"
                          required
                          @change="soCodeChange"
                        >
                          <template v-slot:append>
                              <v-btn
                                ref="btnFindSO"
                                color="primary"
                                icon
                                small
                                @click="showFindSODialog"
                              >
                                <v-icon>
                                  mdi-shopping-search
                                </v-icon>
                              </v-btn>
                            </template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.head">
                    <v-tab key="cust">Customer</v-tab>
                    <v-tab key="delivery">Delivery</v-tab>
                    <v-tab key="notes">Notes</v-tab>
                    <v-tab key="user">User</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.head" class="pa-2">
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
                      key="delivery"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.deliveryAddr"
                            :items="deliveries"
                            label="Delivery Address"
                            class="mt-0"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.warehouseCode"
                            :items="warehouses"
                            :item-text="item => `${item.initial} - ${item.name}`"
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
                    >
                      <v-row no-gutters>
                        <v-textarea
                          v-model="data.notes"
                          :rules="rules.notes"
                          label="Notes"
                          counter="2000"
                          class="mt-0"
                          rows="4"
                        ></v-textarea>
                      </v-row>
                    </v-tab-item>
                    
                    <v-tab-item
                      key="user"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.updatedBy"
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
                      
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-combobox
                            v-model="data.shippedBy"
                            :items="workers"
                            label="Shipped By"
                            item-text="name"
                            item-value="code"
                            class="mt-0"
                          ></v-combobox>
                        </v-col>
                      </v-row>
                      
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-combobox
                            v-model="data.approveBy"
                            :items="workers"
                            label="Approved By"
                            item-text="name"
                            item-value="code"
                            class="mt-0"
                          ></v-combobox>
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
                        <!-- <v-app-bar dense flat>
                          <v-spacer></v-spacer>
                          <v-btn
                            class="blue--text"
                            small
                            tile
                            @click="addItem"
                          >
                            <v-icon left>mdi-plus</v-icon>
                            Add
                          </v-btn>
                        </v-app-bar> -->

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
                                  :disabled="item.typeId == 0"
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
          <!-- </v-form> -->
        </v-card-text>
      </v-card>
    </v-dialog>

    <confirm ref="confirm"></confirm>
    <find-sales-order
      ref="findSO"
      @dblclick:row="bindSOData"
    ></find-sales-order>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import api from '@/services/axios.service'

import Confirm from '@/components/dialog/Confirm'
import FindSalesOrder from '@/components/dialog/FindSalesOrder'

export default {
  components: {
    Confirm,
    FindSalesOrder
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      deliveryDate: false
    },
    tab: {
      head: null,
      foot: null
    },
    grid: {
      search: null,
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Code', value: 'code', divider: true, width: '100' },
        { text: 'Date', value: 'deliveryDate', align: 'right', divider: true, width: '120' },
        { text: 'Customer', value: 'custName', divider: true, width: '200' },
        { text: 'SO Code', value: 'soCode', width: '150' }
      ]
    },
    gridItem: {
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Item', value: 'itemCode', divider: true, width: '100' },
        { text: 'Name', value: 'itemName', divider: true, width: '300' },
        { text: 'Order Qty', value: 'orderQty', align: 'right', divider: true, width: '90' },
        { text: 'Unit', value: 'unitName', divider: true, width: '90' },
        { text: 'Deliver Qty', value: 'qty', align: 'right', divider: true, width: '90' },
        { text: 'Description', value: 'description' }
      ]
    },
    valid: false,
    workers: [],
    currencies: [],
    warehouses: [],
    deliveries:[],
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
    this.getWorkerLists()
    this.getWarehouseLists()
    this.reset()
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
    formatdeliveryDate() {
      return this.data.deliveryDate ? format(parseISO(this.data.deliveryDate), 'dd-MMM-yyyy') : ''
    }
  },

  methods: {
    reset() {
      this.gridItem.data = []
      this.data = {
        action: '',
        code: null,
        deliveryDate: format(new Date(), 'yyyy-MM-dd'),
        soCode: null,
        custCode: null,
        custName: null,
        custAddr: null,
        custPhone: null,
        custFax: null,
        deliveryAddr: null,
        warehouseCode: null,
        notes: null,
        shippedBy: null,
        approveBy: null,
        dpp: 0,
        subTotal: 0,
        finalDisc: 0,
        taxAmount: 0,
        grandTotal: 0,
        createdBy: null,
        createdDate: null,
        updatedBy: null,
        updatedDate: null
      }
    },
    getList() {
      api.getAll(this.endpoint.sales.delivery, {
        params: { search: this.grid.search }
      })
        .then(response => {
          this.grid.data = response.data
        })
    },
    getWorkerLists() {
      api.getAll(this.endpoint.general.worker)
        .then(response => {
          this.workers = response.data
        })
    },
    getWarehouseLists() {
      api.getAll(this.endpoint.inventory.warehouse)
        .then(response => {
          this.warehouses = response.data
        })
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset()
      this.data.action = 'add'

      // Set focus to delivery code field
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
        deliveryDate: format(parseISO(item.deliveryDate), 'yyyy-MM-dd'),
        soCode: item.soCode,
        custCode: item.custCode,
        // custName: null,
        // custAddr: null,
        // custPhone: null,
        // custFax: null,
        deliveryAddr: item.deliveryAddr,
        warehouseCode: item.warehouseCode,
        notes: item.notes,
        shippedBy: item.shippedBy,
        approveBy: item.approveBy,
        dpp: item.dpp,
        subTotal: item.subTotal,
        finalDisc: item.finalDisc,
        taxAmount: item.taxAmount,
        grandTotal: item.grandTotal,
        createdBy: item.createdBy,
        createdDate: item.createdDate,
        updatedBy: item.updatedBy,
        updatedDate: item.updatedDate
      }

      // Get customer details
      api.getAll(this.endpoint.general.customer, {
        params: {
          searchBy: 'code',
          search: item.custCode
        }
      })
        .then(response => {
          const data = response.data[0]
          this.data.custName = data.name
          this.data.custAddr = data.address
          this.data.custPhone = data.phone1
          this.data.custFax = data.fax
        })

      // Get item details
      api.getAll(`${this.endpoint.sales.delivery}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data
        })

      // Set focus to delivery code field
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
        api.delete(this.endpoint.sales.delivery, item.code)
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
      data.itemDetails = this.gridItem.data

      if (data.action === 'add') {
        api.create(this.endpoint.sales.delivery, data)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
              this.dialog.add = false
            }
          })
      } else if (data.action === 'edit') {
        api.update(this.endpoint.sales.delivery, data)
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
      // if (!this.data.custCode) {
      //   this.$store.dispatch('app/showInfo', 'Please choose customer first')
      //   return
      // }
      this.$refs.receiveItem.add()

      // if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0].itemId ?? null)) {
      //   const item = {
      //     rowId: this.$uuid.v1(),
      //     code: this.data.code,
      //     itemId: null,
      //     itemCode: null,
      //     itemName: null,
      //     orderQty: 0,
      //     outstandingQty: 0,
      //     qty: 1,
      //     uomId: null,
      //     unitId: null,
      //     unitName: null,
      //     unitPrice: 0,
      //     itemSellPrice: 0,
      //     disc: 0,
      //     nettPrice: 0,
      //     total: 0,
      //     warehouseCode: null,
      //     typeId: 1,
      //     typeName: 'Bonus',
      //     state: 'A'
      //   }
      //   this.gridItem.data.push(item)

      //   setTimeout(() => {
      //     this.$refs.itemCode.focus()
      //   }, 0)
      // }
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Delete?',
          'Are you sure want to delete this data?')
      ) {
        const idx = this.gridItem.data.findIndex(i => i.rowId === item.rowId)
        this.gridItem.data.splice(idx, 1)
      }
    },
    soCodeChange() {
      api.getAll(`${this.endpoint.sales.order}/incomplete`, {
        params: {
          searchBy: 'socode_eq',
          search: this.data.soCode
        }
      })
        .then(response => {
          this.bindSOData(response.data[0] ?? null)
        })
    },
    calcItemPrice(item) {
      item.nettPrice = item.unitPrice - item.disc
      item.total = item.qty * item.nettPrice

      this.data.subTotal = _sumBy(this.gridItem.data, 'total')
      this.data.dpp = this.data.subTotal - this.data.finalDisc
      this.calcPrice()
    },
    calcPrice() {
      // this.calcTax()
      // if (this.data.includeTax) {
      //   this.data.grandTotal = this.data.subTotal - this.data.finalDisc
      // } else {
      this.data.grandTotal = this.data.subTotal - this.data.finalDisc + this.data.taxAmount
      // }
    },
    showFindSODialog() {
      this.$refs.findSO.open()
    },
    bindSOData(item) {
      if (item) {
        this.data.soCode = item.code
        this.data.custCode = item.custCode
        this.data.custName = item.custName
        this.data.custAddr = item.custAddr
        this.data.custPhone = item.custPhone
        this.data.custFax = item.custFax
        // this.data.deliveryAddr = item.deliveryAddr

        // Get sales order item details
        api.getAll(`${this.endpoint.sales.order}/outstanding-item`, {
          params: { code: item.code }
        })
          .then(response => {
            this.gridItem.data = response.data
          })
      } else {
        this.data.custCode = null
        this.data.custName = null
        this.data.custAddr = null
        this.data.custPhone = null
        this.data.custFax = null
        this.data.deliveryAddr = null
        this.data.warehouseCode = null
        this.gridItem.data = []
      }
    }
  }
}
</script>
