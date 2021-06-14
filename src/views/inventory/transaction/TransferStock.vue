<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="3">
            Transfer Persediaan
          </v-col>
          <!-- <v-col cols="12" md="4">
            <v-text-field
              v-model="grid.search"
              append-icon="mdi-magnify"
              label="Cari..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList()"
            ></v-text-field>
          </v-col> -->
          <v-col cols="12" md="4" >
            <v-row no-gutters>
              <v-text-field
                append-icon="mdi-magnify"
                label="Cari..."
                class="font-weight-regular mt-0 pt-0"
                single-line
                v-model="grid.search"
                :readonly="filter.isAdvancedSearch"
                @click:append-outer="advancedSearch"
                @keyup.enter="getList(false)"
              ></v-text-field>            
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    color="blue darken-2 ml-1"
                    class="font-weight-regular"
                    dark
                    small
                    tile
                    @click="advancedSearch"
                  >
                    <v-icon>
                      mdi-magnify-plus-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span class="text-caption">Pencarian lanjutan</span>
              </v-tooltip>
            <export-excel title="Data Transfer Persediaan" :grid="grid" :gridDefOpts="gridDefOpts" ref="exportExcel"></export-excel>

            </v-row>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="5" class="text-right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'alt', 'n']"
                  color="green darken-1"
                  class="font-weight-regular"
                  dark
                  small
                  tile
                  @click="add"
                  @shortkey="add"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Data Baru
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + Alt + N)</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text v-if="true" class="pb-1">
        <advanced-search @search="search"></advanced-search>
      </v-card-text>
      <v-data-table
        :headers="grid.columns"
        :footer-props="{ itemsPerPageOptions: gridDefOpts.pageSizes }"
        :height="gridDefOpts.height"
        :items="grid.data"
        :items-per-page="gridDefOpts.pageSize"
        :options.sync="grid.options"
        :server-items-length="grid.total"
        :sort-by="grid.options.sortBy"
        :sort-desc="grid.options.sortDesc"
        class="elevation-1"
      >
        <template v-slot:[`item.action`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                color="orange lighten-1"
                icon
                small
                @click="edit(item)"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Ubah</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :disabled="item.mark.toUpperCase() !== 'A'"
                color="red"
                icon
                small
                @click="remove(item)"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Void</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.mark`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                v-bind="attrs"
                v-on="on"
                :color="item.mark.toUpperCase() === 'V' ? 'error' : 'green'"
                class="px-1"
                dark
                small
              >
                {{ item.mark }}
              </v-chip>
            </template>
            <span class="text-caption">{{ item.status }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog
      v-model="dialog.add"
      transition="dialog-bottom-transition"
      fullscreen
      hide-overlay
      persistent
      scrollable
      @keydown.esc="close"
    >
      <v-card :style="{ background: $vuetify.theme.themes[theme].surface }">
        <v-toolbar
          color="primary"
          max-height="64"
          dark
        >
          <v-btn icon dark @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Transfer Persediaan</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="isVoid || data.mark === 'CMP'"
                  dark
                  text
                  @click="save(true, false)"
                  @shortkey="save(true, false)"
                >Simpan & Tutup</v-btn>
              </template>
              <span class="text-caption">(Ctrl + Enter)</span>
            </v-tooltip>
            <v-divider vertical></v-divider>
            <v-menu
              bottom
              eager
              left
              open-on-hover
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  dark
                  icon
                >
                  <v-icon>mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list class="cursor-pointer">
                <v-list-item
                  v-shortkey="['ctrl', 's']"
                  :disabled="isVoid || data.mark === 'CMP'"
                  @click="save(false, false)"
                  @shortkey="save(false, false)"
                >
                  <v-list-item-title>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                        >
                          Simpan
                        </span>
                      </template>
                      <span class="text-caption">(Ctrl + S)</span>
                    </v-tooltip>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-if="data.type === 1"
                  v-shortkey="['ctrl', 'alt', 's']"
                  :disabled="isVoid || data.mark === 'CMP' || hasRelatedTrans"
                  @click="save(false, true)"
                  @shortkey="save(false, true)"
                >
                  <v-list-item-title>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                        >
                          Simpan & Buat Brg. Masuk
                        </span>
                      </template>
                      <span class="text-caption">(Ctrl + Alt + S)</span>
                    </v-tooltip>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-divider vertical></v-divider>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text class="px-2">
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-row dense>
              <v-col cols="12" md="4">
                <v-card>
                  <v-card-title>Umum</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="code"
                          v-model="data.code"
                          label="No. Transfer Persediaan"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.transfDate"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          min-width="290px"
                          offset-y
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-bind="attrs"
                              v-on="on"
                              :rules="rules.required"
                              :value="formatTransfDate"
                              label="Tanggal"
                              class="mt-0"
                              :readonly="data.mark === 'CMP'"
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
                            no-title
                            scrollable
                            @change="menu.transfDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                          v-model="data.type"
                          :items="typeRef"
                          :item-text="item => `${item.text}`"
                          :rules="rules.required"
                          label="Tipe"
                          item-value="value"
                          class="mt-0"
                          :readonly="data.mark === 'CMP' || hasRelatedTrans"
                          required
                          @change="onChangeType"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          v-model="data.originTransferCode"
                          :rules="(data.type === 2) ? rules.required : []"
                          label="No. Transf. Persd. Keluar"
                          class="mt-0"
                          :required="data.type === 2"
                          :readonly="data.type !== 2 || data.mark === 'CMP'"
                          @change="tsCodeChange"
                        >
                          <template v-slot:append v-if="data.type === 2">
                            <v-btn
                              color="primary"
                              icon
                              small
                              @click="showFindTSDialog"
                            >
                              <v-icon>
                                mdi-shopping-search
                              </v-icon>
                            </v-btn>
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.loc">
                    <v-tab key="location">Lokasi</v-tab>
                    <v-tab key="notes">Catatan</v-tab>
                    <v-tab key="user">Pengguna</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.loc" class="pa-2">
                    <v-tab-item
                      key="location"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.warehouseCodeFrom"
                            :items="warehouseRef"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            :rules="(data.type !== 2) ? rules.required : []"
                            :readonly="data.type === 2 || data.mark === 'CMP' || hasRelatedTrans"
                            label="Gudang Asal"
                            item-value="code"
                            class="mt-0"
                            :required="data.type !== 2"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.warehouseCodeTo"
                            :items="warehouseRef"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            :rules="(data.type !== 2) ? rules.required : []"
                            :readonly="data.type === 2 || data.mark === 'CMP' || hasRelatedTrans"
                            label="Gudang Tujuan"
                            item-value="code"
                            class="mt-0"
                            :required="data.type !== 2"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                    </v-tab-item>

                    <v-tab-item
                      key="notes"
                      transition="false"
                    >
                      <v-textarea
                        v-model="data.notes"
                        :rules="rules.max256chars"
                        label="Catatan"
                        counter="256"
                        class="mt-0"
                        rows="4"
                        :readonly="data.mark === 'CMP'"
                      ></v-textarea>
                    </v-tab-item>

                    <v-tab-item
                      key="user"
                      transition="false"
                      eager
                    >

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.createdInitial"
                            label="Dibuat Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.createdDate"
                            label="Tanggal Dibuat"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.updatedInitial"
                            label="Diperbarui Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.updatedDate"
                            label="Tanggal Diperbarui"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.approvedInitial"
                            label="Disetujui Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.approvedDate"
                            label="Tanggal Disetujui"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-tab-item>
                  </v-tabs-items>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-tabs v-model="tab.det">
                    <v-tab key="detail-trans">Detail</v-tab>
                    <v-tab key="related-trans" @click="loadRelatedTransfer">Transaksi Terkait</v-tab>

                    <v-tab-item
                      key="detail-trans"
                      transition="false"
                    >
                      <v-card>
                        <v-app-bar dense flat>
                          <v-spacer></v-spacer>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                v-bind="attrs"
                                v-on="on"
                                v-shortkey="['ctrl', 'i']"
                                :disabled="isVoid || data.type === 2 || data.mark === 'CMP' || hasRelatedTrans"
                                class="blue--text"
                                small
                                tile
                                @click="addItem"
                                @shortkey="addItem"
                              >
                                <v-icon left>mdi-plus</v-icon>
                                Tambah
                              </v-btn>
                            </template>
                            <span class="text-caption">(Ctrl + I)</span>
                          </v-tooltip>
                        </v-app-bar>

                        <v-data-table
                          :headers="gridDet.columns"
                          :items="gridDet.data"
                          :items-per-page="-1"
                          height="300"
                          class="elevation-1"
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
                                  :disabled="isVoid || data.type === 2 || data.mark === 'CMP' || hasRelatedTrans"
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
                          <template v-slot:[`item.itemId`]="{ item }">
                            <v-autocomplete
                              ref="itemId"
                              v-model="item.itemId"
                              :items="items"
                              :readonly="data.type === 2 || data.mark === 'CMP' || hasRelatedTrans"
                              :rules="rules.required"
                              item-text="initial"
                              item-value="id"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="itemIdChange(item)"
                            >
                              <template v-slot:append>
                                <v-btn
                                  :disabled="data.type === 2 || data.mark === 'CMP' || hasRelatedTrans"
                                  color="primary"
                                  icon
                                  x-small
                                  @click="showFindItemDialog(item)"
                                >
                                  <v-icon>
                                    mdi-settings-helper
                                  </v-icon>
                                </v-btn>
                              </template>
                            </v-autocomplete>
                          </template>
                          <template v-slot:[`item.qty`]="{ item }">
                            <v-currency-field
                              v-model="item.qty"
                              :decimal-length="0"
                              :min="1"
                              :readonly="data.type === 2 || data.mark === 'CMP'"
                              class="text-body-2 text-right mt-0"
                              dense
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.unitName`]="{ item }">
                            <v-autocomplete
                              v-model="item.unitId"
                              :items="item.units"
                              :readonly="data.type === 2 || data.mark === 'CMP' || hasRelatedTrans"
                              :rules="rules.required"
                              item-text="unitEquivalent"
                              item-value="id"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="unitItemChange(item)"
                            ></v-autocomplete>
                          </template>
                          <template v-slot:[`item.notes`]="{ item }">
                            <v-text-field
                              v-model="item.notes"
                              :readonly="data.type === 2 || data.mark === 'CMP'"
                              class="text-body-2 mt-0"
                              dense
                            ></v-text-field>
                          </template>
                        </v-data-table>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="related-trans"
                      transition="false"
                    >
                      <v-data-table
                        :headers="gridRelated.columns"
                        :items="gridRelated.data"
                        :items-per-page="-1"
                        height="300"
                        class="elevation-1"
                        dense
                        disable-sort
                        fixed-header
                        hide-default-footer
                      >
                        <template v-slot:[`item.date`]="{ item }">
                          {{ item.date | formatDate('dd-MMM-yyyy') }}
                        </template>
                        <template v-slot:[`item.mark`]="{ item }">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-chip
                                v-bind="attrs"
                                v-on="on"
                                :color="item.mark.toUpperCase() === 'V' ? 'error' : 'green'"
                                class="px-1"
                                dark
                                small
                              >
                                {{ item.mark }}
                              </v-chip>
                            </template>
                            <span class="text-caption">{{ item.status }}</span>
                          </v-tooltip>
                        </template>
                      </v-data-table>
                    </v-tab-item>
                  </v-tabs>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <confirm ref="confirm"></confirm>
    <find-item
      ref="findItem"
      @dblclick:row="bindItemData"
    ></find-item>
    <find-transfer-stock
      ref="findTransferStock"
      :mark-exclude="['V']"
      @dblclick:row="bindTSData"
    ></find-transfer-stock>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import FindItem from '@/components/dialog/inventory/FindItem'
import FindTransferStock from '@/components/dialog/inventory/FindTransferStock'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    FindItem,
    FindTransferStock
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      transfDate: false
    },
    tab: {
      loc: null,
      det: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'No. Transf. Persd.', value: 'code', divider: true, width: '160', excelColWidth:'20' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Tipe', value: 'typeInitial', divider: true, width: '150', excelColWidth:'18' },
        { text: 'Gudang Asal', value: 'warehouseInitialFrom', divider: true, width: '180', excelColWidth:'20' },
        { text: 'Gudang Tujuan', value: 'warehouseInitialTo', divider: true, width: '180', excelColWidth:'20' },
        { text: 'Status', value: 'mark', width: '50', excelColWidth:'10' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [true]
      },
      total: 0,
      search: null
    },
    gridDet: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Inisial', value: 'itemId', divider: true, width: '50' },
        { text: 'Nama', value: 'itemName', divider: true, width: '200' },
        { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '70' },
        { text: 'Satuan', value: 'unitName', divider: true, width: '70' },
        { text: 'Catatan', value: 'notes', divider: true, width: '120' }
      ],
      data: []
    },
    gridRelated: {
      columns: [
        { text: 'No. Transf. Persd.', value: 'code', divider: true, width: '160' },
        { text: 'Tipe', value: 'typeInitial', divider: true, width: '150' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120' },
        { text: 'Gudang Asal', value: 'warehouseInitialFrom', divider: true, width: '180' },
        { text: 'Gudang Tujuan', value: 'warehouseInitialTo', divider: true, width: '180' },
        { text: 'Catatan', value: 'notes', divider: true, width: '180' },
        { text: 'Status', value: 'mark', width: '50' }
      ],
      data: []
    },
    filterfields: [
      {
        text: 'No. Transf. Persd.', value: 'code', dataType: 'text'
      },
      {
        text: 'Tanggal', value: 'date', dataType: 'dateTime'
      },
      {
        text: 'Tipe', value: 'typeInitial', dataType: 'text'
      },
      {
        text: 'Gudang Asal', value: 'warehouseInitialFrom', dataType: 'text'
      },
      {
        text: 'Gudang Tujuan', value: 'warehouseInitialTo', dataType: 'text'
      }      
    ],
    valid: false,
    typeRef: [{ value: 1, text: 'Barang Keluar'}, { value: 2, text: 'Barang Masuk'}, { value: 3, text: 'Transfer Langsung'}],
    warehouseRef: [],
    items: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.loadWarehouse()
    this.getItemLists()
    this.$store.commit('app/setFilterFields', this.filterfields)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Persediaan'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Transfer Persediaan'
      }])
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  watch: {
    'grid.options': {
      handler() {
        this.getList()
      },
      deep: true
    }
  },

  computed: {
    ...mapState({
      gridDefOpts: state => state.app.grid,
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint,
      filter: state => state.app.filter
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatTransfDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    hasRelatedTrans() {
      return (this.gridRelated?.data?.length > 0)
    },
    isVoid() {
      return (this.data?.mark?.toUpperCase() === 'V')
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        type: null,
        originTransferCode: null,
        warehouseCodeFrom: null,
        WarehouseCodeTo: null,
        notes: null,
        typeInitial: null,
        total: 0
      }
      this.gridDet.data = []
      this.tab.loc = 0
      this.tab.det = 0

      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }
    },
    advancedSearch() {
      this.grid.search = null
      this.$store.commit('app/advSearch')
      if (this.filter.isAdvancedSearch) {
        this.$store.commit('app/addSearch')
      }
    },
    search(vm) {
      this.grid.search = vm.search
      this.getList(vm.bindToForm, vm.filters)
    },
    getList(bindToForm = false, filters = []) {
      const sorts = []

      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }
      api.getAll(this.endpoint.inventory.transferStock, {
        params: {
          search: this.grid.search,
          skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
          take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
          sorts: JSON.stringify(sorts),
          filters: JSON.stringify(filters)
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          if (bindToForm) {
            const item = this.grid.data.find(h => h.code === this.data.code)
            this.edit(item)
          }
        })
    },
    // getList(bindToForm = false) {
    //   const sorts = []
    //   for (let i = 0; i < this.grid.options.sortBy.length; i++) {
    //     sorts.push({
    //       field: this.grid.options.sortBy[i],
    //       direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
    //     })
    //   }

    //   api.getAll(this.endpoint.inventory.transferStock, {
    //     params: {
    //       search: this.grid.search,
    //       skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
    //       take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
    //       sorts: JSON.stringify(sorts)
    //     }
    //   })
    //     .then(response => {
    //       this.grid.data = response.data.tableData
    //       this.grid.total = response.data.rowCount
    //       if (bindToForm) {
    //         const item = this.grid.data.find(h => h.code === this.data.code)
    //         this.edit(item)
    //       }
    //     })
    // },
    close() {
      this.dialog.add = false
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'

      setTimeout(() => {
        // Set focus to invoice code field
        this.$refs.code.focus()

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    edit(item) {
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        createdDate: (item.createdDate === null) ? null : format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: (item.updatedDate === null) ? null : format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss'),
        approvedDate: (item.approvedDate === null) ? null : format(parseISO(item.approvedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get item details
      api.getAll(`${this.endpoint.inventory.transferStock}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridDet.data = response.data.tableData
        })

      // Get related transaction
      this.loadRelatedTransfer()

      // Set focus to transfer code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Void?',
          'Apakah anda yakin ingin membuat void data ini?')
      ) {
        api.delete(this.endpoint.inventory.transferStock, item.code)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async save(closeDialog, saveNew) {
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Silahkan periksa kembali data yang wajib diisi.')
        return
      }
      
      const data = this.data
      data.itemDetails = this.gridDet.data
      if (data.originTransferCode === '') {
        data.originTransferCode = null
      }

      // Date validation
      if (this.isDateGreaterThanRelated(data.date)) {
        this.$store.dispatch('app/showInfo', 'Tanggal tidak boleh lebih besar dari Tanggal Barang Masuk pada Transaksi Terkait.')
        return
      }
      
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.inventory.transferStock, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.inventory.transferStock, data.code, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else if (saveNew) {
          this.data.originTransferCode = result.data
          this.tsCodeChange()
          this.data.type = 2
        } else {
          this.data.code = result.data
        }
        this.getList(!closeDialog)
      }
    },
    addItem() {
      if (!this.data.warehouseCodeFrom) {
        this.$store.dispatch('app/showInfo', 'Silahkan pilih gudang asal terlebih dahulu.')
        return
      }

      if (this.gridDet.data.length === 0 || (this.gridDet.data.slice(-1)[0]?.itemId ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.data.code,
          itemId: null,
          uomId: 0,
          unitId: 0,
          qty: 0,
          notes: null,
          unitName: null,
          units: [],
          state: 'A'
        }
        this.gridDet.data.push(item)

        setTimeout(() => {
          this.$refs.qty.focus()
        }, 0)
      }
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridDet.data.findIndex(i => i.id === item.id)
        this.gridDet.data.splice(idx, 1)
      }
    },
    getItemLists(bindToGridDet = false) {
      if (bindToGridDet) {
        api.getAll(`${this.endpoint.inventory.transferStock}/item`, {
          params: { code: this.data.originTransferCode }
        })
          .then(response => {
            this.gridDet.data = response.data.tableData
          })
      } else {
        api.getAll(this.endpoint.inventory.item.item, {
          params: {
            filters: JSON.stringify([{
              field: 'isactive',
              operator: 'eq',
              keyword: true
            }])
          }
        })  
          .then(response => {
            this.items = response.data.tableData
          })
      }
    },
    isDateGreaterThanRelated(dt) {
      let result = false
      if (this.gridRelated.data.length) {
        for (let i = 0; i < this.gridRelated.data.length; i++) {
          if (dt > this.gridRelated.data[i].date) {
            result = true
          }
        }
      } else {
        result = false
      }

      return result
    },
    loadWarehouse() {
      api.getAll(`${this.endpoint.inventory.warehouse}/lists`, {
        params: { 
          filters: JSON.stringify([{
            field: 'isactive',
            operator: 'eq',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: 'name',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.warehouseRef = response.data.tableData
        })
    },
    tsCodeChange() {
      api.getAll(this.endpoint.inventory.transferStock, {
        params: {
          filters: JSON.stringify([{
            field: 'code',
            operator: 'eq',
            keyword: this.data.originTransferCode
          }, {
            field: 'mark',
            operator: 'doesnotcontain',
            keyword: ['V']
          }, {
            field: 'type',
            operator: 'neq',
            keyword: 2
          }])
        }
      })
        .then(response => {
          this.bindTSData(response.data.tableData[0] ?? null)
        })
    },
    showFindTSDialog() {
      this.$refs.findTransferStock.open()
    },
    showFindItemDialog(item) {
      this.$refs.findItem.open(item)
    },
    bindTSData(item) {
      if (item) {
        this.data.originTransferCode = item.code
        this.data.warehouseCodeFrom = item.warehouseCodeFrom
        this.data.warehouseCodeTo = item.warehouseCodeTo

        // Get item details
        this.getItemLists(true)
      } else {
        this.data.originTransferCode = null
        this.data.warehouseCodeFrom = null
        this.data.warehouseCodeTo = null
        this.gridDet.data = []
      }
    },
    loadRelatedTransfer() {
      api.getAll(this.endpoint.inventory.transferStock, {
        params: {
          filters: JSON.stringify([{
            field: 'origintransfercode',
            operator: 'eq',
            keyword: this.data.code
          }, {
            field: 'type',
            operator: 'eq',
            keyword: 2
          }])
        }
      })
        .then(response => {
          this.gridRelated.data = response.data.tableData
        })
    },
    onChangeType() {
      if (!this.data.type) return

      if (this.data.type === 2) {
        this.data.warehouseCodeFrom = null
        this.data.warehouseCodeTo = null
        this.gridDet.data = []
      }
    },
    getUnitItemLists(item) {
      api.getAll(`${this.endpoint.inventory.uom}/item`, {
        params: { uomId: item.uomId }
      })
        .then(response => {
          item.units = response.data.tableData
        })
    },
    bindItemData(rowItem) {
      this.itemIdChange(rowItem)
    },
    itemIdChange(item) {
      const data_i = this.items.find(i => i.id === item.itemId)
      if (data_i) {
        item.itemId = data_i.id
        item.itemName = data_i.name
        item.qty = 1
        item.length = data_i.length
        item.width = data_i.width
        item.height = data_i.height
        item.weight = data_i.weight
        item.dimensionMeasurement = data_i.dimensionMeasurement
        item.weightMeasurement = data_i.weightMeasurement
        item.qtyRcv = 0
        item.uomId = data_i.uomId
        item.oldUnitId = data_i.uomBuyId
        item.oldUnitName = data_i.uomBuyName
        item.oldUnitPrice = data_i.buyPrice
        item.unitId = data_i.uomBuyId
        item.unitName = data_i.uomBuyName
        item.unitPrice = data_i.buyPrice
        item.disc = 0
        item.taxId = data_i.purchaseTaxId
        item.taxAmount = 0
        item.nettPrice = data_i.buyPrice
        item.total = data_i.buyPrice
        item.dpp = data_i.buyPrice
        item.totTax = 0
        item.totDPP = data_i.buyPrice
        item.notes = null
        item.coaInventory = data_i.coaInventory
        item.coaCogs = data_i.coaCogs
        item.coaPurc = data_i.coaPurc
        item.coaPurcDisc = data_i.coaPurcDisc
        item.coaPurcReturn = data_i.coaPurcReturn
        if (item.state !== 'A') {
          item.state = 'M'
        }

        // Get unit item lists
        this.getUnitItemLists(item)
      }
    },
    unitItemChange(item) {
      const oldUnit = item.units.find(u => u.id === item.oldUnitId)
      const unit = item.units.find(u => u.id === item.unitId)

      if (oldUnit.seq < unit.seq) {
        item.uomConversion = unit.conversion
        if (unit.unitToConvert !== item.oldUnitName) {
          this.calcUomConversion(true, item, unit.unitToConvert)
        }
      } else {
        item.uomConversion = 1
        if (unit.unitEquivalent !== item.oldUnitName) {
          this.calcUomConversion(false, item, unit.unitEquivalent)
        }
      }
    },
    calcUomConversion(seqSmaller, item, unitCode) {
      if (seqSmaller) {
        const data = item.units.find(u => u.unitEquivalent === unitCode)
        item.uomConversion *= data.conversion

        if (data.unitToConvert !== item.oldUnitName) {
          this.calcUomConversion(seqSmaller, item, data.unitToConvert)
        }
      } else {
        const data = item.units.find(u => u.unitToConvert === unitCode && !u.isBaseUnit)
        item.uomConversion *= data.conversion
        
        if (data.unitEquivalent !== item.oldUnitName) {
          this.calcUomConversion(seqSmaller, item, data.unitEquivalent)
        }
      }
    },
    async exportExcel() {
      this.exportExcel.export()
    }
  }
}
</script>
