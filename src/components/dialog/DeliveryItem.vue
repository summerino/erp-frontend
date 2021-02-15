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
        <!-- <v-row dense>
          <v-col cols="12">
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
        </v-row> -->

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
                    <v-col cols="12" md="4">
                      <v-currency-field
                        v-model="data.orderQty"
                        label="Order Qty"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-col>
                    <v-col cols="12" md="4" class="pl-md-1">
                      <v-select
                        v-model="data.unitId"
                        :items="units"
                        item-text="unitEquivalent"
                        item-value="id"
                        label="Unit"
                        class="mt-0"
                        readonly
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="4" class="pl-md-1">
                      <v-currency-field
                        ref="qty"
                        v-model="data.qty"
                        label="Received Qty"
                        class="text-right mt-0"
                      ></v-currency-field>
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-text-field
                        v-model="data.description"
                        label="Description"
                        class="mt-0"
                      ></v-text-field>
                    </v-col>
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
      units: [],
      types: [
        { text: 'Normal', value: 0 },
        { text: 'Bonus', value: 1 }
      ],
      search: {
        by: 'poCode',
        value: '',
        items: [
          { text: 'PO Code', value: 'poCode' },
          { text: 'Item Code', value: 'itemCode' },
          { text: 'Item Name', value: 'itemName' }
        ]
      },
      data: {},
      grid: {
        data: [],
        columns: [
          { text: 'PO Code', value: 'poCode', divider: true, width: '120' },
          { text: 'PO Date', value: 'poDate', divider: true, width: '120' },
          { text: 'Item Code', value: 'itemCode', divider: true, width: '120' },
          { text: 'Item Name', value: 'itemName', divider: true, width: '300' },
          { text: 'Order Qty', value: 'qty', align: 'right', divider: true, width: '100' },
          { text: 'Unit', value: 'unitName', divider: true, width: '150' }
        ]
      }
    }
  },

  computed: {
    ...mapState('api', { endpoint: state => state.endpoint }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },
  
  methods: {
    reset() {
      this.search.by = 'poCode'
      this.search.value = ''
      this.grid.data = []
      this.data = {
        poCode: null,
        itemId: null,
        itemCode: null,
        itemName: null,
        orderQty: 0,
        outstandingQty: 0,
        qty: 0,
        uomId: null,
        unitId: null,
        warehouse: null
      }
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
        poCode: item.poCode,
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        orderQty: item.orderQty,
        qty: item.qty,
        uomId: item.uomId,
        unitId: item.unitId,
        unitName: item.unitName,
        description: item.description,
        state: item.state
      }
      
      this.getUnitLists(item.uomId)
    },
    getUnitLists(uomId) {
      api.getAll(this.endpoint.inventory.uom.conversion, {
        params: { uomId: uomId }
      })
        .then(response => {
          this.units = response.data
        })
    },
    doSearch() {
      api.getAll(`${this.endpoint.purchase.order}/incomplete`, {
        params: {
          supCode: this.supCode,
          searchBy: this.search.by,
          search: this.search.value
        }
      })
        .then(response => {
          this.grid.data = response.data
        })
    },
    dblclickRow(event, { item }) {
      this.data.poCode = item.poCode
      this.data.itemId = item.itemId
      this.data.itemCode = item.itemCode
      this.data.itemName = item.itemName
      this.data.orderQty = item.qty
      this.data.outstandingQty = 0
      this.data.qty = 1
      this.data.uomId = item.uomId
      this.data.unitId = item.unitId
      this.data.unitName = item.unitName
      this.data.warehouse = {
        code: item.warehouseCode,
        initial: item.warehouseInitial,
        name: item.warehouseName
      }
      this.data.typeId = 0

      this.getUnitLists(item.uomId)

      this.$refs.form.$el.scrollIntoView()
      this.$refs.qty.$refs.textfield.focus()
    },
    save() {
      this.$emit('save', this.data)
      this.dialog = false
    }
  }
}
</script>
