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
        <v-toolbar-title>Persetujuan Penerimaan Barang</v-toolbar-title>
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
            <v-menu
              v-model="menu.tsDate"
              :close-on-content-click="false"
              transition="scale-transition"
              min-width="290px"
              offset-y
            >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-bind="attrs"
                v-on="on"
                :rules="rules.required"
                :value="formatTsDate"
                label="Tanggal"
                class="mt-0"
                readonly
                required
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="data.tsDate"
              no-title
              scrollable
              @change="menu.tsDate = false"
            ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="6" class="pl-md-1">
            <v-autocomplete
              v-model="data.warehouseCodeFrom"
              :items="warehouses"
              :item-text="item => `${item.initial} - ${item.name}`"
              :rules="rules.required"
              label="Gudang Asal"
              item-value="code"
              class="mt-0"
              required
            ></v-autocomplete>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12">
            <v-textarea
              v-model="data.notes"
              :rules="rules.max256chars"
              label="Catatan"
              counter="256"
              class="mt-0"
              rows="3"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="justify-end pb-2 pr-2">
        <v-btn
          :disabled="!allowApprove"
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
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import api from '@/services/axios.service'

export default {
  props: {
    selected: Array
  },
  data: () => ({
    dialog: false,
    options: {
      width: 800
    },
    data: {},
    menu: {
      tsDate: false
    },
    warehouses: []
  }),
  computed: {
    ...mapState({ 
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint }),
    formatTsDate() {
      return this.data.tsDate ? format(parseISO(this.data.tsDate), 'dd-MMM-yyyy') : ''
    }
  },
  methods: {
    open(item) {
      this.dialog = true
      this.data = item
      this.getWarehouseLists()
    },
    close() {
      this.dialog = false
      this.data.notes = null
      this.data.tsDate = format(new Date(), 'yyyy-MM-dd')
      this.data.warehouseCodeFrom = null
    },
    async save() {
      let result = { success: false, message: '' }
      const resp = await api.updatemaster(`${this.endpoint.mobileSales.itemRequest}/approve`, this.selected, {
        params: { date: this.data.tsDate, whCode: this.data.warehouseCodeFrom, notes: this.data.notes }
      })
      result = resp.data
      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.close()
      }
    },
    getWarehouseLists() {
      api.getAll(`${this.endpoint.inventory.warehouse}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'custCode',
            operator: 'eq',
            keyword: null
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.warehouses = response.data.tableData
          const defWarehouse = response.data.tableData.find(w => w.isDefault)
          if (defWarehouse) {
            this.data.warehouseCodeFrom = defWarehouse.code
          }
        })
    }
  }
}
</script>
