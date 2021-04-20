<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    fullscreen
    scrollable
  >
    <v-card :style="{ background: $vuetify.theme.themes[theme].surface }">
      <v-toolbar
        color="deep-purple darken-1"
        max-height="64"
        dark
      >
        <v-toolbar-title>Item</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          dark
          @click="dialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 py-0">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-card
              :max-height="$vuetify.breakpoint.xs ? 398 : grid.height + 98"
              style="overflow-y: scroll"
              class="h-full"
            >
              <v-card-text>
                <v-row no-gutters>
                  <v-treeview
                    v-model="data.category"
                    :items="categories"
                    :open.sync="initOpenTV"
                    activatable
                    dense
                    hoverable
                    selectable
                    open-on-click
                  ></v-treeview>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="8">
            <v-card>
              <v-card-text>
                <v-row no-gutters>
                  <v-col cols="12" md="4">
                    <v-autocomplete
                      v-model="data.by"
                      :items="data.items"
                      label="Search By"
                      class="mt-0"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" md="8" class="pl-md-1">
                    <v-text-field
                      ref="search"
                      v-model="data.value"
                      label="Search Text"
                      class="mt-0"
                      @keyup.enter="search"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-card>
                  <v-data-table
                    :headers="grid.columns"
                    :height="grid.height"
                    :items="grid.data"
                    :items-per-page="-1"
                    class="elevation-1 row-pointer"
                    dense
                    disable-sort
                    fixed-header
                    hide-default-footer
                    @dblclick:row="dblclickRow"
                  >
                    <template v-slot:[`item.initial`]="{ item }">
                      <v-text-field
                        v-model="item.initial"
                        class="text-body-2 mt-0 no-border"
                        dense
                        readonly
                        @keyup.enter="dblclickRow(null, { item })"
                      ></v-text-field>
                    </template>
                  </v-data-table>
                </v-card>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { remove as _remove } from 'lodash'

import api from '@/services/axios.service'

export default {
  data() {
    return {
      dialog: false,
      valid: false,
      categories: [],
      initOpenTV: [],
      data: {
        category: [0],
        by: 'name',
        value: '',
        items: [
          { text: 'Initial', value: 'initial' },
          { text: 'Name', value: 'name' },
          { text: 'Type', value: 'typeName' }
        ]
      },
      rowItem: {},
      grid: {
        columns: [
          { text: 'Initial', value: 'initial', divider: true, width: '120' },
          { text: 'Name', value: 'name', divider: true, width: '300' },
          { text: 'Type', value: 'typeName', divider: true, width: '150' },
          { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '100' },
          { text: 'Unit', value: 'uomBuyName', divider: true, width: '150' },
          { text: 'Category', value: 'categoryName', width: '150' }
        ],
        data: [],
        height: 300
      }
    }
  },

  mounted: function () {
    this.getCategoryHierarchy()
  },

  computed: {
    ...mapState('api', { endpoint: state => state.endpoint }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },
  
  methods: {
    reset() {
      this.data.category = [0]
      this.data.by = 'name'
      this.data.value = ''
      this.grid.data = []
    },
    open(rowItem) {
      this.dialog = true
      this.rowItem = rowItem
      this.reset()
      setTimeout(() => {
        this.grid.height = this.$refs.dialog.$refs.content.clientHeight - 178
        this.$refs.search.focus()
      }, 500)
    },
    getCategoryHierarchy() {
      api.getAll(`${this.endpoint.inventory.item.category}/hierarchy`)
        .then(response => {
          this.categories = [response.data]
          this.data.category = [0]
          this.initOpenTV = [0]
        })
    },
    search() {
      api.getAll(this.endpoint.inventory.item.item, {
        params: {
          category: JSON.stringify(
            _remove([...this.data.category], function (val) {
              return val > 0
            })
          ),
          filters: JSON.stringify([{
            field: this.data.by,
            operator: 'contains',
            keyword: this.data.value
          }, {
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: this.data.by,
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
        })
    },
    dblclickRow(event, { item }) {
      this.rowItem.itemId = item.id
      this.$emit('dblclick:row', this.rowItem, item)
      this.dialog = false
    }
  }
}
</script>
