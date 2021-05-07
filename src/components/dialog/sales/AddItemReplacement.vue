<template>
  <v-dialog
    v-model="dialog"
    :width="options.width"
    persistent
    scrollable
    @keydown.esc="close"
  >
    <v-card>
      <v-toolbar
        color="indigo darken-1"
        dark
        dense
      >
        <v-toolbar-title>Item</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <v-card>
          <v-form ref="form"
            v-model="valid">
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
                  @click="add"
                  @shortkey="add"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Add
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + I)</span>
            </v-tooltip>
          </v-app-bar>
          <v-data-table
            :headers="grid.columns"
            :items="grid.data"
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
            <template v-slot:[`item.qty`]="{ item }">
              <v-currency-field
                v-model="item.qty"
                :decimal-length="0"
                :min="1"
                class="text-body-2 text-right mt-0"
                dense
                @change="calcItemPrice(item)"
              ></v-currency-field>
            </template>
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
            <template v-slot:[`item.unitPrice`]="{ item }">
              <v-currency-field
                v-model="item.unitPrice"
                class="text-body-2 text-right mt-0"
                dense
                @change="calcItemPrice(item)"
              ></v-currency-field>
            </template>
          </v-data-table>
          </v-form>
        </v-card>
      </v-card-text>
      <v-card-actions class="justify-end pb-2 pr-2">
        <v-btn
          color="blue darken-2"
          class="font-weight-regular"
          dark
          small
          tile
          @click="save"
        >
          <v-icon left>mdi-content-save</v-icon>
          Save
        </v-btn>
        <v-btn
          color="red darken-2"
          class="font-weight-regular"
          dark
          small
          tile
          @click="close"
        >
          <v-icon left>mdi-close-circle-outline</v-icon>
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
    <confirm ref="confirm"></confirm>
  </v-dialog>
</template>

<script>

import Confirm from '@/components/dialog/Confirm'
import { mapState } from 'vuex'
import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'

export default {
  props: {
    items: Array
  },
  components: {
    Confirm
  },

  created: function () {
    this.rules = this.$store.state.app.rules
  },
  data() {
    return {
      rules: {},
      dialog: false,
      data: {
        by: 'code',
        value: '',
        items: [
          { text: 'Code', value: 'code' },
          { text: 'Date', value: 'date' },
          { text: 'SO Code', value: 'soCode' }
        ]
      },
      rowItem: {},
      grid: {
        columns: [
          { value: 'action', sortable: false, divider: true, width: '90' },
          { text: 'Item', value: 'itemId', divider: true, width: '100' },
          { text: 'Name', value: 'itemName', divider: true, width: '280' },
          { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
          { text: 'Unit', value: 'unitName', divider: true, width: '90' },
          { text: 'Unit Price', value: 'unitPrice', align: 'right', divider: true, width: '120' }
        ],
        data: []
      },
      options: {
        width: 800
      },
      valid: false
    }
  },
  computed: {
    ...mapState({
      endpoint: state => state.api.endpoint
    })
  },
  methods: {
    reset() {
      this.data.by = 'code'
      this.data.value = ''
      this.grid.data = []
    },
    open(rowItem, options) {
      this.dialog = true
      this.reset()
      this.rowItem = rowItem
      if (this.rowItem.itemIdReplacements) {
        this.rowItem.itemIdReplacements.forEach(element => {
          this.grid.data.push(element)          
        })
      }
      this.options = Object.assign(this.options, options)
    },
    close() {      
      this.dialog = false
    },
    getUnitItemLists(item) {
      api.getAll(`${this.endpoint.inventory.uom}/item`, {
        params: { uomId: item.uomId }
      })
        .then(response => {
          item.units = response.data.tableData
        })
    },
    save() {      
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Please kindly check mandatory fields or fields that have an error.')
        return
      }
      this.$emit('save', this.rowItem, this.grid.data)
      this.dialog = false
    },
    add() {
      const item = {
        id: randomNumber(-1, -1000),
        code: this.data.code,
        itemId: null,
        itemName: null,
        qty: 1,
        qtyDlv: 0,
        length: null,
        width: null,
        height: null,
        weight: null,
        dimensionMeasurement: null,
        weightMeasurement: null,
        units: [],
        uomId: null,
        oldUnitId: null,
        oldUnitName: null,
        oldUnitPrice: 0,
        unitId: null,
        unitName: null,
        unitPrice: 0,
        disc: 0,
        taxAmount: 0,
        nettPrice: 0,
        total: 0,
        dpp: 0,
        totTax: 0,
        totDPP: 0,
        state: 'A'
      }
      this.grid.data.push(item)
    },
    itemIdChange(item) {
      const data_i = this.items.find(i => i.id === item.itemId)
      if (data_i) {
        item.itemName = data_i.name
        item.qty = 1
        item.length = data_i.length
        item.width = data_i.width
        item.height = data_i.height
        item.weight = data_i.weight
        item.dimensionMeasurement = data_i.dimensionMeasurement
        item.weightMeasurement = data_i.weightMeasurement
        item.uomId = data_i.uomId
        item.oldUnitId = data_i.uomSellId
        item.oldUnitName = data_i.uomSellName
        item.oldUnitPrice = data_i.sellPrice
        item.unitId = data_i.uomSellId
        item.unitName = data_i.uomSellName
        item.unitPrice = data_i.sellPrice
        item.disc = 0
        item.taxId = data_i.purchaseTaxId
        item.taxAmount = 0
        item.nettPrice = data_i.sellPrice
        item.dpp = data_i.sellPrice
        if (item.state !== 'A') {
          item.state = 'M'
        }
        //Get unit item lists
        this.getUnitItemLists(item)
      }
    },
    unitItemChange(item) {
      const oldUnit = item.units.find(u => u.id === item.oldUnitId)
      const unit = item.units.find(u => u.id === item.unitId)

      if (oldUnit.seq < unit.seq) {
        item.uomConversion = unit.conversion
        if (unit.unitToConvert !== item.oldUnitName) {
          this.calcUomConversion(true, item, unit.unitToConvert)
        }
        item.unitPrice = item.oldUnitPrice * item.uomConversion
      } else {
        item.uomConversion = 1
        if (unit.unitEquivalent !== item.oldUnitName) {
          this.calcUomConversion(false, item, unit.unitEquivalent)
        }
        item.unitPrice = item.oldUnitPrice / item.uomConversion
      }

      // Calc item price
      this.calcItemPrice(item)
    },
    calcUomConversion(seqSmaller, item, unitCode) {
      if (seqSmaller) {
        const data = item.units.find(u => u.unitEquivalent === unitCode)
        item.uomConversion *= data.conversion

        if (data.unitToConvert !== item.oldUnitName) {
          this.calcUomConversion(seqSmaller, item, data.unitToConvert)
        }
      } else {
        const data = item.units.find(u => u.unitToConvert === unitCode && !u.isBaseUnit)
        item.uomConversion *= data.conversion

        if (data.unitEquivalent !== item.oldUnitName) {
          this.calcUomConversion(seqSmaller, item, data.unitEquivalent)
        }
      }
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Delete?',
          'Are you sure want to delete this data?')
      ) {
        const idx = this.grid.data.findIndex(i => i.id === item.id)
        this.grid.data.splice(idx, 1)
      }
    }
  }
}
</script>