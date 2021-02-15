<template>
  <v-dialog
    v-model="dialog"
    :width="options.width"
    persistent
    scrollable
  >
    <v-card>
      <v-toolbar
        color="indigo darken-1"
        dark
        dense
      >
        <v-toolbar-title>Sales Order</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="dialog = false"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <v-row no-gutters>
          <v-col cols="12" md="4">
            <v-select
              v-model="data.by"
              :items="data.items"
              label="Search By"
              class="mt-0"
            ></v-select>
          </v-col>
          <v-col cols="12" md="8" class="pl-md-1">
            <v-text-field
              ref="search"
              v-model="data.value"
              label="Search Text"
              class="mt-0"
              @keyup.enter="search"
            ></v-text-field>
          </v-col>
        </v-row>
        
        <v-card>
          <v-data-table
            :headers="grid.columns"
            :items="grid.data"
            :items-per-page="-1"
            height="300"
            class="elevation-1 row-pointer"
            fixed-header
            hide-default-footer
            @dblclick:row="dblclickRow"
          ></v-data-table>
        </v-card>
      </v-card-text>

      <v-card-actions class="justify-end pb-2 pr-2">
        <v-btn
          color="red darken-2"
          class="font-weight-regular"
          dark
          small
          tile
          @click="dialog = false"
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
import api from '@/services/axios.service'

export default {
  data() {
    return {
      dialog: false,
      data: {
        by: 'soCode',
        value: '',
        items: [
          { text: 'SO Date', value: 'soDate' },
          { text: 'SO Code', value: 'soCode' },
          { text: 'Customer', value: 'custName' },
          { text: 'Curr.', value: 'curr' }
        ]
      },
      grid: {
        data: [],
        columns: [
          { text: 'SO Date', value: 'orderDate', divider: true, width: '120' },
          { text: 'SO Code', value: 'code', divider: true, width: '100' },
          { text: 'Amount', value: 'grandTotal', align: 'right', divider: true, width: '120' },
          { text: 'Customer', value: 'custName', divider: true, width: '150' },
          { text: 'Salesman', value: 'salesName', divider: true, width: '150' },
          { text: 'Curr.', value: 'curr', divider: true, width: '90' },
          { text: 'TOP', value: 'paymentTerm', width: '120' }
        ]
      },
      options: {
        width: 800
      }
    }
  },

  computed: {
    ...mapState('api', { endpoint: state => state.endpoint })
  },
  
  methods: {
    reset() {
      this.data.by = 'soCode'
      this.data.value = ''
      this.grid.data = []
    },
    open(options) {
      this.dialog = true
      this.options = Object.assign(this.options, options)
      this.reset()
      setTimeout(() => {
        this.$refs.search.focus()
      }, 0)
    },
    search() {
      api.getAll(`${this.endpoint.sales.order}/incomplete`, {
        params: {
          searchBy: this.data.by,
          search: this.data.value
        }
      })
        .then(response => {
          this.grid.data = response.data
        })
    },
    dblclickRow(event, { item }) {
      this.$emit('dblclick:row', item)
      this.dialog = false
    }
  }
}
</script>
