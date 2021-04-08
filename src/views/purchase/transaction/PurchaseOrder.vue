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
                :disabled="item.mark.toLowerCase() === 'v'"
                color="red"
                icon
                small
                @click="remove(item)"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Void</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.total`]="{ item }">
          {{ item.total | formatCurrency }}
        </template>
        <template v-slot:[`item.mark`]="{ item }">
          <v-badge
            :content="item.mark"
            :color="item.mark.toLowerCase() === 'v' ? 'error' : 'green'"
            inline
          ></v-badge>
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
          <v-toolbar-title>Purchase Order</v-toolbar-title>
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
                          v-model="data.code"
                          label="Order Code"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
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
                              :rules="rules.required"
                              :value="formatOrderDate"
                              label="Order Date"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
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
                          v-model="data.requestBy"
                          :items="employees"
                          :item-text="item => `${item.initial} - ${item.firstName}`"
                          :rules="rules.required"
                          label="Request By"
                          item-value="id"
                          class="mt-0"
                          required
                        ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="5">
                        <v-combobox
                          v-model="data.currCode"
                          :items="currencies"
                          :readonly="hasRelatedTrans"
                          :rules="rules.required"
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
                          :readonly="hasRelatedTrans"
                          :rules="rules.required"
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
                            :readonly="hasRelatedTrans"
                            :rules="rules.required"
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
                            :rules="rules.required"
                            label="Name"
                            class="mt-0"
                            readonly
                            required
                          >
                            <template v-slot:append-outer>
                              <v-btn
                                :disabled="hasRelatedTrans"
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
                            class="mt-0"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="data.includeTax"
                            :disabled="hasRelatedTrans"
                            label="Tax Included"
                            class="shrink mt-0"
                            @change="calcTax"
                          ></v-checkbox>
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
                              :readonly="hasRelatedTrans"
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
                              :readonly="hasRelatedTrans"
                              :rules="rules.required"
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
                          <template v-slot:[`item.notes`]="{ item }">
                            <v-text-field
                              v-model="item.notes"
                              class="text-body-2 mt-0"
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
                        :rules="rules.max256chars"
                        label="Notes"
                        counter="256"
                        class="mt-0"
                        rows="7"
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
                      <!-- <v-col cols="4">
                        <v-currency-field
                          v-model="data.taxPercent"
                          :allow-negative="false"
                          label="Tax Percent"
                          suffix="%"
                          class="text-right mt-0"
                          readonly
                        ></v-currency-field>
                      </v-col> -->
                      <!-- <v-col cols="8" class="pl-1"> -->
                        <v-currency-field
                          v-model="data.taxAmount"
                          :allow-negative="false"
                          label="Tax Amount"
                          class="text-right mt-0"
                          readonly
                        ></v-currency-field>
                      <!-- </v-col> -->
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
          </v-form>
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
import FindSupplier from '@/components/dialog/general/FindSupplier'
import FindItem from '@/components/dialog/inventory/FindItem'

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
      item: null,
      foot: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Code', value: 'code', divider: true, width: '150' },
        { text: 'Date', value: 'date', align: 'right', divider: true, width: '120' },
        { text: 'Request By', value: 'requestInitial', divider: true, width: '200' },
        { text: 'Supplier', value: 'supName', divider: true, width: '200' },
        { text: 'Curr.', value: 'currCode', divider: true, width: '90' },
        { text: 'Total', value: 'total', align: 'right', divider: true, width: '120' },
        { text: 'Status', value: 'mark', width: '50' }
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
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Item', value: 'itemId', divider: true, width: '120' },
        { text: 'Name', value: 'itemName', divider: true, width: '300' },
        { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
        { text: 'Unit', value: 'unitName', divider: true, width: '90' },
        { text: 'Unit Price', value: 'unitPrice', align: 'right', divider: true, width: '120' },
        { text: 'Disc', value: 'disc', align: 'right', divider: true, width: '120' },
        { text: 'Tax', value: 'taxAmount', align: 'right', divider: true, width: '120' },
        { text: 'Nett Price', value: 'nettPrice', align: 'right', divider: true, width: '120' },
        { text: 'Total Price', value: 'total', align: 'right', divider: true, width: '120' },
        { text: 'Description', value: 'notes', width: '200' }
      ],
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
    employees: [],
    currencies: [],
    suppliers: [],
    warehouses: [],
    taxes: [],
    items: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.getDefTaxIncSetting()
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
    formatOrderDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    hasRelatedTrans() {
      return (this.gridRelated?.data?.length > 0)
    },
    isVoid() {
      return (this.data?.mark?.toLowerCase() === 'v')
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        requestBy: null,
        currCode: 'IDR',
        rate: 1,
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        warehouseCode: null,
        notes: null,
        dpp: 0,
        subTotal: 0,
        finalDiscPercent: 0,
        finalDisc: 0,
        includeTax: this.defTaxInc,
        taxAmount: 0,
        total: 0
      }
      this.gridItem.data = []
      this.gridRelated.data = []
      this.tab.sup = 0
      this.tab.item = 0
      this.tab.foot = 0
      
      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }

      // Set default warehouse
      const defWarehouse = this.warehouses.find(w => w.isDefault === 1)
      if (defWarehouse) {
        this.data.warehouseCode = defWarehouse.code
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
      
      api.getAll(this.endpoint.purchase.order, {
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
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.defTaxInc = (response.data.tableData[0].value === '1')
        })
    },
    getPurchaserLists() {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'employee',
          fieldNames: 'id,initial,firstName',
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.employees = response.data.tableData
        })
    },
    getCurrLists() {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'currency',
          fieldNames: 'code',
          sorts: JSON.stringify([{
            field: 'sort',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.currencies = response.data.tableData
        })
    },
    getSupplierLists() {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'supplier',
          fieldNames: 'code,initial,name,address1,phone,fax',
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.suppliers = response.data.tableData
        })
    },
    getWarehouseLists() {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'warehouse',
          fieldNames: 'code,initial,name',
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.warehouses = response.data.tableData
        })
    },
    getTaxLists() {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'tax',
          fieldNames: 'id,initial,name,rate',
          filters: JSON.stringify([{
            field: 'typeId',
            operator: 'equal',
            keyword: 0
          }]),
          sorts: JSON.stringify([{
            field: 'seq',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.taxes = response.data.tableData
          this.data.tax = response.data.tableData[0]
        })
    },
    getItemLists() {
      api.getAll(this.endpoint.inventory.item.item, {
        // params: {
        //   param: 'item',
        //   fieldNames: 'id,initial,name,uomId,uomBuyId,buyPrice,purchaseTaxId',
        //   sorts: JSON.stringify([{
        //     field: 'initial',
        //     direction: 'asc'
        //   }]),
        //   includeMetaData: false
        // }
      })  
        .then(response => {
          this.items = response.data.tableData
        })
    },
    getUnitItemLists(item) {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'uomConversion',
          fieldNames: 'id,uomId,unitToConvert,unitEquivalent,conversion,isBaseUnit,seq',
          filters: JSON.stringify([{
            field: 'uomId',
            operator: 'equal',
            keyword: item.uomId
          }]),
          sorts: JSON.stringify([{
            field: 'seq',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
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
        // Set focus to order code field
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
      api.getAll(`${this.endpoint.purchase.order}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data.tableData
        })

      // Get related transaction details
      api.getAll(`${this.endpoint.purchase.order}/related-trans`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridRelated.data = response.data.tableData
        })

      // Set focus to order code field
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
        api.delete(this.endpoint.purchase.order, item.code)
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
      if (!this.$refs.form.validate()) return

      const data = this.data
      data.itemDetails = this.gridItem.data
      
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.purchase.order, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.purchase.order, data.code, data)
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
          code: this.data.code,
          itemId: null,
          itemName: null,
          qty: 0,
          length: null,
          width: null,
          height: null,
          weight: null,
          dimensionMeasurement: null,
          weightMeasurement: null,
          qtyRcv: 0,
          units: [],
          uomId: null,
          oldUnitId: null,
          oldUnitName: null,
          oldUnitPrice: 0,
          unitId: null,
          unitName: null,
          unitPrice: 0,
          disc: 0,
          taxId: null,
          taxAmount: 0,
          nettPrice: 0,
          total: 0,
          dpp: 0,
          totTax: 0,
          totDPP: 0,
          notes: null,
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
        const idx = this.gridItem.data.findIndex(i => i.rowId === item.rowId)
        this.gridItem.data.splice(idx, 1)

        this.calcPrice()
      }
    },
    supCodeChange() {
      const supplier = this.suppliers.find(s => s.code === this.data.supCode)
      if (supplier) {
        this.data.supName = supplier.name
        this.data.supAddr = supplier.address1
        this.data.supPhone = supplier.phone
        this.data.supFax = supplier.fax
      }
    },
    itemIdChange(item) {
      const data_i = this.items.find(i => i.id === item.itemId)
      if (data_i) {
        item.itemId = data_i.id
        item.itemName = data_i.name
        item.qty = 1
        item.length = data_i.length
        item.width = data_i.width
        item.height = data_i.height
        item.weight = data_i.weight
        item.dimensionMeasurement = data_i.dimensionMeasurement
        item.weightMeasurement = data_i.weightMeasurement
        item.qtyRcv = 0
        item.uomId = data_i.uomId
        item.oldUnitId = data_i.uomBuyId
        item.oldUnitName = data_i.uomBuyName
        item.oldUnitPrice = data_i.buyPrice
        item.unitId = data_i.uomBuyId
        item.unitName = data_i.uomBuyName
        item.unitPrice = data_i.buyPrice
        item.disc = 0
        item.taxId = data_i.purchaseTaxId
        item.taxAmount = 0
        item.nettPrice = data_i.buyPrice
        item.total = data_i.buyPrice
        item.dpp = data_i.buyPrice
        item.totTax = 0
        item.totDPP = data_i.buyPrice
        item.notes = null
        item.coaInventory = data_i.coaInventory
        item.coaCogs = data_i.coaCogs
        item.coaPurc = data_i.coaPurc
        item.coaPurcDisc = data_i.coaPurcDisc
        item.coaPurcReturn = data_i.coaPurcReturn
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
        const data = item.units.find(u => u.unitToConvert === unitCode && u.unitToConvert !== u.unitEquivalent)
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
    discPercentChange() {
      this.data.finalDisc = this.data.subTotal * (this.data.finalDiscPercent / 100)
      this.calcGrandTotal()
    },
    discChange() {
      this.data.finalDiscPercent = this.data.finalDisc / this.data.subTotal * 100
      this.calcGrandTotal()
    },
    calcTax() {
      for (let i = 0; i < this.gridItem.data.length; i++) {
        this.calcItemPrice(this.gridItem.data[i], false)
      }
      this.calcPrice()
      // if (this.data.includeTax) {
      //   this.data.taxAmount = (this.data.subTotal - this.data.finalDisc) - ((this.data.subTotal - this.data.finalDisc) / (1 + (this.data.tax.rate / 100)))
      //   this.data.dpp = (this.data.subTotal - this.data.finalDisc) - this.data.taxAmount
      // } else {
      //   this.data.taxAmount = (this.data.subTotal - this.data.finalDisc) * (this.data.tax.rate / 100)
      //   this.data.dpp = (this.data.subTotal - this.data.finalDisc)
      // }
    },
    calcPrice() {
      this.data.subTotal = _sumBy(this.gridItem.data, 'total')
      this.data.taxAmount = _sumBy(this.gridItem.data, 'totTax')
      this.data.dpp = _sumBy(this.gridItem.data, 'totDPP') - this.data.finalDisc
      this.calcGrandTotal()
    },
    calcGrandTotal() {
      // this.calcTax()
      if (this.data.includeTax) {
        this.data.total = this.data.subTotal - this.data.finalDisc
      } else {
        this.data.total = this.data.subTotal - this.data.finalDisc + this.data.taxAmount
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
      this.data.supAddr = item.address1
      this.data.supPhone = item.phone
      this.data.supFax = item.fax
    },
    bindItemData(rowItem) {
      this.itemIdChange(rowItem)
    }
  }
}
</script>
