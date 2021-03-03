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
        <template v-slot:[`item.receiveDate`]="{ item }">
          {{ item.receiveDate | formatDate('dd-MMM-yyyy') }}
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
          <v-toolbar-title>Receive Item</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
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
          <!-- <v-form v-model="valid"> -->
            <v-row dense>
              <v-col cols="12" md="4">
                <v-card>
                  <v-card-title>General</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="code"
                          v-model="data.code"
                          label="Receive Code"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          v-model="data.refNo"
                          label="Ref. No."
                          class="mt-0"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-menu
                          v-model="menu.receiveDate"
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
                              :value="formatReceiveDate"
                              label="Receive Date"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.receiveDate"
                            no-title
                            scrollable
                            @change="menu.receiveDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          v-model="data.poCode"
                          label="PO Code"
                          class="mt-0"
                          required
                          @change="poCodeChange"
                        >
                          <template v-slot:append>
                              <v-btn
                                ref="btnFindPO"
                                color="primary"
                                icon
                                small
                                @click="showFindPODialog"
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
                    <v-tab key="sup">Supplier</v-tab>
                    <v-tab key="user">User</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.head" class="pa-2">
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
                          ></v-text-field>
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
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.supPhone"
                            label="Phone"
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
                            v-model="data.receiveBy"
                            :items="workers"
                            label="Received By"
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
                          <template v-slot:[`item.itemCode`]="{ item }">
                            <v-autocomplete
                              ref="itemCode"
                              v-model="item.itemCode"
                              :items="items"
                              :readonly="item.typeId == 0"
                              item-text="code"
                              item-value="code"
                              class="text-body-2 mt-0"
                              required
                              @change="itemCodeChange(item)"
                            >
                              <template v-slot:append>
                                <v-btn
                                  :disabled="item.typeId == 0"
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
                              class="text-body-2 text-right mt-0"
                              required
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.warehouseInitial`]="{ item }">
                            <v-autocomplete
                              v-model="item.warehouseCode"
                              :items="warehouses"
                              item-text="initial"
                              item-value="code"
                              class="text-body-2 text-right mt-0"
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
    <find-purchase-order
      ref="findPO"
      @dblclick:row="bindPOData"
    ></find-purchase-order>
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
import FindPurchaseOrder from '@/components/dialog/FindPurchaseOrder'
import FindItem from '@/components/dialog/FindItem'

export default {
  components: {
    Confirm,
    FindPurchaseOrder,
    FindItem
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      receiveDate: false
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
        { text: 'Date', value: 'receiveDate', align: 'right', divider: true, width: '120' },
        { text: 'Supplier', value: 'supName', divider: true, width: '200' },
        { text: 'PO Code', value: 'poCode', divider: true, width: '100' },
        { text: 'Ref. No.', value: 'refNo', width: '150' }
      ]
    },
    gridItem: {
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Item', value: 'itemCode', divider: true, width: '100' },
        { text: 'Name', value: 'itemName', divider: true, width: '280' },
        { text: 'Order Qty', value: 'orderQty', align: 'right', divider: true, width: '90' },
        { text: 'Outstanding', value: 'outstandingQty', align: 'right', divider: true, width: '90' },
        { text: 'Received Qty', value: 'qty', align: 'right', divider: true, width: '90' },
        { text: 'Unit', value: 'unitName', divider: true, width: '90' },
        { text: 'Location', value: 'warehouseInitial', divider: true, width: '180' },
        { text: 'Type', value: 'typeName', width: '90' }
      ]
    },
    valid: false,
    workers: [],
    currencies: [],
    items: [],
    warehouses: [],
    data: {},
    rules: {
      date: [
        (v) => !!v || 'Receive Date is required'
      ],
      notes: [
        (v) => (v || '').length <= 2000 || 'Notes must be less than 2000 characters'
      ]
    }
  }),

  created: function () {
    this.getList()
    this.getWorkerLists()
    this.getItemLists()
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
    formatReceiveDate() {
      return this.data.receiveDate ? format(parseISO(this.data.receiveDate), 'dd-MMM-yyyy') : ''
    }
  },

  methods: {
    reset() {
      this.gridItem.data = []
      this.data = {
        action: '',
        code: null,
        refNo: null,
        receiveDate: format(new Date(), 'yyyy-MM-dd'),
        poCode: null,
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        receiveBy: null,
        approveBy: null,
        dpp: 0,
        subTotal: 0,
        finalDisc: 0,
        taxAmount: 0,
        total: 0,
        createdBy: null,
        createdDate: null,
        updatedBy: null,
        updatedDate: null
      }
    },
    getList() {
      api.getAll(this.endpoint.purchase.receive, {
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
    getItemLists() {
      api.getAll(this.endpoint.inventory.item.item)
        .then(response => {
          this.items = response.data
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

      // Set focus to receive code field
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
        refNo: item.refNo,
        receiveDate: format(parseISO(item.receiveDate), 'yyyy-MM-dd'),
        poCode: item.poCode,
        supCode: item.supCode,
        // supName: null,
        // supAddr: null,
        // supPhone: null,
        // supFax: null,
        receiveBy: item.receiveBy,
        approveBy: item.approveBy,
        dpp: item.dpp,
        subTotal: item.subTotal,
        finalDisc: item.finalDisc,
        taxAmount: item.taxAmount,
        total: item.total,
        createdBy: item.createdBy,
        createdDate: item.createdDate,
        updatedBy: item.updatedBy,
        updatedDate: item.updatedDate
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
      api.getAll(`${this.endpoint.purchase.receive}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data
        })

      // Set focus to receive code field
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

      const data = this.data
      data.itemDetails = this.gridItem.data

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.purchase.receive, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.purchase.receive, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.getList()
        if (closeDialog) {
          this.dialog.add = false
        }
      }
    },
    addItem() {
      // if (!this.data.supCode) {
      //   this.$store.dispatch('app/showInfo', 'Please choose supplier first')
      //   return
      // }

      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0].itemId ?? null)) {
        const item = {
          rowId: this.$uuid.v1(),
          code: this.data.code,
          itemId: null,
          itemCode: null,
          itemName: null,
          orderQty: 0,
          outstandingQty: 0,
          qty: 1,
          uomId: null,
          unitId: null,
          unitName: null,
          unitPrice: 0,
          itemBuyPrice: 0,
          disc: 0,
          nettPrice: 0,
          total: 0,
          warehouseCode: null,
          typeId: 1,
          typeName: 'Bonus',
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
      }
    },
    poCodeChange() {
      api.getAll(`${this.endpoint.purchase.order}/incomplete`, {
        params: {
          searchBy: 'pocode_eq',
          search: this.data.poCode
        }
      })
        .then(response => {
          this.bindPOData(response.data[0] ?? null)
        })
    },
    itemCodeChange(item) {
      const data_i = this.items.find(i => i.code.toLowerCase() === item.itemCode.toLowerCase())
      if (data_i) {
        item.itemId = data_i.id
        item.itemName = data_i.name
        item.orderQty = 0
        item.outstandingQty = 0
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
        if (item.state !== 'A') {
          item.state = 'M'
        }

        // Calc unit item lists
        this.calcItemPrice(item)
      }
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
      //   this.data.total = this.data.subTotal - this.data.finalDisc
      // } else {
      this.data.total = this.data.subTotal - this.data.finalDisc + this.data.taxAmount
      // }
    },
    showFindPODialog() {
      this.$refs.findPO.open()
    },
    showFindItemDialog(item) {
      this.$refs.findItem.open(item)
    },
    bindPOData(item) {
      if (item) {
        this.data.poCode = item.code
        this.data.supCode = item.supCode
        this.data.supName = item.supName
        this.data.supAddr = item.supAddr
        this.data.supPhone = item.supPhone
        this.data.supFax = item.supFax
        this.data.dpp = item.dpp
        this.data.subTotal = item.subTotal
        this.data.finalDisc = item.finalDisc
        this.data.taxAmount = item.taxAmount
        this.data.total = item.total

        // Get purchase order item details
        api.getAll(`${this.endpoint.purchase.order}/outstanding-item`, {
          params: { code: item.code }
        })
          .then(response => {
            this.gridItem.data = response.data
          })
      } else {
        this.data.supCode = null
        this.data.supName = null
        this.data.supAddr = null
        this.data.supPhone = null
        this.data.supFax = null
        this.gridItem.data = []
      }
    },
    bindItemData(rowItem) {
      this.itemCodeChange(rowItem)
    }
  }
}
</script>
