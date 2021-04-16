<template>
  <div class="d-flex flex-column flex-grow-1">
  
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
      <v-row dense>
      <v-col cols="12" md="6">
       <v-text-field
              v-model="grid.search"
              append-icon="mdi-magnify"
              label="Search..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getSearch"
      ></v-text-field>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
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
        @shortkey="add">
        <v-icon left>mdi-plus</v-icon>
        Create New Data
      </v-btn>
      </v-col>
      </v-row>
      </v-card-title>
      <v-data-table
        :headers="grid.columns"
        :items="grid.data"
        :items-per-page="15"
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
                <v-icon small>mdi-close-circle-outline</v-icon>
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
                <v-icon small>mdi-check-circle-outline</v-icon>
              </v-btn>
            </template>
            <span v-if="item.isActive">Remove</span>
            <span v-else>Reactivate</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.isActive`]="{ item }">
            {{item.isActive? "Active" : "InActive"}}
        </template>
      </v-data-table>
      <confirm ref="confirm"></confirm>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="6">
            <span v-if="attrs == 'add'">Customer Add</span>
            <span v-else>Customer Edit</span>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <v-btn
              v-bind="attrs"
              v-shortkey="['ctrl', 'enter']"
              dark
              small
              tile
              color="blue darken-2"
              class="font-weight-regular"
              @click="save"
              @shortkey="save">
              <v-icon left>
                mdi-content-save
              </v-icon>
              Save
            </v-btn>
            <v-btn
              v-bind="attrs"
              v-shortkey="['ctrl', 'alt', 'b']"
              small
              tile
              class="font-weight-regular ml-1"
              @click="back"
              @shortkey="back">
              <v-icon left>
                mdi-undo-variant
              </v-icon>
              Back
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
  <v-form ref="form">
  <v-container>
    <div>
      <v-row no-gutters>
        <template>
          <v-col cols="5">
            <v-text-field
              required
              readonly
              class="mt-0"
              label="Code"
              v-model="data.code"
            ></v-text-field>
          </v-col>
          <v-divider
            class="mx-3"
            vertical
          ></v-divider>
          <v-col cols="5">
           <v-text-field
            :rules="rules.initialRules"
            required
            class="mt-0"
            label="Initial"
            v-model="data.initial"
          ></v-text-field>
          </v-col>
        </template>        
      </v-row>
      <v-row no-gutters>
        <template>
          <v-col cols="5">
            <v-text-field
              :rules="rules.nameRules"
              required
              class="mt-0"
              label="Name"
              v-model="data.name"
            ></v-text-field>
          </v-col>
          <v-divider
            class="mx-3"
            vertical
          ></v-divider>

          <v-col cols="5">
           <v-text-field
            :type="number"
            :rules="rules.typeIdRules"
            required
            class="mt-0"
            label="Type Id"
            v-model="data.typeId"
            @keypress="isNumber($event)"
          ></v-text-field>
          </v-col>
        </template>        
      </v-row>
      <v-row no-gutters>
        <template>
          <v-col cols="5">
              <v-text-field
              :rules="rules.addressRules"
              class="mt-0"
              required
              label="Address 1"
              v-model="data.address1"
              ></v-text-field>
          </v-col>
          <v-divider
            class="mx-3"
            vertical
          ></v-divider>
          <v-col cols="5">
           <v-text-field
              class="mt-0"
              label="Address 2"
              v-model="data.address2"
              ></v-text-field>
          </v-col>
        </template>        
      </v-row>
       <v-row no-gutters>
        <template>
          <v-col cols="5">
            <v-text-field
              :rules="rules.phoneRules"
              required
              class="mt-0"
              label="Phone"
              v-model="data.phone"
              @keypress="isNumber($event)"
            ></v-text-field>
          </v-col>
          <v-divider
            class="mx-3"
            vertical
          ></v-divider>
          <v-col cols="5">
           <v-text-field
            class="mt-0"
            label="Fax"
            v-model="data.fax"
          ></v-text-field>
          </v-col>
        </template>        
      </v-row>
       <v-row no-gutters>
        <template>
          <v-col cols="5">
            <v-text-field
              :rules="rules.emailRules"
              class="mt-0"
              label="Email"
              v-model="data.email"
            ></v-text-field>
          </v-col>
          <v-divider
            class="mx-3"
            vertical
          ></v-divider>
          <v-col cols="5">
           <v-text-field
            class="mt-0"
            label="Website"
            v-model="data.website"
          ></v-text-field>
          </v-col>
        </template>        
      </v-row>
       <v-row no-gutters>
        <template>
          <v-col cols="5">
            <v-currency-field
              :decimal-length="0"
              class="mt-0"
              label="Credit Term"
              v-model="data.creditTerm"
              :max="rules.maxCreditTerm"
            ></v-currency-field>
          </v-col>
          <v-divider
            class="mx-3"
            vertical
          ></v-divider>
          <v-col cols="5">
           <v-currency-field
            :decimal-length="0"
            class="mt-0"
            label="Credit Limit"
            v-model="data.creditLimit"
          ></v-currency-field>
          </v-col>
        </template>        
      </v-row>
       <v-row no-gutters>
        <template>
          <v-col cols="5">
            <v-text-field
              class="mt-0"
              label="Ref. No."
              v-model="data.refNo"
            ></v-text-field>
          </v-col>
          <v-divider
            class="mx-3"
            vertical
          ></v-divider>
          <v-col cols="5">
           <v-text-field
            class="mt-0"
            label="Note"
            v-model="data.note"
          ></v-text-field>
          </v-col>
        </template>        
      </v-row>
    </div>
    </v-container>
  </v-form>
    </v-card>
  </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import api from '@/services/axios.service'
import Confirm from '@/components/dialog/Confirm'
export default {
  components:{
    Confirm
  },
  data: () => ({
    main: true,
    attrs: '',
    grid: {
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Code', value: 'code', divider: true, width: '300' },
        { text: 'Initial', value: 'initial', divider: true, width: '300' },
        { text: 'Name', value: 'name', divider: true, width: '300' },
        { text: 'Address', value: 'address1', divider: true, width: '300' },
        { text: 'Phone', value: 'phone', divider: true, width: '300' },
        { text: 'Credit Term', value: 'creditTerm', divider: true, width: '300' },
        { text: 'Type Name', value: 'typeName', divider: true, width: '300' },
        { text: 'Status', value: 'isActive'}
      ],
      options: {
        sortBy: ['code'],
        sortDesc: [true]
      },
      search: null,
      total: 0
    },
    valid: false,
    data: {
      code: '',
      initial: '',
      name: '',
      typeId: '',
      address1: '',
      address2: '',
      phone: '',
      fax: '',
      email: '',
      website: '',
      creditTerm: '',
      creditLimit: '',
      refNo: '',
      note: '',
      action: ''
    },
    rules: {
      initialRules: [
        v => !!v || 'Initial is required'
      ],
      typeIdRules: [
        v => !!v || 'Type Id is required'
      ],
      nameRules: [
        v => !!v || 'Name is required'
      ],
      emailRules: [
        v => !v || /.+@.+\..+/.test(v) || 'E-mail must be valid'
      ],
      addressRules: [
        v => !!v || 'Address is required'
      ],
      phoneRules: [
        v => !!v || 'Phone is required'
      ],
      maxCreditTerm : 32767
    }
  }),
  computed: {
    ...mapState({
      gridDefOpts: state => state.app.grid,
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint
    })  
  },
  created: function () {
    this.getAll()
    this.getSearch()
  },
  methods:{
    add() {
      this.attrs = 'add'
      this.main = false
      this.data.action = 'add'
    },
    back() {
      this.attrs = 'view'
      this.main = true
      this.getAll()
      this.clearData()
    },
    edit(item) {
      if (!item) return
      this.attrs = 'edit'
      this.main = false

      this.data = {
        ...item,
        action: 'edit'
      }
    },
    getAll() {
      api.getAll(this.endpoint.general.customer, {

      }).then(response => {
        this.grid.data = response.data.tableData
      })      
    },
    getSearch() {
      const sorts = []
      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }
      
      api.getAll(this.endpoint.general.customer, {
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
    async save() {
      if (!this.$refs.form.validate()) return
      const data = this.data
      let result = { success: false, message: '' }

      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.general.customer, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.general.customer, data.code, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.back()
        this.clearData()
        this.getAll()
      }
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Remove?',
          'Are you sure want to remove this customer?')
      ) {
        api.delete(this.endpoint.general.customer, item.code)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getAll()
            }
          })
      }
    },
    async reactivate(item) {
      if (
        await this.$refs.confirm.open(
          'Reactivate?',
          'Are you sure want to reactivate this customer?')
      ) {
        this.data = {
          ...item,
          action: 'edit'
        }
        this.data.isActive = true
        const data = this.data
        api.update(this.endpoint.general.customer, data.code, data)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getAll()
            }
          })
      }
    },
    clearData() {
      this.data.code = ''
      this.data.initial = ''
      this.data.name = ''
      this.data.typeId = ''
      this.data.address1 = ''
      this.data.address2 = ''
      this.data.phone = ''
      this.data.fax = ''
      this.data.email = ''
      this.data.website = ''
      this.data.creditTerm = ''
      this.data.creditLimit = ''
      this.data.refNo = ''
      this.data.note = ''
      this.data.action = ''
      this.grid.search = null
    },
    isNumber: function (evt) {
      evt = (evt) ? evt : window.event
      const charCode = (evt.which) ? evt.which : evt.keyCode
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault()
      } else {
        return true
      }
    }
  }
}

</script>

<style>
</style>