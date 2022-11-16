<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="3">
            Template Laporan Dinamis
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
            <export-excel
              ref="exportExcel"
              :company="companyName"
              :grid="grid"
              :gridDefOpts="gridDefOpts"
              title="Daftar Template Laporan Dinamis"
            ></export-excel>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
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
      </v-data-table>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <span>{{ data.action === 'add' ? 'Tambah' : 'Ubah' }} Template Laporan Dinamis</span>
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
                  :disabled="data.action === 'edit' && !auth.allowUpdate"
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
                  ref="name"
                  v-model="data.name"
                  :rules="[rules.required[0], rules.max50chars[0]]"
                  :counter="50"
                  label="Nama"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-checkbox
                  v-model="data.isActive"
                  label="Aktif"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="data.dataTypeParameter1"
                  :items="types"
                  item-text="name"
                  item-value="name"
                  label="Tipe Data Parameter 1"
                  class="mt-0"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.sourceParameter1"
                  :disabled="data.dataTypeParameter1 !== 'list'"
                  :required="data.dataTypeParameter1 === 'list'"
                  label="Sumber Parameter 1"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.dropdownValueParameter1"
                  :disabled="data.dataTypeParameter1 !== 'list'"
                  :required="data.dataTypeParameter1 === 'list'"
                  label="List Value Parameter 1"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.dropdownTextParameter1"
                  :disabled="data.dataTypeParameter1 !== 'list'"
                  :required="data.dataTypeParameter1 === 'list'"
                  label="List Text Parameter 1"
                  class="mt-0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="data.dataTypeParameter2"
                  :items="types"
                  item-text="name"
                  item-value="name"
                  label="Tipe Data Parameter 2"
                  class="mt-0"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.sourceParameter2"
                  :disabled="data.dataTypeParameter2 !== 'list'"
                  :required="data.dataTypeParameter2 === 'list'"
                  label="Sumber Parameter 2"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.dropdownValueParameter2"
                  :disabled="data.dataTypeParameter2 !== 'list'"
                  :required="data.dataTypeParameter2 === 'list'"
                  label="List Value Parameter 2"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.dropdownTextParameter2"
                  :disabled="data.dataTypeParameter2 !== 'list'"
                  :required="data.dataTypeParameter2 === 'list'"
                  label="List Text Parameter 2"
                  class="mt-0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="data.dataTypeParameter3"
                  :items="types"
                  item-text="name"
                  item-value="name"
                  label="Tipe Data Parameter 3"
                  class="mt-0"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.sourceParameter3"
                  :disabled="data.dataTypeParameter3 !== 'list'"
                  :required="data.dataTypeParameter3 === 'list'"
                  label="Sumber Parameter 3"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.dropdownValueParameter3"
                  :disabled="data.dataTypeParameter3 !== 'list'"
                  :required="data.dataTypeParameter3 === 'list'"
                  label="List Value Parameter 3"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.dropdownTextParameter3"
                  :disabled="data.dataTypeParameter3 !== 'list'"
                  :required="data.dataTypeParameter3 === 'list'"
                  label="List Text Parameter 3"
                  class="mt-0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="data.dataTypeParameter4"
                  :items="types"
                  item-text="name"
                  item-value="name"
                  label="Tipe Data Parameter 4"
                  class="mt-0"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.sourceParameter4"
                  :disabled="data.dataTypeParameter4 !== 'list'"
                  :required="data.dataTypeParameter4 === 'list'"
                  label="Sumber Parameter 4"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.dropdownValueParameter4"
                  :disabled="data.dataTypeParameter4 !== 'list'"
                  :required="data.dataTypeParameter4 === 'list'"
                  label="List Value Parameter 4"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.dropdownTextParameter4"
                  :disabled="data.dataTypeParameter4 !== 'list'"
                  :required="data.dataTypeParameter4 === 'list'"
                  label="List Text Parameter 4"
                  class="mt-0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="data.dataTypeParameter5"
                  :items="types"
                  item-text="name"
                  item-value="name"
                  label="Tipe Data Parameter 5"
                  class="mt-0"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.sourceParameter5"
                  :disabled="data.dataTypeParameter5 !== 'list'"
                  :required="data.dataTypeParameter5 === 'list'"
                  label="Sumber Parameter 5"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.dropdownValueParameter5"
                  :disabled="data.dataTypeParameter5 !== 'list'"
                  :required="data.dataTypeParameter5 === 'list'"
                  label="List Value Parameter 5"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="pl-md-1">
                <v-text-field
                  v-model="data.dropdownTextParameter5"
                  :disabled="data.dataTypeParameter5 !== 'list'"
                  :required="data.dataTypeParameter5 === 'list'"
                  label="List Text Parameter 5"
                  class="mt-0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12">
                <v-card-text>
                  <span>
                    <div class="red--text">* Format parameter harus sesuai dengan tipe data pada query.</div>
                    <div class="red--text">* Format kolom pada query tidak boleh menggunakan spasi.</div>
                  </span>
                </v-card-text>
                <v-textarea
                  v-model="data.query"
                  :rules="rules.required"
                  label="Query"
                  class="mt-0"
                  required
                ></v-textarea>
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
        { text: 'Nama', value: 'name', divider: true, width: '150', excelColWidth:'20' },
        { text: 'Status', value: 'isActive', width: '90', excelColWidth:'10', isBool: true }
      ],
      data: [],
      options: {
        sortBy: ['name'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    types: [{ name: 'string' }, { name: 'date' },
      { name: 'boolean' }, { name: 'list' }],
    data: {}
  }),

  created: function () {
    this.getList()
    auth.getAction(this.endpoint, this.menuId.dynamicReportTemplate)
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
        text: 'Template Laporan Dinamis'
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
      companyName: state => state.api.companyName,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    })
  },
  
  methods:{
    reset(resetValidation = true) {
      this.data = {
        action: '',
        name: null,
        dataTypeParameter1: null,
        sourceParameter1: null,
        dropdownValueParameter1: null,
        dropdownTextParameter1: null,
        dataTypeParameter2: null,
        sourceParameter2: null,
        dropdownValueParameter2: null,
        dropdownTextParameter2: null,
        dataTypeParameter3: null,
        sourceParameter3: null,
        dropdownValueParameter3: null,
        dropdownTextParameter3: null,
        dataTypeParameter4: null,
        sourceParameter4: null,
        dropdownValueParameter4: null,
        dropdownTextParameter4: null,
        dataTypeParameter5: null,
        sourceParameter5: null,
        dropdownValueParameter5: null,
        dropdownTextParameter5: null,
        query: null,
        isActive: false
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
      
      api.getAll(this.endpoint.general.dynamicReportTemplate, {
        params: {
          search: !this.main ? null : this.grid.search,
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
        // Set focus to name field
        this.$refs.name.focus()

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
        api.delete(this.endpoint.general.dynamicReportTemplate, item.id)
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
        const resp = await api.create(this.endpoint.general.dynamicReportTemplate, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.general.dynamicReportTemplate, this.data.id, this.data)
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
