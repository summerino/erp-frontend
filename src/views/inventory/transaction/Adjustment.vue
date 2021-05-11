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
      <v-card-text>

      </v-card-text>
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
                color="orange lighten-1"
                icon
                small
                @click="edit(item)"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Edit</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :disabled="item.mark.toUpperCase() !== 'A'"
                color="red"
                icon
                small
                @click="remove(item)"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Void</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.mark`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                v-bind="attrs"
                v-on="on"
                :color="item.mark.toUpperCase() === 'V' ? 'error' : 'green'"
                class="px-1"
                dark
                small
              >
                {{ item.mark }}
              </v-chip>
            </template>
            <span class="text-caption">{{ item.status }}</span>
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
          <v-toolbar-title>Adjustment</v-toolbar-title>
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
              <v-col cols="12" md="4">
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
                          item-text="name"
                          item-value="code"
                          :rules="rules.required"
                          @change="changeType"
                          label="Type"
                          class="mt-0"
                          required
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-autocomplete
                            v-model="data.warehouseCode"
                            :items="warehouses"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            :rules="rules.required"
                            @change="changeLocation"
                            label="Location"
                            item-value="code"
                            class="mt-0"
                          ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.adj">
                    <v-tab key="notes">Notes</v-tab>
                    <v-tab key="user">User</v-tab>
                  </v-tabs>
                  <v-tabs-items v-model="tab.adj" class="pa-2">
                    
                    <v-tab-item
                      key="notes"
                      transition="false"
                    >
                      <v-textarea
                      v-model="data.notes"
                      :rules="rules.max256chars"
                      label="Notes"
                      counter="256"
                      class="mt-0"
                      rows="4"
                    ></v-textarea>
                    </v-tab-item>
                    <v-tab-item
                      key="user"
                      transition="false"
                      eager
                    >
                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model.trim="data.approveInitial"
                            label="Approved By"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model.trim="data.createdInitial"
                            label="Created By"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model.trim="data.updatedInitial"
                            label="Updated By"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model.trim="data.updatedDate"
                            label="Updated Date"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-tab-item>
                  </v-tabs-items>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  
                  <v-app-bar dense flat>
                    <v-spacer></v-spacer>
                    <v-tooltip bottom v-if="data.type === 1" >
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
                    <v-tooltip bottom v-if="data.type === 2">
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs"
                          v-on="on"
                          v-shortkey="['ctrl', 'a']"
                          class="blue--text"
                          small
                          tile
                          :disabled="showItemDisabled"
                          @click="showAll"
                          @shortkey="showAll"
                          >
                          Show Items
                        </v-btn>
                      </template>
                      <span class="text-caption">(Ctrl + A)</span>
                    </v-tooltip>
                  </v-app-bar>
                  <!-- <v-data-table
                    :headers="gridItem.columns"
                    :items="gridItem.data"
                    :items-per-page="-1"
                    height="300"
                    class="elevation-1"
                    dense
                    disable-sort
                    fixed-header
                    hide-default-footer
                  > -->
                  <v-data-table
                    :headers="gridItem.columns"
                    :items="gridItem.data"
                    :items-per-page="gridDefOpts.pageSize"
                    :footer-props="{ itemsPerPageOptions: gridDefOpts.pageSizes}"
                    height="300"
                    class="elevation-1"
                    dense
                    fixed-header
                  >
                    <template v-slot:[`item.action`]="{ item }">
                      <v-tooltip v-if="data.type === 1" bottom>
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
                        item-text="initial"
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
                    <!-- <template v-slot:[`item.itemId`]="{ item }">
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
                    </template> -->
                    <!-- <template v-slot:[`item.unit`]="{ item }">
                        <v-autocomplete
                            v-model="item.unit"
                            :items="item.units"
                            :rules="rules.required"
                            class="text-body-2 mt-0"
                            dense
                            required
                            ref="itemId"
                            @change="changeUnit(item)"
                        >
                        </v-autocomplete>
                    </template> -->
                    <template v-slot:[`item.unitName`]="{ item }">
                      <v-autocomplete
                        v-model="item.unitId"
                        :items="item.units"
                        :rules="rules.required"
                        item-text="unitEquivalent"
                        item-value="id"
                        class="text-body-2 mt-0"
                        dense
                        required
                        @change="unitItemChange(item)"
                      ></v-autocomplete>
                    </template>
                    <template v-slot:[`item.qtyOnHand`]="{ item }">
                      <span class="text-body-2 text-right mt-0">
                        {{ item.qtyOnHand | formatCurrency }}
                      </span>
                    </template>
                    <template v-slot:[`item.qtyAdjust`]="{ item }">
                        <v-currency-field
                          :min="-Number.MAX_SAFE_INTEGER"
                          :max="Number.MAX_SAFE_INTEGER"
                          :allow-negative="true"
                          v-model="item.qtyAdjust"
                          :rules="rules.cannot0"
                          class="text-body-2 text-right mt-0"
                          dense
                        ></v-currency-field>
                    </template>
                    <template v-slot:[`item.qtyOpname`]="{ item }">
                        <v-currency-field
                            v-model="item.qtyOpname"
                            class="text-body-2 text-right mt-0"
                            dense
                            @change="calculateDifferent(item)"
                        ></v-currency-field>
                    </template>
                    <template v-slot:[`item.different`]="{ item }">
                      <span class="text-body-2 text-right mt-0">
                        {{ item.different | formatCurrency }}
                      </span>
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
      :warehouseCode="data.warehouseCode"
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
    tab: {
      adj: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Date', value: 'date', divider: true, width: '150' },
        { text: 'Code', value: 'code', divider: true, width: '150' },
        { text: 'Location', value: 'warehouseInitial', divider: true, width: '150' },
        { text: 'Notes', value: 'notes', divider: true, width: '200' },
        { text: 'Status', value: 'mark', divider: true, width: '200' }
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
    types: [
      { code: 1, name:'Adjustment' },
      { code: 2, name:'Stock Opname' }
    ],
    locations: [],
    data: {},
    items: [],
    warehouses: [],
    uoms: [],
    showItemDisabled: false
  }),

  created: function () {
    this.getList()
    this.getWarehouseLists()
    this.getUomLists()
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
    showAll() {
      if (!this.data.warehouseCode) {
        this.$store.dispatch('app/showInfo', 'Please choose location first.')
        return
      }
      this.bindGridItems()
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i]
        const units = this.uoms.filter(x => x.uomId === item.uomId)
        const defaultUnitId = units[0].id
        const temp = {
          id: randomNumber(-1, -1000),
          itemId: item.id,
          itemName: item.name,
          unitName: null,
          units: units,
          uomId: item.uomId,
          unitId: defaultUnitId,
          oldUnitId: defaultUnitId,
          qtyOnHand: item.qtyOnHand,
          baseQtyOnHand: item.qtyOnHand,
          qtyOnTransit: 0,
          qtyOpname: 0,
          different: 0,
          cogs: 0,
          totalCogs: 0,
          notes: ''
        }
        this.gridItem.data.push(temp)
      }
      this.isButtonShowItemDisabled()
    },
    unitItemChange(item) {
      const oldUnit = item.units.find(u => u.id === item.oldUnitId)
      const unit = item.units.find(u => u.id === item.unitId)
      item.oldUnitId = item.unitId
      item.qtyAdjust = 0
      item.qtyOpname = 0
      item.different = 0
      this.convertUOM(item, oldUnit.seq, unit.seq)
    },
    calculateDifferent(item) {
      item.different = item.qtyOpname - item.qtyOnHand 
      item.qtyAdjust = item.different
    },
    convertUOM(item, fromSequence, toSequence) {
      let depth = 0
      let direction = ''
      let different = 1
      let itterateSeq = 0
      if (fromSequence < toSequence) {
        depth = toSequence - fromSequence
        direction = 'up'
        itterateSeq = fromSequence
      } else {
        depth = fromSequence - toSequence
        direction = 'down'
        itterateSeq = toSequence
      }
      for (let i = 0; i < depth; i++) {
        itterateSeq++
        const data = item.units.find(u => u.seq === itterateSeq)
        different *=  data.conversion
      }
      if (direction === 'up') {
        item.qtyOnHand = Math.round(item.qtyOnHand / different)
      } else {
        item.qtyOnHand = item.qtyOnHand * different
      }
    },
    getUnitItemLists(item) {
      const units = this.uoms.filter(x => x.uomId === item.uomId)
      item.units = units
      const selectedUnit = units.find(x => x.seq === 1)
      item.unitId = selectedUnit.id
      item.oldUnitId = item.unitId
    },
    reset(resetValidation = true) {
      this.data = {
        mark: 'A',
        code: null,
        type: 1,
        date: format(new Date(), 'yyyy-MM-dd'),
        warehouseCode: null,
        notes: ''
      }
      this.gridItem.data = []
      this.tab.adj = 0

      // Set default warehouse
      const defWarehouse = this.warehouses.find(w => w.isDefault)
      if (defWarehouse) {
        this.data.warehouseCode = defWarehouse.code
        this.getItemLists()
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
      
      api.getAll(this.endpoint.inventory.adjustment, {
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
    getItemLists() {
      const filters = [{
        field: 'warehouseCode',
        operator: 'eq',
        keyword: this.data.warehouseCode
      }]
      api.getAll(this.endpoint.inventory.item.item, {
        params: {
          filters: JSON.stringify(filters)         
        }
      })  
        .then(response => {
          this.items = response.data.tableData
        })
    },
    getUomLists() {
      api.getAll(`${this.endpoint.inventory.uom}/item`, {})  
        .then(response => {
          this.uoms = response.data.tableData
        })
    },
    back() {
      this.main = true
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'
      this.data.type = 1
      this.bindGridItems()
    },
    edit(item) {
      if (!item) return
      this.isButtonShowItemDisabled()
      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }
      this.bindGridItems()
      // Get item details
      api.getAll(`${this.endpoint.inventory.adjustment}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data.tableData
        })

      // Set focus to order code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Void?',
          'Are you sure want to void this data?')
      ) {
        api.delete(this.endpoint.inventory.adjustment, item.code)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async save(closeDialog) {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Please kindly check mandatory fields or fields that have an error.')
        return
      }      
      
      const data = this.data
      data.itemDetails = this.gridItem.data

      if (data.itemDetails.length === 0) {
        this.$store.dispatch('app/showInfo', 'Item cannot be empty.')
        return
      }
      let result = { success: false, message: '' }
      if (this.data.action === 'add') {
        const resp = await api.create(this.endpoint.inventory.adjustment, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.inventory.adjustment, this.data.code, this.data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else {
          this.data.code = result.data
        }
        this.getList(!closeDialog)
      }
    },
    close() {
      this.reset()
      this.dialog.add = false
    },
    async changeType() {
      if (this.gridItem.data.length > 0) this.gridItem.data = []
      this.bindGridItems()
      this.isButtonShowItemDisabled()
    },
    changeLocation() {
      this.gridItem.data = []
      this.getItemLists()
      this.isButtonShowItemDisabled()
    },
    bindGridItems() {
      if (this.data.type === 1) this.bindAdjustmentTable()
      else this.bindStockOpnameTable()
    },
    bindStockOpnameTable() {
      this.gridItem.columns = [
        { value: 'action', sortable: false, divider: true, width: '90'},
        { text: 'Item', value: 'itemId', divider: true, width: '120' },
        { text: 'Name', value: 'itemName', divider: true, width: '300' },
        { text: 'Unit', value: 'unitName', sortable: false, divider: true, width: '100'},
        { text: 'Qty On Hand', value: 'qtyOnHand', sortable: false, divider: true, width: '75'},
        { text: 'Qty Opname', value: 'qtyOpname', sortable: false, divider: true, width: '75'},
        { text: 'Different', value: 'different', sortable: false, divider: true, width: '75'},
        // { text: 'COGS (smalles unit)', value: 'cogs', sortable: false, divider: true, width: '175'},
        // { text: 'Total COGS', value: 'totalCogs', sortable: false, divider: true, width: '175'},
        { text: 'Notes', value: 'notes', sortable: false, divider: true, width: '250'}
      ]
    }, 
    bindAdjustmentTable() {
      this.gridItem.columns = [
        { value: 'action', sortable: false, divider: true, width: '90'},
        { text: 'Item', value: 'itemId', divider: true, width: '120' },
        { text: 'Name', value: 'itemName', divider: true, width: '300' },
        { text: 'Unit', value: 'unitName', sortable: false, divider: true, width: '100'},
        { text: 'Qty On Hand', value: 'qtyOnHand', sortable: false, divider: true, width: '75'},
        { text: 'Qty To Adjust', value: 'qtyAdjust', sortable: false, divider: true, width: '75'},
        // { text: 'COGS (smalles unit)', value: 'cogs', sortable: false, divider: true},
        // { text: 'Total COGS', value: 'totalCogs', sortable: false, divider: true},
        { text: 'Notes', value: 'notes', sortable: false, divider: true, width: '250'}
      ]
    },
    addItem() {
      if (!this.data.warehouseCode) {
        this.$store.dispatch('app/showInfo', 'Please choose location first.')
        return
      }
      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0]?.itemId ?? null)) {
        let item = {}
        if (this.data.type === 'Stock Opname') {
          item = {
            id: randomNumber(-1, -1000),
            itemId: 0,
            name: null,
            unitName: null,
            units: [],
            qtyOnHand: 0,
            qtyOnTransit: 0,
            netOnHand: 0,
            qtyOpname: 0,
            different: 0,
            cogs: 0,
            totalCogs: 0,
            notes: ''
          }
        } else {
          item = {
            id: randomNumber(-1, -1000),
            itemId: 0,
            name: null,
            units: [],
            uomId: 0,
            oldUnitId: 0,
            oldUnitName: null,
            oldQtyOnHand: 0,
            unitId: 0,
            unitName: null,
            qtyOnHand: 0,
            qtyAdjust: 0,
            cogs: 0,
            notes: ''
          }
        } 
        this.gridItem.data.push(item)
        setTimeout(() => {
          this.$refs.itemId.focus()
        }, 0)
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
      const data_i = this.items.find(i => i.id === item.itemId)
      if (data_i) {
        item.itemId = data_i.id
        item.uomId = data_i.uomId
        item.itemName = data_i.name
        item.oldUomId = item.uomId
        item.unitName = data_i.uomBuyName
        item.qtyOnHand = data_i.qtyOnHand            
        item.baseQtyOnHand = item.qtyOnHand
        item.notes = null
        item.qtyAdjust = 0
        item.qtyOpname = 0
        item.different = 0
        if (item.state !== 'A') {
          item.state = 'M'
        }
      }
      this.getUnitItemLists(item)
    },
    showFindItemDialog(item) {
      this.$refs.findItem.open(item, this.data.warehouseCode)
    },
    bindItemData(rowItem) {
      this.itemIdChange(rowItem)
    },
    getWarehouseLists() {
      api.getAll(`${this.endpoint.inventory.warehouse}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.warehouses = response.data.tableData
        })
    },
    isButtonShowItemDisabled() {
      this.showItemDisabled =  this.gridItem.data.length > 0 && this.data.type === 2
    }
  }
}

</script>

<style>
</style>