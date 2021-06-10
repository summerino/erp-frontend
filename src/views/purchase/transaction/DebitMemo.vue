<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Nota Debit
          </v-col>
          <v-col cols="12" md="6" >
            <v-row no-gutters>
              <v-text-field
                append-icon="mdi-magnify"
                label="Cari..."
                class="font-weight-regular mt-0 pt-0"
                single-line
                v-model="grid.search"
                :readonly="filter.isAdvancedSearch"
                @click:append-outer="advancedSearch"
                @keyup.enter="getList(false)"
              ></v-text-field>            
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    color="blue darken-2 ml-1"
                    class="font-weight-regular"
                    dark
                    small
                    tile
                    @click="advancedSearch"
                  >
                    <v-icon>
                      mdi-magnify-plus-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span class="text-caption">Pencarian lanjutan</span>
              </v-tooltip>
              <export-excel title="Data Note Debit" :grid="grid" :gridDefOpts="gridDefOpts" ref="exportExcel"></export-excel>

            </v-row>
          </v-col>
          <!-- <v-col cols="12" md="4">
            <v-text-field
              v-model.trim="grid.search"
              append-icon="mdi-magnify"
              label="Cari..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList()"
            ></v-text-field>
          </v-col> -->
        </v-row>
      </v-card-title>
      <v-card-text v-if="true" class="pb-1">
        <advanced-search @search="search"></advanced-search>
      </v-card-text>
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
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.amount`]="{ item }">
          {{ item.amount | formatCurrency }}
        </template>
        <template v-slot:[`item.used`]="{ item }">
          {{ item.used | formatCurrency }}
        </template>
        <template v-slot:[`item.outstanding`]="{ item }">
          {{ item.outstanding | formatCurrency }}
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
          <v-toolbar-title>Nota Debit</v-toolbar-title>
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
                          label="Kode Transaksi"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          :rules="rules.required"
                          :value="formatDate"
                          label="Tanggal Transaksi"
                          class="mt-0"
                          readonly
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-autocomplete
                          v-model="data.srcTrans"
                          :items="sources"
                          :rules="rules.required"
                          label="Sumber Transaksi"
                          item-text="name"
                          item-value="id"
                          class="mt-0"
                          readonly
                          required
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          v-model.trim="data.transCode"
                          label="Kode Transaksi Sumber"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-currency-field
                          v-model="data.amount"
                          label="Nilai"
                          class="text-right mt-0"
                          readonly
                        ></v-currency-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-currency-field
                          v-model="data.used"
                          label="Digunakan"
                          class="text-right mt-0"
                          readonly
                        ></v-currency-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-currency-field
                          v-model="data.outstanding"
                          label="Saldo"
                          class="text-right mt-0"
                          readonly
                        ></v-currency-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.sup">
                    <v-tab key="sup">Pemasok</v-tab>
                    <v-tab key="notes">Catatan</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.sup" class="pa-2">
                    <v-tab-item
                      key="sup"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="3">
                          <v-text-field
                            v-model="data.supCode"
                            :rules="rules.required"
                            label="Kode Pemasok"
                            class="mt-0"
                            readonly
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="9" class="pl-1">
                          <v-text-field
                            v-model="data.supName"
                            label="Nama"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model.trim="data.supAddr"
                            label="Alamat"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.supPhone"
                            label="Telepon"
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
                      key="notes"
                      transition="false"
                    >
                      <v-textarea
                        v-model="data.notes"
                        :rules="rules.max256chars"
                        label="Catatan"
                        counter="256"
                        class="mt-0"
                        rows="4"
                        readonly
                      ></v-textarea>
                    </v-tab-item>
                  </v-tabs-items>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-tabs v-model="tab.related">
                    <v-tab key="related-trans">Transaksi Terkait</v-tab>

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
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

import api from '@/services/axios.service'
import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'

export default {
  components:{
    AdvancedSearch,
    ExportExcel
  },
  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      date: false
    },
    tab: {
      sup: null,
      related: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'Kode Transaksi', value: 'code', divider: true, width: '160', excelColWidth:'19' },
        { text: 'Tanggal Transaksi', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15' },
        { text: 'Pemasok', value: 'supName', divider: true, width: '200', excelColWidth:'23' },
        { text: 'Sumber Transksi.', value: 'srcTransName', divider: true, width: '100', excelColWidth:'13' },
        { text: 'Kode Transaksi Sumber', value: 'transCode', divider: true, width: '100', excelColWidth:'13' },
        { text: 'Nilai', value: 'amount', align: 'right', divider: true, width: '120', excelColWidth:'15' },
        { text: 'Digunakan', value: 'used', align: 'right', divider: true, width: '120', excelColWidth:'15' },
        { text: 'Saldo', value: 'outstanding', align: 'right', divider: true, width: '120', excelColWidth:'15' },
        { text: 'Status', value: 'mark', width: '50', excelColWidth:'10' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [true]
      },
      total: 0,
      search: null
    },
    gridRelated: {
      columns: [
        { text: 'Kode Transaksi', value: 'code', divider: true },
        { text: 'Tanggal Transaksi', value: 'date', align: 'right', divider: true },
        { text: 'Status', value: 'mark' }
      ],
      data: []
    },
    filterfields: [
      {
        text: 'Kode Transaksi', value: 'code', dataType: 'text'
      },
      {
        text: 'Tanggal Transaksi', value: 'date', dataType: 'dateTime'
      },
      {
        text: 'Pemasok', value: 'supName', dataType: 'text'
      },
      {
        text: 'Sumber Transksi', value: 'srcTransName', dataType: 'text'
      },
      {
        text: 'Kode Transaksi Sumber', value: 'transCode', dataType: 'text'
      },
      {
        text: 'Nilai', value: 'amount', dataType: 'text'
      },
      {
        text: 'Digunakan', value: 'used', dataType: 'text'
      },
      {
        text: 'Saldo', value: 'outstanding', dataType: 'text'
      }
    ],
    valid: false,
    sources: [{ id: 1, name: 'Deposit' }, { id: 2, name: 'Retur' }, { id: 2, name: 'Return (Same Item)' }],
    data: {}
  }),

  created: function () {
    this.getList()
    this.$store.commit('app/setFilterFields', this.filterfields)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Pembelian'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Nota Debit'
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
      filter: state => state.app.filter
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        srcTrans: 1,
        transCode: null,
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        amount: 0,
        used: 0,
        outstanding: 0
      }
      this.gridRelated.data = []
      this.tab.sup = 0
      this.tab.related = 0

      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }
    },
    advancedSearch() {
      this.grid.search = null
      this.$store.commit('app/advSearch')
      if (this.filter.isAdvancedSearch) {
        this.$store.commit('app/addSearch')
      }
    },
    search(vm) {
      this.grid.search = vm.search
      this.getList(vm.bindToForm, vm.filters)
    },
    getList(bindToForm = false, filters = []) {
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
          sorts: JSON.stringify(sorts),
          filters: JSON.stringify(filters)
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
    // getList(bindToForm = false) {
    //   const sorts = []
    //   for (let i = 0; i < this.grid.options.sortBy.length; i++) {
    //     sorts.push({
    //       field: this.grid.options.sortBy[i],
    //       direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
    //     })
    //   }

    //   api.getAll(this.endpoint.purchase.debitMemo, {
    //     params: {
    //       search: this.grid.search,
    //       skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
    //       take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
    //       sorts: JSON.stringify(sorts)
    //     }
    //   })
    //     .then(response => {
    //       this.grid.data = response.data.tableData
    //       this.grid.total = response.data.rowCount
    //       if (bindToForm) {
    //         const item = this.grid.data.find(h => h.code === this.data.code)
    //         this.edit(item)
    //       }
    //     })
    // },
    edit(item) {
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit'
      }

      // Get supplier details
      this.bindSupData(this.data)
      
      // Get related transaction details
      api.getAll(`${this.endpoint.purchase.debitMemo}/related-trans`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridRelated.data = response.data.tableData
        })

      // Set focus to return code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
    },
    bindSupData(item) {
      api.getOne(this.endpoint.general.supplier.supplier, item.supCode)
        .then(response => {
          if (response.data) {
            item.supAddr = response.data.address1
            item.supPhone = response.data.phone
            item.supFax = response.data.fax
          }
        })
    },
    async exportExcel() {
      this.exportExcel.export()
    }
  }
}
</script>
