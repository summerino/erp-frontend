<template>
  <div class="w-full">
    <v-card v-if="main == 'home'">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Tutup Bulan
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
            <export-excel title="Daftar Tutup Bulan" :grid="grid" :gridDefOpts="gridDefOpts" ref="exportExcel"></export-excel>
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
        </template>
        <template v-slot:[`item.isClose`]="{ item }">
          <v-checkbox
            v-model="item.isClose"
            readonly
          ></v-checkbox>
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else-if="main == 'add'">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <span>Tambah Tutup Bulan</span>
          </v-col>
          <v-col cols="12" md="8" class="text-right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  color="blue darken-2"
                  class="font-weight-regular"
                  :disabled="!auth.allowUpdate"
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
                        :value="formatStartDate"
                        :rules="rules.required"
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
                        type="month"
                        @change="menu.startDate = false"
                    ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
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
                        :value="formatEndDate"
                        :rules="rules.required"
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
                        type="month"
                        @change="menu.endDate = false"
                    ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12">
                <v-checkbox
                  v-model="data.isClose"
                  label="Tutup Bulan"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card v-else-if="main == 'edit'">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <span>Ubah Tutup Bulan</span>
          </v-col>
          <v-col cols="12" md="8" class="text-right">
            <label
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
                  :disabled="!auth.allowUpdate"
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
                    v-bind="attrs"
                    v-on="on"
                    :value="formatPeriod"
                    :rules="rules.required"
                    label="Periode"
                    class="mt-0"
                    readonly
                    required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-checkbox
                  v-model="data.isClose"
                  label="Tutup Bulan"
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
    main: 'home',
    menu:{
      startDate: false,
      endDate: false
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'Periode', value: 'periodName', divider: true, width: '150', excelColWidth:'20' },
        { text: 'Tutup Bulan', value: 'isClose', divider: true, width: '100', isBool: true, excelColWidth:'20', customValues: [{value: 'Ya'}, {value: 'Tidak'}] }
      ],
      data: [],
      options: {
        sortBy: ['period'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    data: {}
  }),

  created: function () {
    this.getList()
    auth.getAction(this.endpoint, this.menuId.closingMonth)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Utilitas'
      }, {
        text: 'Tutup Bulan'
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
      menuId: state => state.api.menus
    }),
    formatStartDate() {
      return this.data.startDate ? format(parseISO(this.data.startDate), 'MMM-yyyy') : ''
    },
    formatEndDate() {
      return this.data.endDate ? format(parseISO(this.data.endDate), 'MMM-yyyy') : ''
    },
    formatPeriod() {
      return this.data.period ? format(parseISO(this.data.period), 'MMM-yyyy') : ''
    }
  },
  
  methods:{
    reset(resetValidation = true) {
      this.data = {
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        isClose: true
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
      
      api.getAll(this.endpoint.accounting.closingMonth, {
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
      this.main = 'home'
    },
    add() {
      this.main = 'add'
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

      this.main = 'edit'
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
        api.delete(this.endpoint.accounting.closingMonth, item.id)
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
        const resp = await api.create(this.endpoint.accounting.closingMonth, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.updatemaster(this.endpoint.accounting.closingMonth, this.data)
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
