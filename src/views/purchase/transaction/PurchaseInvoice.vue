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
        <template v-slot:[`item.invDate`]="{ item }">
          {{ item.invDate | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.total`]="{ item }">
          {{ item.total | formatCurrency }}
        </template>
        <template v-slot:[`item.dueDate`]="{ item }">
          {{ item.invDate | formatDate('dd-MMM-yyyy') }}
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
          <v-toolbar-title>Purchase Invoice</v-toolbar-title>
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
                          label="Inv. Code"
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
                      <v-col cols="12" md="6">
                        <v-menu
                          v-model="menu.invDate"
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
                              :value="formatInvDate"
                              label="Inv. Date"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.invDate"
                            no-title
                            scrollable
                            @change="menu.invDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.dueDate"
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
                              :value="formatDueDate"
                              label="Due Date"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.dueDate"
                            no-title
                            scrollable
                            @change="menu.dueDate = false"
                          ></v-date-picker>
                        </v-menu>
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
                  <v-tabs v-model="tab.head">
                    <v-tab key="sup">Supplier</v-tab>
                    <v-tab key="tax">Tax</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.head" class="pa-2">
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
                      key="tax"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-autocomplete
                          v-model="data.tax"
                          :items="taxes"
                          label="Tax"
                          item-text="name"
                          item-value="code"
                          return-object
                          @change="calcPrice(false)"
                        ></v-autocomplete>
                        <v-checkbox
                          v-model="data.includeTax"
                          label="Tax Included"
                          class="shrink ml-1"
                          @change="calcPrice(false)"
                        ></v-checkbox>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model="data.taxInvNo"
                            label="Tax Inv. No."
                            class="mt-0"
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
                  <v-tabs>
                    <v-tab key="detail-trans">Detail</v-tab>
                    <v-tab key="related-trans">Related Transaction(s)</v-tab>

                    <v-tab-item
                      key="detail-trans"
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
                          :headers="gridDet.columns"
                          :items="gridDet.data"
                          :items-per-page="-1"
                          height="300"
                          class="elevation-1"
                          dense
                          disable-sort
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
                          <template v-slot:[`item.rcvCode`]="{ item }">
                            <v-autocomplete
                              ref="rcvCode"
                              v-model="item.rcvCode"
                              :items="purRcvs"
                              item-text="code"
                              item-value="code"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="rcvCodeChange(item)"
                            >
                              <template v-slot:append>
                                <v-btn
                                  color="primary"
                                  icon
                                  x-small
                                  @click="showFindPurcRcvDialog(item)"
                                >
                                  <v-icon>
                                    mdi-settings-helper
                                  </v-icon>
                                </v-btn>
                              </template>
                            </v-autocomplete>
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

                    <!-- <v-tab-item
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
                    </v-tab-item> -->

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
                        v-model="data.total"
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
    <find-purchase-receive
      ref="findPurcRcv"
      :sup-code="data.supCode"
      @dblclick:row="bindPurcRcvData"
    ></find-purchase-receive>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import api from '@/services/axios.service'

import Confirm from '@/components/dialog/Confirm'
import FindSupplier from '@/components/dialog/FindSupplier'
import FindPurchaseReceive from '@/components/dialog/FindPurchaseReceive'

export default {
  components: {
    Confirm,
    FindSupplier,
    FindPurchaseReceive
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      invDate: false,
      dueDate: false
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
        { text: 'Code', value: 'code', divider: true, width: '120' },
        { text: 'Date', value: 'invDate', align: 'right', divider: true, width: '120' },
        { text: 'Supplier', value: 'supName', divider: true, width: '200' },
        { text: 'Curr.', value: 'curr', divider: true, width: '90' },
        { text: 'Total', value: 'total', align: 'right', divider: true, width: '120' },
        { text: 'Due Date', value: 'dueDate', align: 'right', divider: true, width: '120' },
        { text: 'Ref. No.', value: 'refNo', width: '120' }
      ]
    },
    gridDet: {
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Rcv. Code', value: 'rcvCode', divider: true },
        // { text: 'Total Before tax', value: 'dpp', align: 'right', divider: true, width: '120' },
        // { text: 'Tax', value: 'taxAmount', align: 'right', divider: true, width: '120' },
        { text: 'Total', value: 'total', align: 'right' }
      ]
    },
    valid: false,
    workers: [],
    currencies: [],
    suppliers: [],
    taxes: [],
    purRcvs:[],
    deliveries:[],
    data: {},
    rules: {
      date: [
        (v) => !!v || 'Inv. Date / Due Date is required'
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
    formatInvDate() {
      return this.data.invDate ? format(parseISO(this.data.invDate), 'dd-MMM-yyyy') : ''
    },
    formatDueDate() {
      return this.data.dueDate ? format(parseISO(this.data.dueDate), 'dd-MMM-yyyy') : ''
    }
  },

  methods: {
    reset() {
      this.gridDet.data = []
      this.data = {
        action: '',
        code: null,
        invDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        curr: 'IDR',
        rate: 1,
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        tax: this.taxes[0],
        includeTax: true,
        notes: null,
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
        dpp: 0,
        total: 0
      }
    },
    getList() {
      api.getAll(this.endpoint.purchase.invoice, {
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
        invDate: format(parseISO(item.invDate), 'yyyy-MM-dd'),
        dueDate: format(parseISO(item.dueDate), 'yyyy-MM-dd'),
        curr: item.curr,
        rate: item.rate,
        supCode: item.supCode,
        // supName: null,
        // supAddr: null,
        // supPhone: null,
        // supFax: null,
        tax: this.taxes.find(t => t.code === item.tax),
        includeTax: item.includeTax,
        notes: item.notes,
        // downPayment: item.downPayment,
        // applyTax: item.applyTax,
        // dpTax: item.dpTax,
        shipmentFee: item.shipmentFee,
        handlingFee: item.handlingFee,
        subTotal: item.subTotal,
        finalDiscPercent: item.finalDiscPercent,
        finalDisc: item.finalDisc,
        taxPercent: item.taxPercent,
        taxAmount: item.taxAmount,
        fee: item.fee,
        dpp: item.dpp,
        total: item.total,
        updatedBy: item.updatedBy,
        updatedDate: item.updatedDate
      }

      // Get supplier details
      const supplier = this.suppliers.find(s => s.code === item.supCode)
      this.bindSupData(supplier)

      // Get invoice details
      api.getAll(`${this.endpoint.purchase.invoice}/detail`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridDet.data = response.data
        })

      // this.calcDP()
      this.calcFee()

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
        api.delete(this.endpoint.purchase.invoice, item.code)
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
      data.includeTax = this.data.includeTax | 0
      data.tax = this.data.tax.code
      data.applyTax = this.data.applyTax | 0
      data.itemDetails = this.gridDet.data
      
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.purchase.invoice, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.purchase.invoice, data)
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
      if (!this.data.supCode) {
        this.$store.dispatch('app/showInfo', 'Please choose supplier first.')
        return
      }

      if (this.gridDet.data.length === 0 || (this.gridDet.data.slice(-1)[0].rcvCode ?? null)) {
        const item = {
          rowId: this.$uuid.v1(),
          code: this.data.code,
          rcvCode: null,
          subTotal: 0,
          disc: 0,
          finalDisc: 0,
          taxAmount: 0,
          dpp: 0,
          total: 0,
          state: 'A'
        }
        this.gridDet.data.push(item)

        setTimeout(() => {
          this.$refs.rcvCode.focus()
        }, 0)
      }
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Delete?',
          'Are you sure want to delete this data?')
      ) {
        const idx = this.gridDet.data.findIndex(i => i.rowId === item.rowId)
        this.gridDet.data.splice(idx, 1)

        // Calc price
        this.data.subTotal = _sumBy(this.gridDet.data, 'total')
        this.calcPrice(false)
      }
    },
    supCodeChange() {
      const supplier = this.suppliers.find(s => s.code === this.data.supCode)
      this.bindSupData(supplier)
    },
    rcvCodeChange(item) {
      const data_d = this.purRcvs.find(r => r.code.toLowerCase() === item.rcvCode.toLowerCase())
      if (data_d) {
        item.subTotal = data_d.subTotal
        item.finalDisc = data_d.finalDisc
        item.taxAmount = data_d.taxAmount
        item.dpp = data_d.dpp
        item.total = data_d.total
        if (item.state !== 'A') {
          item.state = 'M'
        }

        // Calc detail price
        // this.calcDetPrice(item)

        // Calc price
        this.data.subTotal = _sumBy(this.gridDet.data, 'total')
        this.calcPrice(false)
      }
    },
    calcDetPrice(item) {
      if (this.data.includeTax) {
        this.data.taxPercent = this.data.tax.rate
        item.taxAmount = Math.round((item.subTotal - item.finalDisc) - ((item.subTotal - item.finalDisc) / (1 + (this.data.tax.rate / 100))))
        item.dpp = (item.subTotal - item.finalDisc) - item.taxAmount
        item.total = item.subTotal + item.finalDisc
      } else {
        this.data.taxPercent = this.data.tax.rate
        item.taxAmount = Math.round((item.subTotal - item.finalDisc) * (this.data.tax.rate / 100))
        item.dpp = item.subTotal - item.finalDisc
        item.total = item.subTotal - item.finalDisc + item.taxAmount
      }

      this.data.subTotal = _sumBy(this.gridDet.data, 'total')
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
        this.data.taxAmount = Math.round((this.data.subTotal - this.data.finalDisc) - ((this.data.subTotal - this.data.finalDisc) / (1 + (this.data.tax.rate / 100))))
        this.data.dpp = (this.data.subTotal - this.data.finalDisc) - this.data.taxAmount
      } else {
        this.data.taxPercent = this.data.tax.rate
        this.data.taxAmount = Math.round((this.data.subTotal - this.data.finalDisc) * (this.data.tax.rate / 100))
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
        this.data.total = this.data.subTotal - this.data.finalDisc + this.data.fee
      } else {
        this.data.total = this.data.subTotal - this.data.finalDisc + this.data.taxAmount + this.data.fee
      }
    },
    showFindSupDialog() {
      this.$refs.findSup.open()
    },
    showFindPurcRcvDialog(item) {
      this.$refs.findPurcRcv.open(item)
    },
    bindSupData(item) {
      if (item) {
        this.data.supCode = item.code
        this.data.supName = item.name
        this.data.supAddr = item.address
        this.data.supPhone = item.phone1
        this.data.supFax = item.fax
        this.gridDet.data = []

        // Get purchase receive lists
        api.getAll(`${this.endpoint.purchase.receive}/uninv/${this.data.supCode}`)
          .then(response => {
            this.purRcvs = response.data
          })
      }
    },
    bindPurcRcvData(rowItem) {
      this.rcvCodeChange(rowItem)
    }
  }
}
</script>
