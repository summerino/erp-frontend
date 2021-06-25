<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Faktur
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
              <export-excel title="Daftar Faktur" :grid="grid" :gridDefOpts="gridDefOpts" :filters="filter" ref="exportExcel"></export-excel>
            </v-row>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="6" class="text-right">
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
                  color="green darken-1"
                  class="font-weight-regular"
                  dark
                  small
                  tile
                  :disabled="!auth.allowInsert"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Data Baru
                </v-btn>
              </template>
              <v-list
                class="cursor-pointer"
                color="green darken-1"
                dark
              >
                <v-list-item
                  v-shortkey="['ctrl', 'alt', 'n']"
                  dense
                  @click="add()"
                  @shortkey="add()"
                  :disabled="!auth.allowInsert"
                >
                  <v-list-item-title>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                          class="text-subtitle-2"
                        >
                          Faktur Penjualan
                        </span>
                      </template>
                      <span class="text-caption">(Ctrl + Alt + N)</span>
                    </v-tooltip>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-shortkey="['ctrl', 'alt', 'd']"
                  dense
                  @click="add(true)"
                  @shortkey="add(true)"
                  :disabled="!auth.allowInsert"
                >
                  <v-list-item-title>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                          class="text-subtitle-2"
                        >
                          Penjualan langsung
                        </span>
                      </template>
                      <span class="text-caption">(Ctrl + Alt + D)</span>
                    </v-tooltip>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
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
            <span class="text-caption">Hapus</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.custName`]="{ item }">
          {{ item.custCode }} - {{ item.custName }}
        </template>
        <template v-slot:[`item.fromDirectInvoice`]="{ item }">
          {{ item.fromDirectInvoice ? 'Penjualan Langsung' : 'Faktur Penjualan' }}
        </template>
        <template v-slot:[`item.total`]="{ item }">
          {{ item.total | formatCurrency }}
        </template>
        <template v-slot:[`item.dueDate`]="{ item }">
          {{ item.dueDate | formatDate('dd-MMM-yyyy') }}
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
          <v-toolbar-title>Faktur Penjualan</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  dark
                  text
                  @click="save(true)"
                  @shortkey="save(true)"
                  :disabled="isVoid || (data.action === 'edit' && !auth.allowUpdate)"
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
                  @click="save(false)"
                  @shortkey="save(false)"
                  :disabled="isVoid || (data.action === 'edit' && !auth.allowUpdate)"
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
                      <v-col cols="12">
                        <v-text-field
                          ref="code"
                          v-model="data.code"
                          label="No. Faktur"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-menu
                          v-model="menu.invDate"
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
                              :value="formatInvDate"
                              label="Tanggal Transaksi"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
                            no-title
                            scrollable
                            @change="menu.invDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.dueDate"
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
                              :value="formatDueDate"
                              label="Tanggal Jatuh Tempo"
                              class="mt-0"
                              readonly
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.dueDate"
                            no-title
                            scrollable
                            @change="menu.dueDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          v-model="data.soCode"
                          :rules="rules.required"
                          label="No. Order Penjualan"
                          class="mt-0"
                          required
                          @change="soCodeChange"
                        >
                          <template v-slot:append>
                              <v-btn
                                color="primary"
                                icon
                                small
                                @click="showFindSODialog"
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
                  <v-tabs v-model="tab.cust">
                    <v-tab key="cust">Pelanggan</v-tab>
                    <v-tab key="user">Pengguna</v-tab>
                    <v-tab key="notes">Catatan</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.cust" class="pa-2">
                    <v-tab-item
                      key="cust"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="3">
                          <v-text-field
                            v-model="data.custCode"
                            :rules="rules.required"
                            label="Kode"
                            class="mt-0"
                            readonly
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="9" class="pl-1">
                          <v-text-field
                            v-model="data.custName"
                            label="Nama"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model="data.custAddr"
                            label="Alamat"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.custPhone"
                            label="Telepon"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.custFax"
                            label="Fax"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-tab-item>

                    <v-tab-item
                      key="user"
                      transition="false"
                      eager
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.issuedBy"
                            :items="employees"
                            :item-text="item => `${item.initial} - ${item.firstName}`"
                            :rules="rules.required"
                            label="Dikeluarkan Oleh"
                            item-value="id"
                            class="mt-0"
                            required
                          ></v-autocomplete>
                        </v-col>
                      </v-row>

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
                      ></v-textarea>
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
                    <v-tab key="related-trans">Transaksi Terkait</v-tab>

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
                                :disabled="isVoid"
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
                                  :disabled="isVoid"
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
                          <template v-slot:[`item.doCode`]="{ item }">
                            <v-autocomplete
                              ref="doCode"
                              v-model="item.doCode"
                              :items="dlvOrders"
                              item-text="code"
                              item-value="code"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="doCodeChange(item)"
                            >
                              <template v-slot:append>
                                <v-btn
                                  color="primary"
                                  icon
                                  x-small
                                  @click="showFindDODialog(item)"
                                >
                                  <v-icon>
                                    mdi-settings-helper
                                  </v-icon>
                                </v-btn>
                              </template>
                            </v-autocomplete>
                          </template>
                          <template v-slot:[`item.dpp`]="{ item }">
                            {{ item.dpp | formatCurrency }}
                          </template>
                          <template v-slot:[`item.taxAmount`]="{ item }">
                            {{ item.taxAmount | formatCurrency }}
                          </template>
                          <template v-slot:[`item.shipmentFee`]="{ item }">
                            {{ item.shipmentFee | formatCurrency }}
                          </template>
                          <template v-slot:[`item.handlingFee`]="{ item }">
                            {{ item.handlingFee | formatCurrency }}
                          </template>
                          <template v-slot:[`item.total`]="{ item }">
                            {{ item.total | formatCurrency }}
                          </template>
                        </v-data-table>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="related-trans"
                      transition="false"
                    >
                      Ini adalah transaksi terkait
                    </v-tab-item>
                  </v-tabs>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <!-- <v-col cols="12" md="5">
                <v-card>
                  <v-tabs v-model="tab.foot">
                    <v-tab key="detail">Detail</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.foot" class="pa-2">
                    <v-tab-item
                      key="detail"
                      transition="false"
                    >
                      <v-currency-field
                        v-model="data.dpp"
                        label="Total Before Tax"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-tab-item>
                  </v-tabs-items>
                </v-card>
              </v-col> -->

              <v-col cols="12" md="6" offset-md="6">
                <v-card>
                  <v-card-text>
                    <v-row no-gutters>
                      <v-currency-field
                        v-model="data.total"
                        label="Total Keseluruhan"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <confirm ref="confirm"></confirm>
    <find-so
      ref="findSO"
      :mark-exclude="['A', 'V', 'CLS']"
      @dblclick:row="bindSOData"
    ></find-so>
    <find-do
      ref="findDO"
      :so-code="data.soCode"
      @dblclick:row="bindDOData"
    ></find-do>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO, addDays } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import FindSo from '@/components/dialog/sales/FindSO'
import FindDo from '@/components/dialog/sales/FindDO'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    FindSo,
    FindDo
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      invDate: false,
      dueDate: false
    },
    tab: {
      cust: null,
      det: null,
      foot: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'No. Faktur', value: 'code', divider: true, width: '160', excelColWidth:'18' },
        { text: 'Tanggal Transaksi', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'20', isDateTime: true },
        { text: 'Tipe', value: 'fromDirectInvoice', divider: true, width: '170', excelColWidth:'20', isBool: true, customValues: [{state: true, value: 'Penjualan Langsung'}, {state: false, value: 'Faktur Penjualan'}] },
        { text: 'Pelanggan', value: 'custName', divider: true, width: '200', excelColWidth:'23' },
        { text: 'No. Ord. Penjualan', value: 'soCode', divider: true, width: '150', excelColWidth:'18' },
        { text: 'Total', value: 'total', align: 'right', divider: true, width: '120', excelColWidth:'15', isNumber: true },
        { text: 'Dikeluarkan Oleh', value: 'issuedInitial', divider: true, width: '200', excelColWidth:'23' },
        { text: 'Tanggal Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '120', excelColWidth:'20', isDateTime: true },
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
        { text: 'Kode Pengiriman', value: 'doCode', divider: true, width: '200' },
        { text: 'Total Sebelum Pajak', value: 'dpp', align: 'right', divider: true, width: '120' },
        { text: 'Pajak', value: 'taxAmount', align: 'right', divider: true, width: '120' },
        { text: 'Biaya Pengiriman', value: 'shipmentFee', align: 'right', divider: true, width: '120' },
        { text: 'Biaya Penanganan', value: 'handlingFee', align: 'right', divider: true, width: '120' },
        { text: 'Total', value: 'total', align: 'right', width: '120' }
      ],
      data: []
    },
    filterfields: [
      {
        text: 'No. Faktur', value: 'code', dataType: 'text'
      },
      {
        text: 'Tanggal Transaksi', value: 'date', dataType: 'datetime'
      },
      {
        text: 'Tipe', 
        value: 'fromDirectInvoice', 
        dataType: 'bit', 
        options: [
          { 
            text: 'Penjualan Langsung',
            value: true
          },
          { 
            text: 'Faktur Penjualan',
            value: false
          }
        ]
      },
      {
        text: 'Pelanggan', value: 'custName', dataType: 'text'
      },
      {
        text: 'No. Ord. Penjualan', value: 'soCode', dataType: 'text'
      },
      {
        text: 'Dikeluarkan Oleh', value: 'issuedInitial', dataType: 'text'
      },
      {
        text: 'Tanggal Jatuh Tempo', value: 'dueDate', dataType: 'datetime'
      }     
    ], 
    valid: false,
    employees: [],
    dlvOrders: [],
    paymentTerms: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.getEmployeeLists()
    this.getPaymentTermLists()
    auth.getAction(this.endpoint, this.menuId.salesinvoice, [this.action.insert, this.action.update, this.action.void])
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
        text: 'Order'
      }, {
        text: 'Faktur'
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
      filter: state => state.app.filter,
      auth: state => state.api.authorization,
      action: state => state.api.action,
      menuId: state => state.api.menus
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatInvDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    formatDueDate() {
      return this.data.dueDate ? format(parseISO(this.data.dueDate), 'dd-MMM-yyyy') : ''
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
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        soCode: null,
        custCode: null,
        custName: null,
        custAddr: null,
        custPhone: null,
        custFax: null,
        issuedBy: null,
        curr: 'IDR',
        notes: null,
        paidAmount: 0,
        total: 0
      }
      this.gridDet.data = []
      this.tab.cust = 0
      this.tab.det = 0
      // this.tab.foot = 0

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
      api.getAll(this.endpoint.sales.invoice, {
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

    //   api.getAll(this.endpoint.sales.invoice, {
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
    getDOLists(bindToGridDet = false) {
      api.getAll(`${this.endpoint.sales.delivery}/un-invoice`, {
        params: {
          soCode: this.data.soCode,
          invCode: this.data.code
        }
      })
        .then(response => {
          this.dlvOrders = JSON.parse(JSON.stringify(response.data.tableData))
          if (bindToGridDet) {
            this.gridDet.data = response.data.tableData
            for (let i = 0; i < this.gridDet.data.length; i++) {
              this.gridDet.data[i].id = randomNumber(-1, -1000)
              this.gridDet.data[i].doCode = this.gridDet.data[i].code
              this.gridDet.data[i].code = this.data.code
              this.gridDet.data[i].state = 'A'
            }
            this.calcPrice()
            
            const paymentData = this.paymentTerms.find(x => x.id === this.data.paymentTermId)
            if (paymentData) {
              const date = addDays(parseISO(this.gridDet.data[0].date), paymentData.due)
              this.data.dueDate = format(date, 'yyyy-MM-dd')
            }
          }
        })
    },
    close() {
      this.dialog.add = false
    },
    add(fromDI = false) {
      if (fromDI) {
        this.$router.push({
          name: 'direct-invoice',
          params: { action: 'add' }
        })
        return
      }

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

      if (item.fromDirectInvoice) {
        this.$router.push({
          name: 'direct-invoice',
          params: { action: 'edit', code: item.code }
        })
        return
      }
      
      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        createdDate: (item.createdDate === null) ? null : format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: (item.updatedDate === null) ? null : format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss'),
        approvedDate: (item.approvedDate === null) ? null : format(parseISO(item.approvedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get customer details
      this.bindCustData(this.data)

      // Get invoice details
      api.getAll(`${this.endpoint.sales.invoice}/detail`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridDet.data = response.data.tableData
        })

      // Get sales delivery details
      this.getDOLists()

      // Set focus to invoice code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
    },
    getPaymentTermLists() {
      api.getAll('payment-term/lists')
        .then(response => {
          this.paymentTerms = response.data.tableData
        })
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        api.delete(this.endpoint.sales.invoice, item.code)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async save(closeDialog) {
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Silahkan periksa kembali data yang wajib diisi.')
        return
      }
      
      const data = this.data
      data.details = this.gridDet.data
      
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.invoice, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.invoice, data.code, data)
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
    addItem() {
      if (!this.data.soCode) {
        this.$store.dispatch('app/showInfo', 'Silahkan pilih order penjualan terlebih dahulu.')
        return
      }

      if (this.gridDet.data.length === 0 || (this.gridDet.data.slice(-1)[0].doCode ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.data.code,
          doCode: null,
          shipmentFee: 0,
          handlingFee: 0,
          subTotal: 0,
          finalDisc: 0,
          taxAmount: 0,
          total: 0,
          dpp: 0,
          state: 'A'
        }
        this.gridDet.data.push(item)

        setTimeout(() => {
          this.$refs.doCode.focus()
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

        // Calc price
        this.calcPrice()
      }
    },
    soCodeChange() {
      api.getAll(this.endpoint.sales.order, {
        params: {
          filters: JSON.stringify([{
            field: 'code',
            operator: 'eq',
            keyword: this.data.soCode
          }, {
            field: 'mark',
            operator: 'doesnotcontain',
            keyword: ['A', 'V', 'CLS']
          }])
        }
      })
        .then(response => {
          this.bindSOData(response.data.tableData[0] ?? null)
        })
    },
    doCodeChange(item) {
      const data_d = this.dlvOrders.find(r => r.code.toUpperCase() === item.doCode.toUpperCase())
      if (data_d) {
        item.shipmentFee = data_d.shipmentFee
        item.handlingFee = data_d.handlingFee
        item.subTotal = data_d.subTotal
        item.finalDisc = data_d.finalDisc
        item.taxAmount = data_d.taxAmount
        item.total = data_d.total
        item.dpp = data_d.dpp
        if (item.state !== 'A') {
          item.state = 'M'
        }

        // Calc price
        this.calcPrice()
      }
    },
    calcPrice() {
      this.data.total = _sumBy(this.gridDet.data, 'total')
    },
    showFindSODialog() {
      this.$refs.findSO.open()
    },
    showFindDODialog(item) {
      this.$refs.findDO.open(item)
    },
    bindSOData(item) {
      if (item) {
        this.data.soCode = item.code
        this.data.custCode = item.custCode
        this.data.custName = item.custName
        this.data.currCode = item.currCode
        this.data.total = 0

        if (!item.called) {
          // Get customer details
          this.bindCustData(this.data)

          // Get sales delivery details
          this.getDOLists(true)
        }
      } else {
        this.data.custCode = null
        this.data.custName = null
        this.data.custAddr = null
        this.data.custPhone = null
        this.data.custFax = null
        this.data.currCode = null
        this.data.total = 0
        this.gridDet.data = []
      }
    },
    bindCustData(item) {
      api.getOne(this.endpoint.general.customer.customer, item.custCode)
        .then(response => {
          if (response.data) {
            item.custAddr = response.data.address1
            item.custPhone = response.data.phone
            item.custFax = response.data.fax
            item.paymentTermId = response.data.paymentTermId
          }
        })
    },
    bindDOData(rowItem) {
      this.doCodeChange(rowItem)
    },
    async exportExcel() {
      this.exportExcel.export()
    }
  }
}
</script>
