<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Kendaraan
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
            <export-excel
              ref="exportExcel"
              :company="companyName"
              :grid="grid"
              :gridDefOpts="gridDefOpts"
              title="Daftar Kendaraan"
            ></export-excel>
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
        <template v-slot:[`item.maxLoadVolume`]="{ item }">
          <span style="float:right;">{{ item.maxLoadVolume}} M³</span>
        </template>
        <template v-slot:[`item.maxLoadWeight`]="{ item }">
          <span style="float:right;">{{ item.maxLoadWeight}} Kg</span>
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <span>{{ data.action === 'add' ? 'Tambah' : 'Ubah' }} Kendaraan</span>
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
                  v-shortkey="['ctrl', 's']"
                  color="blue darken-2"
                  class="font-weight-regular"
                  :disabled="isActive || (data.action === 'edit' && !auth.allowUpdate)"
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
          <v-container class="px-1 pt-0 pb-1">
            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-text-field
                  ref="vehicleNo"
                  v-model="data.vehicleNo"
                  :rules="[rules.required[0], rules.max20chars[0]]"
                  :counter="20"
                  label="No. Kendaraan"
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
                <v-currency-field
                  v-model="data.maxLoadVolume"
                  :decimal-length="0"
                  class="mt-0"
                  label="Volume Beban Maksimal"
                  suffix="M³"
                ></v-currency-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-currency-field
                  v-model="data.maxLoadWeight"
                  :decimal-length="0"
                  class="mt-0"
                  label="Bobot Beban Maksimal"
                  suffix="Kg"
                ></v-currency-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-autocomplete
                  v-model="data.driverId"
                  :items="drivers"
                  :item-text="item => `${item.initial} - ${item.firstName} ${item.lastName}`"
                  :rules="rules.required"
                  label="Supir"
                  item-value="id"
                  class="mt-0"
                  required
                ></v-autocomplete>
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
        { text: 'No. Kendaraan', value: 'vehicleNo', divider: true, width: '150', excelColWidth:'15' },
        { text: 'Tipe', value: 'typeName', divider: true, width: '150', excelColWidth:'15' },
        { text: 'Volume Beban Maksimal', value: 'maxLoadVolume', divider: true, width: '90', excelColWidth:'105' },
        { text: 'Bobot Beban Maksimal', value: 'maxLoadWeight', divider: true, width: '90', excelColWidth:'10' },
        { text: 'Supir', value: 'driverInitial', divider: true, width: '90', excelColWidth:'10'}
      ],
      data: [],
      options: {
        sortBy: ['vehicleNo'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    types: [],
    data: {},
    drivers: []
  }),

  created: function () {
    this.getList()
    this.getTypesList()
    this.getDriversList()
    auth.getAction(this.endpoint, this.menuId.vehicle)
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
        text: 'Kendaraan'
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
    }),
    isActive() {
      return (!this.data.isActive)
    }  
  },
  
  methods:{
    reset(resetValidation = true) {
      this.data = {
        action: '',
        vehicleNo: null,
        typeId: null,
        maxLoadVolume: 0.00,
        maxLoadWeight: 0.00,
        driverId: 0,
        helperId1: 0,
        helperId2: 0,
        notes: null,
        isActive: true,
        updatedInitial: null
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
      
      api.getAll(this.endpoint.general.vehicle.vehicle, {
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
    getTypesList() {
      api.getAll(`${this.endpoint.general.vehicle.type}/lists`, {
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
    getDriversList() {
      api.getAll(this.endpoint.general.employee, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }]),
          filters: JSON.stringify([
            {
              field: 'type',
              operator: 'eq',
              keyword: 3
            }
          ])
        }
      })
        .then(response => {
          this.drivers = response.data.tableData
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
        // Set focus to vehicleNo field
        this.$refs.vehicleNo.focus()

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
        api.delete(this.endpoint.general.vehicle.vehicle, item.id)
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
        const resp = await api.create(this.endpoint.general.vehicle.vehicle, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.general.vehicle.vehicle, this.data.id, this.data)
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
