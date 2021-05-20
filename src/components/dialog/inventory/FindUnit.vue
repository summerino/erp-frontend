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
        <v-toolbar-title>Satuan</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <v-row no-gutters>
          <v-col cols="12" md="6">
            <v-text-field
              label="Inisial"
              v-model="rowItem.itemId"
              class="ml-3"
              readonly
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              label="Nama"
              v-model="rowItem.itemName"
              class="ml-2 mr-3"
              readonly
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" md="6">
            <v-text-field
              label="Qty Sistem"
              v-model="rowItem.qtyOnHand"
              class="ml-3"
              dense
              readonly
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              label="Satuan"
              v-model="rowItem.unitName"
              class="ml-2 mr-3"
              dense
              readonly
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" md="6">
            <v-text-field
              label="Total Qty Aktual"
              v-model="rowItem.qtyOpname"
              class="ml-3"
              dense
              readonly
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              label="Satuan"
              v-model="rowItem.unitName"
              class="ml-2 mr-3"
              dense
              readonly
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-form ref="form"
            v-model="valid">
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
            <template v-slot:[`item.qtyAdjust`]="{ item }">
              <v-currency-field
                v-model="item.qtyAdjust"
                :decimal-length="0"
                :min="0"
                class="text-body-2 text-right mt-0"
                dense
                @change="calculateSumQtyOpname"
              ></v-currency-field>
            </template>
            <!-- <template v-slot:[`item.unitName`]="{ item }">
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
            </template> -->
          </v-data-table>
          </v-form>
        </v-row>
      </v-card-text>
      <v-card-actions class="justify-end pb-2 pr-2">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              ref="save"
              v-bind="attrs"
              v-on="on"
              class="primary mr-1"
              small
              tile
              v-shortkey="['ctrl', 's']"
              @click="save"
              @shortkey="save"
            >
              <v-icon left>mdi-content-save</v-icon>
              Save
            </v-btn>
          </template>
          <span class="text-caption">(Ctrl + S)</span>
        </v-tooltip>
      </v-card-actions>
    </v-card>
    <confirm ref="confirm"></confirm>
  </v-dialog>
</template>

<script>

import Confirm from '@/components/dialog/Confirm'
import { mapState } from 'vuex'
import api from '@/services/axios.service'

export default {
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
      grid: {
        columns: [
          { value: 'action', sortable: false, divider: true, width: '15' },
          { text: 'Qty Aktual', value: 'qtyAdjust', divider: true, width: '380' },
          { text: 'Satuan', value: 'unitName', align:'center', divider: true, width: '380' }
        ],
        data: []
      },
      rowItem: {},
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
      this.grid.data = []
      setTimeout(() => {
        this.$refs.save.$el.focus()
      }, 0)
    },
    open(item, options) {
      debugger
      this.dialog = true
      this.reset()
      this.rowItem = item
      this.bindUnit()
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
          for (let i = 0; i < response.data.tableData.length; i++) {
            const temp = {
              unit: response.data.tableData[i].unitToConvert
            }
            this.grid.data.push(temp)
          }
        })
    },
    bindUnit() {
      debugger
      const item = this.rowItem
      const selectedUnit = item.units.find(x => x.id === item.unitId)
      if (selectedUnit) {
        this.rowItem.unitName = selectedUnit.unitEquivalent
      } 
      for (let i = 0; i < item.units.length; i++) {
        let qtyAdjust = 0
        if (item.differentUnits.length > 0) {
          const tempSearch = item.differentUnits.find(x => x.unitId === item.units[i].id)
          if (tempSearch) {
            qtyAdjust = tempSearch.qtyAdjust
          }
        }
        const temp = {
          unitId: item.units[i].id, 
          unitName: item.units[i].unitEquivalent,
          qtyAdjust: qtyAdjust
        }
        this.grid.data.push(temp)
      }
    },
    save() {      
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Please kindly check mandatory fields or fields that have an error.')
        return
      }
      this.generateDiffernetUnit()
      this.$emit('save', this.rowItem)
      this.dialog = false
    },
    generateDiffernetUnit() {
      this.rowItem.differentUnit = ''
      this.rowItem.differentUnits = this.grid.data.filter(x => x.qtyAdjust > 0)
      const temp = []
      this.rowItem.differentUnits.forEach(item => {
        temp.push(`${item.qtyAdjust} ${item.unitName} `)
      })
      this.rowItem.differentUnit = temp.join(', ')
    },
    calculateSumQtyOpname() {
      debugger
      let totalSumQtyOpname = 0
      const tempDest = this.rowItem.units.find(x => x.id === this.rowItem.unitId)
      let toSequence = 0
      if (tempDest) {
        toSequence = tempDest.seq
      }
      this.grid.data.forEach((item) => {
        const tempFrom = this.rowItem.units.find(x => x.id === item.unitId)
        if (tempFrom) {
          const fromSequence = tempFrom.seq
          totalSumQtyOpname += this.convertUOM(item.qtyAdjust, fromSequence, toSequence, this.rowItem.units)
        }
      })
      this.rowItem.qtyOpname = totalSumQtyOpname
    },
    convertUOM(qtyOnHand, fromSequence, toSequence, units) {
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
        const data = units.find(u => u.seq === itterateSeq)
        different *=  data.conversion
      }
      if (direction === 'up') {
        return Number((qtyOnHand / different).toFixed(6))
      } else {
        return qtyOnHand * different
      }
    }
  }
}
</script>