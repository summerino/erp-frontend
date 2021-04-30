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
                :disabled="item.isActive === false"
                color="red"
                icon
                small
                @click="remove(item)"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Delete</span>
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
          <v-toolbar-title>Item Group</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="data.isActive === false"
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
                  :disabled="data.isActive === false"
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
                      <v-col cols="12" md="6" class="pr-md-3">
                        <v-text-field
                          ref="Initial"
                          v-model="data.initial"
                          label="Initial"
                          :readonly="data.isActive === false"
                          class="mt-0"
                          :rules="[rules.required[0], rules.max20chars[0]]"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-3">
                        <v-text-field
                          ref="Name"
                          v-model="data.name"
                          label="Name"
                          :readonly="data.isActive === false"
                          class="mt-0"
                          :rules="[rules.required[0], rules.max50chars[0]]"
                          required
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
                  <v-card-title>
                    Sub Group &nbsp;
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on" small>mdi-help-circle</v-icon>
                      </template>
                      <span class="text-caption">Value of sub group must be separated using a punctuation mark (;). ex: "Value1; Value2; Value3" etc</span>
                    </v-tooltip>
                  </v-card-title>
                  <v-app-bar dense flat>
                    <v-spacer></v-spacer>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs"
                          v-on="on"
                          v-shortkey="['ctrl', 'i']"
                          :disabled="data.isActive === false"
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

                  <v-card-text>
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
                              :disabled="data.isActive === false"
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
                      <template v-slot:[`item.name`]="{ item }">
                        <v-text-field
                          ref="itemName"
                          v-model="item.name"
                          :readonly="data.isActive === false"
                          class="mt-0"
                          dense
                        ></v-text-field>
                      </template>
                      <template v-slot:[`item.value`]="{ item }">
                        <v-text-field
                          ref="itemValue"
                          v-model="item.value"
                          :readonly="data.isActive === false"
                          class="mt-0"
                          dense
                        ></v-text-field>
                      </template>
                    </v-data-table>
                  </v-card-text>
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
      receiveDate: false
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Initial', value: 'initial', divider: true, width: '110' },
        { text: 'Name', value: 'name', divider: true, width: '270' },
        { text: 'Status', value: 'isActive', align: 'center', width: '50' }
      ],
      data: [],
      options: {
        sortBy: ['initial'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridItem: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Name', value: 'name', divider: true, width: '120' },
        { text: 'Value', value: 'value', divider: true, width: '300' }
      ],
      data: []
    },
    valid: false,
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
        initial: '',
        name: '',
        isActive: null
      }
      this.gridItem.data = []

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

      api.getAll(this.endpoint.inventory.item.group, {
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
    close() {
      this.dialog.add = false
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'
      this.data.isActive = true    

      setTimeout(() => {
        // Set focus to receive initial field
        this.$refs.Initial.focus()

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    edit(item) {
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit'
      }

      // Get item details
      api.getAll(`${this.endpoint.inventory.item.group}/item`, {
        params: { id: item.id }
      })
        .then(response => {
          this.gridItem.data = response.data.tableData
        })

      // Set focus to receive code field
      setTimeout(() => {
        this.$refs.Initial.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Inactive?',
          'Are you sure want to inactive this data?')
      ) {
        api.delete(this.endpoint.inventory.item.group, item.id)
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

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.inventory.item.group, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.inventory.item.group, data.id, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else {
          this.data.initial = result.data
        }
        this.getList(!closeDialog)
      }
    },
    addItem() {
      if (this.gridItem.data.length < 10) {
        const item = {
          id: randomNumber(-1, -1000),
          name: null,
          value: null,
          state: 'A'
        }
        this.gridItem.data.push(item)

        setTimeout(() => {
          this.$refs.itemName.focus()
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
        if (idx !== -1) {
          this.gridItem.data.splice(idx, 1)
        }
      }
    }
  }
}
</script>
