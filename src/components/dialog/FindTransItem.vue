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
        <v-toolbar-title>{{ this.title }} Item</v-toolbar-title>
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
            <template v-slot:[`item.itemInitial`]="{ item }">
              <v-text-field
                v-model="item.itemInitial"
                class="text-body-2 mt-0 no-border"
                dense
                readonly
                @keyup.enter="dblclickRow(null, { item })"
              ></v-text-field>
            </template>
            <template v-slot:[`item.qty`]="{ item }">
              {{ item.qty | formatCurrency({ decimalDigits: 0 }) }}
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
  props: {
    src: String,
    code: String
  },

  data() {
    return {
      dialog: false,
      title: '',
      url: '',
      data: {
        by: 'itemName',
        value: '',
        items: [
          { text: 'Initial', value: 'itemInitial' },
          { text: 'Name', value: 'itemName' },
          { text: 'Unit', value: 'unitName' }
        ]
      },
      rowItem: {},
      grid: {
        data: [],
        columns: [
          { text: 'Initial', value: 'itemInitial', divider: true, width: '150' },
          { text: 'Name', value: 'itemName', divider: true, width: '300' },
          { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '100' },
          { text: 'Unit', value: 'unitName', width: '150' }
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
      this.data.by = 'itemName'
      this.data.value = ''
      this.grid.data = []
      if (this.src === 'rcv') {
        this.title = 'Purchase Receive'
        this.url = `${this.endpoint.purchase.receive}/item`
      }
    },
    open(rowItem, options) {
      this.dialog = true
      this.rowItem = rowItem
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
      api.getAll(this.url, {
        params: {
          code: this.code,
          filters: JSON.stringify([{
            field: this.data.by,
            operator: 'contains',
            keyword: this.data.value
          }, {
            field: 'type',
            operator: 'eq',
            keyword: 0
          }])
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
        })
    },
    dblclickRow(event, { item }) {
      if (this.rowItem) {
        this.rowItem.itemId = item.itemId
      }
      this.$emit('dblclick:row', this.rowItem, item)
      this.dialog = false
    }
  }
}
</script>
