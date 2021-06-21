<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Pengguna
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="grid.search"
              append-icon="mdi-magnify"
              label="Pencarian..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList()"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="1">
            <export-excel title="Data Pengguna" :grid="grid" :gridDefOpts="gridDefOpts" ref="exportExcel"></export-excel>
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
                  Tambah Baru
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
            <template v-else v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                small
                color="green"
                @click="reactivate(item)"
              >
                <v-icon small>mdi-check</v-icon>
              </v-btn>
            </template>
            <span v-if="item.isActive">Nonaktifkan</span>
            <span v-else>Aktifkan Kembali</span>
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
      </v-data-table>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="6">
            <span>{{ data.action === 'add' ? 'Tambah' : 'Ubah' }} Pengguna</span>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <label
              v-if="data.action == 'edit'"
              class="text-caption mr-1"
            >
              Terakhir Diperbarui : {{ data.updatedDate }} oleh {{ data.updatedInitial }}
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
                  :disabled="isActive || (data.action === 'edit' && !auth.allowUpdate)"
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
                  ref="username"
                  v-model="data.username"
                  :rules="[rules.required[0], rules.max50chars[0]]"
                  :counter="50"
                  label="Username"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-text-field
                  v-model="data.password"
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  :required="data.action === 'add'"
                  :rules="data.action === 'add' ? rules.required : ''"
                  :type="show ? 'text' : 'password'"
                  label="Kata Sandi"
                  class="mt-0"
                  @click:append="show = !show"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-text-field
                  v-model="data.initial"
                  :rules="[rules.required[0], rules.max20chars[0]]"
                  :counter="20"
                  label="Inisial"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
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
              <v-col cols="12" md="6" class="pr-md-3">
                <v-autocomplete
                  v-model="data.roleId"
                  :items="roles"
                  :item-text="item => `${item.initial} - ${item.name}`"
                  
                  label="Peran"
                  item-value="id"
                  class="mt-0"
                  
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-autocomplete
                  v-model="data.employeeId"
                  :items="employees"
                  :item-text="item => `${item.initial} - ${item.firstName}`"
                  
                  label="Karyawan"
                  item-value="id"
                  class="mt-0"
                  
                ></v-autocomplete>
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
        { text: 'Username', value: 'username', divider: true, width: '150', excelColWidth:'18' },
        { text: 'Inisial', value: 'initial', divider: true, width: '150', excelColWidth:'18' },
        { text: 'Nama', value: 'name', divider: true, width: '200', excelColWidth:'23' },
        { text: 'Peran', value: 'roleName', divider: true, width: '150', excelColWidth:'18' },
        { text: 'Karyawan', value: 'employeeInitial', divider: true, width: '150', excelColWidth:'18' },
        { text: 'Status', value: 'isActive', width: '90', excelColWidth:'10', isBool: true }
      ],
      data: [],
      options: {
        sortBy: ['username'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    roles: [],
    employees: [],
    data: {},
    show: false
  }),

  created: function () {
    this.getList()
    this.getEmployeeList()
    this.getRolesList()
    auth.getAction(this.endpoint, this.menuId.user, [this.action.insert, this.action.update, this.action.delete])
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Manajemen Sistem'
      }, {
        text: 'Data Master'
      }, {
        text: 'Pengguna'
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
    }  
  },
  
  methods:{
    reset(resetValidation = true) {
      this.data = {
        action: '',
        username: null,
        password: null,
        initial: null,
        name: null,
        roleId: 0,
        employeeId: 0,
        isActive: true,
        updatedInitial: null,
        roleName: null,
        employeeInitial: null
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
      
      api.getAll(this.endpoint.systemManagement.user, {
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
            const item = this.grid.data.find(h => h.username === this.data.username)
            this.edit(item)
          }
        })
    },
    getEmployeeList() {
      api.getAll(`${this.endpoint.general.employee}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.employees = response.data.tableData
        })
    },
    getRolesList() {
      api.getAll(this.endpoint.systemManagement.role, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.roles = response.data.tableData
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
        this.$refs.username.focus()

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
          'Nontaktifkan?',
          'Apakah anda yakin untuk menonaktifkan data ini?')
      ) {
        api.delete(this.endpoint.systemManagement.user, item.id)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async reactivate(item) {
      if (
        await this.$refs.confirm.open(
          'Aktifkan Kembali?',
          'Apakah anda yakin untuk mengaktifkan kembali data ini?')
      ) {
        this.data = {
          ...item,
          action: 'edit',
          isActive: true
        }

        api.update(this.endpoint.systemManagement.user, item.id, this.data)
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
        this.$store.dispatch('app/showInfo', 'Tolong cek kembali bagian formulir yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      let result = { success: false, message: '' }
      if (this.data.action === 'add') {
        const resp = await api.create(this.endpoint.systemManagement.user, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.systemManagement.user, this.data.id, this.data)
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