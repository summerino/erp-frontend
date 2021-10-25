<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-5">
        <v-row no-gutters>
          <v-col cols="12" md="7">
            Format Laporan Laba/Rugi
          </v-col>
          <v-col cols="12" md="5" class="text-right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'alt', 'n']"
                  :disabled="!auth.allowCreate"
                  color="green darken-1"
                  class="font-weight-regular"
                  dark
                  small
                  tile
                  @click="add"
                  @shortkey="add"
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
    
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12">
            <v-autocomplete
              v-model="category"
              :items="typesCat"                  
              label="Kategori"
              item-text="name"
              item-value="id"
              class="mt-0"
              dense
              @change="getHierarchy()"
            >
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-treeview
              :active.sync="active"
              :items="hierarchy.data"
              :open.sync="open"
              open-on-click 
              transition
              dense
            >
              <template v-slot:append="{ item }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      :disabled="!auth.allowUpdate"
                      color="blue"
                      icon
                      small
                      @click="move(item,'up')"
                    >
                      <v-icon small>mdi-arrow-up</v-icon>
                    </v-btn>
                  </template>
                  <span>Pindahkan ke atas</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      :disabled="!auth.allowUpdate"
                      color="blue"
                      icon
                      small
                      @click="move(item,'down')"
                    >
                      <v-icon small>mdi-arrow-down</v-icon>
                    </v-btn>
                  </template>
                  <span>Pindahkan ke bawah</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      :disabled="item.type !== 'S'"
                      color="green darken-1"
                      icon
                      small
                      @click="subTotal(item)"
                    >
                      <v-icon small>mdi-sigma</v-icon>
                    </v-btn>
                  </template>
                  <span>Subtotal</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      :disabled="!auth.allowUpdate"
                      color="orange lighten-1"
                      icon
                      small
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
                      :disabled="!auth.allowDelete"
                      color="red"
                      icon
                      small
                      @click="remove(item)"
                    >
                      <v-icon small>mdi-close-thick</v-icon>
                    </v-btn>
                  </template>
                  <span class="text-caption">Non-aktifkan</span>
                </v-tooltip>
              </template>
            </v-treeview>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-else-if="!main && !sub">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <span>{{ data.action === 'add' ? 'Tambah' : 'Ubah' }} Format Laporan Laba/Rugi</span>
          </v-col>
          <v-col cols="12" md="8" class="text-right">
            <label
              v-if="data.action === 'edit'"
              class="text-caption mr-1"
            >
              Tanggal Diperbarui: {{ data.updatedDate }} oleh {{ data.updatedInitial }}
            </label>
            <v-btn
              v-shortkey="['ctrl', 'enter']"
              color="blue darken-2"
              class="font-weight-regular"
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
            <v-btn
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
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
        >
          <v-container class="px-1 pt-0 pb-1">
            <v-row dense>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-text-field
                  v-model="data.code"
                  label="Kode"
                  class="mt-0"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-text-field
                  ref="name"
                  v-model="data.name"
                  :rules="[rules.required[0], rules.max50chars[0]]"
                  :counter="50"
                  label="Nama"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-autocomplete
                  v-model="data.category"
                  :items="typesCat"                  
                  label="Kategori"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-autocomplete
                  v-model="data.parentCode"
                  :items="data.category === 'S' ? formatSummary : formatDetail"                  
                  label="Induk Format"
                  :item-text="item => `${item.code} - ${item.name}`"
                  item-value="code"
                  class="mt-0"
                  dense
                  clearable
                >
                </v-autocomplete>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-autocomplete
                  v-model="data.position"
                  :items="typesPos"                  
                  label="Posisi"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-autocomplete
                  v-model="data.type"
                  :items="types"                  
                  label="Tipe"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                >
                </v-autocomplete>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-checkbox
                  v-model="data.detail"
                  label="Detail"
                ></v-checkbox>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-checkbox
                  v-model="data.hidden"
                  label="Sembunyikan"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-checkbox
                  v-model="data.bold"
                  label="Bold"
                ></v-checkbox>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-checkbox
                  v-model="data.byAccount"
                  label="Berdasarkan Akun"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-title v-if="data.action === 'edit'" class="indigo--text text--lighten-2 pt-1">
        <v-row no-gutters>
          <v-col cols="12" md="12">
            Akun
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text v-if="data.action === 'edit'">
        <v-data-table  
          :headers="grid.columns"
          :height="grid.height"
          :items="grid.data"
          class="elevation-1"
          disable-sort
          fixed-header
          hide-default-footer
          disable-pagination
        >
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-card v-else-if="!main && sub">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="8">
            <span>Subtotal - {{data.name}}</span>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-btn
              v-shortkey="['esc']"
              class="font-weight-regular"
              small
              tile
              @click="subBack"
              @shortkey="subBack"
            >
              <v-icon left>
                mdi-undo-variant
              </v-icon>
              Kembali
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="6">
            <span class="font-weight-black">
              Digunakan
            </span>
          </v-col>
          <v-col cols="12" md="6">
            <span class="font-weight-black">
              Tersedia
            </span>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12" md="6">
            <v-data-table  
              :headers="gridUsed.columns"
              :height="gridUsed.height"
              :items="gridUsed.data"
              class="elevation-1"
              disable-sort
              fixed-header
              hide-default-footer
              disable-pagination
            >
              <template v-slot:[`item.action`]="{ item }">
                <v-btn
                  :disabled="!auth.allowUpdate"
                  color="green"
                  icon
                  tile
                  @click="removeSub(item)"
                >
                  <v-icon>
                    mdi-arrow-right-thick
                  </v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-col>
          <v-col cols="12" md="6">
            <v-data-table  
              :headers="gridAvailable.columns"
              :height="gridAvailable.height"
              :items="gridAvailable.data"
              class="elevation-1"
              disable-sort
              fixed-header
              hide-default-footer
              disable-pagination
            >
              <template v-slot:[`item.action`]="{ item }">
                <v-btn
                  :disabled="!auth.allowUpdate"
                  color="green"
                  icon
                  tile
                  @click="insertSub(item)"
                >
                  <v-icon>
                    mdi-arrow-left-thick
                  </v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <confirm ref="confirm"></confirm>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import Confirm from '@/components/dialog/Confirm'

export default {
  components: {
    Confirm
  },

  data: () => ({
    active: [],
    category: null,
    data: {},
    formatSummary: {},
    formatDetail: {},
    grid: {
      height: 300,
      columns: [
        { text: 'Kode Akun', value: 'code', divider: true, width: '100', excelColWidth:'15' },
        { text: 'Nama Akun', value: 'name', width: '300', excelColWidth:'40' }
      ],
      data: []
    },
    gridUsed: {
      height: 300,
      columns: [
        { value: 'action', divider: true, width: '90', excelColWidth:'10' },
        { text: 'Kode', value: 'code', divider: true, width: '100', excelColWidth:'15' },
        { text: 'Nama', value: 'name', width: '300', excelColWidth:'40' }
      ],
      data: []
    },
    gridAvailable: {
      height: 300,
      columns: [
        { value: 'action', divider: true, width: '90', excelColWidth:'10' },
        { text: 'Kode', value: 'code', divider: true, width: '100', excelColWidth:'15' },
        { text: 'Nama', value: 'name', width: '300', excelColWidth:'40' }
      ],
      data: []
    },
    hierarchy: {
      data: []
    },
    main: true,
    open: [],
    sub: false,
    types: [{ id: 'N', name: 'Normal' }, { id: 'S', name: 'Subtotal' }],
    typesCat: [{ id: 'S', name: 'Ringkasan' }, { id: 'D', name: 'Terperinci' }],
    typesPos: [{ id: 'C', name: 'Kredit' }, { id: 'D', name: 'Debit' }],
    valid: false
  }),

  created: function () {
    this.reset()
    this.getHierarchy()
    this.getList('S')
    this.getList('D')
    auth.getAction(this.endpoint, this.menuId.isFormat)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Akuntansi'
      }, {
        text: 'Utilitas'
      }, {
        text: 'Format Laporan Laba/Rugi'
      }])
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  computed: {
    ...mapState({
      gridDefOpts: state => state.app.grid,
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint,
      companyName: state => state.api.companyName,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    }) 
  },
  
  methods:{
    reset() {
      this.data = {
        action: null,
        code: null,
        name: null,
        parentCode: null,
        category: 'S',
        type: 'N',
        percentOf: null,
        percentFrom: null,
        position: 'C',
        deep: 1,
        sort: 1,
        subtotalSort: 0,
        detail: false,
        hidden: false,
        bold: false,
        byAccount: false
      }
      this.category = 'S'
      this.grid.data = []
    },
    getHierarchy() {
      api.getAll(`${this.endpoint.accounting.incomeStatementFormat}/format-hierarchy`, {
        params: { category: this.category }
      })
        .then(response => {
          this.hierarchy.data = response.data
        })
    },
    edit(item) {
      if (!item) return

      this.main = false
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      this.getCoa(item)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Non-Aktif?',
          'Apakah anda yakin ingin me-non-aktifkan data ini?')
      ) {
        api.delete(this.endpoint.accounting.incomeStatementFormat, item.code)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getHierarchy()
            }
          })
      }
    },
    add() {
      this.main = false
      this.reset()
      this.data.action = 'add'

      setTimeout(() => {
        // Set focus to name field
        this.$refs.name.focus()

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    back() {
      this.main = true
      this.category = this.data.category
      this.getHierarchy()
    },
    getList(cat) {
      api.getAll(`${this.endpoint.accounting.incomeStatementFormat}/format-lists`, {
        params: { category: cat }
      })
        .then(response => {
          if (cat === 'S') {
            this.formatSummary = response.data
          } else if (cat === 'D') {
            this.formatDetail = response.data
          }
        })
    },
    async save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      let result = { success: false, message: '' }
      if (this.data.action === 'add') {
        const resp = await api.create(this.endpoint.accounting.incomeStatementFormat, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.accounting.incomeStatementFormat, this.data.code, this.data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.back()
        this.getHierarchy()
      }
    },
    async move(item, type) {
      let result = { success: false, message: '' }
      const resp = await api.updatemaster(`${this.endpoint.accounting.incomeStatementFormat}/move`, item, {
        params: { type: type }
      })
      result = resp.data

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.getHierarchy()
      } else {
        this.$store.dispatch('app/showInfo', result.message)
      }
    },
    getCoa(item) {
      api.getAll(this.endpoint.accounting.coa, {
        params: {
          filters: JSON.stringify([{
            field: item.category === 'S' ? 'isCode' : 'isDetCode',
            operator: 'eq',
            keyword: item.code
          }])
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
        })
    },
    subTotal(item) {
      this.main = false
      this.sub = true
      this.data = {
        ...item
      }
      this.getSubFormat(item)
      this.getUnSubFormat(item)
    },
    subBack() {
      this.sub = false
      this.back()
    },
    getSubFormat(item) {
      api.getAll(`${this.endpoint.accounting.incomeStatementFormat}/format-sub`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridUsed.data = response.data
        })
    },
    getUnSubFormat(item) {
      api.getAll(`${this.endpoint.accounting.incomeStatementFormat}/format-unsub`, {
        params: { code: item.code, category: item.category }
      })
        .then(response => {
          this.gridAvailable.data = response.data
        })
    },
    async insertSub(item) {
      let result = { success: false, message: '' }
      const resp = await api.updatemaster(`${this.endpoint.accounting.incomeStatementFormat}/insert-sub`, item, {
        params: { subCode: item.code, code: this.data.code }
      })
      result = resp.data

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.getSubFormat(this.data)
        this.getUnSubFormat(this.data)
      }
    },
    async removeSub(item) {
      let result = { success: false, message: '' }
      const resp = await api.updatemaster(`${this.endpoint.accounting.incomeStatementFormat}/remove-sub`, item, {
        params: { subCode: item.code, code: this.data.code }
      })
      result = resp.data

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.getSubFormat(this.data)
        this.getUnSubFormat(this.data)
      }
    }
  }
}
</script>
