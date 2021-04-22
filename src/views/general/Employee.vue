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
        <template v-slot:[`item.sex`]="{ item }">
          <span v-if="item.sex">Male</span>
          <span v-else>Female</span>
        </template>
        <template v-slot:[`item.type`]="{ item }">
          <span v-if="item.type === 1">Employee</span>
          <span v-else-if="item.type === 2">Salesman</span>
          <span v-else-if="item.type === 3">Driver</span>
          <span v-else>Unknown</span>
        </template>
        <template v-slot:[`item.isActive`]="{ item }">
          <v-icon v-if="item.isActive" color="green">mdi-toggle-switch-outline</v-icon>
          <v-icon v-else color="red">mdi-toggle-switch-off-outline</v-icon>
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="6">
            <span>Employee {{ data.action | capitalize }}</span>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <label
              v-if="data.action == 'edit'"
              class="text-caption mr-1"
            >
              Last Updated: {{ data.updatedDate }} by {{ data.updatedBy }}
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
                  ref="initial"
                  v-model="data.initial"
                  :rules="[rules.required[0], rules.max20chars[0]]"
                  :counter="20"
                  label="Initial"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-row no-gutters>
                  <v-col cols="12">
                    <span>Gender</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="3">
                    <input 
                     type="radio" 
                     id="male" 
                     value="true" 
                     v-model="data.sex">
                    <label for="male">&nbsp;Male</label>
                  </v-col>
                  <v-col cols="9">
                    <input 
                     type="radio" 
                     id="female" 
                     value="false" 
                     v-model="data.sex">
                    <label for="female">&nbsp;Female</label>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-text-field
                  v-model="data.firstName"
                  :rules="rules.required"
                  label="First Name"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-text-field
                  v-model="data.lastName"
                  label="Last Name"
                  class="mt-0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-menu
                  v-model="menu.calBirthDate"
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
                      :value="formatBirthDate"
                      label="Birth Date"
                      class="mt-0"
                      readonly
                      required
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.birthDate"
                    no-title
                    scrollable
                    @change="menu.calBirthDate = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-text-field
                  v-model="data.birthPlace"
                  label="Birth Place"
                  class="mt-0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  v-model="data.address1"
                  :rules="rules.required"
                  label="Address 1"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  v-model="data.address2"
                  label="Address 2"
                  class="mt-0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-text-field
                  v-model="data.phone"
                  label="Phone"
                  class="mt-0"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-text-field
                  v-model="data.identityCardNo"
                  label="Identity No."
                  class="mt-0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-autocomplete
                  v-model="data.maritalStatus"
                  :items="maritalStatusRef"
                  :item-text="item => `${item.text}`"
                  :rules="rules.required"
                  label="Marital Status"
                  item-value="value"
                  class="mt-0"
                  required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                <v-autocomplete
                  v-model="data.religion"
                  :items="religionRef"
                  :item-text="item => `${item.text}`"
                  :rules="rules.required"
                  label="Religion"
                  item-value="value"
                  class="mt-0"
                  required
                ></v-autocomplete>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col cols="12" md="6" class="pr-md-3">
                <v-autocomplete
                  v-model="data.type"
                  :items="employeeTypeRef"
                  :item-text="item => `${item.text}`"
                  :rules="rules.required"
                  label="Employee Type"
                  item-value="value"
                  class="mt-0"
                  required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="6" class="pl-md-3">
                &nbsp;
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
    menu: {
      calBirthDate: false
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Initial', value: 'initial', divider: true, width: '150' },
        { text: 'First Name', value: 'firstName', divider: true, width: '200' },
        { text: 'Last Name', value: 'lastName', divider: true, width: '200' },
        { text: 'Gender', value: 'sex', divider: true, width: '60' },
        { text: 'Address', value: 'address1', divider: true, width: '250' },
        { text: 'Phone', value: 'phone', divider: true, width: '120' },
        { text: 'Employee Type', value: 'type', divider: true, width: '60' },
        { text: 'Status', value: 'isActive', width: '90' }
      ],
      data: [],
      options: {
        sortBy: ['initial'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    employeeTypeRef: [{text: 'Employee', value: 1}, {text: 'Salesman', value: 2}, {text: 'Driver', value: 3}],
    maritalStatusRef: [{text: 'Single', value: 1}, {text: 'Married', value: 2}, {text: 'Divorced', value: 3}],
    religionRef: [{text: 'Islam', value: 1}, {text: 'Protestant', value: 2}, {text: 'Catholic', value: 3}, {text: 'Buddha', value: 4}, {text: 'Hindu', value: 5}, {text: 'Konghucu', value: 6}, {text: 'Others', value: 7}],
    data: {}
  }),

  created: function () {
    this.getList()
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
    formatBirthDate() {
      return this.data.birthDate ? format(parseISO(this.data.birthDate), 'dd-MMM-yyyy') : ''
    }
  },
  
  methods:{
    reset(resetValidation = true) {
      this.data = {
        action: '',
        id: 0,
        initial: null,
        firstName: null,
        lastName: null,
        sex: true,
        birthDate: null,
        birthPlace: null,
        maritalStatus: null,
        identityCardNo: null,
        religion: null,
        address1: null,
        address2: null,
        phone: null,
        type: null
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
      
      api.getAll(this.endpoint.general.employee, {
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
            const item = this.grid.data.find(h => h.initial === this.data.initial)
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
          'Inactive?',
          'Are you sure want to inactive this data?')
      ) {
        api.delete(this.endpoint.general.employee, item.id)
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

        api.update(this.endpoint.general.employee, this.data.id, this.data)
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
        const resp = await api.create(this.endpoint.general.employee, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.general.employee, this.data.initial, this.data)
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