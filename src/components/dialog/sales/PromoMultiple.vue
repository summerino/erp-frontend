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
      selected: []
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
      this.dialog.listSelected = false
      this.data.items = _clone(this.grid.data)
      this.$emit('saveMultiple', this.data)
    },
    saveItem() {
      if (this.selected.length < 2) {
        this.$store.dispatch('app/showInfo', 'Harus memilih minimal 2 barang.')
        return
      }

      this.dialog.listItem = false
      this.grid.data = _clone(this.selected)
    },
    addItem() {
      this.dialog.listItem = true
      this.gridItem.data = this.items
      this.selected = []
    }
  }
}
</script>
