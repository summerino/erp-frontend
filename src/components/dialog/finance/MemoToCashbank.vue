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
        <v-toolbar-title>{{ transactionType === 'payment' ? 'Pembayaran' : 'Penarikan' }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <v-row no-gutters class="mt-5">
          <v-col cols="12">
            <v-autocomplete
              ref="coaCode"
              v-model="data.coaCode"
              :items="coas"
              label="Akun"
              :item-text="item => `${item.code} - ${item.name}`"
              item-value="code"
              class="mt-0"
              :rules="rules.required"
              required
              dense
            ></v-autocomplete>
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
import api from '@/services/axios.service'

export default {
  props: ['memo', 'source', 'transactionType'],
  data: () => ({
    dialog: false,
    options: {
      width: 800
    },
    data: {},
    coas: []
  }),
  created: function () {
    this.getCOAList()
    this.getCOACodeList()
  },
  computed: {
    ...mapState({ 
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint })
  },
  methods: {
    reset() {
      this.data = {
        action: '',
        code: null,
        vouCode: null,
        type: null,
        date: null,
        coaCode: null,
        currCode: 'IDR',
        rate: 1,
        amount: 0,
        chequeNo: null,
        chequeDate: null,
        note: null,
        isInterCashBank: 0,
        itemDetails: [
          {
            id: 0,
            code: null,
            type: null,
            transCode: null,
            coaCode: null,
            currCode: 'IDR',
            rate: 1,
            amount: 0,
            typeAmount: null,
            transAmount: 0,
            note: null
          }
        ]
      }
    },
    open() {
      this.reset()
      this.dialog = true
      setTimeout(() => {
        this.$refs.coaCode.focus()
      }, 0)
    },
    close() {
      this.dialog = false
    },
    async save() {
      this.fillData()
      let result = { success: false, message: '' }
      const resp = await api.create(this.endpoint.finance.cashBank, this.data)
      result = resp.data

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.close()
        this.$emit('closeParent')
      }
    },
    getCOAList() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'typeId',
            operator: 'eq',
            keyword: 1
          }])
        }
      })
        .then(response => {
          this.coas = response.data.tableData
        })
    },
    getCOACodeList() {
      const codes = ['DEPS_COA', 'DEPC_COA']
      api.getAll(`${this.endpoint.systemManagement.parameter}/lists`, {
        params: {
          codes: JSON.stringify(codes)
        }
      })
        .then(response => {
          this.coaCodes = response.data.tableData
        })
    },
    fillData() {
      let createdFrom = ''
      let custOrSup = ''
      let type = ''
      if (this.source === 'debit-memo' && this.transactionType === 'payment') {
        this.data.type = 'C'
        this.data.itemDetails[0].typeAmount = 'D'
        createdFrom = `Debit Memo ${this.memo.code}`
        custOrSup = this.memo.supName
        type = 'DEPS'
        this.data.amount = -this.memo.amount
      } else if (this.source === 'debit-memo' && this.transactionType === 'retur') {
        this.data.type = 'D'
        this.data.itemDetails[0].typeAmount = 'C'
        createdFrom = `Debit Memo ${this.memo.code}`
        custOrSup = this.memo.supName
        type = 'RDEPS'
        this.data.amount = -this.memo.amount
      } else if (this.source === 'credit-memo' && this.transactionType === 'payment') {
        this.data.type = 'D'
        this.data.itemDetails[0].typeAmount = 'C'
        createdFrom = `Credit Memo ${this.memo.code}`
        custOrSup = this.memo.custName
        type = 'DEPC'
        this.data.amount = this.memo.amount
      } else if (this.source === 'credit-memo' && this.transactionType === 'retur') {
        this.data.type = 'C'
        this.data.itemDetails[0].typeAmount = 'D'
        createdFrom = `Credit Memo ${this.memo.code}`
        custOrSup = this.memo.custName
        type = 'RDEPC'
        this.data.amount = this.memo.amount
      }
      this.data.date = this.memo.date
      this.data.notes = `Automatically created by ${createdFrom}`
      this.data.itemDetails[0].transCode = this.memo.code
      this.data.itemDetails[0].amount = this.data.amount
      this.data.itemDetails[0].transAmount = this.data.amount
      this.data.itemDetails[0].notes = custOrSup
      this.data.itemDetails[0].type = type
      
      if (type === 'DEPC' || type === 'RDEPC') {
        this.getCoaCode('DEPC')
      } else if (type === 'DEPS' || type === 'RDEPS') {
        this.getCoaCode('DEPS')
      }

    },
    getCoaCode(type) {
      const temp = this.coaCodes.find(x => x.code === `${type}_COA`)
      if (temp) {
        this.data.itemDetails[0].coaCode = temp.value
      }
    }  
  }
}
</script>
