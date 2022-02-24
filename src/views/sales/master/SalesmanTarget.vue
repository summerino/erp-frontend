<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Target Penjual
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
                  :disabled="!auth.allowCreate"
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
            <span class="text-caption">Void</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :disabled="item.mark.toUpperCase() !== 'A' || !auth.allowClone"
                color="green"
                icon
                small
                @click="clone(item)"
              >
                <v-icon small>mdi-content-copy</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Klon</span>
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
          <v-btn icon dark @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Target Penjual</v-toolbar-title>
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
                  :disabled="isVoid || (data.action === 'edit' && auth.allowUpdate)"
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
                          label="Kode"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          v-model="data.name"
                          :rules="[rules.required[0], rules.max50chars[0]]"
                          :counter="50"
                          label="Nama Target Penjual"
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
                            :min="dataStartDate"
                            no-title
                            scrollable
                            @change="menu.startDate = false; changeStartDate();"
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
                            :min="dataStartDate"
                            no-title
                            scrollable
                            @change="menu.endDate = false; changeEndDate();"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.user">
                    <v-tab key="user">Pengguna</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.user" class="pa-2">

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
                    </v-tab-item>
                  </v-tabs-items>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-tabs v-model="tab.item">
                    <v-tab key="subject">Subjek</v-tab>
                    <v-tab key="detail">Detail</v-tab>

                    <v-tab-item
                      key="subject"
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
                                    v-shortkey="['ctrl', 'k']"
                                    :disabled="isVoid || (data.action === 'add' && !auth.allowCreate) || (data.action === 'edit' && !auth.allowUpdate)"
                                    class="blue--text"
                                    small
                                    tile
                                    @click="addSubject"
                                    @shortkey="addSubject"
                                  >
                                    <v-icon left>mdi-plus</v-icon>
                                    Tambah
                                  </v-btn>
                                </template>
                                <span class="text-caption">(Ctrl + K)</span>
                              </v-tooltip>
                            </v-app-bar>

                            <v-data-table
                              :headers="gridSubject.columns"
                              :items="gridSubject.data"
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
                                      :disabled="isVoid || (data.action === 'add' && !auth.allowCreate) || (data.action === 'edit' && !auth.allowUpdate)"
                                      color="red"
                                      icon
                                      small
                                      @click="removeSubject(item)"
                                    >
                                      <v-icon small>mdi-close-thick</v-icon>
                                    </v-btn>
                                  </template>
                                  <span class="text-caption">Hapus</span>
                                </v-tooltip>
                              </template>
                              <template v-slot:[`item.salesmanId`]="{ item }">
                                  <v-autocomplete
                                    ref="salesmanId"
                                    v-model="item.salesmanId"
                                    :items="salesmans"
                                    :rules="rules.required"
                                    :item-text="item => `${item.initial} - ${item.firstName}`"
                                    item-value="id"
                                    class="mt-0"
                                    dense
                                    required
                                  >
                                  </v-autocomplete>
                              </template>
                            </v-data-table>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-tab-item>

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
                                    :disabled="isVoid || (data.action === 'add' && !auth.allowCreate) || (data.action === 'edit' && !auth.allowUpdate)"
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
                                      :disabled="isVoid || (data.action === 'add' && !auth.allowCreate) || (data.action === 'edit' && !auth.allowUpdate)"
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
                              <template v-slot:[`item.itemGroupId`]="{ item }">
                                <v-autocomplete
                                  ref="itemGroupId"
                                  v-model="item.itemGroupId"
                                  :items="itemGroups"
                                  :rules="rules.required"
                                  :item-text="item => `${item.initial} - ${item.name}`"
                                  item-value="id"
                                  class="mt-0"
                                  dense
                                  required
                                  @change="itemGroupIdChange(item)"
                                >
                                </v-autocomplete>
                              </template>
                              <template v-slot:[`item.itemSubGroupId`]="{ item }">
                                <v-autocomplete
                                  v-model="item.itemSubGroupId"
                                  :items="item.itemSubGroups"
                                  :rules="rules.required"
                                  :disabled="item.itemGroupId === null"
                                  item-text="name"
                                  item-value="id"
                                  class="mt-0"
                                  dense
                                  required
                                  @change="itemSubGroupIdChange(item)"
                                >
                                </v-autocomplete>
                              </template>
                              <template v-slot:[`item.subGroup`]="{ item }">
                                <v-autocomplete
                                  v-model="item.subGroup"
                                  :items="item.subGroups"
                                  :rules="rules.required"
                                  :disabled="item.itemSubGroupId === null"
                                  item-text="name"
                                  item-value="name"
                                  class="mt-0"
                                  dense
                                  required
                                >
                                </v-autocomplete>
                              </template>
                              <template v-slot:[`item.amount`]="{ item }">
                                <v-currency-field
                                  v-model="item.amount"
                                  :decimal-length="2"
                                  :min="0"
                                  :rules="[rules.required[0], rules.above0[0]]"
                                  class="text-body-2 text-right mt-0"
                                  dense
                                  required
                                ></v-currency-field>
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
    <clone-salesman-target 
    ref="clone"
    @closeClone="closeClone"
    ></clone-salesman-target>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import Confirm from '@/components/dialog/Confirm'
import CloneSalesmanTarget from '@/components/dialog/sales/CloneSalesmanTarget'


export default {
  components: {
    Confirm,
    CloneSalesmanTarget
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
      user: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Kode', value: 'code', divider: true, width: '100' },
        { text: 'Nama Target Penjual', value: 'name', divider: true, width: '100' },
        { text: 'Tanggal Mulai', value: 'startDate', align: 'right', divider: true, width: '100' },
        { text: 'Tanggal Akhir', value: 'endDate', align: 'right', divider: true, width: '100' },
        { text: 'Status', value: 'status', width: '100' }
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
        { value: 'action', sortable: false, divider: true, width: '4%' },
        { text: 'Grup Barang', value: 'itemGroupId', divider: true, width: '24%' },
        { text: 'Sub Grup Barang', value: 'itemSubGroupId', divider: true, width: '24%' },
        { text: 'Sub Grup', value: 'subGroup', divider: true, width: '24%' },
        { text: 'Nilai', value: 'amount', align: 'right', width: '24%' }
      ],
      data: []
    },
    gridSubject: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '5%' },
        { text: 'Penjual', value: 'salesmanId', width: '95%' }
      ],
      data: []
    }, 
    dataStartDate: null,
    itemGroups: [],
    salesmans: [],
    data: {},
    valid: false,
    seenByOthers: false
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getSalesmanLists()
    this.getItemGroupLists()
    auth.getAction(this.endpoint, this.menuId.salesmanTarget)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Penjualan'
      }, {
        text: 'Master'
      }, {
        text: 'Penjual'
      }, {
        text: 'Target'
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
        mark: null,
        createdBy: 0,
        createdDate: format(new Date(), 'yyyy-MM-dd'),
        updatedBy: 0,
        updatedDate: format(new Date(), 'yyyy-MM-dd')
      }
      this.gridItem.data = []
      this.gridSubject.data = []
      this.tab.user = 0
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

      api.getAll(this.endpoint.sales.salesmanTarget, {
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
    getSystemParameter() {
      api.getAll(`${this.endpoint.systemManagement.parameter}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'code',
            operator: 'eq',
            keyword: 'DATA_START_DATE'
          }])
        }
      })
        .then(response => {
          this.dataStartDate = response.data.tableData[0].value
        })
    },
    async close() {
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
    async edit(item) {
      if (!item) return
      
      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        mark: item.status === 'Void' ? 'V' : 'A',
        createdDate: format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get item details
      const responseDetails = await api.getAll(`${this.endpoint.sales.salesmanTarget}/detail`, {
        params: { code: item.code }
      })

      this.gridItem.data = responseDetails.data.tableData

      for (let i = 0; i < this.gridItem.data.length; i++) {
        const response = await this.getItemSubGroupLists(this.gridItem.data[i])
        this.gridItem.data[i].itemSubGroups = response.data.tableData
        await this.itemSubGroupIdChange(this.gridItem.data[i])
      }  

      // Get subject details
      api.getAll(`${this.endpoint.sales.salesmanTarget}/subject`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridSubject.data = response.data.tableData
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
          'Apakah anda yakin ingin membuat void data ini?')
      ) {
        api.delete(this.endpoint.sales.salesmanTarget, item.code, {data: item})
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
      data.itemSubjects = this.gridSubject.data

      const valueArr = data.itemSubjects.map(function (item) { return item.salesmanId })
      const isDuplicate = valueArr.some(function (item, idx) { 
        return valueArr.indexOf(item) !== idx 
      })

      if (isDuplicate) {
        this.$store.dispatch('app/showInfo', 'Subjek tidak boleh duplikat.')
        return
      }

      if (data.itemDetails.length === 0) {
        this.$store.dispatch('app/showInfo', 'Detil tidak boleh kosong.')
        return
      }

      if (data.itemSubjects.length === 0) {
        this.$store.dispatch('app/showInfo', 'Subjek tidak boleh kosong.')
        return
      }

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.salesmanTarget, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.salesmanTarget, data.code, data)
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
      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0]?.itemGroupId ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          itemGroupId: null,
          itemSubGroupId: null,
          subGroup: null,
          amount: 0,
          itemSubGroups: [],
          subGroups: []
        }
        this.gridItem.data.push(item)

        setTimeout(() => {
          this.$refs.itemGroupId.focus()
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
    addSubject() {
      if (this.gridSubject.data.length === 0 || (this.gridSubject.data.slice(-1)[0]?.salesmanId ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          salesmanId: null
        }
        this.gridSubject.data.push(item)

        setTimeout(() => {
          this.$refs.salesmanId.focus()
        }, 0)
      }
    },
    async removeSubject(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridSubject.data.findIndex(i => i.id === item.id)
        this.gridSubject.data.splice(idx, 1)
      }
    },
    getSalesmanLists() {
      api.getAll(`${this.endpoint.general.employee}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'type',
            operator: 'eq',
            keyword: 2
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.salesmans = response.data.tableData
        })
    },
    getItemGroupLists() {
      api.getAll(`${this.endpoint.inventory.item.group}/lists`)
        .then(response => {
          this.itemGroups = response.data.tableData
        })
    },
    async getItemSubGroupLists(item) {
      return await api.getAll(`${this.endpoint.inventory.item.group}/item-by-id`, {
        params: { id: item.itemGroupId }
      })
    },
    async itemGroupIdChange(item) {
      item.itemSubGroupId = null
      const response = await this.getItemSubGroupLists(item)
      item.itemSubGroups = response.data.tableData
      item.subGroup = null
      item.subGroups = []
    },
    itemSubGroupIdChange(item) {
      const itemSub = item.itemSubGroups.find(x => x.id === item.itemSubGroupId)
      if (itemSub) {
        item.subGroups = itemSub.value.split(';')
      }
    },
    clone(item) {
      this.$refs.clone.open(item.code)
    },
    changeStartDate() {
      if (this.data.startDate > this.data.endDate) {
        this.data.endDate = this.data.startDate
      }
    },
    changeEndDate() {
      if (this.data.endDate < this.data.startDate) {
        this.data.startDate = this.data.endDate
      }
    },
    closeClone() {
      this.getList()
    }
  }
}
</script>