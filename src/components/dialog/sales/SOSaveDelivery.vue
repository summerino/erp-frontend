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
        <v-toolbar-title>Simpan & Kirim</v-toolbar-title>
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
          <v-col cols="12">
            <v-menu
              v-model="menu.dlvDate"
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
                :value="formatDlvDate"
                label="Tanggal Pengiriman"
                ref="dlvDate"
                class="mt-0"
                readonly
                required
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="data.dlvDate"
              no-title
              scrollable
              @change="menu.dlvDate = false"
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
      dlvDate: false
    }
  }),
  computed: {
    ...mapState({ 
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint
    }),
    formatDlvDate() {
      return this.data.dlvDate ? format(parseISO(this.data.dlvDate), 'dd-MMM-yyyy') : ''
    }
  },
  methods: {
    reset() {
      this.data = {
        action: '',
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        salesBy: null,
        currCode: 'IDR',
        rate: 1,
        custCode: null,
        custName: null,
        custAddr: null,
        custPhone: null,
        custFax: null,
        notes: null,
        dpp: 0,
        subTotal: 0,
        finalDiscPercent: 0,
        finalDisc: 0,
        includeTax: this.defTaxInc,
        taxAmount: 0,
        total: 0,
        dlvDate : format(new Date(), 'yyyy-MM-dd'),
        isSoDlv : false
      }
    },
    open(SOdata) {
      this.reset()
      this.dialog = true
      this.data = SOdata
      this.data.isSoDlv = true
      setTimeout(() => {
        this.$refs.dlvDate.focus()
      }, 0)
    },
    close() {
      this.dialog = false
      this.data.isSoDlv = false
    },
    async save() {
      let result = { success: false, message: '' }
      if (this.data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.order, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.order, this.data.code, this.data)
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
