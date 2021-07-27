<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="3">
            Saldo Awal Hutang
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="grid.search"
              append-icon="mdi-magnify"
              label="Cari..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="1">
            <export-excel title="Daftar Saldo Awal Hutang" :grid="grid" :gridDefOpts="gridDefOpts" ref="exportExcel"></export-excel>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
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
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.dueDate`]="{ item }">
          {{ item.dueDate | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.amount`]="{ item }">
          {{ item.amount | formatCurrency }}
        </template>
        <template v-slot:[`item.paidAmount`]="{ item }">
          {{ item.paidAmount | formatCurrency }}
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <span>{{ data.action === 'add' ? 'Tambah' : 'Ubah' }} Saldo Awal Hutang</span>
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
                  v-shortkey="['ctrl', 'enter']"
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
              <span class="text-caption">(Ctrl + Enter)</span>
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
          <v-container fluid grid-list-md>
            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-text-field
                  ref="code"
                  v-model="data.code"
                  :rules="[rules.required[0], rules.max17chars[0]]"
                  :counter="17"
                  label="Kode"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-autocomplete
                  v-model="data.supCode"
                  :items="suppliers"
                  :item-text="item => `${item.code} - ${item.name}`"
                  :rules="rules.required"
                  label="Pemasok"
                  item-value="code"
                  class="mt-0"
                  required
                ></v-autocomplete>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-menu
                  v-model="menu.date"
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
                      :value="formatDate"
                      label="Tanggal"
                      class="mt-0"
                      readonly
                      required
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.date"
                    :max="dataStartDate"
                    no-title
                    scrollable
                    @change="menu.date = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
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
                      :rules="rules.required"
                      :value="formatDueDate"
                      label="Tanggal Jatuh Tempo"
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
              <v-col cols="12" md="6" class="pr-md-3">
                <v-currency-field
                  v-model="data.amount"
                  :decimal-length="0"
                  class="mt-0"
                  label="Nilai"
                  @change="nilaiChange()"
                ></v-currency-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-currency-field
                  v-model="data.paidAmount"
                  :decimal-length="0"
                  class="mt-0"
                  label="Nilai Sudah Dibayar"
                  readonly
                ></v-currency-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-currency-field
                  v-model="data.leftoverAmount"
                  :decimal-length="0"
                  class="mt-0"
                  label="Nilai Sisa"
                  readonly
                ></v-currency-field>
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
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>
    
    <confirm ref="confirm"></confirm>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { add, format, parseISO }  from 'date-fns'

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
    menu: {
      date: false,
      dueDate: false
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'18' },
        { text: 'Pemasok', value: 'supName', divider: true, width: '220', excelColWidth:'35' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Tgl. Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '120', excelColWidth:'16', isDateTime: true },
        { text: 'Nilai', value: 'amount', align: 'right', divider: true, width: '120', excelColWidth:'15', isNumber: true },
        { text: 'Nilai Sudah Dibayar', value: 'paidAmount', align: 'right', width: '120', excelColWidth:'19', isNumber: true }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    dataStartDate: null,
    suppliers: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getSupplierLists()
    auth.getAction(this.endpoint, this.menuId.accountPayable, [this.action.insert, this.action.update, this.action.delete])
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Akuntansi'
      }, {
        text: 'Tranksasi'
      }, {
        text: 'Saldo Awal'
      }, {
        text: 'Hutang'
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
    formatDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    formatDueDate() {
      return this.data.dueDate ? format(parseISO(this.data.dueDate), 'dd-MMM-yyyy') : ''
    }
  },
  
  methods:{
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        supCode: null,
        date: format(parseISO(this.dataStartDate), 'yyyy-MM-dd'),
        dueDate: format(parseISO(this.dataStartDate), 'yyyy-MM-dd'),
        currCode: 'IDR',
        rate: 1,
        amount: 0,
        paidAmount: 0,
        leftoverAmount: 0,
        notes: null
      }

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
      
      api.getAll(this.endpoint.accounting.beginBalance.ap, {
        params: {
          search: this.grid.search,
          skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
          take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
          sorts: JSON.stringify(sorts),
          filters: JSON.stringify([
            {
              field: 'isActive',
              operator: 'eq',
              keyword: 'true'
            }
          ])
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          if (bindToForm) {
            const item = this.grid.data.find(h => h.id === this.data.id)
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
          this.dataStartDate = format(add(parseISO(response.data.tableData[0].value), { days: -1 }), 'yyyy-MM-dd')
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
        // Set focus to code field
        this.$refs.code.focus()

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    edit(item) {
      if (!item) return

      this.main = false
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        originalDate: item.date,
        leftoverAmount: item.amount - item.paidAmount,
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus Data?',
          'Apakah anda yakin untuk menghapus data ini?')
      ) {
        api.delete(this.endpoint.accounting.beginBalance.ap, item.id, {data: item})
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

      let result = { success: false, message: '' }
      if (this.data.action === 'add') {
        const resp = await api.create(this.endpoint.accounting.beginBalance.ap, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.accounting.beginBalance.ap, this.data.id, this.data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.back()
        this.getList()
      }
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    getSupplierLists() {
      api.getAll(`${this.endpoint.general.supplier.supplier}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.suppliers = response.data.tableData
        })
    },
    nilaiChange() {
      this.data.leftoverAmount = this.data.amount - this.data.paidAmount
    }
  }
}

</script>
