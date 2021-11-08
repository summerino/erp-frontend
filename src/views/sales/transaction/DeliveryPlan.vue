<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="3">
            Rencana Pengiriman
          </v-col>
          <v-col cols="12" md="5" >
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
                <span class="text-caption">Pencarian Lanjutan</span>
              </v-tooltip>
              <export-excel
                ref="exportExcel"
                :company="companyName"
                :filters="filter"
                :grid="grid"
                :gridDefOpts="gridDefOpts"
                title="Daftar Rencana Pengiriman"
              ></export-excel>
            </v-row>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
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
                  :disabled="!auth.allowCreate"
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
        fixed-header
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
                :disabled="item.mark.toUpperCase() !== 'A' || !auth.allowVoid"
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
          <v-menu
            bottom
            eager
            open-on-hover
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :disabled="item.mark.toUpperCase() === 'V' || !auth.allowPrint"
                color="teal darken-2"
                icon
                small
              >
                <v-icon small>mdi-printer</v-icon>
              </v-btn>
            </template>
            <v-list
              class="cursor-pointer"
              color="teal darken-2"
              dark
            >
              <v-list-item
                dense
                @click="print('packing', item)"
              >
                <v-list-item-title>
                  <span class="text-caption">
                    Cetak Daftar Pengepakan
                  </span>
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                dense
                @click="print('picking', item)"
              >
                <v-list-item-title>
                  <span class="text-caption">
                    Cetak Daftar Pengambilan
                  </span>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.total`]="{ item }">
          {{ item.total | formatCurrency }}
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
          <v-btn icon dark @click="dialog.add = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Rencana Pengiriman</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="isVoid || (data.action === 'edit' && !auth.allowUpdate)"
                  dark
                  text
                  @click="save(true)"
                  @shortkey="save(true)"
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
                  :disabled="isVoid || (data.action === 'edit' && !auth.allowUpdate)"
                  @click="save(false)"
                  @shortkey="save(false)"
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
                          v-model.trim="data.code"
                          label="Kode"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.deliveryDate"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          min-width="290px"
                          offset-y
                          :disabled="!auth.allowChangeDate"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-bind="attrs"
                              v-on="on"
                              :rules="rules.required"
                              :value="formatDeliveryDate"
                              label="Tanggal Transaksi"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
                            :min="dataStartDate"
                            no-title
                            scrollable
                            @change="menu.deliveryDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                          v-model="data.srcTrans"
                          :items="types"
                          :rules="rules.required"
                          :readonly="hasRelatedTrans"
                          label="Sumber Transaksi"
                          item-text="name"
                          item-value="id"
                          class="mt-0"
                          required
                          @change="clearItemData"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                       <v-col cols="12" md="6">
                        <v-autocomplete
                          v-model="data.vehicleId"
                          :items="vehicles"
                          :rules="rules.required"
                          :readonly="hasRelatedTrans"
                          label="Kendaraan"
                          :item-text="item => `${item.vehicleNo} - ${item.typeName}`"
                          item-value="id"
                          class="mt-0"
                          required
                          @change="vehicleChange"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-autocomplete
                          v-model="data.driverId"
                          :items="drivers"
                          :rules="rules.required"
                          :readonly="hasRelatedTrans"
                          label="Supir"
                          :item-text="item => `${item.initial} - ${item.firstName}`"
                          item-value="id"
                          class="mt-0"
                          required
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.notes">
                    <v-tab key="location">Gudang</v-tab>
                    <v-tab key="notes">Catatan</v-tab>
                    <v-tab key="user">Pengguna</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.notes" class="pa-2">
                    <v-tab-item
                      key="location"
                      transition="false"
                      eager
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.warehouseCode"
                            :items="warehouses"
                            :disabled="hasRelatedTrans || !auth.allowChangeWarehouse"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            :rules="rules.required"
                            item-value="code"
                            label="Gudang"
                            class="mt-0"
                            @change="clearItemData"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                    </v-tab-item>

                    <v-tab-item
                      key="notes"
                      transition="false"
                      eager
                    >
                      <v-row no-gutters>
                        <v-textarea
                          v-model="data.notes"
                          :rules="[rules.max256chars[0], rules.required[0]]"
                          label="Catatan"
                          counter="256"
                          class="mt-0"
                          rows="6"
                          required
                        ></v-textarea>
                      </v-row>
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
                  <v-tabs v-model="tab.item">
                    <v-tab key="detail">Detail</v-tab>
                    <v-tab key="related-trans">Transaksi Terkait</v-tab>

                    <v-tab-item
                      key="detail"
                      transition="false"
                    >
                      <v-card>
                        <v-row dense>
                          <v-col cols="12">
                            <v-app-bar dense flat>
                              <v-spacer></v-spacer>
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    v-bind="attrs"
                                    v-on="on"
                                    v-shortkey="['ctrl', 'i']"
                                    :disabled="isVoid || hasRelatedTrans || (data.action === 'add' && !auth.allowCreate) || (data.action === 'edit' && !auth.allowUpdate)"
                                    class="blue--text"
                                    small
                                    tile
                                    @click="addDetail"
                                    @shortkey="addDetail"
                                  >
                                    <v-icon left>mdi-plus</v-icon>
                                    Tambah
                                  </v-btn>
                                </template>
                                <span class="text-caption">(Ctrl + I)</span>
                              </v-tooltip>
                            </v-app-bar>

                            <v-data-table
                              :headers="gridItem.columns"
                              :items="gridItem.data"
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
                                      :disabled="isVoid || hasRelatedTrans || (data.action === 'add' && !auth.allowCreate) || (data.action === 'edit' && !auth.allowUpdate)"
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
                              <template v-slot:[`item.transCode`]="{ item }">
                                <v-text-field
                                  ref="itemId"
                                  v-model="item.transCode"
                                  readonly
                                  :rules="rules.required"
                                  class="text-body-2 mt-0"
                                  dense
                                  required
                                >
                                  <template v-slot:append>
                                    <v-btn
                                      color="primary"
                                      icon
                                      x-small
                                      @click="showDPFindDialog(item)"
                                    >
                                      <v-icon>
                                        mdi-settings-helper
                                      </v-icon>
                                    </v-btn>
                                  </template>
                                </v-text-field>
                              </template>
                              <template v-slot:[`item.volume`]="{ item }">
                                {{ item.volume === null ? 0 : item.volume }} M³
                              </template>
                              <template v-slot:[`item.weight`]="{ item }">
                                {{ item.weight === null ? 0 : item.weight }} Kg
                              </template>
                              <template v-slot:[`item.detail`]="{ item }">
                                <v-tooltip bottom>
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      v-bind="attrs"
                                      v-on="on"
                                      color="blue"
                                      icon
                                      x-small
                                      @click="showDPSendFailedDialog(item)"
                                    >
                                      <v-icon small>mdi-cube-send</v-icon>
                                    </v-btn>
                                  </template>
                                  <span class="text-caption">Detail</span>
                                </v-tooltip>
                              </template>
                              <template v-slot:[`item.isFailShipment`]="{ item }">
                                <v-checkbox
                                  v-model="item.isFailShipment"
                                  :readonly="hasRelatedTrans"
                                ></v-checkbox>
                              </template>
                            </v-data-table>
                          </v-col>
                        </v-row>
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
                      </v-data-table>
                    </v-tab-item>
                  </v-tabs>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="12">
                <v-card>
                  <v-tabs v-model="tab.calc">
                    <v-tab key="detail">Volume / Berat</v-tab>
                    <v-tab-item
                      key="detail"
                      transition="false"
                    >
                      <v-card-text>
                      <v-row dense>
                        <v-col cols="12" md="6">   
                          <v-currency-field
                            v-model="data.totalVolume"
                            :decimal-length="0"
                            class="text-right"
                            suffix="M³"
                            :readonly="true"
                            label="Total Volume"
                          ></v-currency-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-currency-field
                            v-model="data.totalWeight"
                            :decimal-length="0"
                            class="text-right"
                            :readonly="true"
                            suffix="Kg"
                            label="Total Bobot"
                          ></v-currency-field> 
                        </v-col>
                      </v-row>

                      <v-row dense>
                        <v-col cols="12" md="6">   
                          <v-currency-field
                            v-model="data.diffVolume"
                            :decimal-length="0"
                            class="text-right"
                            suffix="M³"
                            :readonly="true"
                            label="Selisih Total Volume"
                          ></v-currency-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-currency-field
                            v-model="data.diffWeight"
                            :decimal-length="0"
                            class="text-right"
                            :readonly="true"
                            suffix="Kg"
                            label="Selisih Total Bobot"
                          ></v-currency-field> 
                        </v-col>
                      </v-row>
                      </v-card-text>
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
    <report-viewer ref="reportViewer"></report-viewer>
    <dp-find
      ref="dpFind"
      :warehouse-code="data.warehouseCode"
      :src-trans="data.srcTrans"
      :grid-item="listCode"
      @dblclick:row="getListCode"
    ></dp-find>
    <dp-send-failed
      ref="dpSendFailed"
      :warehouse-code="data.warehouseCode"
    >
    </dp-send-failed>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import ReportViewer from '@/components/dialog/ReportViewer'
import DpFind from '@/components/dialog/sales/DPFind'
import DpSendFailed from '@/components/dialog/sales/DPSendFailed'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    ReportViewer,
    DpFind,
    DpSendFailed
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      deliveryDate: false
    },
    tab: {
      item: null,
      calc: null,
      notes: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Kode', value: 'code', divider: true, width: '120', excelColWidth:'14' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'No. Kendaraan', value: 'vehicleNo', divider: true, width: '160', excelColWidth:'18' },
        { text: 'Supir', value: 'driverInitial', divider: true, width: '120', excelColWidth:'15' },
        { text: 'Gudang', value: 'warehouseInitial', divider: true, width: '160', excelColWidth:'19' },
        { text: 'Status', value: 'mark', divider: true, width: '120', excelColWidth:'10' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [true]
      },
      total: 0,
      search: null
    },
    gridItem: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '80' },
        { text: 'No. Dokumen', value: 'transCode', divider: true, width: '120' },
        { text: 'Penjual', value: 'salesInitial', divider: true, width: '120' },
        { text: 'Volume', value: 'volume', align: 'right', divider: true, width: '120' },
        { text: 'Bobot', value: 'weight', align: 'right', divider: true, width: '120' },
        { text: 'Detail Barang Gagal Kirim', value: 'detail', divider: true, width: '120' },
        { text: 'Gagal Kirim', value: 'isFailShipment', divider: true, width: '100' }
      ],
      data: []
    },  
    gridRelated: {
      columns: [
        { text: 'Kode', value: 'code', divider: true },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true },
        { text: 'Status', value: 'mark' }
      ],
      data: []
    },
    filterfields: [
      {
        text: 'Kode', value: 'code', dataType: 'text'
      },
      {
        text: 'No. Kendaraan', value: 'vehicleNo', dataType: 'text'
      },
      {
        text: 'Supir', value: 'driverInitial', dataType: 'text'
      },
      {
        text: 'Gudang', value: 'warehouseInitial', dataType: 'text'
      }, 
      {
        text: 'Tanggal', value: 'date', dataType: 'datetime'
      }     
    ],
    valid: false,
    dataStartDate: null,
    defWarehouseCode: '',
    types: [{ id: 1, name: 'Penjualan Langsung' }, { id: 2, name: 'Surat Jalan' }, { id: 3, name: 'Semua' }],
    drivers: [],
    employees: [],
    data: {},
    vehicles: [],
    warehouses: [],
    listCode: [],
    orderData: []
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getDriverLists()
    this.getEmployeeLists()
    this.getVehicleLists()
    this.getWarehouseLists()
    this.getOrderData()
    this.getDlvData()
    auth.getAction(this.endpoint, this.menuId.deliveryPlan)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    this.$store.commit('app/setFilterFields', this.filterfields)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Penjualan'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Rencana Pengiriman'
      }])
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  computed: {
    ...mapState({
      gridDefOpts: state => state.app.grid,
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint,
      companyName: state => state.api.companyName,
      filter: state => state.app.filter,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatDeliveryDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    formatInvoiceDate() {
      return this.data.taxInvoiceDate ? format(parseISO(this.data.taxInvoiceDate), 'dd-MMM-yyyy') : ''
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
        srcTrans: null,
        vehicleId: null,
        driverId: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        warehouseCode: null,
        notes: null,
        totalVolume: null,
        totalWeight: null,
        totalVehicleVolume: null,
        totalVehicleWeight: null,
        diffVolume: null,
        diffWeight: null
      }
      this.gridItem.data = []
      this.gridRelated.data = []
      this.tab.notes = 0
      this.tab.item = 0
      this.tab.calc = 0

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
      api.getAll(this.endpoint.sales.plan, {
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
    getSystemParameter() {
      api.getAll(`${this.endpoint.systemManagement.parameter}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'code',
            operator: 'eq',
            keyword: 'DATA_START_DATE'
          }])
        }
      })
        .then(response => {
          this.dataStartDate = response.data.tableData[0].value
        })
    },
    getDriverLists() {
      api.getAll(`${this.endpoint.general.employee}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'type',
            operator: 'eq',
            keyword: 3
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.drivers = response.data.tableData
        })
    },
    getEmployeeLists() {
      api.getAll(`${this.endpoint.general.employee}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'type',
            operator: 'eq',
            keyword: 1
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.employees = response.data.tableData
        })
    },
    getVehicleLists() {
      api.getAll(this.endpoint.general.vehicle.vehicle, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }])
        }
      })
        .then(response => {
          this.vehicles = response.data.tableData
        })
    },
    getWarehouseLists() {
      api.getAll(`${this.endpoint.inventory.warehouse}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.warehouses = response.data.tableData
          
          // // Set default warehouse
          // const defWarehouse = this.warehouses.find(w => w.isDefault)
          // if (defWarehouse) {
          //   this.defWarehouseCode = defWarehouse.code
          // }

          // set default warehouse
          this.setDefaultWarehouse()

        })
    },
    close() {
      this.dialog.add = false
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'

      setTimeout(() => {
        // Set focus to return code field
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
        originalDate: item.date,
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get item details
      api.getAll(`${this.endpoint.sales.plan}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          for (let i = 0; i < response.data.tableData.length; i++) {
            const data_dlv = this.dlvData.find(x => x.code === response.data.tableData[i].transCode)
            if (data_dlv) {
              const data_so = this.orderData.find(x => x.code === data_dlv.transCode)
              if (data_so) {
                response.data.tableData[i].salesInitial = data_so.salesInitial
              }
            }
          }
          this.gridItem.data = response.data.tableData
          this.calcTotal()  
        })

      // // Get related transaction details
      // api.getAll(`${this.endpoint.sales.return}/related-trans`, {
      //   params: { code: item.code }
      // })
      //   .then(response => {
      //     this.gridRelated.data = response.data.tableData
      //   })

      // Set focus to return code field
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
        api.delete(this.endpoint.sales.plan, item.code, {data: item})
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    print(caller, item) {
      if (caller === 'packing') {
        this.$refs.reportViewer.open('delivery-plan-packing', item.code)
      } else if (caller === 'picking') {
        this.$refs.reportViewer.open('delivery-plan-picking', item.code)
      }
    },
    async save(closeDialog) {
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = this.data
      data.itemDetails = this.gridItem.data
      

      if (data.itemDetails.length === 0) {
        this.$store.dispatch('app/showInfo', 'Detil tidak boleh kosong.')
        return
      }

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.plan, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.plan, data.code, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else {
          this.data.code = result.data
        }
        this.getList(!closeDialog)
      }
    },
    addDetail() {
      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0]?.transCode ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.data.code,
          transCode: null,
          volume: 0,
          weight: 0,
          isFailShipment: false,
          notesFailShipment: null,
          custName: null,
          undeliveredItems: []
        }
        this.gridItem.data.push(item)

        setTimeout(() => {
          this.$refs.itemId.focus()
        }, 0)
      }
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridItem.data.findIndex(i => i.id === item.id)
        this.gridItem.data.splice(idx, 1)
        this.listCode.splice(idx, 1)
        
        this.calcTotal()
      }
    },
    vehicleChange() {
      const vehicle = this.vehicles.find(s => s.id === this.data.vehicleId)
      if (vehicle) {
        this.data.totalVehicleVolume = vehicle.maxLoadVolume
        this.data.totalVehicleWeight = vehicle.maxLoadWeight
      }

      this.calcTotal()
    },
    calcTotal() {
      this.data.totalWeight = _sumBy(this.gridItem.data, 'weight')
      this.data.totalVolume = _sumBy(this.gridItem.data, 'volume')

      this.data.diffVolume = this.data.totalVehicleVolume - this.data.totalVolume
      this.data.diffWeight = this.data.totalVehicleWeight - this.data.totalWeight
    },
    showDPFindDialog(item) {
      this.$refs.dpFind.open(item)
    },
    showDPSendFailedDialog(item) {
      this.$refs.dpSendFailed.open(item)
    },
    getListCode() {
      this.listCode.splice(0, this.listCode.length)
      for (let i = 0; i < this.gridItem.data.length; i++) {
        this.listCode.push(this.gridItem.data[i].code)
      }
    },
    clearItemData() {
      this.gridItem.data = []
      this.listCode = []
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    setDefaultWarehouse() {
      const userInfo = this.userInfo = auth.getUserInfo()
      const defWarehouse = this.warehouses.find(w => w.isDefault)
      if (userInfo) {
        const userDefaultWarehouse = userInfo.WarehouseCode
        if (userDefaultWarehouse) {
          this.data.warehouseCode = userDefaultWarehouse
        } else if (defWarehouse) {
          this.data.warehouseCode = defWarehouse.code
        }
      }
    },
    getOrderData() {
      api.getAll(this.endpoint.sales.order)
        .then(response => {
          this.orderData = response.data.tableData
        })
    },
    getDlvData() {
      api.getAll(this.endpoint.sales.delivery)
        .then(response => {
          this.dlvData = response.data.tableData
        })
    }
  }
}
</script>