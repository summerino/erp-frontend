<template>
  <div class="w-full">
    <v-card>
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
            <span v-if="item.isDefault === true" class="text-caption">Yes</span>
            <span v-else class="text-caption">No</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
     <v-dialog
      v-model="dialog.add"
      transition="dialog-bottom-transition"
      fullscreen
      hide-overlay
      persistent
      scrollable
      @keydown.esc="close"
    >
      <v-card :style="{ background: $vuetify.theme.themes[theme].surface }">
        <v-toolbar
          color="primary"
          max-height="64"
          dark
        >
          <v-btn icon dark @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Multiple Adjustment</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  dark
                  text
                  @click="save(true)"
                  @shortkey="save(true)"
                >Save & Close</v-btn>
              </template>
              <span class="text-caption">(Ctrl + Enter)</span>
            </v-tooltip>
            <v-divider vertical></v-divider>
            <v-menu
              bottom
              eager
              left
              open-on-hover
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  dark
                  icon
                >
                  <v-icon>mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list class="cursor-pointer">
                <v-list-item
                  v-shortkey="['ctrl', 's']"
                  @click="save(false)"
                  @shortkey="save(false)"
                >
                  <v-list-item-title>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                        >
                          Save
                        </span>
                      </template>
                      <span class="text-caption">(Ctrl + S)</span>
                    </v-tooltip>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-divider vertical></v-divider>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text class="px-2">
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-card-title>General</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="code"
                          v-model="data.code"
                          label="Code"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.date"
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
                              :value="formatDate"
                              label="Date"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
                            no-title
                            scrollable
                            @change="menu.date = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-autocomplete
                        v-model="data.type"
                        :items="types"
                        :rules="rules.required"
                        @change="changeType"
                        label="Type"
                        class="mt-0"
                        required
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-autocomplete
                        v-model="data.location"
                        :items="locations"
                        :rules="rules.required"
                        label="Location"
                        class="mt-0"
                        required
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-app-bar dense flat>
                    <v-spacer></v-spacer>
                    <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                        v-bind="attrs"
                        v-on="on"
                        v-shortkey="['ctrl', 'i']"
                        class="blue--text"
                        small
                        tile
                        @click="addItem"
                        @shortkey="addItem"
                        >
                        <v-icon left>mdi-plus</v-icon>
                        Add
                        </v-btn>
                    </template>
                    <span class="text-caption">(Ctrl + I)</span>
                    </v-tooltip>
                  </v-app-bar>
                  <v-data-table
                    :headers="gridItem.columns"
                    :items="gridItem.data"
                    :items-per-page="-1"
                    height="300"
                    class="elevation-1"
                    dense
                    disable-sort
                    fixed-header
                    hide-default-footer
                  >
                    <template v-slot:[`item.action`]="{ item }">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-bind="attrs"
                                v-on="on"
                                color="red"
                                icon
                                small
                                @click="removeItem(item)"
                            >
                                <v-icon small>mdi-close-thick</v-icon>
                            </v-btn>
                            </template>
                            <span class="text-caption">Delete</span>
                        </v-tooltip>
                    </template>
                    <template v-slot:[`item.itemId`]="{ item }">
                        <v-autocomplete
                            ref="itemId"
                            v-model="item.itemId"
                            :items="items"
                            :rules="rules.required"
                            item-value="id"
                            class="text-body-2 mt-0"
                            dense
                            required
                            @change="itemIdChange(item)"
                        >
                            <template v-slot:append>
                                <v-btn
                                    color="primary"
                                    icon
                                    x-small
                                    @click="showFindItemDialog(item)"
                                >
                                    <v-icon>
                                    mdi-settings-helper
                                    </v-icon>
                                </v-btn>
                            </template>
                        </v-autocomplete>
                    </template>
                    <template v-slot:[`item.unit`]="{ item }">
                        <v-autocomplete
                            v-model="item.unit"
                            :items="item.units"
                            :rules="rules.required"
                            class="text-body-2 mt-0"
                            dense
                            required
                            @change="changeUnit(item)"
                        >
                        </v-autocomplete>
                    </template>
                    <template v-slot:[`item.qtyToAdjust`]="{ item }">
                        <v-currency-field
                            v-model="item.qtyToAdjust"
                            class="text-body-2 text-right mt-0"
                            dense
                        ></v-currency-field>
                    </template>
                    <template v-slot:[`item.qtyOpname`]="{ item }">
                        <v-currency-field
                            v-model="item.qtyOpname"
                            class="text-body-2 text-right mt-0"
                            dense
                        ></v-currency-field>
                    </template>
                    <template v-slot:[`item.cogs`]="{ item }">
                        <v-currency-field
                            v-model="item.cogs"
                            class="text-body-2 text-right mt-0"
                            dense
                        ></v-currency-field>
                    </template>
                    <template v-slot:[`item.notes`]="{ item }">
                        <v-text-field
                            v-model="item.notes"
                            :rules="rules.max256chars"
                            class="text-body-2 mt-0"
                            dense
                        ></v-text-field>
                    </template>
                  </v-data-table>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <confirm ref="confirm"></confirm>
    <find-item
      ref="findItem"
      @dblclick:row="bindItemData"
    ></find-item>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'
import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'
import Confirm from '@/components/dialog/Confirm'
import FindItem from '@/components/dialog/inventory/FindItem'

import dummy from '../transaction/MultipleAdjustmentDummyData'
export default {
  components:{
    Confirm,
    FindItem
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      date: false
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Date', value: 'date', divider: true, width: '150' },
        { text: 'Code', value: 'code', divider: true, width: '150' },
        { text: 'Location', value: 'location', divider: true, width: '150' },
        { text: 'Status', value: 'status', divider: true, width: '200' },
        { text: 'Journal', value: 'journal', divider: true, width: '200' },
        { text: 'Created By', value: 'createdBy', divider: true, width: '120' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridItem: {
      columns: [],
      data: []
    },
    valid: false,
    types: [],
    locations: [],
    data: {},
    items: []
  }),

  created: function () {
    this.getList()
    this.getTypes()
    this.getLocations()
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
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    }
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
    // getList() {
    //   const sorts = []
    //   for (let i = 0; i < this.grid.options.sortBy.length; i++) {
    //     sorts.push({
    //       field: this.grid.options.sortBy[i],
    //       direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
    //     })
    //   }
      
    //   api.getAll(this.endpoint.inventory.warehouse, {
    //     params: {
    //       search: this.grid.search,
    //       skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
    //       take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
    //       sorts: JSON.stringify(sorts)
    //     }
    //   })
    //     .then(response => {
    //       this.grid.data = response.data.tableData
    //       this.grid.total = response.data.rowCount 
    //     })
    // },
    getList() {
      this.grid.data = dummy.mainGrid
      this.grid.total = dummy.mainGrid.length 
    },
    back() {
      this.main = true
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'
      this.data.type = 'Stock Opname'
      this.bindGridItems()
      
    //   setTimeout(() => {
    //     this.$refs.initial.focus()
    //   }, 0)
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
        api.delete(this.endpoint.inventory.warehouse, item.code)
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

        api.update(this.endpoint.inventory.warehouse, this.data.code, this.data)
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
    close() {
      this.dialog.add = false
    },
    getTypes() {
      this.types = []
      const types = dummy.types
      types.forEach((type) => {
        this.types.push(type.name)
      })
    },
    getLocations() {
      this.locations = []
      const locations = dummy.locations
      locations.forEach((location) => {
        this.locations.push(location.name)
      })
    },
    async changeType() {
      if (this.gridItem.data.length > 0) {
        this.gridItem.data = []
        this.bindGridItems()
      } else {
        this.bindGridItems()
      }
    },
    bindGridItems() {
      if (this.data.type === 'Stock Opname') this.bindStockOpnameTable()
      else this.bindMultipleAdjustmentTable()
    },
    bindStockOpnameTable() {
      this.gridItem.columns = [
        { value: 'action', sortable: false, divider: true},
        { text: 'Item ID', value: 'itemId', sortable: false, divider: true, width: '150'},
        { text: 'Name', value: 'name', sortable: false, divider: true, width: '250' },
        { text: 'Unit', value: 'unit', sortable: false, divider: true, width: '100'},
        { text: 'Qty On Hand', value: 'qtyOnHand', sortable: false, divider: true, width: '75'},
        { text: 'Qty On Transit', value: 'qtyOnTransit', sortable: false, divider: true, width: '75'},
        { text: 'Nett On Hand', value: 'netOnHand', sortable: false, divider: true, width: '75'},
        { text: 'Qty Opname', value: 'qtyOpname', sortable: false, divider: true, width: '75'},
        { text: 'Different', value: 'different', sortable: false, divider: true, width: '75'},
        { text: 'Account', value: 'account', sortable: false, divider: true, width: '150'},
        { text: 'COGS (smalles unit)', value: 'cogs', sortable: false, divider: true, width: '175'},
        { text: 'Total COGS', value: 'totalCogs', sortable: false, divider: true, width: '175'},
        { text: 'Notes', value: 'notes', sortable: false, divider: true, width: '250'}
      ]
    }, 
    bindMultipleAdjustmentTable() {
      this.gridItem.columns = [
        { value: 'action', sortable: false, divider: true},
        { text: 'Item ID', value: 'itemId', sortable: false, divider: true},
        { text: 'Name', value: 'name', sortable: false, divider: true},
        { text: 'Unit', value: 'unit', sortable: false, divider: true},
        { text: 'Qty On Hand', value: 'qtyOnHand', sortable: false, divider: true},
        { text: 'Qty To Adjust', value: 'qtyToAdjust', sortable: false, divider: true},
        { text: 'Account', value: 'account', sortable: false, divider: true},
        { text: 'COGS (smalles unit)', value: 'cogs', sortable: false, divider: true},
        { text: 'Total COGS', value: 'totalCogs', sortable: false, divider: true},
        { text: 'Notes', value: 'notes', sortable: false, divider: true}
      ]
    },
    addItem() {
      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0]?.itemId ?? null)) {
        let item = {}
        if (this.data.type === 'Stock Opname') {
          item = {
            id: randomNumber(-1, -1000),
            itemId: randomNumber(-1, -1000),
            name: '2',
            unit: '3',
            units: ['test1', 'test2'],
            qtyOnHand: '4',
            qtyOnTransit: '5',
            netOnHand: '6',
            qtyOpname: '7',
            difference: '8',
            account: '9',
            cogs: '10',
            totalCogs: '11',
            notes: 'note'
          }
        } else {
          item = {
            id: randomNumber(-1, -1000),
            itemId: randomNumber(-1, -1000),
            name: '7',
            unit: '8',
            units: ['test3', 'test4'],
            qtyOnHand: '9',
            qtyToAdjust: '10',
            account: '11',
            cogs: '12',
            totalCogs: '13',
            notes: 'note 2'
          }
        } 
        this.gridItem.data.push(item)

        // setTimeout(() => {
        //   this.$refs.itemId.focus()
        // }, 0)
      }
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Delete?',
          'Are you sure want to delete this data?')
      ) {
        const idx = this.gridItem.data.findIndex(i => i.id === item.id)
        this.gridItem.data.splice(idx, 1)
      }
    },
    itemIdChange(item) {
      console.log(item)
    },
    showFindItemDialog(item) {
      this.$refs.findItem.open(item)
    },
    bindItemData(rowItem) {
      this.itemIdChange(rowItem)
    }
  }
}

</script>

<style>
</style>