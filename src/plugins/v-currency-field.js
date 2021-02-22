import Vue from 'vue'
import VCurrencyField from 'v-currency-field'
import { VTextField } from 'vuetify/lib'

/**
 * Vuetify Plugin
 * https://github.com/phiny1/v-currency-field
 */
Vue.component('v-text-field', VTextField)
Vue.use(VCurrencyField, { 
  locale: 'en',
  decimalLength: 2,
  autoDecimalMode: false,
  min: null,
  max: null,
  defaultValue: 0,
  valueAsInteger: false,
  allowNegative: false
})
