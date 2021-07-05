<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Perintah
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="grid.search"
              append-icon="mdi-magnify"
              label="Cari..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList()"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="1">
            <export-excel title="Daftar Perintah Kunjungan" :grid="grid" :gridDefOpts="gridDefOpts"  ref="exportExcel"></export-excel>
          </v-col>
          <v-col cols="12" md="5" class="text-right">
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
                  :disabled="!auth.allowInsert"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Data Baru
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
            <span class="text-caption">Ubah</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :disabled="!auth.allowDelete || item.mark === 'CMP' || item.mark === 'V'"
                color="red"
                icon
                small
                @click="remove(item)"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Hapus</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
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
          <v-toolbar-title>Perintah Kunjungan</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="data.mark === 'CMP' || data.mark === 'V' || (data.action === 'edit' && !auth.allowUpdate)"
                  dark
                  text
                  @click="save(true)"
                  @shortkey="save(true)"

                >Simpan & Tutup</v-btn>
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
                  :disabled="data.mark === 'CMP' || data.mark === 'V' || (data.action === 'edit' && !auth.allowUpdate)"
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
                          Simpan
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
              <v-col cols="12">
                <v-card>
                  <v-card-title>Umum</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="Code"
                          v-model="data.code"
                          label="No. Perintah Kunjungan"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.visitDate"
                          :close-on-content-click="false"
                          :disabled="data.mark === 'CMP' || data.mark === 'V'"
                          transition="scale-transition"
                          min-width="290px"
                          offset-y                          
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              ref="date"
                              v-bind="attrs"
                              v-on="on"
                              :rules="rules.required"
                              :value="formatVisitDate"
                              :readonly="data.mark === 'CMP' || data.mark === 'V'"
                              label="Tanggal"
                              class="mt-0"
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
                            :disabled="data.mark === 'CMP' || data.mark === 'V'"
                            no-title
                            scrollable
                            @change="menu.visitDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.aliases"
                          :readonly="data.mark === 'CMP' || data.mark === 'V'"
                          :rules="rules.required"
                          label="ID Penjual"
                          class="mt-0"
                          required
                        >
                          <template v-slot:append>
                            <v-btn
                              color="primary"
                              :disabled="data.mark === 'CMP' || data.mark === 'V'"
                              icon
                              small
                              @click="showFindSalesDialog"
                            >
                              <v-icon>
                                mdi-shopping-search
                              </v-icon>
                            </v-btn>
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          ref="Source"
                          v-model="data.sourceTransaction"
                          label="Sumber Transaksi"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="IDGroup"
                          v-model="employee.groupAliases"
                          label="ID Grup"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          ref="VisitPlanCode"
                          v-model="data.visitPlanCode"
                          label="Sumber Dokumen"
                          class="mt-0"
                          readonly
                        ></v-text-field>
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
                    <v-tab key="customer">Pelanggan</v-tab>
                    <v-tab key="invoice">Faktur</v-tab>
                    <v-tab key="notes">Catatan</v-tab>

                    <v-tab-item
                      key="customer"
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
                                :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                class="blue--text"
                                small
                                tile
                                @click="addItem"
                                @shortkey="addItem"
                              >
                                <v-icon left>mdi-plus</v-icon>
                                Tambah
                              </v-btn>
                            </template>
                            <span class="text-caption">(Ctrl + I)</span>
                          </v-tooltip>
                        </v-app-bar>

                        <v-card-text>
                          <template>
                            <v-row no-gutters>
                              <v-col cols="12">
                                <v-data-table
                                  :headers="gridCustomer.columns"
                                  :items="gridCustomer.data"
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
                                          :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                          color="red"
                                          icon
                                          small
                                          @click="removeItem(item)"
                                        >
                                          <v-icon small>mdi-close-thick</v-icon>
                                        </v-btn>
                                      </template>
                                      <span class="text-caption">Hapus</span>
                                    </v-tooltip>
                                  </template>    
                                  <template v-slot:[`item.custCode`]="{ item }">
                                    <v-autocomplete
                                      ref="CustomerCode"
                                      v-model="item.custCode"
                                      :items="items"
                                      :readonly="data.mark === 'CMP' || data.mark === 'V'"
                                      :rules="rules.required"
                                      item-text="initial"
                                      item-value="code"
                                      class="text-body-2 mt-0"
                                      dense
                                      required
                                      @change="custCodeChange(item)"
                                    >
                                      <template v-slot:append>
                                        <v-btn
                                          :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                          color="primary"
                                          icon
                                          x-small
                                          @click="showFindCustomerDialog(item)"
                                        >
                                          <v-icon>
                                            mdi-settings-helper
                                          </v-icon>
                                        </v-btn>
                                      </template>
                                    </v-autocomplete>
                                  </template>
                                  <template v-slot:[`item.replacemanName`]="{ item }">
                                    <v-text-field
                                      ref="ReplacemanName"
                                      v-model="item.replacemanName"
                                      class="text-body-2 mt-0"
                                      readonly
                                      dense
                                    >
                                      <template v-slot:append>
                                        <v-btn
                                          :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                          color="primary"
                                          icon
                                          x-small
                                          @click="showFindReplacemanDialog(item)"
                                        >
                                          <v-icon>
                                            mdi-settings-helper
                                          </v-icon>
                                        </v-btn>
                                      </template>
                                    </v-text-field>
                                  </template>
                                  <template v-slot:[`item.visited`]="{ item }">
                                    <v-checkbox
                                      ref="chkVisited"
                                      v-model="item.visited"
                                      :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                      class="align-center justify-center"
                                      dense
                                    ></v-checkbox>
                                  </template>                           
                                </v-data-table>
                              </v-col>
                            </v-row>
                          </template>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="invoice"
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
                                v-shortkey="['ctrl', 'alt', 'i']"
                                :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                class="blue--text"
                                small
                                tile
                                @click="addItemInvoice"
                                @shortkey="addItemInvoice"
                              >
                                <v-icon left>mdi-plus</v-icon>
                                Tambah
                              </v-btn>
                            </template>
                            <span class="text-caption">(Ctrl + Alt + I)</span>
                          </v-tooltip>
                        </v-app-bar>

                        <v-card-text>
                          <template>
                            <v-row no-gutters>
                              <v-col cols="12">
                                <v-data-table
                                  :headers="gridInvoice.columns"
                                  :items="gridInvoice.data"
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
                                          :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                          color="red"
                                          icon
                                          small
                                          @click="removeItemInvoice(item)"
                                        >
                                          <v-icon small>mdi-close-thick</v-icon>
                                        </v-btn>
                                      </template>
                                      <span class="text-caption">Hapus</span>
                                    </v-tooltip>
                                  </template> 
                                  <template v-slot:[`item.failCollect`]="{ item }">
                                    <v-checkbox
                                      ref="chkFailCollect"
                                      v-model="item.failCollect"
                                      :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                      class="align-center justify-center"
                                      dense
                                    ></v-checkbox>
                                  </template>
                                  <template v-slot:[`item.invCode`]="{ item }">
                                    <v-autocomplete
                                      ref="InvoiceCode"
                                      v-model="item.invCode"
                                      :items="itemInvoice"
                                      :readonly="data.mark === 'CMP' || data.mark === 'V'"
                                      :rules="rules.required"
                                      item-text="code"
                                      item-value="code"
                                      class="text-body-2 mt-0"
                                      dense
                                      required
                                      @change="invCodeChange(item)"
                                    >
                                      <template v-slot:append>
                                        <v-btn
                                          :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                          color="primary"
                                          icon
                                          x-small
                                          @click="showFindInvoiceDialog(item)"
                                        >
                                          <v-icon>
                                            mdi-settings-helper
                                          </v-icon>
                                        </v-btn>
                                      </template>
                                    </v-autocomplete>
                                  </template>
                                  <template v-slot:[`item.transactionDate`]="{ item }">
                                    {{ item.transactionDate | formatDate('dd-MMM-yyyy') }}
                                  </template>
                                  <template v-slot:[`item.invoiceDueDate`]="{ item }">
                                    {{ item.invoiceDueDate | formatDate('dd-MMM-yyyy') }}
                                  </template>     
                                  <template v-slot:[`item.total`]="{ item }">
                                    {{ item.total | formatCurrency }}
                                  </template>   
                                  <template v-slot:[`item.notesFailCollect`]="{ item }">
                                    <v-text-field
                                      ref="NotesFailCollect"
                                      v-model="item.notesFailCollect"
                                      :readonly="data.mark === 'CMP' || data.mark === 'V'"
                                      class="text-body-2 mt-0"
                                      dense
                                    ></v-text-field>
                                  </template>                 
                                </v-data-table>
                              </v-col>
                            </v-row>
                          </template>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="notes"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-textarea
                            v-model="data.notes"
                            :rules="rules.max256chars"
                            :readonly="data.mark === 'CMP' || data.mark === 'V'"
                            label="Catatan"
                            counter="256"
                            class="mt-0"
                            rows="7"
                          ></v-textarea>
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
    <find-salesman
      ref="findSalesman"
      @dblclick:row="bindSalesman"
    ></find-salesman>
    <find-salesman
      ref="findReplaceman"
      @dblclick:row="bindReplaceman"
    ></find-salesman>
    <find-customer
      ref="findCustomer"
      @dblclick:row="bindCustomer"
    ></find-customer>
    <find-invoice
      ref="findInvoice"
      @dblclick:row="bindInvoice"
    ></find-invoice>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'
import { randomNumber } from '@/helpers/math-helpers'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import FindSalesman from '@/components/dialog/sales/FindSalesman'
import FindCustomer from '@/components/dialog/sales/FindCustomerVO'
import FindInvoice from '@/components/dialog/sales/FindInvoiceVO'

export default {
  components: {
    ExportExcel,
    Confirm,
    FindSalesman,
    FindCustomer,
    FindInvoice
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      visitDate: false
    },
    tab: {
      advancedItem: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'No. Perintah Kunjungan', value: 'code', divider: true, width: '110', excelColWidth:'10' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'30' },
        { text: 'ID Penjual', value: 'salesmanInitial', divider: true, width: '130', excelColWidth:'30' },
        { text: 'Nama Penjual', value: 'salesmanName', divider: true, width: '200', excelColWidth:'30' },
        { text: 'ID Grup', value: 'groupInitial', divider: true, width: '90', excelColWidth:'10' },
        { text: 'Nama Grup', value: 'groupName', divider: true, width: '150', excelColWidth:'18' },
        { text: 'No. Sumber Dokumen', value: 'visitPlanCode', divider: true, width: '60', excelColWidth:'10' },
        { text: 'Sumber Transaksi', value: 'sourceTransaction', divider: true, width: '150', excelColWidth:'18' },
        { text: 'Status', value: 'status', width: '50', excelColWidth:'10' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridCustomer: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '30' },
        { text: 'ID Pelanggan', value: 'custCode', divider: true, width: '110'  },
        { text: 'Nama', value: 'customerName', divider: true, width: '120' },
        { text: 'Alamat', value: 'address', divider: true, width: '200' },
        { text: 'Wilayah', value: 'areaName1', divider: true, width: '120' },
        { text: 'Pengganti', value: 'replacemanName', divider: true, width: '120' },
        { text: 'Terkunjungi', value: 'visited', divider: true, width: '30'}
      ],
      data: [],
      options: {
        sortBy: ['id'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridInvoice: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '30' },
        { text: 'Gagal Tagih', value: 'failCollect', divider: true, width: '60'  },
        { text: 'No. Faktur', value: 'invCode', divider: true, width: '120' },
        { text: 'Nama Pelanggan', value: 'customerName', divider: true, width: '150' },
        { text: 'Tanggal Transaksi', value: 'transactionDate', align: 'right', divider: true, width: '110' },
        { text: 'Tanggal Jatuh Tempo', value: 'invoiceDueDate', align: 'right', divider: true, width: '110' },
        { text: 'Nilai', value: 'total', align: 'right', divider: true, width: '150' },
        { text: 'Alasan Gagal Tagih', value: 'notesFailCollect', divider: true, width: '150' }
      ],
      data: [],
      options: {
        sortBy: ['id'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    areaReference: [],
    employee: [],
    employeeRef: [],
    itemInvoice: [],
    items: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.getArea()
    auth.getAction(this.endpoint, this.menuId.item, [this.action.insert, this.action.update, this.action.delete])
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Penjualan'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Perintah Kunjungan'
      }])
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
      endpoint: state => state.api.endpoint,
      auth: state => state.api.authorization,
      action: state => state.api.action,
      menuId: state => state.api.menus
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    isActive() {
      return (this.data?.IsActive?.IsActive === true)
    },
    formatVisitDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        code: '',
        date: null,
        salesmanId: null,
        visitPlanCode: null,
        notes: null,
        salesmanInitial: null,
        salesmanName: null,
        groupInitial: null,
        groupName: null,
        sourceTransaction: null,
        status: null,
        createdInitial: null,
        updatedInitial: null,
        approvedInitial: null
      }
      this.employee = []
      this.gridCustomer.data = []
      this.gridInvoice.data = []
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

      api.getAll(this.endpoint.sales.visitOrder, {
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
    close() {
      this.dialog.add = false
    },
    async add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'  
      this.data.sourceTransaction = 'Manual'  

      await this.getCustomer()
      await this.getInvoice()

      setTimeout(() => {
        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    async edit(item) {
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        createdDate: format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      await this.getCustomer()
      await this.getInvoice()

      this.loadEmployee()
      this.loadCustomer()
      this.loadInvoice()

      // Set focus to receive code field
      setTimeout(() => {
        this.$refs.date.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus Data?',
          'Apakah anda yakin untuk menghapus data ini?')
      ) {
        api.delete(this.endpoint.sales.visitOrder, item.code)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async save(closeDialog) {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Silahkan periksa kembali data yang wajib diisi.')
        return
      }

      const data = this.data
      data.customerDetails = this.gridCustomer.data
      data.invoiceDetails = this.gridInvoice.data
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.visitOrder, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.visitOrder, data.id, data)
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
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridCustomer.data.findIndex(i => i.id === item.id)
        this.gridCustomer.data.splice(idx, 1)
      }
    },
    async removeItemInvoice(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridInvoice.data.findIndex(i => i.id === item.id)
        this.gridInvoice.data.splice(idx, 1)
      }
    },
    salesCodeChange() {
      console.log('salesCodeChange')
    },
    showFindSalesDialog() {
      this.$refs.findSalesman.open()
    },
    showFindReplacemanDialog() {
      this.$refs.findReplaceman.open()
    },
    showFindCustomerDialog(item) {
      this.$refs.findCustomer.open(item)
    },
    showFindInvoiceDialog(item) {
      this.$refs.findInvoice.open(item)
    },
    bindSalesman(item) {
      this.data.salesmanId = item.id

      this.employee = {
        ...item,
        aliases: `${item.initial} - ${item.fullName}`,
        groupAliases: `${item.groupInitial} - ${item.groupName}`
      }
    },
    bindReplaceman() {

    },
    bindCustomer(rowItem) {
      this.custCodeChange(rowItem)
    },
    bindInvoice(rowItem) {
      this.invCodeChange(rowItem)
    },
    addItem() {
      if (this.gridCustomer.data.length === 0 || (this.gridCustomer.data.slice(-1)[0]?.custCode ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          custCode: null,
          replacingForSalesmanId: null,
          visited: null,
          customerInitial: null,
          customerName: null,
          address: null,
          areaName1: null,
          areaName2: null,
          replacemanInitial: null,
          replacemanName: null,
          state: 'A'
        }
        this.gridCustomer.data.push(item)
      }
    },
    custCodeChange(item) {
      const gdItem = this.gridCustomer.data.find(x => x.custCode === item.custCode && x.id !== item.id)
      if (gdItem) {
        this.$store.dispatch('app/showInfo', 'Data Pelanggan sudah tersedia, hanya data pertama yang akan disimpan.')
      }

      const data_i = this.items.find(i => i.code === item.custCode)
      if (data_i) {
        item.custCode = data_i.code
        item.replacingForSalesmanId = data_i.replacingForSalesmanId
        item.visited = data_i.visited
        item.customerInitial = data_i.initial
        item.customerName = data_i.name
        item.address = data_i.address1
        item.areaName1 = this.getAreaName(data_i.areaId1 === null ? 0 : data_i.areaId1)
        item.areaName2 = this.getAreaName(data_i.areaId2 === null ? 0 : data_i.areaId2)
        item.replacemanInitial = data_i.replacemanInitial
        item.replacemanName = data_i.replacemanName
        if (item.state !== 'A') {
          item.state = 'M'
        }
      }
    },
    addItemInvoice() {
      if (this.gridInvoice.data.length === 0 || (this.gridInvoice.data.slice(-1)[0]?.invCode ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          invCode: null,
          failCollect: null,
          notesFailCollect: null,
          customerName: null,
          transactionDate: null,
          invoiceDueDate: null,
          salesName: null,
          total: 0,
          state: 'A'
        }
        this.gridInvoice.data.push(item)
      }
    },
    invCodeChange(item) {      
      const gdItem = this.gridInvoice.data.find(x => x.invCode === item.invCode && x.id !== item.id)
      if (gdItem) {
        this.$store.dispatch('app/showInfo', 'Data Invoice sudah tersedia, hanya data pertama yang akan disimpan.')
      }

      const data_i = this.itemInvoice.find(i => i.code === item.invCode)
      if (data_i) {
        item.invCode = data_i.code
        item.failCollect = data_i.failCollect
        item.notesFailCollect = data_i.notesFailCollect
        item.customerName = data_i.custName
        item.transactionDate = data_i.date
        item.invoiceDueDate = data_i.dueDate
        item.salesName = data_i.salesName
        item.total = data_i.total
        if (item.state !== 'A') {
          item.state = 'M'
        }
      }
    },
    getCustomer() {
      return api.getAll(`${this.endpoint.general.customer.customer}/lists`, {
        params: { 
          filters: JSON.stringify([{
            field: 'isactive',
            operator: 'eq',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: 'name',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.items = response.data.tableData
        })
    },
    getInvoice() {
      return api.getAll(this.endpoint.sales.invoice, {
        params: { 
          filters: JSON.stringify([{
            field: 'mark',
            operator: 'eq',
            keyword: 'A'
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.itemInvoice = response.data.tableData
        })
    },
    loadEmployee() {
      api.getAll(this.endpoint.general.employee, {
        params: {
          filters: JSON.stringify([{
            field: 'id',
            operator: 'eq',
            keyword: this.data.salesmanId
          }]),
          sorts: JSON.stringify([{
            field: 'id',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.employee = response.data.tableData
          this.fillAliases(this.employee)
        })
    },
    fillAliases(item) {
      if (item.length) {
        this.$set(item, 'aliases', `${item[0].initial} - ${item[0].fullName}`)
        this.$set(item, 'groupAliases', `${item[0].groupInitial} - ${item[0].groupName}`)
      }
    },
    loadCustomer() {
      api.getAll(`${this.endpoint.sales.visitOrder}/visit-order-customer`, {
        params: { code: this.data.code }
      })
        .then(response => {
          this.gridCustomer.data = response.data.tableData
        })
    },
    loadInvoice() {
      api.getAll(`${this.endpoint.sales.visitOrder}/visit-order-invoice`, {
        params: { code: this.data.code }
      })
        .then(response => {
          this.gridInvoice.data = response.data.tableData
        })
    },
    getArea() {
      api.getAll(`${this.endpoint.sales.area}/lists`, {})
        .then(response => {
          this.areaReference = response.data.tableData
        })
    },
    getAreaName(id) {
      const item = this.areaReference.find(x => x.id === id)

      if (item) {
        return item.name
      } else {
        return ''
      }
    },
    async exportExcel() {
      this.exportExcel.export()
    }
  }
}
</script>
