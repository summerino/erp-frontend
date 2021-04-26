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
        <v-toolbar-title>Currency Rate</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <v-form ref="formAdd" v-model="valid">
          <v-container>
            <v-row no-gutters>
                <v-col cols="12">
                    <v-menu
                        v-model="menu.startDate"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        min-width="290px"
                        offset-y
                    >
                        <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-bind="attrs"
                            v-on="on"
                            :value="formatStartDate"
                            :rules="rules.required"
                            label="Start Date"
                            class="mt-0"
                            readonly
                            required
                        ></v-text-field>
                        </template>
                        <v-date-picker
                            v-model="data.startDate"
                            no-title
                            scrollable
                            @change="menu.startDate = false"
                        ></v-date-picker>
                    </v-menu>
                </v-col>
            </v-row>
            <v-row no-gutters>
                <v-col cols="12">
                    <v-menu
                        v-model="menu.endDate"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        min-width="290px"
                        offset-y
                    >
                        <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-bind="attrs"
                            v-on="on"
                            :value="formatEndDate"
                            :rules="rules.required"
                            label="End Date"
                            class="mt-0"
                            readonly
                            required
                        ></v-text-field>
                        </template>
                        <v-date-picker
                            v-model="data.endDate"
                            no-title
                            scrollable
                            
                            @change="menu.endDate = false"
                        ></v-date-picker>
                    </v-menu>
                </v-col>
            </v-row>
            <v-row no-gutters>
                <v-col cols="12">
                    <v-autocomplete
                    v-model="data.currCode"
                    :items="listCurrencies"
                    :rules="rules.required"
                    label="Currency Code"
                    class="mt-0"
                    required
                    ></v-autocomplete>
                </v-col>
            </v-row>
            <v-row no-gutters>
                <v-col cols="12">
                    <v-currency-field
                    v-model="data.amount"
                    :rules="rules.required"
                    label="Amount"
                    class="text-right mt-0"
                    required
                    ></v-currency-field>
                </v-col>
                </v-row>
          </v-container>
        </v-form>
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
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import api from '@/services/axios.service'

export default {
  created: function () {
    this.getListCurrencies()
    this.rules = this.$store.state.app.rules
  },
  data() {
    return {
      rules: {},
      dialog: false,
      menu:{
        startDate: false,
        endDate: false
      },
      data: {
        startDate: null,
        endDate: null,
        currCode: null,
        amount: 0
      },
      listCurrencies: [],
      options: {
        width: 800
      },
      valid: false
    }
  },

  computed: {
    ...mapState('api', { 
      endpoint: state => state.endpoint
    }),
    formatStartDate() {
      return this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
    },
    formatEndDate() {
      return this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
    }
  },
  
  methods: {
    reset() {
      this.data = {
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        currCode: '',
        amount: 0    
      }
    },
    open(options) {
      this.reset()
      this.dialog = true
      setTimeout(() => {
        this.$refs.formAdd.validate()
      }, 0)
      this.options = Object.assign(this.options, options)
    },
    close() {
      this.dialog = false
    },
    async save() {
      if (!this.$refs.formAdd.validate()) {
        this.$store.dispatch('app/showInfo', 'Please kindly check mandatory fields or fields that have an error.')
        return
      }
      if (!this.isDateValid()) {
        this.$store.dispatch('app/showInfo', 'Start date is greater than end date')
        return
      } 
      let result = { success: false, message: '' }
      const resp = await api.create(this.endpoint.accounting.currencyRate, this.data)
      result = resp.data
      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.onSave()
        this.close()        
      }
    },
    onSave() {
      this.$emit('onSave')
    },
    getListCurrencies() {      
      api.getAll(`${this.endpoint.general.currency}/lists`, {})
        .then(response => {
          this.bindListCurrenciesWithIgnoreIDR(response.data.tableData)        
        })
    },
    bindListCurrenciesWithIgnoreIDR(data) {
      data.forEach((item)  => {
        if (item.code.toLowerCase() !== 'idr') {
          this.listCurrencies.push(item.code)
        }
      })
    },
    isDateValid() {
      let result = true
      if (this.data.startDate > this.data.endDate) {
        result = false
      }
      return result
    }
  }
}
</script>
