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
        <v-toolbar-title>Cari ID Penjual</v-toolbar-title>
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
              @change="searchByChange"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="8" class="pl-md-1">
            <v-text-field
              ref="search"
              v-if="data.by !== 'date'"
              v-model="data.value"
              label="Teks Pencarian"
              class="mt-0"
              @keyup.enter="search"
            ></v-text-field>
            <v-menu
              v-else
              v-model="menu"
              :close-on-content-click="false"
              transition="scale-transition"
              min-width="290px"
              offset-y
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  ref="search"
                  v-bind="attrs"
                  v-on="on"
                  :value="formatDate"
                  label="Teks Pencarian"
                  class="mt-0"
                  readonly
                  @keyup.enter="search"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="data.value"
                no-title
                scrollable
                @change="searchDateChange"
              ></v-date-picker>
            </v-menu>
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
            <template v-slot:[`item.date`]="{ item }">
              {{ item.date | formatDate('dd-MMM-yyyy') }}
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
import { format, parseISO } from 'date-fns'

import api from '@/services/axios.service'

export default {
  data() {
    return {
      dialog: false,
      menu:  false,
      data: {
        by: 'code',
        value: '',
        items: [
          { text: 'Inisial', value: 'initial' },
          { text: 'Grup', value: 'groupName' },
          { text: 'Nama', value: 'fullName' },
          { text: 'No. Identitas', value: 'identityCardNo' },
          { text: 'No. Telepon/HP', value: 'phone' }
        ]
      },
      grid: {
        columns: [
          { text: 'Inisial', value: 'initial', divider: true, width: '110' },
          { text: 'Grup', value: 'groupName', divider: true, width: '120' },
          { text: 'Nama', value: 'fullName', divider: true, width: '200' },
          { text: 'Jenis Kelamin', value: 'gender', divider: true, width: '90' },
          { text: 'No. Identitas', value: 'identityCardNo', divider: true, width: '130' },
          { text: 'No. Telepon/HP', value: 'phone', divider: true, width: '100' }
        ],
        data: []
      },
      options: {
        width: 800
      },
      isReplaceman: false,
      gridIndex: 0
    }
  },

  computed: {
    ...mapState('api', { endpoint: state => state.endpoint }),
    formatDate() {
      return this.data.value ? format(parseISO(this.data.value), 'dd-MMM-yyyy') : ''
    }
  },
  
  methods: {
    reset() {
      this.data.by = 'initial'
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
    openReplaceman(idx) {
      this.dialog = true
      this.isReplaceman = true
      this.gridIndex = idx
      this.reset()
      setTimeout(() => {
        this.$refs.search.focus()
      }, 0)
    },
    close() {
      this.dialog = false
    },
    search() {
      api.getAll(this.endpoint.general.employee, {
        params: {
          filters: JSON.stringify([{
            field: this.data.by,
            operator: this.data.by === 'date' ? 'eq' : 'contains',
            keyword: this.data.value
          }, {
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }, {
            field: 'type',
            operator: 'eq',
            keyword: 2
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
    searchByChange() {
      this.data.value = this.data.by === 'date' ? format(new Date(), 'yyyy-MM-dd') : ''
    },
    searchDateChange() {
      this.menu = false
      this.$refs.search.focus()
    },
    dblclickRow(event, { item }) {
      item.called = 'dialog'

      if (this.isReplaceman) {
        item.gridIndex = this.gridIndex
        this.$emit('dblclick:rep', item)
      } else {
        this.$emit('dblclick:row', item)
      }
      this.dialog = false
    }
  }
}
</script>
