<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    width="800"
    persistent
    @keydown.esc="close"
  >
    <v-card>
      <v-toolbar
        color="indigo darken-1"
        max-height="64"
        dark
      >
        <v-toolbar-title>Discount & Promo</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <v-form
            ref="form"
            v-model="valid"
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
                  :headers="!fromMobile ? grid.columns : grid.columnsMobile"
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
                      <template v-if="item.fromPromo === false" v-slot:activator="{ on, attrs }">
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
                  <template v-slot:[`item.name`]="{ item }">
                    <v-text-field
                      v-model="item.name"
                      :readonly="item.fromPromo"
                      class="text-body-2 mt-0"
                      dense
                    ></v-text-field>
                  </template>
                  <template v-slot:[`item.promoMethod`]="{ item }">
                    <v-autocomplete
                    v-model="item.promoMethod"
                    :items="promoMethod"
                    :readonly="item.fromPromo"
                    item-text="name"
                    item-value="id"
                    class="mt-0"
                    @change="checkIsPercentage(item)"
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
                      :readonly="item.fromPromo"
                      :rules="[rules.required[0], item.fromPromo === false ? rules.cannot0[0] : '']"
                      class="text-body-2 text-right mt-0"
                      dense
                      required
                      @change="limitPercent(item); changeValue();"
                    ></v-currency-field>
                  </template>
                  <template v-slot:[`item.nettPrice`]="{ item }">
                    {{ item.nettPrice | formatCurrency }}
                  </template>
                  <template v-slot:[`item.coaCode`]="{ item }">
                    <v-autocomplete
                      v-model="item.coaCode"
                      :items="accounts"
                      :item-text="item => `${item.code} - ${item.name}`"
                      :rules="rules.required"
                      item-value="code"
                      class="mt-0"      
                      dense                      
                    ></v-autocomplete>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="4">
                <v-card-actions>
                  <v-currency-field
                    v-model="data.unitPrice"
                    :decimal-length="2"
                    :min="0"
                    class="text-body-2 text-right mt-0"
                    label="Harga satuan"
                    readonly
                  ></v-currency-field>
                </v-card-actions>
              </v-col>
              <v-col cols="4">
                <v-card-actions>
                  <v-currency-field
                    v-model="data.nettPrice"
                    :decimal-length="2"
                    :min="0"
                    class="text-body-2 text-right mt-0"
                    label="Harga satuan setelah diskon"
                    readonly
                  ></v-currency-field>
                </v-card-actions>
              </v-col>
              <v-col cols="4">
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
          </v-card>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { dateToTick } from '@/helpers/date-helpers'
import api from '@/services/axios.service'

export default {
  data() {
    return {
      dialog: false,
      menu:  false,
      grid: {
        columns: [
          { value: 'action', sortable: false, divider: true, width: '30' },
          { text: 'Nama Diskon', value: 'name', divider: true, width: '100' },
          { text: 'Tipe', value: 'promoMethod', divider: true, width: '100' },
          { text: 'Nilai', value: 'value', align: 'right', divider: true, width: '100' },
          { text: 'Harga Bersih', value: 'nettPrice', align: 'right', divider: true, width: '100' },
          { text: 'Akun', value: 'coaCode', divider: true, width: '100' }
        ],
        columnsMobile: [
          { value: 'action', sortable: false, divider: true, width: '30' },
          { text: 'Nama Diskon', value: 'name', divider: true, width: '100' },
          { text: 'Tipe', value: 'promoMethod', divider: true, width: '100' },
          { text: 'Nilai', value: 'value', align: 'right', divider: true, width: '100' },
          { text: 'Harga Bersih', value: 'nettPrice', align: 'right', width: '100' }
        ],
        data: [],
        height: 100
      },
      data: [],
      promoMethod: [{ id: 1, name: 'Persen' }, { id: 2, name: 'Nominal' }],
      accounts: [],
      sysCoa: null,
      valid: false,
      fromMobile: false
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
      this.fromMobile = false
    },
    open(item, accounts, fromMobile = false) {
      this.reset()
      this.getSysCOA()
      this.dialog = true
      this.fromMobile = fromMobile
      this.accounts = accounts
      if (item.discPromo) {
        for (let i = 0; i < item.discPromo.length; i++) {
          if (i === 0) {
            if (item.discPromo[i].promoMethod === 1 || item.discPromo[i].isPercentage) {
              item.discPromo[i].nettPrice = item.unitPrice - (item.unitPrice * (item.discPromo[i].value / 100))
            } else {
              item.discPromo[i].nettPrice = item.unitPrice - item.discPromo[i].value
            }
            item.nettPrice = item.discPromo[i].nettPrice
          } else {
            if (item.discPromo[i].promoMethod === 1 || item.discPromo[i].isPercentage) {
              item.discPromo[i].nettPrice = item.nettPrice - (item.unitPrice * (item.discPromo[i].value / 100))
            } else {
              item.discPromo[i].nettPrice = item.nettPrice - item.discPromo[i].value
            }
            item.nettPrice = item.discPromo[i].nettPrice
          }
          if (item.discPromo[i].isPercentage) {
            item.discPromo[i].promoMethod = 1
          } else {
            item.discPromo[i].promoMethod = 2
          }
          if (item.discPromo[i].promoCode) {
            item.discPromo[i].fromPromo = true
          } else {
            item.discPromo[i].fromPromo = false
          }
        }
        this.grid.data = item.discPromo
      }
      this.data = item
      setTimeout(() => {
        this.grid.height = this.$refs.dialog.$refs.content.clientHeight - 158
        // Validate form first
        this.$refs.form.validate()
      }, 100)
    },
    close() {
      this.dialog = false
    },
    addItem() {
      if (this.grid.data.length === 0 || (this.grid.data.slice(-1)[0]?.name ?? null)) {
        const item = {
          id: -dateToTick(),
          name: null,
          promoMethod: 1,
          value: null,
          nettPrice: 0,
          coaCode: this.data.coaSlsDisc ?? this.sysCoa,
          amount: 0,
          fromPromo: false,
          isPercentage: true
        }
        this.grid.data.push(item)
      }
    },
    async removeItem(item) {
      const idx = this.grid.data.findIndex(i => i.id === item.id)
      this.grid.data.splice(idx, 1)
      this.changeValue()
    },
    save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      this.data.disc = this.data.unitPrice - this.data.nettPrice
      this.close()
    },
    checkIsPercentage(item) {
      if (item.promoMethod === 1) {
        item.isPercentage = true
      } else {
        item.isPercentage = false
      }
      item.value = 0
    },
    limitPercent(item) {
      if (item.isPercentage) {
        if (item.value > 100) {
          item.value = 100
        }
      }
    },
    changeValue() {
      if (this.grid.data.length > 0) {
        for (let i = 0; i < this.grid.data.length; i++) {
          if (i === 0) {
            if (this.grid.data[i].promoMethod === 1 || this.grid.data[i].isPercentage) {
              this.grid.data[i].amount = this.data.unitPrice * (this.grid.data[i].value / 100)
            } else {
              this.grid.data[i].amount = this.grid.data[i].value
            }
            const calcValue = this.data.unitPrice - this.grid.data[i].amount
            this.grid.data[i].nettPrice = calcValue < 0 ? 0 : calcValue
            this.data.disc = this.grid.data[i].amount
          } else {
            if (this.grid.data[i].promoMethod === 1 || this.grid.data[i].isPercentage) {
              this.grid.data[i].amount = this.data.unitPrice * (this.grid.data[i].value / 100)
            } else {
              this.grid.data[i].amount = this.grid.data[i].value
            }
            const calcValue = this.data.nettPrice - this.grid.data[i].amount
            this.grid.data[i].nettPrice = calcValue < 0 ? 0 : calcValue
            this.data.disc += this.grid.data[i].amount
          }
          const calcValue = this.data.unitPrice - this.data.disc
          this.data.nettPrice = calcValue < 0 ? 0 : calcValue
        }
      } else {
        this.data.disc = 0
        this.data.nettPrice = this.data.unitPrice
      }
    },
    getSysCOA() {
      const codes = ['SLS_DISC_COA']
      api.getAll(`${this.endpoint.systemManagement.parameter}/lists`, {
        params: {
          codes: JSON.stringify(codes)
        }
      })
        .then(response => {
          this.sysCoa = response.data.tableData[0].value
        })
    }
  }
}
</script>
