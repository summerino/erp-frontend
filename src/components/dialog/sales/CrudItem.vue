<template>
  <v-dialog
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
        <v-btn
          icon
          dark
          @click="dialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Item</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            dark
            text
            @click="save"
          >
            Save
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text class="px-2">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-card
              max-height="398"
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
                    :items="grid.data"
                    :items-per-page="-1"
                    height="300"
                    class="elevation-1 row-pointer"
                    fixed-header
                    hide-default-footer
                    @dblclick:row="dblclickRow"
                  ></v-data-table>
                </v-card>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-form
          ref="form"
          v-model="valid"
        >
          <v-row dense>
            <v-col cols="12">
              <v-card>
                <v-card-text>
                  <v-row no-gutters>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="data.itemCode"
                        label="Item Code"
                        class="mt-0"
                        readonly
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="9" class="pl-md-1">
                      <v-text-field
                        v-model="data.itemName"
                        label="Item Name"
                        class="mt-0"
                        readonly
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="12" md="3">
                      <v-currency-field
                        ref="qty"
                        v-model="data.qty"
                        label="Qty"
                        class="text-right mt-0"
                        @change="calcPrice"
                      ></v-currency-field>
                      </v-col>
                    <v-col cols="12" md="4" class="pl-md-1">
                      <v-select
                        v-model="data.unit"
                        :items="units"
                        item-text="unitEquivalent"
                        item-value="id"
                        label="Unit"
                        class="mt-0"
                        return-object
                        @change="unitChange"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="5" class="pl-md-1">
                      <v-currency-field
                        v-model="data.unitPrice"
                        label="Unit Price"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="12" md="3">
                      <v-currency-field
                        v-model="data.disc"
                        label="Discount"
                        class="text-right mt-0"
                        @change="calcPrice"
                      ></v-currency-field>
                    </v-col>
                    <v-col cols="12" md="4" class="pl-md-1">
                      <v-currency-field
                        v-model="data.nettPrice"
                        label="Nett Price"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-col>
                    <v-col cols="12" md="5" class="pl-md-1">
                      <v-currency-field
                        v-model="data.total"
                        label="Total Price"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-text-field
                      v-model="data.description"
                      label="Description"
                      class="mt-0"
                    ></v-text-field>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from '@/axios'

export default {
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
      data: {
        action: '',
        itemCode: null,
        itemName: null,
        qty: 0,
        unit: null,
        uomConversion: 1,
        uomSellName: null,
        unitPrice: 0,
        disc: 0,
        nettPrice: 0,
        total: 0,
        description: null
      },
      grid: {
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
      this.data = {}
    },
    add() {
      this.dialog = true
      this.reset()
      this.data.action = 'add'
      setTimeout(() => {
        this.$refs.search.focus()
      }, 0)
    },
    edit(item) {
      this.dialog = true
      this.reset()
      
      this.data = {
        action: 'edit',
        rowId: item.rowId,
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        qty: item.qty,
        unit: { id: item.unitId, unitEquivalent: item.unitName },
        uomSellName: item.uomSellName,
        unitPrice: item.unitPrice,
        itemSellPrice: item.itemSellPrice,
        disc: item.disc,
        nettPrice: item.nettPrice,
        total: item.total,
        description: item.description,
        state: item.state
      }
      
      this.getUnitLists(item.uomId)
    },
    getCategoryHierarchy() {
      axios.get('/item/category/hierarchy')
        .then(response => {
          this.categories = response.data
          this.search.category = [0]
          this.initOpenTV = [0]
        })
    },
    getUnitLists(uomId) {
      axios.post('/uom-conversion/list', { uomId: uomId })
        .then(response => {
          this.units = response.data
        })
    },
    doSearch() {
      axios.post('/item/list', {
        category: this.search.category,
        searchBy: this.search.by,
        search: this.search.value
      })
        .then(response => {
          this.grid.data = response.data
        })
    },
    calcUomConversion(unitToConvert) {
      const data = this.units.find(u => u.unitToConvert === unitToConvert && u.unitToConvert !== u.unitEquivalent)
      this.data.uomConversion *= data.conversion
      
      if (data.unitEquivalent !== this.data.uomSellName) {
        this.calcUomConversion(data.unitEquivalent)
      }
    },
    calcPrice() {
      this.data.nettPrice = this.data.unitPrice - this.data.disc
      this.data.total = this.data.qty * this.data.nettPrice
    },
    dblclickRow(event, { item }) {
      this.data.itemId = item.id
      this.data.itemCode = item.code
      this.data.itemName = item.name
      this.data.qty = 1
      this.data.uomId = item.uomId
      this.data.unit = { id: item.uomSellId, unitEquivalent: item.uomSellName }
      this.data.uomSellName = item.uomSellName
      this.data.unitPrice = item.sellPrice
      this.data.itemSellPrice = item.sellPrice
      this.data.disc = 0

      this.getUnitLists(item.uomId)
      this.calcPrice()

      this.$refs.form.$el.scrollIntoView()
      this.$refs.qty.$refs.textfield.focus()
    },
    unitChange() {
      this.data.uomConversion = 1

      if (this.data.unit.unitEquivalent !== this.data.uomSellName) {
        this.calcUomConversion(this.data.unit.unitEquivalent)
      }

      this.data.unitPrice = this.data.itemSellPrice / this.data.uomConversion
      this.calcPrice()
    },
    save() {
      this.$emit('save', this.data)
      this.dialog = false
    }
  }
}
</script>
