<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="3">
            Promo
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model.trim="grid.search"
              append-icon="mdi-magnify"
              label="Cari..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList()"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
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
                :disabled="item.mark.toUpperCase() !== 'A' || !auth.allowVoid"
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
        <template v-slot:[`item.startDate`]="{ item }">
          {{ item.startDate | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.endDate`]="{ item }">
          {{ item.endDate | formatDate('dd-MMM-yyyy') }}
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
          <v-toolbar-title>Promo</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="isVoid || (data.action === 'edit' && !auth.allowUpdate)"
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
                  :disabled="isVoid || (data.action === 'edit' && !auth.allowUpdate)"
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
              <v-col cols="12" md="4">
                <v-card>
                  <v-card-title>Umum</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="code"
                          v-model.trim="data.code"                          
                          label="Id Promo"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          v-model="data.name"
                          :rules="[rules.required[0], rules.max50chars[0]]"
                          :counter="50"
                          label="Nama Promo"
                          class="mt-0"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    
                    <v-row no-gutters>
                       <v-col cols="12" md="6">
                        <v-menu
                          v-model="menu.startDate"
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
                              :value="formatStartDate"
                              label="Tanggal Mulai"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.startDate"
                            no-title
                            scrollable
                            @change="menu.startDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.endDate"
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
                              :value="formatEndDate"
                              label="Tanggal Akhir"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.endDate"
                            no-title
                            scrollable
                            @change="menu.endDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.notes">
                    <v-tab key="account">Akun</v-tab>
                    <v-tab key="user">Pengguna</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.notes" class="pa-2">
                    <v-tab-item
                      key="account"
                      transition="false"
                      eager
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.coaCost"
                            :items="accounts"
                            :item-text="item => `${item.code} - ${item.name}`"
                            :rules="rules.required"
                            item-value="code"
                            label="Akun Alokasi Biaya"
                            class="mt-0"                            
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                    </v-tab-item>

                    <v-tab-item
                      key="user"
                      transition="false"
                      eager
                    >
                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.createdInitial"
                            label="Dibuat Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.createdDate"
                            label="Tanggal Dibuat"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.updatedInitial"
                            label="Diperbarui Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.updatedDate"
                            label="Tanggal Diperbarui"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.approvedInitial"
                            label="Disetujui Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.approvedDate"
                            label="Tanggal Disetujui"
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
                    <v-tab key="detail">Detail</v-tab>
                  
                    <v-tab-item
                      key="detail"
                      transition="false"
                    >
                      <v-card>
                        <v-row dense>
                          <v-col cols="12">
                            <v-app-bar dense flat>
                              <v-spacer></v-spacer>
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    v-bind="attrs"
                                    v-on="on"
                                    v-shortkey="['ctrl', 'i']"
                                    :disabled="isVoid"
                                    class="blue--text"
                                    small
                                    tile
                                    @click="addDetail"
                                    @shortkey="addDetail"
                                  >
                                    <v-icon left>mdi-plus</v-icon>
                                    Tambah
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
                                      :disabled="isVoid"
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
                              <template v-slot:[`item.applyTo`]="{ item }">
                                <v-autocomplete
                                  ref="applyTo"
                                  v-model="item.applyTo"
                                  :items="applyTo"
                                  :rules="rules.required"
                                  item-text="name"
                                  item-value="id"
                                  class="mt-0"
                                  dense
                                  required
                                  @change="applyToChange(item)"
                                >
                                </v-autocomplete>
                              </template>
                              <template v-slot:[`item.itemId`]="{ item }">
                                <v-autocomplete
                                v-model="item.itemId"
                                :items="item.applyTo === 1 ? items : itemCategories"
                                :rules="item.applyTo === 2 ? [] : rules.required"
                                item-text="initial"
                                item-value="id"
                                :disabled="item.applyTo === 2 || item.applyTo === null"
                                class="text-body-2 mt-0"
                                dense
                                @change="itemIdChange(item)"
                              >
                                  <template v-if="item.applyTo === 1" v-slot:append>
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
                              <template v-slot:[`item.promoType`]="{ item }">
                                <v-autocomplete
                                  v-model="item.promoType"
                                  :items="item.promoTypes"
                                  :rules="rules.required"
                                  :disabled="item.applyTo === null"
                                  item-text="name"
                                  item-value="id"
                                  class="mt-0"
                                  dense
                                  @change="clearPromoTier(item)"
                                >
                                </v-autocomplete>
                              </template>
                              <template v-slot:[`item.valuePercentage`]="{ item }">
                                <v-currency-field
                                  v-model="item.valuePercentage"
                                  :decimal-length="2"
                                  :min="0"
                                  :disabled="item.promoType !== 1"
                                  class="text-body-2 text-right mt-0"
                                  dense
                                  @change="changeValuePercentage(item)"
                                ></v-currency-field>
                              </template>
                              <template v-slot:[`item.valueAmount`]="{ item }">
                                <v-currency-field
                                  v-model="item.valueAmount"
                                  :decimal-length="2"
                                  :min="0"
                                  :disabled="item.promoType !== 1"
                                  class="text-body-2 text-right mt-0"
                                  dense
                                  @change="changeValueAmount(item)"
                                ></v-currency-field>
                              </template>
                              <template v-slot:[`item.tier`]="{ item }">
                                <v-tooltip bottom>
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      v-bind="attrs"
                                      v-on="on"
                                      :disabled="item.promoType === 1 || item.promoType === 0"
                                      color="blue"
                                      icon
                                      x-small
                                      @click="showPromoTierDialog(item)"
                                    >
                                      <v-icon small>mdi-dots-horizontal</v-icon>
                                    </v-btn>
                                  </template>
                                  <span class="text-caption">Jenjang</span>
                                </v-tooltip>
                              </template>
                            </v-data-table>
                          </v-col>
                        </v-row>
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
    <promo-tier
      ref="promoTier"
    ></promo-tier>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import Confirm from '@/components/dialog/Confirm'
import FindItem from '@/components/dialog/inventory/FindItem'
import PromoTier from '@/components/dialog/sales/PromoTier'

export default {
  components: {
    Confirm,
    FindItem,
    PromoTier
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      startDate: false,
      endDate: false
    },
    tab: {
      item: null,
      notes: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Id Promo', value: 'code', divider: true, width: '100' },
        { text: 'Nama Promo', value: 'name', divider: true, width: '100' },
        { text: 'Tanggal Mulai', value: 'startDate', align: 'right', divider: true, width: '100' },
        { text: 'Tanggal Akhir', value: 'endDate', align: 'right', divider: true, width: '100' },
        { text: 'Status', value: 'status', divider: true, width: '100' }
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
        { value: 'action', sortable: false, divider: true, width: '50' },
        { text: 'Terapkan Ke', value: 'applyTo', divider: true, width: '130' },
        { text: 'Barang / Kategori Barang', value: 'itemId', divider: true, width: '100' },
        { text: 'Nama', value: 'itemName', divider: true, width: '120' },
        { text: 'Tipe Promo', value: 'promoType', divider: true, width: '120' },
        { text: 'Promo (%)', value: 'valuePercentage', align: 'right', divider: true, width: '90' },
        { text: 'Promo (Nilai) Dalam Satuan Terkecil', value: 'valueAmount', align: 'right', divider: true, width: '90' },
        { text: 'Jenjang', value: 'tier', align: 'center', divider: true, width: '100' }
      ],
      data: []
    },  
    accounts: [],
    applyTo: [{ id: 1, name: 'Barang' }, { id: 2, name: 'Faktur' }, { id: 3, name: 'Kategori Barang' }],
    data: {},
    items: [],
    itemCategories: [],
    listCode: [],
    suppliers: [],
    valid: false
  }),

  created: function () {
    this.getList()
    this.getAccountLists()
    this.getItemLists()
    this.getItemCategoryLists()
    auth.getAction(this.endpoint, this.menuId.promo, [this.action.insert, this.action.update, this.action.void])
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
        text: 'Promo'
      }])
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
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
    formatStartDate() {
      return this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
    },
    formatEndDate() {
      return this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
    },
    isVoid() {
      return (this.data?.mark?.toUpperCase() === 'V')
    }
  },

  watch: {
    'grid.options': {
      handler() {
        this.getList()
      },
      deep: true
    }
  },
  
  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        name: null,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        coaCost: null,
        mark: null,
        createdBy: 0,
        createdDate: format(new Date(), 'yyyy-MM-dd'),
        updatedBy: 0,
        updatedDate: format(new Date(), 'yyyy-MM-dd'),
        approvedBy: 0,
        approvedDate: format(new Date(), 'yyyy-MM-dd')
      }
      this.gridItem.data = []
      this.tab.notes = 0
      this.tab.item = 0

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

      api.getAll(this.endpoint.sales.promo, {
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
    getAccountLists() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          // filters: JSON.stringify([{
          //   field: 'type',
          //   operator: 'eq',
          //   keyword: 3
          // }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.accounts = response.data.tableData
        })
    },
    getItemLists() {
      api.getAll(this.endpoint.inventory.item.item)  
        .then(response => {
          this.items = response.data.tableData
        })
    },
    getItemCategoryLists() {
      api.getAll(`${this.endpoint.inventory.item.category}/lists`)  
        .then(response => {
          this.itemCategories = response.data.tableData
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
        mark: item.status === 'Void' ? 'V' : 'A',
        createdDate: format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss'),
        approvedDate: format(parseISO(item.approvedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get item details
      api.getAll(`${this.endpoint.sales.promo}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data.tableData
          for (let i = 0; i < this.gridItem.data.length; i++) {
            this.itemIdChange(this.gridItem.data[i])
            this.gridItem.data[i].overBudgetAction = this.gridItem.data[i].overBudgetAction.toString()
            this.gridItem.data[i].promoTypes = this.gridItem.data[i].applyTo === 2 ? [{ id: 5, name: 'Nilai Trans. Penj.' }, { id: 4, name: 'Term Pembayaran' }] : [{ id: 1, name: 'Reguler' }, { id: 2, name: 'Qty Barang' }, { id: 3, name: 'Bonus' }, { id: 4, name: 'Term Pembayaran' }]
          }
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
        api.delete(this.endpoint.sales.promo, item.code)
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
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = this.data
      data.itemDetails = this.gridItem.data
      

      if (data.itemDetails.length === 0) {
        this.$store.dispatch('app/showInfo', 'Detil tidak boleh kosong.')
        return
      }

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.promo, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.promo, data.code, data)
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
    addDetail() {
      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0]?.applyTo ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          applyTo: null,
          itemId: null,
          itemName: null,
          promoType: 0,
          isPercentage: false,
          valuePercentage: 0,
          valueAmount: 0,
          isPromoWithBudget: false,
          budgetMaximumValue: 0,
          overBudgetAction: null,
          promoTierList: []
        }
        this.gridItem.data.push(item)

        setTimeout(() => {
          this.$refs.applyTo.focus()
        }, 0)
      }
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridItem.data.findIndex(i => i.id === item.id)
        this.gridItem.data.splice(idx, 1)
      }
    },
    showFindItemDialog(item) {
      this.$refs.findItem.open(item)
    },
    showPromoTierDialog(item) {
      this.$refs.promoTier.open(item, this.items)
    },
    applyToChange(item) {
      item.itemId = null
      item.itemName = null
      item.promoType = 0
      item.valuePercentage = 0
      item.valueAmount = 0
      if (item.applyTo === 2) {
        item.promoTypes = [{ id: 5, name: 'Nilai Trans. Penj.' }, { id: 4, name: 'Term Pembayaran' }]
      } else {
        item.promoTypes = [{ id: 1, name: 'Reguler' }, { id: 2, name: 'Qty Barang' }, { id: 3, name: 'Bonus' }, { id: 4, name: 'Term Pembayaran' }]
      }
    },
    itemIdChange(item) {
      let data_i = item
      if (item.applyTo === 1) {
        data_i = this.items.find(i => i.id === item.itemId)
        item.itemName = data_i.name
      } else if (item.applyTo === 3) {
        data_i = this.itemCategories.find(i => i.id === item.itemId)
        item.itemName = data_i.name
      }
    },
    clearPromoTier(item) {
      item.promoMethod = 0
      item.isPercentage = false
      item.saleUnit = null
      item.applyToAllUnit = false
      item.freeGoodItemId = null
      item.freeItemName = null
      item.unitFreeGood = null
      item.isMultiple = false
      item.promoTierList = []
      item.isPromoWithBudget = false
      item.budgetMaximumValue = 0
      item.overBudgetAction = 1
    },
    bindItemData(rowItem) {
      this.itemIdChange(rowItem)
    },
    changeValuePercentage(item) {
      item.isPercentage = true
      item.valueAmount = 0
      if (item.valuePercentage > 100) {
        item.valuePercentage = 100
      }
    },
    changeValueAmount(item) { 
      item.isPercentage = false
      item.valuePercentage = 0
    }
  }
}
</script>