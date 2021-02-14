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
          <v-toolbar-title>Receive Item</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              v-shortkey="['ctrl', 's']"
              dark
              text
              @click="save"
              @shortkey="save"
            >Save</v-btn>
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
                          v-model="data.code"
                          label="Receive Code"
                          class="mt-0"
                          readonly
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
                          v-model="data.supDocNo"
                          label="Supplier Doc. No."
                          class="mt-0"
                          readonly
                        ></v-text-field>
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
                          >
                            <template v-slot:append-outer>
                              <v-btn
                                ref="btnFindSup"
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
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.supPhone"
                            label="Phone"
                            class="mt-0"
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
                          <v-btn
                            class="blue--text"
                            small
                            tile
                            @click="addItem"
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
                                  @click="$refs.receiveItem.edit(item)"
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
                          <template v-slot:[`item.warehouse`]="{ item }">
                            {{ item.warehouseInitial }} - {{ item.warehouseName }}
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
    <find-supplier
      ref="findSup"
      @dblclick:row="bindSupData"
    ></find-supplier>
    <receive-item
      ref="receiveItem"
      :sup-code="data.supCode"
      :warehouses="warehouses"
      caller="purc"
      @save="saveItem"
    ></receive-item>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

import api from '@/services/axios.service'

import Confirm from '@/components/dialog/Confirm'
import FindSupplier from '@/components/dialog/FindSupplier'
import ReceiveItem from '@/components/dialog/RcvDlvItem'

export default {
  components: {
    Confirm,
    FindSupplier,
    ReceiveItem
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
        { text: 'Date', value: 'receiveDate', divider: true, width: '120' },
        { text: 'Supplier', value: 'supCode', divider: true, width: '200' },
        { text: 'Supplier Doc. No.', value: 'supDocNo', divider: true, width: '150' }
      ]
    },
    gridItem: {
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Item', value: 'itemCode', divider: true, width: '100' },
        { text: 'Name', value: 'itemName', divider: true, width: '300' },
        { text: 'Order Qty', value: 'orderQty', divider: true, width: '90' },
        { text: 'Outstanding', value: 'outstandingQty', divider: true, width: '90' },
        { text: 'Received Qty', value: 'qty', divider: true, width: '90' },
        { text: 'Unit', value: 'unitName', divider: true, width: '90' },
        { text: 'Location', value: 'warehouse' }
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
        receiveDate: format(new Date(), 'yyyy-MM-dd'),
        supDocNo: null,
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        receiveBy: null,
        approveBy: null,
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
    },
    edit(item) {
      this.dialog.add = true
      this.reset()

      this.data = {
        action: 'edit',
        code: item.code,
        receiveDate: format(parseISO(item.receiveDate), 'yyyy-MM-dd'),
        supDocNo: item.supDocNo,
        supCode: item.supCode,
        // supName: null,
        // supAddr: null,
        // supPhone: null,
        // supFax: null,
        receiveBy: item.receiveBy,
        approveBy: item.approveBy,
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
    save() {
      if (!this.dialog.add) return
  
      const data = this.data
      data.itemDetails = this.gridItem.data

      if (data.action === 'add') {
        api.create(this.endpoint.purchase.receive, data)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
              this.dialog.add = false
            }
          })
      } else if (data.action === 'edit') {
        api.update(this.endpoint.purchase.receive, data)
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
      if (!this.data.supCode) {
        this.$store.dispatch('app/showInfo', 'Please choose supplier first')
        this.$refs.btnFindSup.$el.focus()
        return
      }
      this.$refs.receiveItem.add()
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
    saveItem(data) {
      if (data.action === 'add') {
        const item = {
          rowId: this.$uuid.v1(),
          code: this.data.code,
          poCode: data.poCode,
          itemId: data.itemId,
          itemCode: data.itemCode,
          itemName: data.itemName,
          orderQty: data.orderQty,
          outstandingQty: data.outstandingQty,
          qty: data.qty,
          uomId: data.uomId,
          unitId: data.unitId,
          unitName: data.unitName,
          warehouseCode: data.warehouse.code,
          warehouseInitial: data.warehouse.initial,
          warehouseName: data.warehouse.name,
          state: 'A'
        }
        this.gridItem.data.push(item)
      } else {
        console.log(data.warehouse)
        const item = this.gridItem.data.find(i => i.rowId === data.rowId)
        item.poCode = data.poCode
        item.itemId = data.itemId
        item.itemCode = data.itemCode
        item.itemName = data.itemName
        item.orderQty = data.orderQty
        item.outstandingQty = data.outstandingQty
        item.qty = data.qty
        item.uomId = data.uomId
        item.unitId = data.unitId
        item.unitName = data.unitName
        item.warehouseCode = data.warehouse.code
        item.warehouseInitial = data.warehouse.initial
        item.warehouseName = data.warehouse.name
        if (item.state !== 'A') {
          item.state = 'M'
        }
        this.gridItem.data.concat(item)
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
