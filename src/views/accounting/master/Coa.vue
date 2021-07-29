<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Akun
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
            <export-excel title="Daftar Akun" :grid="grid" :gridDefOpts="gridDefOpts" ref="exportExcel"></export-excel>
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
        <template v-slot:[`item.name`]="{ item }">
          <span v-html="getSpaceName(item)" :class="item.isParent ? 'font-weight-black' : 'font-weight-medium'">
          </span>
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <span>{{ data.action === 'add' ? 'Tambah' : 'Ubah' }} Akun</span>
          </v-col>
          <v-col cols="12" md="8" class="text-right">
            <label
              v-if="data.action == 'edit'"
              class="text-caption mr-1"
            >
              Tanggal Diperbarui : {{ data.updatedDate }} oleh {{ data.updatedInitial }}
            </label>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  color="blue darken-2"
                  class="font-weight-regular"
                  :disabled="(data.action === 'edit' && !auth.allowUpdate)"
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
          <v-container class="px-1 pt-0 pb-1">
            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-text-field
                  ref="code"
                  v-model="data.code"
                  :rules="[rules.required[0], rules.max6chars[0]]"
                  :counter="6"
                  :readonly="isCBEdit"
                  label="Kode"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-text-field
                  v-model="data.name"
                  :rules="[rules.required[0], rules.max50chars[0]]"
                  :counter="50"
                  :readonly="isCBEdit"
                  label="Nama"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-autocomplete
                    v-model="data.typeId"
                    :items="types"
                    :item-text="item => `${item.initial} - ${item.name}`"
                    :rules="rules.required"
                    :readonly="isCBEdit"
                    label="Tipe"
                    item-value="id"
                    class="mt-0"
                    required
                    @change="typeChange"
                  ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-autocomplete
                    v-model="data.parentId"
                    :items="accounts"
                    :item-text="item => `${item.code} - ${item.name}`"
                    label="Induk Akun"
                    :readonly="isCBEdit"
                    item-value="id"
                    class="mt-0"
                    clearable
                    @change="parentChange"
                    @click:clear="parentChange"
                  ></v-autocomplete>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  v-model="data.description"
                  :rules="rules.max100chars"
                  :counter="100"
                  :readonly="isCBEdit"
                  label="Deskripsi"
                  class="mt-0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-autocomplete
                    v-model="data.currCode"
                    :disabled="(data.typeId !== 2) || (data.typeId === 2 && data.parentId === null)"
                    :items="currencies"
                    :item-text="item => `${item.code} - ${item.name}`"
                    :rules="data.typeId === 2 && data.parentId !== null ? rules.required : []"
                    :readonly="isCBEdit"
                    label="Kurensi"
                    item-value="code"
                    class="mt-0"
                    :required="data.typeId === 2 && data.parentId !== null ? true : false"
                  ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-autocomplete
                    v-model="data.cbType"
                    :disabled="(data.typeId !== 2) || (data.typeId === 2 && data.parentId === null)"
                    :items="cbTypes"
                    :rules="data.typeId === 2 && data.parentId !== null ? rules.required : []"
                    :readonly="isCBEdit"
                    label="Kas / Bank Tipe"
                    item-text="name"
                    item-value="id"
                    class="mt-0"
                    :required="data.typeId === 2 && data.parentId !== null ? true : false"
                  ></v-autocomplete>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-text-field
                  v-model="data.vouCode"
                  :disabled="(data.typeId !== 2) || (data.typeId === 2 && data.parentId === null)"
                  :rules="data.typeId === 2 && data.parentId !== null ? [rules.required[0],rules.max4chars[0]] : []"
                  :counter="4"
                  :readonly="isCBEdit"
                  label="Kode Voucher"
                  class="mt-0"
                  :required="data.typeId === 2 && data.parentId !== null ? true : false"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-checkbox
                  v-model="data.isActive"
                  label="Aktif"
                  :readonly="isCBEdit"
                ></v-checkbox>
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
import { format, parseISO }  from 'date-fns'

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
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'Kode', value: 'code', divider: true, width: '150', excelColWidth:'20' },
        { text: 'Nama', value: 'name', divider: true, width: '200', excelColWidth:'20' },
        { text: 'Tipe', value: 'typeName', divider: true, width: '200', excelColWidth:'20' },
        { text: 'Mata Uang', value: 'currCode', divider: true, width: '120', excelColWidth:'20' },
        { text: 'Tipe Kas & Bank', value: 'cbType', divider: true, width: '100', excelColWidth:'20' },
        { text: 'Kode Voucher', value: 'vouCode', divider: true, width: '100', excelColWidth:'20' }
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
    accounts: [],
    cbTypes: [{ id: 'C', name: 'Kas' }, { id: 'B', name: 'Bank' }],
    currencies: [],
    types: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.getAccountLists()
    this.getCoaTypeList()
    this.getCurrencyLists()
    auth.getAction(this.endpoint, this.menuId.coa, [this.action.insert, this.action.update, this.action.delete])
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Akuntansi'
      }, {
        text: 'Data Master'
      }, {
        text: 'Akun'
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
    isActive() {
      return (!this.data.isActive)
    },
    isCBEdit() {
      return (this.data.typeId === 2 && this.data.action === 'edit')
    }  
  },
  
  methods:{
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        name: null,
        typeId: 0,
        parentId: null,
        deep: null,
        description: null,
        currCode: null,
        cbType: null,
        vouCode: null,
        isActive: true
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
      
      api.getAll(this.endpoint.accounting.coa, {
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
            const item = this.grid.data.find(h => h.id === this.data.id)
            this.edit(item)
          }
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
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus Data?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        api.delete(this.endpoint.accounting.coa, item.id)
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
        const resp = await api.create(this.endpoint.accounting.coa, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.accounting.coa, this.data.id, this.data)
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
    getCoaTypeList() {
      api.getAll(this.endpoint.accounting.coaType, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: 'id',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.types = response.data.tableData
        })
    },
    getCurrencyLists() {
      api.getAll(`${this.endpoint.general.currency}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.currencies = response.data.tableData
        })
    },
    getAccountLists() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }]),
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
    typeChange() {
      if (this.data.typeId !== 2) {
        this.data.currCode = null
        this.data.cbType = null
        this.data.vouCode = null
      }
    },
    parentChange() {
      if (this.data.typeId === 2 && this.data.parentId !== null) {
        this.data.currCode = null
        this.data.cbType = null
        this.data.vouCode = null
      }
    },
    getSpaceName(item) {
      let space = ''
      if (item.deep !== null) {
        for (let i = 0; i < item.deep; i++) {
          space += '&nbsp;&nbsp;'
        }
      }
      space += item.name
      return space
    }
  }
}
</script>
