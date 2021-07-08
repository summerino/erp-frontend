<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Pelanggan
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
            <export-excel title="Daftar Pelanggan" :grid="grid" :gridDefOpts="gridDefOpts" ref="exportExcel"></export-excel>
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
                icon
                small
                color="orange lighten-1"
                @click="edit(item)"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Ubah</span>
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
                :disabled="!auth.allowDelete"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <span>Hapus</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.isActive`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon 
                v-bind="attrs" 
                v-on="on" 
                :color="item.isActive === true ? 'green' : 'red'"
              >
                {{ item.isActive === true ? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline' }}
              </v-icon>
            </template>
            <span class="text-caption">
                {{ item.isActive === true ? 'Aktif' : 'Nonaktif' }}
            </span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.creditLimit`]="{ item }">
          {{ item.creditLimit | formatCurrency }}
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else :style="{ background: $vuetify.theme.themes[theme].surface }">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <span>{{ data.action === 'add' ? 'Tambah' : 'Ubah' }} Pelanggan</span>
          </v-col>
          <v-col cols="12" md="8" class="text-right">
            <label
              v-if="data.action == 'edit'"
              class="text-caption mr-1"
            >
              Tanggal Diperbarui: {{ data.updatedDate }} oleh {{ data.updatedInitial }}
            </label>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 's']"
                  color="blue darken-2"
                  class="font-weight-regular"
                  :disabled="data.action === 'edit' && !auth.allowUpdate"
                  dark
                  small
                  tile
                  @click="save"
                  @shortkey="save"
                >
                  <v-icon left>
                    mdi-content-save
                  </v-icon>
                  Simpan
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + S)</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['esc']"
                  class="font-weight-regular ml-1"
                  small
                  tile
                  @click="back"
                  @shortkey="back"
                >
                  <v-icon left>
                    mdi-undo-variant
                  </v-icon>
                  Kembali
                </v-btn>
              </template>
              <span class="text-caption">(Esc)</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
        >
          <v-card>
            <v-container fluid grid-list-md>
              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-text-field
                    v-model="data.code"
                    label="Kode"
                    class="mt-0"
                    readonly
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-text-field
                    ref="initial"
                    v-model="data.initial"
                    :rules="[rules.required[0], rules.max20chars[0]]"
                    :counter="20"
                    label="Inisial"
                    class="mt-0"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-text-field
                    v-model="data.name"
                    :rules="[rules.required[0], rules.max50chars[0]]"
                    :counter="50"
                    label="Nama"
                    class="mt-0"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-autocomplete
                    v-model="data.typeId"
                    :items="types"
                    :item-text="item => `${item.initial} - ${item.name}`"
                    :rules="rules.required"
                    label="Tipe"
                    item-value="id"
                    class="mt-0"
                    required
                  ></v-autocomplete>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-text-field
                    v-model="data.email"
                    :rules="[rules.required[0], rules.email[0], rules.max50chars[0]]"
                    :counter="50"
                    class="mt-0"
                    label="Email"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-text-field
                    v-model="data.website"
                    :rules="rules.max50chars"
                    :counter="50"
                    label="Website"
                    class="mt-0"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-autocomplete
                  v-model="data.paymentTermId"
                  :items="paymentTerms"
                  :item-text="item => `${item.initial} - ${item.name}`"
                  :rules="rules.required"
                  label="Pembayaran"
                  item-value="id"
                  class="mt-0"
                  >
                  </v-autocomplete>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-currency-field
                    v-model="data.creditLimit"
                    :decimal-length="0"
                    class="mt-0"
                    label="Batas Kredit"
                  ></v-currency-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-text-field
                    v-model="data.refNo"
                    :rules="rules.max30chars"
                    :counter="30"
                    class="mt-0"
                    label="No. Ref."
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-text-field
                    v-model="data.notes"
                    :rules="rules.max256chars"
                    :counter="256"
                    class="mt-0"
                    label="Catatan"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12" md="6" class="pr-md-3">
                  <v-checkbox
                    v-model="data.isActive"
                    label="Aktif"
                  ></v-checkbox>
                </v-col>
                <v-col cols="12" md="6" class="pl-md-3">
                  <v-checkbox
                    v-model="data.isConsignee"
                    label="Menerima titipan barang (Konsinyasi)"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
          <br/>
          <v-card>
            <v-tabs v-model="tab.advancedItem">
              <v-tab key="address">Alamat</v-tab>
              <v-tab key="area">Wilayah</v-tab>
              <v-tab key="default" @click="bindAddress">Default</v-tab>
              <v-tab-item
                key="address"
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
                          :disabled="data.isActive === false || ((data.action === 'edit' && !auth.allowUpdate) && !auth.allowInsert)"
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
                  <v-container fluid grid-list-md>
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
                              :disabled="data.isActive === false || item.isDefault === true || ((data.action === 'edit' && !auth.allowUpdate) && !auth.allowInsert)"
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
                      <template v-slot:[`item.isDefault`]="{ item }">
                        <v-checkbox 
                          ref="IsDefault"
                          v-model="item.isDefault"
                          :disabled="data.isActive === false || item.isDefault === true"
                          @change="setAsDefault(item)"
                          dense
                        ></v-checkbox>
                      </template>
                      <template v-slot:[`item.initial`]="{ item }">
                        <v-text-field
                          ref="InitialAddress"
                          v-model="item.initial"
                          :readonly="data.isActive === false"
                          :rules="[rules.required[0], rules.max20chars[0]]"
                          :counter="20"
                          class="mt-0"
                          required
                          dense
                        ></v-text-field>
                      </template>
                      <template v-slot:[`item.address1`]="{ item }">
                        <v-text-field
                          ref="Address1"
                          v-model="item.address1"
                          :readonly="data.isActive === false"
                          :rules="[rules.required[0], rules.max100chars[0]]"
                          :counter="100"
                          class="mt-0"
                          required
                          dense
                        ></v-text-field>
                      </template>
                      <template v-slot:[`item.address2`]="{ item }">
                        <v-text-field
                          ref="Address2"
                          v-model="item.address2"
                          :readonly="data.isActive === false"
                          class="mt-0"
                          dense
                        ></v-text-field>
                      </template>
                      <template v-slot:[`item.contactPerson`]="{ item }">
                        <v-text-field
                          ref="ContactPerson"
                          v-model="item.contactPerson"
                          :readonly="data.isActive === false"
                          :rules="[rules.required[0], rules.max50chars[0]]"
                          :counter="50"
                          class="mt-0"
                          required
                          dense
                        ></v-text-field>
                      </template>
                      <template v-slot:[`item.phone`]="{ item }">
                        <v-text-field
                          ref="Phone"
                          v-model="item.phone"
                          :readonly="data.isActive === false"
                          :rules="[rules.required[0], rules.max30chars[0]]"
                          :counter="30"
                          class="mt-0"
                          required
                          dense
                        ></v-text-field>
                      </template>
                      <template v-slot:[`item.fax`]="{ item }">
                        <v-text-field
                          ref="Fax"
                          v-model="item.fax"
                          :readonly="data.isActive === false"
                          class="mt-0"
                          dense
                        ></v-text-field>
                      </template>
                    </v-data-table>
                  </v-container>
                </v-card>
              </v-tab-item>
              <v-tab-item
                key="area"
                transition="false"
              >
                <v-card>
                  <v-container fluid grid-list-md>
                    <v-row no-gutters>
                      <v-col cols="12" md="6" class="pr-md-3">
                        <v-autocomplete
                          v-model="data.areaId1"
                          :items="areaRef"
                          :item-text="item => `${item.name}`"
                          item-value="id"
                          label="Wilayah 1"
                          class="mt-0"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-3">
                        <v-autocomplete
                          v-model="data.areaId2"
                          :items="areaRef"
                          :item-text="item => `${item.name}`"
                          item-value="id"
                          label="Wilayah 2"
                          class="mt-0"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6" class="pr-md-3">
                        <v-autocomplete
                          v-model="data.areaId3"
                          :items="areaRef"
                          :item-text="item => `${item.name}`"
                          item-value="id"
                          label="Wilayah 3"
                          class="mt-0"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-3">
                        <v-autocomplete
                          v-model="data.areaId4"
                          :items="areaRef"
                          :item-text="item => `${item.name}`"
                          item-value="id"
                          label="Wilayah 4"
                          class="mt-0"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6" class="pr-md-3">
                        <v-autocomplete
                          v-model="data.areaId5"
                          :items="areaRef"
                          :item-text="item => `${item.name}`"
                          item-value="id"
                          label="Wilayah 5"
                          class="mt-0"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-3">
                        &nbsp;
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>
              </v-tab-item>
              <v-tab-item
                key="default"
                transition="false"
              >
                <v-card>
                  <v-container fluid grid-list-md>
                    <v-row no-gutters>
                      <v-col cols="12" md="6" class="pr-md-3">
                        <v-autocomplete
                          v-model="data.billingAddressId"
                          :items="billingAddressRef"
                          :item-text="item => `${item.text}`"
                          item-value="id"
                          label="Alamat Tagihan"
                          class="mt-0"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-3">
                        <v-autocomplete
                          v-model="data.shippingAddressId"
                          :items="shippingAddressRef"
                          :item-text="item => `${item.text}`"
                          item-value="id"
                          label="Alamat Pengiriman"
                          class="mt-0"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-form>
      </v-card-text>
    </v-card>
    
    <confirm ref="confirm"></confirm>
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

export default {
  components:{
    ExportExcel,
    Confirm
  },

  data: () => ({
    main: true,
    tab: {
      advancedItem: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'Kode', value: 'code', divider: true, width: '150', excelColWidth:'15' },
        { text: 'Inisial', value: 'initial', divider: true, width: '150', excelColWidth:'15' },
        { text: 'Nama', value: 'name', divider: true, width: '200', excelColWidth:'20' },
        { text: 'Tipe', value: 'typeName', divider: true, width: '180', excelColWidth:'18' },
        { text: 'Alamat', value: 'address1', divider: true, width: '200', excelColWidth:'20' },
        { text: 'Telepon', value: 'phone', divider: true, width: '120', excelColWidth:'12' },
        { text: 'Batas Kredit', value: 'creditLimit', divider: true, width: '90', excelColWidth:'10' },
        { text: 'Status', value: 'isActive', width: '90', excelColWidth:'10', isBool: true }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridItem: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Default', value: 'isDefault', align: 'center', divider: true, width: '4%' },
        { text: 'Inisial', value: 'initial', divider: true, width: '120' },
        { text: 'Alamat 1', value: 'address1', divider: true, width: '300' },
        { text: 'Alamat 2', value: 'address2', divider: true, width: '300' },
        { text: 'Kontak Person', value: 'contactPerson', divider: true, width: '120' },
        { text: 'Telepon', value: 'phone', divider: true, width: '170' },
        { text: 'Fax', value: 'fax', divider: true, width: '170' }
      ],
      data: []
    },
    valid: false,
    types: [],
    billingAddressRef: [],
    shippingAddressRef: [],
    areaRef: [],
    paymentTerms: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.getTypesList()
    this.getAreaList()
    this.getPaymentTermLists()
    auth.getAction(this.endpoint, this.menuId.customer, [this.action.insert, this.action.update, this.action.delete])
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Umum'
      }, {
        text: 'Data Master'
      }, {
        text: 'Pelanggan'
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
      return (!this.data.isActive)
    }  
  },
  
  methods:{
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        initial: null,
        name: null,
        typeId: null,
        initialAddress: null,
        address1: null,
        address2: null,
        contactPerson: null,
        phone: null,
        fax: null,
        email: null,
        website: null,
        creditTerm: 0,
        creditLimit: 0,
        refNo: null,
        notes: null,
        isActive: true,
        updatedInitial: null,
        billingAddressId: null,
        shippingAddressId: null,
        areaId1: null,
        areaId2: null,
        areaId3: null,
        areaId4: null,
        areaId5: null
      }
      this.gridItem.data = []
      this.tab.advancedItem = 0
      this.billingAddressRef = []
      this.shippingAddressRef = []

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
      
      api.getAll(this.endpoint.general.customer.customer, {
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
    getTypesList() {
      api.getAll(`${this.endpoint.general.customer.type}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.types = response.data.tableData
        })
    },
    getAreaList() {
      api.getAll(`${this.endpoint.sales.area}/lists`, {})
        .then(response => {
          this.areaRef = response.data.tableData
        })
    },
    getPaymentTermLists() {
      api.getAll('payment-term/lists')
        .then(response => {
          this.paymentTerms = response.data.tableData
        })
    },
    back() {
      this.main = true
    },
    add() {
      this.main = false
      this.reset(false)
      this.data.action = 'add'

      setTimeout(() => {
        // Set focus to initial field
        this.$refs.initial.focus()

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    edit(item) {
      if (!item) return

      this.main = false
      this.reset()

      // Get address details
      api.getAll(`${this.endpoint.general.customer.customer}/addresses`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data.tableData
          const defAddress = this.gridItem.data.find(h => h.isDefault)

          this.setAsDefault(defAddress)
          this.bindAddress()
        })

      this.data = {
        ...item,
        action: 'edit',
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus Data?',
          'Apakah anda yakin untuk menghapus data ini?')
      ) {
        api.delete(this.endpoint.general.customer.customer, item.code)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = this.data
      data.itemDetails = this.gridItem.data

      let result = { success: false, message: '' }
      if (this.data.action === 'add') {
        const resp = await api.create(this.endpoint.general.customer.customer, data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.general.customer.customer, data.code, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.data.code = result.data
        this.back()
        this.getList()
      }
    },
    addItem() {
      let defaultValue = false
      if (this.gridItem.data.length > 0) {
        if (!this.gridItem.data[this.gridItem.data.length - 1].initial) {
          this.$store.dispatch('app/showInfo', 'Tidak bisa tambah alamat karena inisial kosong')
          return
        }
        defaultValue = false
      } else if (this.gridItem.data.length === 0) {
        defaultValue = true
      }

      const item = {
        id: randomNumber(-1, -1000),
        code: this.data.code,
        initial: '',
        address1: '',
        address2: null,
        contactPerson: '',
        phone: '',
        fax: null,
        isDefault: defaultValue,
        state: 'A'
      }
      this.gridItem.data.push(item)

      if (defaultValue) {
        this.data.billingAddressId = item.id
        this.data.shippingAddressId = item.id
      }

      setTimeout(() => {
        // Set focus to initial address field
        this.$refs.InitialAddress.focus()
      }, 0)
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin untuk menghapus data ini?')
      ) {
        const idx = this.gridItem.data.findIndex(i => i.id === item.id)
        if (idx !== -1) {
          this.gridItem.data.splice(idx, 1)
        }
      }
    },
    setAsDefault(item) {
      if (!item) return
      if (item.isDefault) {
        for (let i = 0; i < this.gridItem.data.length; i++) {
          if (item.initial !== this.gridItem.data[i].initial) {
            this.gridItem.data[i].isDefault = false
          }
        }

        this.data = {
          ...this.data,
          initialAddress: item.initial,
          address1: item.address1,
          address2: item.address2,
          contactPerson: item.contactPerson,
          phone: item.phone,
          fax: item.fax,
          billingAddressId: item.id,
          shippingAddressId: item.id
        }
      }
    },
    bindAddress() {
      const arrAddress = []
      const item = this.gridItem.data

      for (let i = 0; i < item.length; i++) {
        let initialText = item[i].initial
        if (item[i].isDefault) {
          initialText = `${initialText} (Default)`
        }
        arrAddress.push({ def: item[i].isDefault, text: initialText, id: item[i].id })
      }

      if (arrAddress.length > 0) {
        this.billingAddressRef = arrAddress.sort(function (a, b) { return b.def - a.def })
        this.shippingAddressRef = arrAddress.sort(function (a, b) { return b.def - a.def })
      }
    },
    async exportExcel() {
      this.exportExcel.export()
    }
  }
}

</script>

<style>
</style>