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
        <v-toolbar-title>Purchase Order</v-toolbar-title>
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
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="data.by"
              :items="data.items"
              label="Search By"
              class="mt-0"
            ></v-autocomplete>
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
            dense
            fixed-header
            hide-default-footer
            @dblclick:row="dblclickRow"
          >
            <template v-slot:[`item.code`]="{ item }">
              <v-text-field
                v-model="item.code"
                class="mt-0 no-border"
                dense
                readonly
                @keyup.enter="dblclickRow(null, { item })"
              ></v-text-field>
            </template>
          </v-data-table>
        </v-card>
      </v-card-text>

      <v-card-actions class="justify-end pb-2 pr-2">
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
import api from '@/services/axios.service'

export default {
  data() {
    return {
      dialog: false,
      data: {
        by: 'poCode_contains',
        value: '',
        items: [
          { text: 'PO Date', value: 'poDate' },
          { text: 'PO Code', value: 'poCode_contains' },
          { text: 'Supplier', value: 'supName' },
          { text: 'Curr.', value: 'curr' }
        ]
      },
      grid: {
        data: [],
        columns: [
          { text: 'PO Date', value: 'orderDate', align: 'right', divider: true, width: '120' },
          { text: 'PO Code', value: 'code', divider: true, width: '100' },
          { text: 'Amount', value: 'grandTotal', align: 'right', divider: true, width: '120' },
          { text: 'Supplier', value: 'supName', divider: true, width: '150' },
          { text: 'Purchaser', value: 'workerName', divider: true, width: '150' },
          { text: 'Curr.', value: 'curr', width: '90' }
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
      this.data.by = 'poCode_contains'
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
    close() {
      this.dialog = false
    },
    search() {
      api.getAll(`${this.endpoint.purchase.order}/incomplete`, {
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
