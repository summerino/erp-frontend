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
        <v-toolbar-title>Customer</v-toolbar-title>
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
            class="elevation-1"
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
import axios from '@/axios'

export default {
  data() {
    return {
      dialog: false,
      data: {
        by: 'name',
        value: '',
        items: [
          { text: 'Customer Code', value: 'code' },
          { text: 'Customer Name', value: 'name' }
        ]
      },
      grid: {
        data: [],
        columns: [
          { text: 'Code', value: 'code', divider: true, width: '120' },
          { text: 'Name', value: 'name', divider: true, width: '300' },
          { text: 'Address', value: 'address', divider: true, width: '200' },
          { text: 'Phone', value: 'phone1', divider: true, width: '150' },
          { text: 'Credit Limit', value: 'creditLimit', align: 'right', divider: true, width: '120' },
          { text: 'Category', value: 'categoryName', divider: true, width: '150' },
          { text: 'Contact Person', value: 'contactPerson', width: '150' }
        ]
      },
      options: {
        width: 800
      }
    }
  },
  methods: {
    open(options) {
      this.dialog = true
      this.options = Object.assign(this.options, options)
    },
    search() {
      axios.post('/customer/list', {
        searchBy: this.data.by,
        search: this.data.value
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
