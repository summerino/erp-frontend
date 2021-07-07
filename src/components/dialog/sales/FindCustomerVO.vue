<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    :width="options.width"
    persistent
    scrollable
    @keydown.esc="close"
  >
    <v-card :style="{ background: $vuetify.theme.themes[theme].surface }">
      <v-toolbar
        color="indigo darken-1"
        max-height="64"
        dark
      >
        <v-toolbar-title>Pelanggan</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          dark
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 py-0">
        <v-row dense>
          <v-col cols="12">
            <v-card>
              <v-card-text>
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
                    <template v-slot:[`item.initial`]="{ item }">
                      <v-text-field
                        v-model="item.initial"
                        class="text-body-2 mt-0 no-border"
                        dense
                        readonly
                        @keyup.enter="dblclickRow(null, { item })"
                      ></v-text-field>
                    </template>
                  </v-data-table>
                </v-card>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
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
      valid: false,
      categories: [],      
      data: {
        category: [0],
        by: 'name',
        value: '',
        items: [
          { text: 'Inisial', value: 'initial' },
          { text: 'Nama', value: 'name' }
        ]
      },
      rowItem: {},
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
    ...mapState('api', { endpoint: state => state.endpoint }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },
  
  methods: {
    reset() {
      this.data.by = 'name'
      this.data.value = ''
      this.grid.data = []      
    },
    open(rowItem) {
      this.dialog = true
      this.rowItem = rowItem
      this.reset()
      setTimeout(() => {
        this.$refs.search.focus()
      }, 500)
    },
    close() {
      this.dialog = false
    },
    search() {
      const filters = [{
        field: this.data.by,
        operator: 'contains',
        keyword: this.data.value
      }, {
        field: 'isActive',
        operator: 'eq',
        keyword: true
      }]
      api.getAll(`${this.endpoint.general.customer.customer}/lists`, {
        params: {
          filters: JSON.stringify(filters),
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
      this.rowItem.custCode = item.code
      this.$emit('dblclick:row', this.rowItem, item)
      this.dialog = false
    }
  }
}
</script>
