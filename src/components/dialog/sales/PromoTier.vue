<template>
  <v-dialog
    v-model="dialog"
    :width="options.width"
    persistent
    @keydown.esc="close"
  >
    <v-card>
    <v-toolbar
        color="indigo darken-1"
        dark
        dense
      >
        <v-toolbar-title>Jenjang Promo</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
    </v-toolbar>
    <v-form
      ref="form"
      v-model="valid"
    >
      <v-card-text class="px-2 pt-1">
        <v-card>
          <v-card-title>Umum</v-card-title>
          <v-card-text>
            <v-row no-gutters>
              <v-col cols="12">
                <v-autocomplete
                v-model="data.promoMethod"
                :items="promoMethod"
                :rules="rules.required"
                item-text="name"
                item-value="id"
                label="Metode Promo"
                class="mt-0"
                @change="checkIsPercentage()"
                >
                </v-autocomplete>
              </v-col>
            </v-row>
            <v-row v-if="data.applyTo !== 3 && (data.promoType === 2 || data.promoType === 3)" no-gutters>
              <v-col cols="12">
                <v-autocomplete
                v-model="data.saleUnit"
                :items="itemUnits"
                :rules="rules.required"
                item-text="unitEquivalent"
                item-value="id"
                label="Unit Yang Berlaku Untuk Promo"
                class="mt-0"
                @change="changeUnit()"
                >
                </v-autocomplete>
              </v-col>
            </v-row>
            <v-row v-if="data.applyTo !== 3 && data.promoType === 2" no-gutters>
              <v-col cols="12">
                <v-checkbox
                  v-model="data.applyToAllUnit"
                  :label="`Berlaku untuk semua satuan berdasarkan ${unitName}`"
                >
                </v-checkbox>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-text v-if="data.promoType === 3" class="px-2 pt-1">
        <v-card>
          <v-card-title>Barang Gratis</v-card-title>
          <v-card-text>
            <v-row no-gutters>
              <v-col cols="12">
                <v-autocomplete
                  v-model="data.freeGoodItemId"
                  :items="items"
                  :rules="rules.required"
                  item-text="initial"
                  item-value="id"
                  class="text-body-2 mt-0"
                  label="ID Barang"
                  dense
                  @change="freeItemIdChange(data.freeGoodItemId)"
                >
                </v-autocomplete>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  v-model="data.freeItemName"
                  label="Nama Barang"
                  class="mt-0"
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12">
                <v-autocomplete
                  v-model="data.unitFreeGood"
                  :items="freeItemUnits"
                  :rules="rules.required"
                  item-text="unitEquivalent"
                  item-value="id"
                  class="text-body-2 mt-0"
                  label="Satuan"
                  dense
                >
                </v-autocomplete>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12">
                <v-checkbox
                  v-model="data.isMultiple"
                  label="Kelipatan"
                  @change="clearItemTier"
                >
                </v-checkbox>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-text class="px-2 pt-1">
        <v-card>
          <v-tabs v-model="tab.tier">
            <v-tab key="tier">Jenjang</v-tab>
            <v-tab key="budget">Anggaran</v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab.tier" class="pa-2">
            <v-tab-item
              key="detail"
              transition="false"
            >
              <v-card>
                <v-row dense>
                  <v-col cols="12">
                    <v-app-bar dense flat>
                      <v-spacer></v-spacer>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            v-on="on"
                            v-shortkey="['ctrl', 'i']"
                            :disabled="grid.data != null ? isUnlimited : false"
                            class="blue--text"
                            small
                            tile
                            @click="addTier"
                            @shortkey="addTier"
                          >
                            <v-icon left>mdi-plus</v-icon>
                            Tambah
                          </v-btn>
                        </template>
                        <span class="text-caption">(Ctrl + I)</span>
                      </v-tooltip>
                    </v-app-bar>

                    <v-data-table
                      :headers="data.promoType === 4 ? gridPayment.columns : grid.columns"
                      :items="data.promoType === 4 ? gridPayment.data : grid.data"
                      :items-per-page="-1"
                      height="250"
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
                          <span class="text-caption">Hapus</span>
                        </v-tooltip>
                      </template>
                      <template v-if="data.promoType !== 4" v-slot:[`item.fromQty`]="{ item }">
                        <v-currency-field
                          v-model="item.fromQty"
                          :decimal-length="2"
                          :min="0"
                          class="text-body-2 text-right mt-0"
                          dense
                          :readonly="!data.isMultiple"
                        ></v-currency-field>
                      </template>
                      <template v-else v-slot:[`item.paymentTermId`]="{ item }">
                        <v-autocomplete
                          v-model="item.paymentTermId"
                          :items="paymentTerms"
                          :item-text="item => `${item.initial} - ${item.name}`"
                          :rules="rules.required"
                          item-value="id"
                          class="mt-0"
                          dense
                        >
                        </v-autocomplete>
                      </template>
                      <template v-slot:[`item.value`]="{ item }">
                        <v-currency-field
                          ref="value"
                          v-model="item.value"
                          :decimal-length="2"
                          :min="0"
                          :rules="rules.required"
                          class="text-body-2 text-right mt-0"
                          dense
                          required
                          @change="limitPercent(item)"
                        ></v-currency-field>
                      </template>
                      <template v-if="data.promoType !== 4" v-slot:[`item.toQty`]="{ item }">
                        <v-text-field v-if="item.toQty === Number.MAX_SAFE_INTEGER"
                          value="Unlimited"
                          :disabled="data.isMultiple"
                          class="text-body-2 text-right mt-0"
                          dense
                          @click="resetToQty(item)"
                        ></v-text-field>
                        <v-currency-field v-else
                          v-model="item.toQty"
                          :decimal-length="2"
                          :min="0"
                          :rules="rules.above0"
                          :readonly="checkNextHasValue(item)"
                          class="text-body-2 text-right mt-0"
                          dense
                          required
                          @change="checkToQty(item)"
                        ></v-currency-field>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
              </v-card>
            </v-tab-item>

            <v-tab-item
              key="budget"
              transition="false"
              eager
            >
              <v-row no-gutters>
                <v-col cols="12">
                  <v-checkbox
                    v-model="data.isPromoWithBudget"
                    label="Gunakan anggaran promo"
                >
                </v-checkbox>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12">
                  <v-currency-field
                    v-model="data.budgetMaximumValue"
                    :decimal-length="2"
                    :min="0"
                    :disabled="!data.isPromoWithBudget"
                    label="Nilai Maksimum"
                    class="text-body-2 text-right mt-0"
                  ></v-currency-field>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12">
                  <v-radio-group
                    v-model="data.overBudgetAction"
                    mandatory
                  >
                    <template v-slot:label>
                      <div><strong>Kalau melebihi anggaran</strong></div>
                    </template>
                    <v-radio
                      label="Peringatkan user, pelanggan tetap mendapat promo"
                      value="1"
                    ></v-radio>
                    <v-radio
                      label="Peringatkan user, pelanggan tidak mendapat promo"
                      value="2"
                    ></v-radio>
                    <v-radio
                      label="Peringatkan user, pelanggan tetap mendapat promo atau tidak"
                      value="3"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-card-text>
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
    </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'

export default {
  data: () => ({
    dialog: false,
    options: {
      width: 800
    },
    tab: {
      tier: null
    },
    data: {},
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '30' },
        { text: 'Qty Mulai', value: 'fromQty', divider: true, width: '100' },
        { text: 'Qty Sampai', value: 'toQty', divider: true, width: '100' },
        { text: 'Nilai', value: 'value', align: 'right', divider: true, width: '100' }
      ],
      data: [],
      height: 100
    },
    gridPayment: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '30' },
        { text: 'Term Pembayaran', value: 'paymentTermId', divider: true, width: '100' },
        { text: 'Nilai', value: 'value', align: 'right', divider: true, width: '100' }
      ],
      data: [],
      height: 100
    },
    promoMethod: [],
    items: [],
    freeItemUnits: [],
    itemUnits: [],
    paymentTerms: [],
    unitName: null,
    valid: false
  }),
  computed: {
    ...mapState({ 
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint }),
    isUnlimited() {
      return (this.grid?.data[this.grid.data.length - 1]?.toQty === Number.MAX_SAFE_INTEGER)
    }
  },
  methods: {
    reset() {
      this.data = []
      this.grid.data = []
      this.gridPayment.data = []
      this.tab.tier = 0
      this.unitName = 'satuan'
    },
    async open(item, listItem) {
      this.reset()
      this.dialog = true
      this.items = listItem
      this.data = item
      if (this.data.promoType === 3) {        
        this.grid.data = item.promoTierList
        this.promoMethod = [{ id: 3, name: 'Mendapatkan' }]
        this.data.freeGoodItemId = item.freeGoodItemId === undefined || item.freeGoodItemId === null ? item.promoTierList.length === 0 ? null : item.promoTierList[0].freeGoodItemId : item.freeGoodItemId 
        if (this.data.freeGoodItemId) {
          this.freeItemIdChange(this.data.freeGoodItemId)
        }
        this.data.unitFreeGood = item.unitFreeGood === undefined || item.unitFreeGood === null ? item.promoTierList.length === 0 ? null : Number(item.promoTierList[0].unitFreeGood) : item.unitFreeGood 
        this.data.isMultiple = item.isMultiple === undefined || item.isMultiple === null ? item.promoTierList.length === 0 ? false : item.promoTierList[0].isMultiple : item.isMultiple 
        this.data.promoMethod = 3
        if (this.data.applyTo !== 3) {
          this.itemUnits = await this.getItemUnitLists(item.itemId)
        }
        this.data.saleUnit = item.saleUnit === undefined || item.saleUnit === null ? item.promoTierList.length === 0 ? this.itemUnits[0].id : item.promoTierList[0].saleUnit : item.saleUnit 
      } else if (this.data.promoType === 4) {
        this.gridPayment.data = item.promoTierList
        this.promoMethod = [{ id: 1, name: 'Persen' }, { id: 2, name: 'Nominal' }]
        this.data.promoMethod = item.isPercentage === false ? 2 : 1
        this.getPaymentTermLists()
      } else if (this.data.promoType === 5) {
        this.grid.data = item.promoTierList
        this.promoMethod = [{ id: 1, name: 'Persen' }, { id: 2, name: 'Nominal' }]
        this.data.promoMethod = item.isPercentage === false ? 2 : 1
        this.grid.columns[1].text = 'Nilai Mulai'
        this.grid.columns[2].text = 'Nilai Sampai'
      } else {
        this.grid.data = item.promoTierList
        this.data.applyToAllUnit = item.applyToAllUnit === undefined || item.applyToAllUnit === null ? item.promoTierList.length === 0 ? false : item.promoTierList[0].applyToAllUnit : item.applyToAllUnit 
        this.promoMethod = [{ id: 1, name: 'Persen' }, { id: 2, name: 'Nominal' }]
        this.data.promoMethod = item.isPercentage === false ? 2 : 1
        if (this.data.applyTo !== 3) {
          this.itemUnits = await this.getItemUnitLists(item.itemId)
        }
        this.data.saleUnit = item.saleUnit === undefined || item.saleUnit === null ? item.promoTierList.length === 0 ? this.itemUnits[0].id : item.promoTierList[0].saleUnit : item.saleUnit        
        const data_u = await this.itemUnits.find(i => i.id === this.data.saleUnit)
        this.unitName = data_u.unitEquivalent
      }
    },
    close() {
      this.dialog = false
    },
    async save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      if (this.data.promoType !== 4) {
        this.data.promoTierList = this.grid.data
      }
      this.close()
    },
    addTier() {
      if (this.data.promoType !== 4) {
        if (this.grid.data.length === 0) {
          const item = {
            id: randomNumber(-1, -1000),
            fromQty: 1,
            value: null,
            toQty: Number.MAX_SAFE_INTEGER
          }
          this.grid.data.push(item)
        } else if (this.grid.data[this.grid.data.length - 1].toQty !== Number.MAX_SAFE_INTEGER) {
          const item = {
            id: randomNumber(-1, -1000),
            fromQty: this.grid.data[this.grid.data.length - 1].toQty + 1,
            value: null,
            toQty: Number.MAX_SAFE_INTEGER
          }
          this.grid.data.push(item)
        } 
      } else if (this.data.promoType === 4) {
        if (this.gridPayment.data.length === 0 || (this.gridPayment.data.slice(-1)[0]?.paymentTermId ?? null)) {
          const item = {
            id: randomNumber(-1, -1000),
            paymentTermId: null,
            value: null
          }
          this.gridPayment.data.push(item)
        }  
      }
    },
    async removeItem(item) {
      if (this.data.promoType === 4) {
        const idx = this.gridPayment.data.findIndex(i => i.id === item.id)
        this.gridPayment.data.splice(idx, 1)
      } else {
        const idx = this.grid.data.findIndex(i => i.id === item.id)
        this.grid.data.splice(idx, 1)
      }
    },
    async getItemUnitLists(item) {
      const data_i = this.items.find(i => i.id === item)
      const response = await api.getAll(`${this.endpoint.inventory.uom}/item`, {
        params: { uomId: data_i.uomId }
      })
      return response.data.tableData
    },
    getPaymentTermLists() {
      api.getAll('payment-term/lists')
        .then(response => {
          this.paymentTerms = response.data.tableData
        })
    },
    resetToQty(item) {
      item.toQty = 0
    },
    checkToQty(item) {
      if (item.toQty <= 0) {
        item.toQty = Number.MAX_SAFE_INTEGER
      } else if (item.toQty <= item.fromQty) {
        item.toQty = item.fromQty + 1
      }
    },
    limitPercent(item) {
      if (this.data.isPercentage) {
        if (item.value > 100) {
          item.value = 100
        }
      }
    },
    checkIsPercentage() {
      if (this.data.promoMethod === 1) {
        this.data.isPercentage = true
      } else {
        this.data.isPercentage = false
      }
    },
    freeItemIdChange(item) {
      const data_i = this.items.find(i => i.id === item)
      this.data.freeItemName = data_i.name

      api.getAll('uom-conversion', {
        params: { uomId: data_i.uomId }
      })
        .then(response => {
          this.freeItemUnits = response.data.tableData
        })
    },
    changeUnit() {
      const data_u = this.itemUnits.find(i => i.id === this.data.saleUnit)
      this.unitName = data_u.unitEquivalent
    },
    clearItemTier() {
      this.grid.data.splice(0, this.grid.data.length)
    },
    checkNextHasValue(item) {
      const indexData = this.grid.data.findIndex(x => x.toQty === item.toQty)
      if (typeof this.grid.data[indexData + 1] === 'undefined') {
        return false
      } else {
        return true
      }
    }
  }
}
</script>
