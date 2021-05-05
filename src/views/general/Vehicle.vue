<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="grid.search"
              append-icon="mdi-magnify"
              label="Search..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList()"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
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
                >
                  <v-icon left>mdi-plus</v-icon>
                  New
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
            <span>Edit</span>
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
            <span v-if="item.isActive">Inactive</span>
            <span v-else>Reactivate</span>
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
                {{ item.isActive === true ? 'Active' : 'Inactive' }}
            </span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="6">
            <span>Vehicle {{ data.action | capitalize }}</span>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <label
              v-if="data.action == 'edit'"
              class="text-caption mr-1"
            >
              Last Updated: {{ data.updatedDate }} by {{ data.updatedInitial }}
            </label>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 's']"
                  color="blue darken-2"
                  class="font-weight-regular"
                  :disabled="isActive"
                  dark
                  small
                  tile
                  @click="save"
                  @shortkey="save"
                >
                  <v-icon left>
                    mdi-content-save
                  </v-icon>
                  Save
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
                  Back
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
                  label="Vehicle No."
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
                  label="Type"
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
                  label="Max Load Volume"
                ></v-currency-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-currency-field
                  v-model="data.maxLoadWeight"
                  :decimal-length="0"
                  class="mt-0"
                  label="Max Load Weight"
                ></v-currency-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-text-field
                  v-model="data.driverId"
                  label="Driver Id"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-text-field
                  v-model="data.helperId1"
                  label="Helper Id 1"
                  class="mt-0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-text-field
                  v-model="data.helperId2"
                  label="Helper Id 2"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-text-field
                  v-model="data.notes"
                  :rules="rules.max256chars"
                  :counter="256"
                  class="mt-0"
                  label="Notes"
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

import Confirm from '@/components/dialog/Confirm'

export default {
  components:{
    Confirm
  },

  data: () => ({
    main: true,
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Vehicle No.', value: 'vehicleNo', divider: true, width: '150' },
        { text: 'Type', value: 'typeName', divider: true, width: '150' },
        { text: 'Max Load Volume', value: 'maxLoadVolume', divider: true, width: '90' },
        { text: 'Max Load Weight', value: 'maxLoadWeight', divider: true, width: '90' },
        { text: 'Driver Id', value: 'driverId', divider: true, width: '90' },
        { text: 'Helper Id 1', value: 'helperId1', divider: true, width: '90' },
        { text: 'Helper Id 2', value: 'helperId2', divider: true, width: '90' },
        { text: 'Status', value: 'isActive', width: '90' }
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
    data: {}
  }),

  created: function () {
    this.getList()
    this.getTypesList()
  },

  mounted: function () {
    setTimeout(() => {
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
      endpoint: state => state.api.endpoint
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
          'Inactive?',
          'Are you sure want to inactive this data?')
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
    async reactivate(item) {
      if (
        await this.$refs.confirm.open(
          'Reactivate?',
          'Are you sure want to reactivate this data?')
      ) {
        this.data = {
          ...item,
          action: 'edit',
          isActive: true
        }

        api.update(this.endpoint.general.vehicle.vehicle, this.data.id, this.data)
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
    }
  }
}

</script>

<style>
</style>