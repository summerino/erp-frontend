<template>
  <v-dialog
    ref="listSelected"
    v-model="dialog.listSelected"
    fullscreen
    persistent
    scrollable
    @keydown.esc="close"
  >
    <v-card>
      <v-toolbar
        color="indigo darken-1"
        max-height="64"
        dark
      >
        <v-toolbar-title>Promo Beberapa Barang</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            dark
            text
            @click="save"
          >Simpan</v-btn>
        </v-toolbar-items>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <v-row no-gutters>
          <v-col cols="12">
            <v-card-actions class="justify-end pr-2">
            <v-btn
              :disabled="this.grid.data.length < 1"
              color="red"
              class="font-weight-regular"
              dark
              small
              tile
              @click="removeAll"
            >
              <v-icon left>mdi-window-close</v-icon>
              Hapus Semua Barang
            </v-btn>
            <v-btn
              color="green"
              class="font-weight-regular"
              dark
              small
              tile
              @click="addItem"
            >
              <v-icon left>mdi-plus</v-icon>
              Pilih Barang
            </v-btn>
            </v-card-actions>
          </v-col>
        </v-row>
        
        <v-row no-gutters>
          <v-col cols="12">
            <v-card>
              <v-data-table
                :headers="grid.columns"
                :height="grid.height"
                :items="grid.data"
                :items-per-page="-1"
                class="elevation-1 row-pointer"
                dense
                disable-sort
                fixed-header
                hide-default-footer
              >
                <template v-slot:[`item.action`]="{ item }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        color="red"
                        icon
                        small
                        @click="removeItem(item)"
                      >
                        <v-icon small>mdi-close-thick</v-icon>
                      </v-btn>
                    </template>
                    <span class="text-caption">Hapus</span>
                  </v-tooltip>
                </template>
              </v-data-table>
            </v-card> 
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-dialog
      ref="listItem"
      v-model="dialog.listItem"
      width="800"
      persistent
      scrollable
      @keydown.esc="closeItem"
    >
      <v-card>
        <v-toolbar
          color="indigo darken-1"
          max-height="64"
          dark
        >
          <v-toolbar-title>Daftar Barang</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
          <v-btn
            dark
            text
            @click="saveItem"
          >Pilih</v-btn>
        </v-toolbar-items>
          <v-btn
            icon
            @click="closeItem"
          >
            <v-icon>mdi-window-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="px-2 pt-1">
          <v-row>
            <v-col cols="12">
              <v-card>
                <v-data-table
                  :headers="gridItem.columns"
                  :height="gridItem.height"
                  :items="gridItem.data"
                  :items-per-page="-1"
                  class="elevation-1 row-pointer"
                  dense
                  fixed-header
                  hide-default-footer
                  item-key="id"
                  v-model="selected"
                  show-select
                >
                </v-data-table>
              </v-card> 
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import { clone as _clone} from 'lodash'

export default {
  props: {
    items: Array
  },

  data() {
    return {
      dialog: {
        listSelected: false,
        listItem: false
      },
      data: {},
      gridData: {},
      grid: {
        columns: [
          { value: 'action', sortable: false, divider: true, width: '30' },
          { text: 'Inisial Barang', value: 'initial', divider: true, width: '160' },
          { text: 'Nama Barang', value: 'name', divider: true, width: '160' },
          { text: 'Satuan (Jual)', value: 'uomSellName', width: '160' }
        ],
        data: [],
        height: 600
      },
      gridItem: {
        columns: [
          { text: 'Inisial Barang', value: 'initial', divider: true, width: '100' },
          { text: 'Nama Barang', value: 'name', divider: true, width: '200' },
          { text: 'Satuan (Jual)', value: 'uomSellName', width: '100' }
        ],
        data: [],
        height: 600
      },
      selected: [],
      selectedItem: []
    }
  },
  
  watch: {
    'grid.data': {
      handler() {
        this.getListItem()
      },
      deep: true
    }
  },

  methods: {
    reset() {
      this.grid.data = []
    },
    open(item) {
      this.dialog.listSelected = true
      this.reset()
      this.data.id = item.id
      for (let i = 0; i < item.multipleItem.length; i++) {
        const nItem = this.items.find(x => x.id === item.multipleItem[i].itemId)
        if (nItem) {
          this.grid.data.push(nItem)
        }
      }
    },
    close() {
      this.dialog.listSelected = false
    },
    closeItem() {
      this.dialog.listItem = false
    },
    save() {
      if (this.grid.data.length < 2) {
        this.$store.dispatch('app/showInfo', 'Harus memilih minimal 2 barang.')
        return
      }
      this.dialog.listSelected = false
      this.data.items = _clone(this.grid.data)
      this.$emit('saveMultiple', this.data)
    },
    saveItem() {
      this.dialog.listItem = false

      for (let i = 0; i < this.selected.length; i++) {
        this.grid.data.push(this.selected[i]) 
      }
    },
    addItem() {
      this.dialog.listItem = true
      this.gridItem.data = this.items.filter(x => !this.selectedItem.includes(x.id))
      this.selected = []
    },
    getListItem() {
      this.selectedItem.splice(0, this.selectedItem.length)
      for (let i = 0; i < this.grid.data.length; i++) {
        this.selectedItem.push(this.grid.data[i].id)
      }
    },
    removeItem(item) {
      const idx = this.grid.data.findIndex(i => i.id === item.id)
      if (idx !== -1) {
        this.grid.data.splice(idx, 1)
      }
    },
    removeAll() {
      this.grid.data = []
    }
  }
}
</script>
