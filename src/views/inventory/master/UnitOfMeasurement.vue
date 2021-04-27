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
            <span class="text-caption">Edit</span>
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
            <span>Inactive</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.total`]="{ item }">
          {{ item.total | formatCurrency }}
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
          <v-toolbar-title>Unit Of Measurement</v-toolbar-title>
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
            <v-row>
              <v-col cols="12">
                <v-card>
                  <v-card-title>Unit Of Measurement</v-card-title>
                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                            v-model="data.initial"
                            ref="initial"
                            :rules="[rules.max20chars[0], rules.required[0]]"
                            :counter="20"
                            class="text-body-2 mt-0"
                            label="Initial"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                            v-model="data.description"
                            :rules="[rules.max100chars[0], rules.required[0]]"
                            :counter="100"
                            class="text-body-2 mt-0"
                            label="Name"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                            v-model="data.baseUnit"
                            :rules="[rules.max20chars[0], rules.required[0]]"
                            :counter="20"
                            @blur="resetItems"
                            class="text-body-2 mt-0"
                            label="Base Unit"
                        ></v-text-field>
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
                        <v-tooltip v-if="isCanDelete(item.id)" bottom>
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
                        <template v-slot:[`item.conversion`]="{ item }">
                        <v-currency-field
                            v-model="item.conversion"
                            :readonly="isFirstRecord(item.id)"
                            class="text-body-2 text-right mt-0"
                            dense
                        ></v-currency-field>
                        </template>
                        <template v-slot:[`item.unitToConvert`]="{ item }">
                          <span>{{ item.unitToConvert }}</span>
                        </template>
                        <template v-slot:[`item.unitToConvertLabel`]="{ item }">
                          <span>{{ item.unitToConvertLabel }}</span>
                        </template>
                        <template v-slot:[`item.unitEquivalent`]="{ item }">
                        <v-text-field
                            v-model="item.unitEquivalent"
                            :readonly="!isLastRecord(item.id)"
                            :rules="rules.max20chars"
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'
import Confirm from '@/components/dialog/Confirm'

export default {
  components: {
    Confirm
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      orderDate: false
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Initial', value: 'initial', divider: true },
        { text: 'Name', value: 'description', divider: true },
        { text: 'Base Unit', value: 'baseUnit', divider: true }
      ],
      data: [],
      options: {
        sortBy: ['id'],
        sortDesc: [true]
      },
      total: 0,
      search: null
    },
    gridItem: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Conversion', value: 'conversion', divider: true },
        { text: 'Unit To Convert', value: 'unitToConvert', divider: true },
        { text: '= 1', value: 'unitToConvertLabel', divider: true },
        { text: 'Unit Equivalent', value: 'unitEquivalent', divider: true }
      ],
      data: []
    },
    valid: false,
    items: [],
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
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        id: 0,
        initial: null,
        description: null,
        baseUnit: null
      }
      this.gridItem.data = []
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
      
      api.getAll(this.endpoint.inventory.uom.uom, {
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
      api.getAll(this.endpoint.inventory.item.item, { id : '8'})  
        .then(response => {
          this.items = response.data.tableData
        })
    },
    close() {
      this.dialog.add = false
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'

      setTimeout(() => {
        // Set focus to order code field
        this.$refs.initial.focus()

        // Validate form first
        //this.$refs.form.validate()
      }, 0)
    },
    edit(item) {
      if (!item) return
      // map name to description
      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get item details
      api.getAll(`${this.endpoint.inventory.uom.uom}/item`, {
        params: { uomId: item.id }
      })
        .then(response => {
          this.gridItem.data = response.data.tableData
          this.bindListItems(response.data.tableData)
        })

      setTimeout(() => {
        //this.$refs.initial.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Void?',
          'Are you sure want to delete this data?')
      ) {
        api.delete(this.endpoint.inventory.uom.uom, item.id)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async save(closeDialog) {
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Please kindly check mandatory fields or fields that have an error.')
        return
      }

      const data = this.data
      data.details = this.gridItem.data
      
      if (data.details.length === 0 || !this.validateDetails()) {
        this.$store.dispatch('app/showInfo', 'Please kindly check mandatory fields or fields that have an error.')
        return
      }
      if (this.validateIsHasDuplicateItem()) {
        this.$store.dispatch('app/showInfo', 'Cannot add duplicate item.')
        return
      }
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.inventory.uom.uom, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.inventory.uom.uom, data.code, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else {
          this.data.code = result.data
        }
        this.getList()
      }
    },
    initiateFirstItem() {
      const item = {
        id: randomNumber(-1, -1000),
        unitToConvert: this.data.baseUnit,
        unitToConvertLabel: '= 1',
        unitEquivalent: this.data.baseUnit,
        conversion: 1,
        isBaseUnit: true,
        seq: 1,
        state: 'A'
      }
      if (this.gridItem.data.length === 0) {
        item.unitEquivalent = this.data.baseUnit
      }
      this.gridItem.data.push(item)
    },
    addNewItem() {
      const lastMeasurement = this.gridItem.data[this.gridItem.data.length - 1].unitEquivalent
      const item = {
        id: randomNumber(-1, -1000),
        unitToConvert: lastMeasurement,
        unitToConvertLabel: '= 1',
        unitEquivalent: null,
        conversion: 0,
        isBaseUnit: false,
        seq: this.gridItem.data.length + 1,
        state: 'A'
      }
      this.gridItem.data.push(item)
    },
    addItem() {
      if (!this.data.baseUnit) {
        this.$store.dispatch('app/showInfo', 'Cannot add item, base unit is empty')
        return
      }
      // if (!this.validateLastRecord()) {
      //   this.$store.dispatch('app/showInfo', 'Conversion or Unit Equivalent in the last item cannot be zero or is empty.')
      //   return
      // }      
      this.addNewItem()
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
    bindListItems(data) {
      const result = []
      data.forEach(item => {
        const temp = {
          id : item.id,
          unitToConvert : item.unitToConvert,
          unitToConvertLabel : '= 1',
          unitEquivalent : item.unitEquivalent,
          conversion : item.conversion,
          isBaseUnit : item.isBaseUnit,
          seq : item.seq,
          state : 'E'
        }
        result.push(temp)
      })
      this.gridItem.data = result
    },
    isLastRecord(id) {
      return this.gridItem.data[this.gridItem.data.length - 1].id === id
    },
    isFirstRecord(id) {
      return this.gridItem.data[0].id === id
    },
    isCanDelete(id) {
      if (this.isFirstRecord(id)) return false
      return this.isLastRecord(id)
    },
    resetItems() {
      this.gridItem.data = []      
      this.initiateFirstItem()
      this.addNewItem()
    },
    validateLastRecord() {
      let result = true
      const lastItem = this.gridItem.data[this.gridItem.data.length - 1]
      if (lastItem.conversion === 0 || !lastItem.conversion || !lastItem.unitEquivalent) {
        result = false
      }
      if (this.validateLastItemIfDuplicate(lastItem)) {
        result = false
      } 
      return result
    },
    validateDetails() {
      let result = true
      const items = this.gridItem.data
      items.forEach(item => {
        if (item.conversion === 0 || !item.unitEquivalent) result = false
      }) 
      return result
    },
    validateLastItemIfDuplicate(data) {
      let result = false
      const items = this.gridItem.data
      items.forEach(item => {
        if (item.conversion === data.conversion && item.unitEquivalent === data.unitEquivalent) result = true
      }) 
      return result
    },
    validateIsHasDuplicateItem() {
      let result = false
      const items = this.gridItem.data
      for (let i = 0; i < items.length; i++) {
        const currentItem = items[i]
        const listToCompare = items.filter((_, index) => index !== i)
        const isExist = listToCompare.filter((data) => {
          return data.conversion === currentItem.conversion && data.unitEquivalent.toLowerCase() === currentItem.unitEquivalent.toLowerCase()
        }).length > 0
        if (isExist) result = true
      }
      return result
    }
  }
}
</script>
