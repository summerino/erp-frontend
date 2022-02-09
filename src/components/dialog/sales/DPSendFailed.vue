<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    fullscreen
    persistent
    scrollable
    @keydown.esc="close"
  >
    <v-card>
      <v-toolbar
        color="indigo darken-1"
        max-height="64"
        dark
      >
        <v-toolbar-title>Gagal Kirim</v-toolbar-title>
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
            <v-row dense>
              <v-col cols="12">
                <v-app-bar dense flat>
                  <v-checkbox
                    v-model="checkAll"
                    label="Gagal kirim untuk semua barang di surat jalan / faktur penjualan ini"
                    @click="selectAll"
                  >
                  </v-checkbox>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        v-shortkey="['ctrl', 'i']"
                        :disabled="checkAll"
                        class="blue--text"
                        small
                        tile
                        @click="addItem"
                        @shortkey="addItem"
                      >
                        <v-icon left>mdi-plus</v-icon>
                        Tambah
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
                          :disabled="checkAll"
                          color="red"
                          icon
                          small
                          @click="removeItem(item)"
                        >
                          <v-icon small>mdi-close-thick</v-icon>
                        </v-btn>
                      </template>
                      <span class="text-caption">Hapus</span>
                    </v-tooltip>
                  </template>
                  <template v-slot:[`item.itemInitial`]="{ item }">
                    <v-autocomplete
                      ref="itemInitial"
                      v-model="item.itemId"
                      :readonly="checkAll"
                      :items="data"
                      :rules="rules.required"
                      item-text="itemInitial"
                      item-value="itemId"
                      class="text-body-2 mt-0"
                      dense
                      required
                      @change="itemIdChange(item)"
                    >
                    </v-autocomplete>
                  </template>
                  <template v-slot:[`item.qty`]="{ item }">
                    <v-currency-field
                      v-model="item.qty"
                      :decimal-length="0"
                      :readonly="checkAll"
                      class="text-body-2 text-right mt-0"
                      dense
                      @change="qtyChange(item)"
                    ></v-currency-field>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-card>
          <v-card>
            <v-card-text>
              <v-form
                ref="form"
                v-model="valid"
              >
                <v-row dense>
                  <v-col cols="12">
                    <v-textarea
                      v-model="notes"
                      :rules="[rules.max256chars[0], rules.required[0]]"
                      label="Catatan"
                      counter="256"
                      class="mt-0"
                      rows="6"
                      required
                    ></v-textarea>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="12">
                    <v-card-actions class="justify-end pb-2 pr-2">
                      <v-btn
                        color="green"
                        class="font-weight-regular"
                        dark
                        small
                        tile
                        @click="save"
                      >
                        <v-icon left>mdi-content-save</v-icon>
                        Simpan
                      </v-btn>
                    </v-card-actions>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { randomNumber } from '@/helpers/math-helpers'

import api from '@/services/axios.service'

export default {
  props: {
    warehouseCode: String
  },

  data() {
    return {
      checkAll: false,
      dialog: false,
      menu:  false,
      rowItem: {},
      grid: {
        columns: [
          { value: 'action', sortable: false, divider: true, width: '30' },
          { text: 'Inisial Barang', value: 'itemInitial', divider: true, width: '100' },
          { text: 'Qty Tidak Terkirim', value: 'qty', align: 'right', divider: true, width: '100' },
          { text: 'Satuan', value: 'unitName', divider: true, width: '100' }
        ],
        data: [],
        height: 100
      },
      notes : null,
      data: [],
      dataFreeItem: [],
      valid: false
    }
  },

  computed: {
    ...mapState({
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint
    })
  },
  
  methods: {
    reset() {
      this.grid.data = []
      this.data = []
      this.dataFreeItem = []
    },
    open(rowItem) {
      this.dialog = true
      this.rowItem = rowItem
      this.notes = rowItem.notesFailShipment
      this.checkAll = rowItem.failedSendAll
      this.reset()
      this.getDetail(rowItem)
      this.getDetailFree(rowItem)
      setTimeout(() => {
        this.grid.height = this.$refs.dialog.$refs.content.clientHeight - 158
      }, 100)
    },
    close() {
      this.dialog = false
    },
    getDetail(item) {
      api.getAll(`${this.endpoint.sales.delivery}/item`, {
        params: { 
          code: 'doCode' in item ? item.doCode : item.transCode
        }
      })
        .then(response => {
          this.data = response.data.tableData
          for (let i = 0; i < this.data.length; i++) {
            const item = {
              id: randomNumber(-1, -1000),
              code: this.rowItem.code,
              itemId: this.data[i].itemId,
              uomId: this.data[i].uomId,
              unitId: this.data[i].unitId,
              qty: this.data[i].qty,
              warehouseCode: this.warehouseCode,
              type: 0,
              unitName: this.data[i].unitName,
              detailId: this.data[i].id
            }
            const uItem = this.rowItem.undeliveredItems.find(x => x.itemId === item.itemId && x.unitId === item.unitId && x.type === 0)
            if (uItem) {
              item.qty = uItem.qty
            }
            this.grid.data.push(item) 
          }
        })
    },
    getDetailFree(item) {
      api.getAll(`${this.endpoint.sales.delivery}/free-item`, {
        params: { 
          code: 'doCode' in item ? item.doCode : item.transCode
        }
      })
        .then(response => {
          this.dataFreeItem = response.data.tableData
          if (this.dataFreeItem.length > 0) {
            for (let i = 0; i < this.dataFreeItem.length; i++) {
              const item = {
                id: randomNumber(-1, -1000),
                code: this.rowItem.code,
                itemId: this.dataFreeItem[i].itemId,
                uomId: this.dataFreeItem[i].uomId,
                unitId: this.dataFreeItem[i].unitId,
                qty: this.dataFreeItem[i].qty,
                warehouseCode: this.warehouseCode,
                type: 1,
                unitName: this.dataFreeItem[i].unitName,
                detailId: this.dataFreeItem[i].id
              }
              const uItem = this.rowItem.undeliveredItems.find(x => x.itemId === item.itemId && x.unitId === item.unitId && x.type === 1)
              if (uItem) {
                item.qty = uItem.qty
              }
              this.grid.data.push(item) 
            }
          }
        })
    },
    itemIdChange(item) {
      const data_i = this.data.find(i => i.itemId === item.itemId)
      if (data_i) {
        item.itemId = data_i.itemId
        item.uomId = data_i.uomId
        item.unitId = data_i.unitId
        item.qty = data_i.qty
        item.unitName = data_i.unitName
      }
    },
    addItem() {
      if (this.grid.data.length === 0 || (this.grid.data.slice(-1)[0]?.itemId ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.rowItem.code,
          itemId: null,
          uomId: null,
          unitId: null,
          qty: null,
          warehouseCode: this.warehouseCode,
          type: 0,
          unitName: null
        }
        this.grid.data.push(item)
      }
    },
    async removeItem(item) {
      const idx = this.grid.data.findIndex(i => i.id === item.id)
      this.grid.data.splice(idx, 1)
    },
    selectAll() {
      this.grid.data.splice(0, this.grid.data.length)
      if (this.checkAll) {
        for (let i = 0; i < this.data.length; i++) {
          const item = {
            id: randomNumber(-1, -1000),
            itemId: this.data[i].itemId,
            uomId: this.data[i].uomId,
            unitId: this.data[i].unitId,
            qty: this.data[i].qty,
            warehouseCode: this.warehouseCode,
            type: 0,
            unitName: this.data[i].unitName
          }
          this.grid.data.push(item) 
          this.rowItem.undeliveredItems = this.grid.data
        }
      }
    },
    qtyChange(item) {
      const data_i = this.data.find(i => i.itemId === item.itemId)
      if (item.qty > data_i.qty) {
        this.$store.dispatch('app/showInfo', 'Total qty tidak terkirim tidak boleh lebih besar dari qty dikirim.')
        item.qty = data_i.qty
      }
    },
    save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      const valueArr = this.grid.data.map(function (item) { return item.itemId })
      const isDuplicate = valueArr.some(function (item, idx) { 
        return valueArr.indexOf(item) !== idx 
      })
      if (isDuplicate) {
        this.$store.dispatch('app/showInfo', 'Barang tidak boleh duplikat.')
      } else {
        this.rowItem.notesFailShipment = this.notes
        this.rowItem.failedSendAll = this.checkAll
        this.rowItem.undeliveredItems = this.grid.data
        if (!this.rowItem.undeliveredItems.length) {
          this.rowItem.isFailShipment = false
        } else {
          this.rowItem.isFailShipment = true
        }
        this.close()
      }
    }
  }
}
</script>
