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

      <v-card-text class="px-2">
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
                    fixed-header
                    hide-default-footer
                    @dblclick:row="dblclickRow"
                  >
                    <template v-slot:[`item.code`]="{ item }">
                      <v-text-field
                        v-model="item.code"
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
          { text: 'Code', value: 'code' },
          { text: 'Name', value: 'name' },
          { text: 'Type', value: 'type' }
        ]
      },
      rowItem: {},
      grid: {
        height: 300,
        data: [],
        columns: [
          { text: 'Code', value: 'code', divider: true, width: '120' },
          { text: 'Name', value: 'name', divider: true, width: '300' },
          { text: 'Type', value: 'type', divider: true, width: '150' },
          { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '100' },
          { text: 'Unit', value: 'unit', divider: true, width: '150' },
          { text: 'Category', value: 'category', width: '150' }
        ]
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
        this.grid.height = this.$refs.dialog.$refs.content.clientHeight - 186
        this.$refs.search.focus()
      }, 1000)
    },
    getCategoryHierarchy() {
      api.getAll(`${this.endpoint.inventory.item.category}/hierarchy`)
        .then(response => {
          this.categories = response.data
          this.data.category = [0]
          this.initOpenTV = [0]
        })
    },
    search() {
      api.getAll(this.endpoint.inventory.item.item, {
        params: {
          category: this.data.category,
          searchBy: this.data.by,
          search: this.data.value
        }
      })
        .then(response => {
          this.grid.data = response.data
        })
    },
    dblclickRow(event, { item }) {
      this.rowItem.itemCode = item.code
      this.$emit('dblclick:row', this.rowItem, item)
      this.dialog = false
    }
  }
}
</script>
