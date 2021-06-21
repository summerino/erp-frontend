<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Gudang
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
            <export-excel title="Data Gudang" :grid="grid" :gridDefOpts="gridDefOpts" ref="exportExcel"></export-excel>
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
        :server-items-length="grid.total"
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
            <template v-if="item.isActive" v-slot:activator="{ on, attrs }">
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
            <template v-if="item.isActive === true" v-slot:activator="{ on, attrs }">
              <v-icon 
                v-bind="attrs" 
                v-on="on" 
                color="green">mdi-toggle-switch-outline</v-icon>
            </template>
            <template v-else v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs" 
                v-on="on"
                color="red">mdi-toggle-switch-off-outline</v-icon>
            </template>
            <span v-if="item.isActive === true" class="text-caption">Active</span>
            <span v-else class="text-caption">Inactive</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.isDefault`]="{ item }">
          <v-tooltip bottom>
            <template v-if="item.isDefault === true" v-slot:activator="{ on, attrs }">
              <v-icon 
                v-bind="attrs" 
                v-on="on" 
                color="blue darken-2">mdi-checkbox-marked-outline</v-icon>
            </template>
            <template v-else v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs" 
                v-on="on">mdi-checkbox-blank-outline</v-icon>
            </template>
            <span v-if="item.isDefault === true" class="text-caption">Ya</span>
            <span v-else class="text-caption">Tidak</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="6">
            <span>{{ data.action === 'add' ? 'Tambah' : 'Ubah' | capitalize }} Gudang</span>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <label
              v-if="data.action == 'edit'"
              class="text-caption mr-1"
            >
              Tanggal diperbarui : {{ data.updatedDate }} oleh {{ data.updatedInitial }}
            </label>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 's']"
                  color="blue darken-2"
                  class="font-weight-regular"
                  dark
                  small
                  tile
                  @click="save"
                  @shortkey="save"
                  :disabled="data.action === 'edit' && !auth.allowUpdate"
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
          <v-container class="px-1 pt-0 pb-1">
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
              <v-col cols="12">
                <v-text-field
                  v-model="data.name"
                  :rules="[rules.required[0], rules.max50chars[0]]"
                  :counter="50"
                  label="Nama"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  v-model="data.address"
                  :rules="[rules.required[0], rules.max100chars[0]]"
                  :counter="100"
                  label="Alamat"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  v-model="data.phone"
                  :rules="[rules.required[0], rules.max30chars[0]]"
                  :counter="30"
                  label="Telepon"
                  class="mt-0"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" class="pr-md-3">
                <v-checkbox
                  v-model="data.isDefault"
                  label="Default"
                  class="mt-0"
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
        { text: 'Kode', value: 'code', divider: true, width: '150', excelColWidth:'10' },
        { text: 'Initial', value: 'initial', divider: true, width: '150', excelColWidth:'15' },
        { text: 'Nama', value: 'name', divider: true, width: '200', excelColWidth:'25' },
        { text: 'Alamat', value: 'address', divider: true, width: '200', excelColWidth:'35' },
        { text: 'Telepon', value: 'phone', divider: true, width: '120', excelColWidth:'15' },
        { text: 'Default', value: 'isDefault', divider: true, width: '120', excelColWidth:'10', isBool: true }
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
    types: [],
    data: {}
  }),

  created: function () {
    this.getList()
    auth.getAction(this.endpoint, this.menuId.warehouse, [this.action.insert, this.action.update, this.action.delete])
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Persediaan'
      }, {
        text: 'Data Master'
      }, {
        text: 'Gudang'
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
    })  
  },
  
  methods:{
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        initial: null,
        name: null,
        address: null,
        phone: null,
        isDefault: false
      }

      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }
    },
    getList() {
      const sorts = []
      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }
      
      api.getAll(this.endpoint.inventory.warehouse, {
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

      this.data = {
        ...item,
        action: 'edit',
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        api.delete(this.endpoint.inventory.warehouse, item.code)
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
        this.$store.dispatch('app/showInfo', 'Please kindly check mandatory fields or fields that have an error.')
        return
      }      

      let result = { success: false, message: '' }
      if (this.data.action === 'add') {
        const resp = await api.create(this.endpoint.inventory.warehouse, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.inventory.warehouse, this.data.code, this.data)
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
    }
  }
}

</script>

<style>
</style>