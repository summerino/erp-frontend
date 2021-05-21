import Vue from 'vue'
import { format, parseISO } from 'date-fns'

Vue.filter('formatDate', (value, filterFormat) => {
  if (value) {
    return format(parseISO(value), filterFormat)
  }

  return ''
})
