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
        <v-toolbar-title>Simpan & Terima</v-toolbar-title>
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
              ref="refNo"
              v-model="data.rcvRefNo"
              label="No. Ref. Terima"
              class="mt-0"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6" class="pl-md-1">
            <v-menu
              v-model="menu.rcvDate"
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
                :value="formatRcvDate"
                label="Tanggal Terima"
                class="mt-0"
                readonly
                required
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="data.rcvDate"
              no-title
              scrollable
              @change="menu.rcvDate = false"
            ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
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
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import api from '@/services/axios.service'

export default {
  data: () => ({
    dialog: false,
    options: {
      width: 800
    },
    data: {},
    menu: {
      rcvDate: false
    }
  }),
  computed: {
    ...mapState({ 
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint }),
    formatRcvDate() {
      return this.data.rcvDate ? format(parseISO(this.data.rcvDate), 'dd-MMM-yyyy') : ''
    }
  },
  methods: {
    reset() {
      this.data = {
        action: '',
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        requestBy: null,
        currCode: 'IDR',
        rate: 1,
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        warehouseCode: null,
        notes: null,
        dpp: 0,
        subTotal: 0,
        finalDiscPercent: 0,
        finalDisc: 0,
        includeTax: this.defTaxInc,
        taxAmount: 0,
        total: 0,
        rcvRefNo : null,
        rcvDate: format(new Date(), 'yyyy-MM-dd'),
        isPoRcv: false
      }
    },
    open(POdata) {
      this.reset()
      this.dialog = true
      this.data = POdata
      this.data.isPoRcv = true
      setTimeout(() => {
        this.$refs.refNo.focus()
      }, 0)
    },
    close() {
      this.dialog = false
    },
    async save() {
      let result = { success: false, message: '' }
      if (this.data.action === 'add') {
        const resp = await api.create(this.endpoint.purchase.order, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.purchase.order, this.data.code, this.data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.close()
        this.$emit('closeParent')
      }
    }
  }
}
</script>
