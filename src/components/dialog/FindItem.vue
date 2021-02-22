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
                    v-model="search.category"
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
                    <v-select
                      v-model="search.by"
                      :items="search.items"
                      label="Search By"
                      class="mt-0"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="8" class="pl-md-1">
                    <v-text-field
                      ref="search"
                      v-model="search.value"
                      label="Search Text"
                      class="mt-0"
                      @keyup.enter="doSearch"
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
                  ></v-data-table>
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
  props: {
    caller: String
  },
  
  data() {
    return {
      dialog: false,
      valid: false,
      categories: [],
      initOpenTV: [],
      units: [],
      search: {
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
      data: {},
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
      this.search.category = [0]
      this.search.by = 'name'
      this.search.value = ''
      this.grid.data = []
    },
    open(rowItem) {
      this.dialog = true
      this.rowItem = rowItem
      this.reset()
      setTimeout(() => {
        this.grid.height = this.$refs.dialog.$refs.content.clientHeight - 186
        this.$refs.search.focus()
      }, 0)
    },
    getCategoryHierarchy() {
      api.getAll(`${this.endpoint.inventory.item.category}/hierarchy`)
        .then(response => {
          this.categories = response.data
          this.search.category = [0]
          this.initOpenTV = [0]
        })
    },
    doSearch() {
      api.getAll(this.endpoint.inventory.item.item, {
        params: {
          category: this.search.category,
          searchBy: this.search.by,
          search: this.search.value
        }
      })
        .then(response => {
          this.grid.data = response.data
        })
    },
    calcUomConversion(unitToConvert) {
      const data = this.units.find(u => u.unitToConvert === unitToConvert && u.unitToConvert !== u.unitEquivalent)
      this.data.uomConversion *= data.conversion
      
      if (this.caller === 'sls') {
        if (data.unitEquivalent !== this.data.uomSellName) {
          this.calcUomConversion(data.unitEquivalent)
        }
      } else if (data.unitEquivalent !== this.data.uomBuyName) {
        this.calcUomConversion(data.unitEquivalent)
      }
    },
    calcPrice() {
      this.data.nettPrice = this.data.unitPrice - this.data.disc
      this.data.total = this.data.qty * this.data.nettPrice
    },
    dblclickRow(event, { item }) {
      this.rowItem.itemCode = item.code
      this.$emit('dblclick:row', this.rowItem, item)
      this.dialog = false
    },
    unitChange() {
      this.data.uomConversion = 1

      if (this.caller === 'sls') {
        if (this.data.unit.unitEquivalent !== this.data.uomSellName) {
          this.calcUomConversion(this.data.unit.unitEquivalent)
        }
        this.data.unitPrice = this.data.itemSellPrice / this.data.uomConversion
      } else {
        if (this.data.unit.unitEquivalent !== this.data.uomBuyName) {
          this.calcUomConversion(this.data.unit.unitEquivalent)
        }
        this.data.unitPrice = this.data.itemBuyPrice / this.data.uomConversion
      }

      this.calcPrice()
    }
  }
}
</script>
