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
        <v-toolbar-title>Pelanggan</v-toolbar-title>
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
              label="Cari Berdasarkan"
              class="mt-0"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="8" class="pl-md-1">
            <v-text-field
              ref="search"
              v-model="data.value"
              label="Teks Pencarian"
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
            disable-sort
            fixed-header
            hide-default-footer
            @dblclick:row="dblclickRow"
          >
            <template v-slot:[`item.code`]="{ item }">
              <v-text-field
                v-model="item.code"
                class="text-body-2 mt-0 no-border"
                dense
                readonly
                @keyup.enter="dblclickRow(null, { item })"
              ></v-text-field>
            </template>
            <template v-slot:[`item.creditLimit`]="{ item }">
              {{ item.creditLimit | formatCurrency }}
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
          Batal
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
        by: 'name',
        value: '',
        items: [
          { text: 'Kode', value: 'code' },
          { text: 'Inisial', value: 'initial' },
          { text: 'Nama', value: 'name' },
          { text: 'Tipe', value: 'typeName' }
        ]
      },
      grid: {
        columns: [
          { text: 'Kode', value: 'code', divider: true, width: '120' },
          { text: 'Inisial', value: 'initial', divider: true, width: '150' },
          { text: 'Nama', value: 'name', divider: true, width: '300' },
          { text: 'Alamat', value: 'address1', divider: true, width: '200' },
          { text: 'Telepon', value: 'phone', divider: true, width: '150' },
          { text: 'Fax', value: 'fax', divider: true, width: '150' },
          { text: 'Batas Kredit', value: 'creditLimit', align: 'right', divider: true, width: '120' },
          { text: 'Tipe', value: 'typeName', divider: true, width: '150' }
        ],
        data: []
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
      this.data.by = 'name'
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
      api.getAll(this.endpoint.general.customer.customer, {
        params: {
          filters: JSON.stringify([{
            field: this.data.by,
            operator: 'contains',
            keyword: this.data.value
          }, {
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: this.data.by,
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
        })
    },
    dblclickRow(event, { item }) {
      this.$emit('dblclick:row', item)
      this.dialog = false
    }
  }
}
</script>
