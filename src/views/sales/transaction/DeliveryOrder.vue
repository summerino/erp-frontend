<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="2">
            Surat Jalan
          </v-col>
          <v-col cols="12" md="6" >
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
                title="Daftar Surat Jalan"
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
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :disabled="item.mark.toUpperCase() === 'V' || !auth.allowPrint"
                color="teal darken-2"
                icon
                small
                @click="print(item)"
              >
                <v-icon small>mdi-printer</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Cetak</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.custName`]="{ item }">
          {{ item.custCode }} - {{ item.custName }}
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
          <v-toolbar-title>Surat Jalan</v-toolbar-title>
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
                  :disabled="(data.action === 'edit' && !auth.allowUpdate)"
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
              <v-list class="cursor-pointer">
                <v-list-item
                  v-shortkey="['ctrl', 'alt', 'i']"
                  :disabled="isSaveNInvoiceAble || !allowInsertSalesInvoice || (data.action === 'edit' && !auth.allowUpdate)"
                  @click="saveInv()"
                  @shortkey="saveInv()"
                >
                  <v-list-item-title>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                        >
                          Simpan & Faktur
                        </span>
                      </template>
                      <span class="text-caption">(Ctrl + Alt + I)</span>
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
                        <v-autocomplete
                          v-model="data.srcTrans"
                          :items="sources"
                          :rules="rules.required"
                          label="Sumber Transaksi"
                          item-text="name"
                          item-value="id"
                          class="mt-0"
                          required
                          @change="srcTransChange"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="code"
                          v-model="data.code"
                          label="Kode"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.dlvDate"
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
                              :value="formatDlvDate"
                              label="Tanggal"
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
                            @change="menu.dlvDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          v-model="data.transCode"
                          :readonly="hasRelatedTrans"
                          :rules="rules.required"
                          :label="lblTransCode"
                          class="mt-0"
                          required
                          @change="transCodeChange"
                        >
                          <template v-slot:append>
                              <v-btn
                                :disabled="hasRelatedTrans"
                                color="primary"
                                icon
                                small
                                @click="showFindTransDialog"
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
                    <v-tab key="location">Gudang</v-tab>
                    <v-tab key="notes">Catatan</v-tab>
                    <v-tab key="user">Pengguna</v-tab>
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
                            required
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
                      key="location"
                      transition="false"
                      eager
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.warehouseCode"
                            :items="warehouses"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            :rules="rules.required"
                            item-value="code"
                            label="Gudang"
                            class="mt-0"
                            :disabled="!auth.allowChangeWarehouse"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                    </v-tab-item>

                    <v-tab-item
                      key="notes"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-textarea
                          v-model="data.notes"
                          :rules="rules.max256chars"
                          label="Catatan"
                          counter="256"
                          class="mt-0"
                          rows="4"
                        ></v-textarea>
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
                            v-model="data.shippedBy"
                            :items="employees"
                            :item-text="item => `${item.initial} - ${item.firstName}`"
                            :rules="rules.required"
                            label="Dikirim Oleh"
                            item-value="id"
                            class="mt-0"
                            required
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                      
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.approveBy"
                            :items="employees"
                            :item-text="item => `${item.initial} - ${item.firstName}`"
                            label="Disetujui Oleh"
                            item-value="id"
                            class="mt-0"
                          ></v-autocomplete>
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
                    </v-tab-item>
                  </v-tabs-items>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-tabs v-model="tab.item">
                    <v-tab key="item">Barang</v-tab>
                    <v-tab key="bonus">Bonus</v-tab>
                    <v-tab key="related-trans">Transaksi Terkait</v-tab>
                    <v-tab key="tax">Faktur Pajak</v-tab>

                    <v-tab-item
                      key="item"
                      transition="false"
                    >
                      <v-card>
                        <!-- <v-app-bar dense flat>
                          <v-spacer></v-spacer>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                v-bind="attrs"
                                v-on="on"
                                v-shortkey="['ctrl', 'i']"
                                :disabled="isVoid || hasRelatedTrans"
                                class="blue--text"
                                small
                                tile
                                @click="addItem"
                                @shortkey="addItem"
                              >
                                <v-icon left>mdi-plus</v-icon>
                                Add
                              </v-btn>
                            </template>
                            <span class="text-caption">(Ctrl + I)</span>
                          </v-tooltip>
                        </v-app-bar> -->

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
                                  :disabled="item.type == 0 || isVoid || hasRelatedTrans || (data.action === 'add' && !auth.allowCreate) || (data.action === 'edit' && !auth.allowUpdate)"
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
                          <template v-slot:[`item.qty`]="{ item }">
                            <v-currency-field
                              v-model="item.qty"
                              :decimal-length="0"
                              :readonly="hasRelatedTrans"
                              class="text-body-2 text-right mt-0"
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.notes`]="{ item }">
                            <v-text-field
                              v-model="item.notes"
                              :rules="rules.max256chars"
                              class="text-body-2 mt-0"
                              dense
                            ></v-text-field>
                          </template>
                        </v-data-table>
                      </v-card>
                    </v-tab-item>
                    
                    <v-tab-item
                      key="bonus"
                      transition="false"
                    >
                      <v-data-table
                        :headers="gridBonus.columns"
                        :items="gridBonus.data"
                        :items-per-page="-1"
                        height="300"
                        class="elevation-1"
                        dense
                        disable-sort
                        fixed-header
                        hide-default-footer
                      >
                      <template v-slot:[`item.qty`]="{ item }">
                        <v-currency-field
                          v-model="item.qty"
                          :decimal-length="0"
                          class="text-body-2 text-right mt-0"
                        ></v-currency-field>
                      </template>
                      </v-data-table>
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
                        <template v-slot:[`item.total`]="{ item }">
                          {{ item.total | formatCurrency }}
                        </template>
                      </v-data-table>
                    </v-tab-item>
                    
                    <v-tab-item
                      key="tax"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="data.taxInvoiceNo"
                                :rules="rules.max16chars"
                                label="No Faktur Pajak"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6" class="pl-md-1">
                              <v-menu
                                v-model="menu.taxInvoiceDate"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                min-width="290px"
                                offset-y
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-bind="attrs"
                                    v-on="on"
                                    :value="formatInvoiceDate"
                                    label="Tanggal Faktur Pajak"
                                    class="mt-0"
                                    readonly
                                    clearable
                                    @click:clear="clearDate('tax')"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="data.taxInvoiceDate"
                                  :min="dataStartDate"
                                  no-title
                                  scrollable
                                  @change="menu.taxInvoiceDate = false"
                                ></v-date-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
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
    <find-so
      ref="findSO"
      :mark-exclude="['V', 'CLS', 'CMP']"
      @dblclick:row="bindTransData"
    ></find-so>
    <find-return
      ref="findReturn"
      :mark-exclude="['V', 'CLS', 'CMP']"
      @dblclick:row="bindTransData"
    ></find-return>
    <so-save-Invoice
      ref="soSi"
     @closeParent="closeInv"
    ></so-save-Invoice>
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
import FindSo from '@/components/dialog/sales/FindSO'
import FindReturn from '@/components/dialog/sales/FindReturn'
import SoSaveInvoice from '@/components/dialog/sales/SOSaveInvoice'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    ReportViewer,
    FindSo,
    FindReturn,
    SoSaveInvoice
  },

  data: () => ({
    filterfields: [{
      text: 'Kode', value: 'code', dataType: 'text'
    }, {
      text: 'Tanggal', value: 'date', dataType: 'datetime'
    }, {
      text: 'Kd. Pelanggan', value: 'custCode', dataType: 'text'
    }, {
      text: 'Nama Pelanggan', value: 'custName', dataType: 'text'
    }, {
      text: 'Kode Trans.', value: 'transCode', dataType: 'text'
    }, {
      text: 'Dikirim Oleh', value: 'shippedInitial', dataType: 'text'
    }],
    dialog: {
      add: false
    },
    menu: {
      dlvDate: false
    },
    tab: {
      cust: null,
      item: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '120' },
        { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'19' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Pelanggan', value: 'custName', divider: true, width: '220', excelColWidth:'35', customValues: ['custCode', 'custName'] },
        { text: 'Kode Trans.', value: 'transCode', width: '160', excelColWidth:'19' },
        { text: 'Dikirim Oleh', value: 'shippedInitial', divider: true, width: '180', excelColWidth:'22' },
        { text: 'Status', value: 'mark', width: '50' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [true]
      },
      total: 0,
      search: null
    },
    gridBonus: {
      data:[],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Inisial', value: 'initial', divider: true, width: '120' },
        { text: 'Nama', value: 'name', divider: true, width: '300' },
        { text: 'Qty Tersedia', value: 'outstandingQty', align: 'right', divider: true, width: '90' },
        { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
        { text: 'Satuan', value: 'unitName', divider: true, width: '90' }
      ]
    },
    gridItem: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Inisial', value: 'itemInitial', divider: true, width: '120' },
        { text: 'Nama', value: 'itemName', divider: true, width: '300' },
        { text: 'Qty', value: 'orderQty', align: 'right', divider: true, width: '90' },
        { text: 'Outstanding', value: 'outstandingQty', align: 'right', divider: true, width: '90' },
        { text: 'Qty Terkirim', value: 'qty', align: 'right', divider: true, width: '90' },
        { text: 'Satuan', value: 'unitName', divider: true, width: '90' },
        { text: 'Catatan', value: 'notes' }
      ],
      data: []
    },
    gridRelated: {
      columns: [
        { text: 'Kode Trans.', value: 'code', divider: true },
        { text: 'Tipe Trans.', value: 'type', divider: true },
        { text: 'Tanggal Trans.', value: 'date', align: 'right', divider: true },
        { text: 'Nilai', value: 'total', align: 'right', divider: true }
      ],
      data: []
    },
    valid: false,
    dataStartDate: null,
    employees: [],
    warehouses: [],
    taxes: [],
    data: {},
    lblTransCode: null,
    sources: [{ id: 1, name: 'Order Penjualan' }, { id: 2, name: 'Retur Penjualan' }],
    allowInsertSalesInvoice: false
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getEmployeeLists()
    this.getWarehouseLists()
    this.getTaxLists()
    auth.getAction(this.endpoint, this.menuId.salesDelivery)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    auth.getAction(this.endpoint, this.menuId.salesInvoice, [1])
      .then((response) => {
        this.allowInsertSalesInvoice = response.data.some(x => x)
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
        text: 'Surat Jalan'
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
      companyName: state => state.api.companyName,
      filter: state => state.app.filter,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatDlvDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    hasRelatedTrans() {
      return (this.gridRelated?.data?.length > 0)
    },
    isVoid() {
      return (this.data?.mark?.toUpperCase() === 'V')
    },
    isSaveNInvoiceAble() {
      if (this.data.action === 'add') {
        return false
      } if (this.data.mark === 'CMP' || this.data.mark === 'A') {
        if (this.data.action === 'edit') {
          return false
        }
      }
      return true
    },
    formatInvoiceDate() {
      return this.data.taxInvoiceDate ? format(parseISO(this.data.taxInvoiceDate), 'dd-MMM-yyyy') : ''
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        srcTrans: 1,
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        transCode: null,
        custCode: null,
        custName: null,
        custAddr: null,
        custPhone: null,
        custFax: null,
        warehouseCode: null,
        notes: null,
        shippedBy: null,
        approveBy: null,
        dpp: 0,
        subTotal: 0,
        finalDisc: 0,
        taxAmount: 0,
        total: 0
      }
      this.lblTransCode = 'Kode Order Penjualan'
      this.gridItem.data = []
      this.gridRelated.data = []
      this.tab.cust = 0
      this.tab.item = 0
      
      // set default warehouse
      this.setDefaultWarehouse()

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

      filters.push({
        field: 'fromDirectInvoice',
        operator: 'eq',
        keyword: false
      })
      
      api.getAll(this.endpoint.sales.delivery, {
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
            if (item) {
              this.edit(item)
            } else {
              api.getAll(this.endpoint.sales.delivery, {
                params: {
                  search: this.grid.search,
                  skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
                  take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
                  sorts: JSON.stringify(sorts),
                  filters: JSON.stringify([{
                    field: 'code',
                    operator: 'eq',
                    keyword: this.data.code
                  }])
                }
              })
                .then(response => {
                  this.edit(response.data.tableData[0])
                })
            }
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
    getWarehouseLists() {
      api.getAll(`${this.endpoint.inventory.warehouse}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'custCode',
            operator: 'eq',
            keyword: null
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.warehouses = response.data.tableData
        })
    },
    getTaxLists() {
      api.getAll(this.endpoint.general.tax, {
        params: {
          filters: JSON.stringify([{
            field: 'typeId',
            operator: 'eq',
            keyword: 2
          }])
        }
      })
        .then(response => {
          this.taxes = response.data.tableData
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
        // Set focus to receive code field
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

      // Define label trans code
      if (this.data.srcTrans === 1) {
        this.lblTransCode = 'Kode Order Penjualan'
      } else {
        this.lblTransCode = 'Kode Retur Penjualan'
      }

      // Get customer details
      this.bindCustData(this.data)

      // Get item details
      api.getAll(`${this.endpoint.sales.delivery}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data.tableData
        })

      // Get bonus item details
      api.getAll(`${this.endpoint.sales.delivery}/free-item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridBonus.data = response.data.tableData
        })

      // Get related transaction details
      api.getAll(`${this.endpoint.sales.delivery}/related-trans`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridRelated.data = response.data.tableData
        })

      // Set focus to delivery code field
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
        api.delete(this.endpoint.sales.delivery, item.code, {data: item})
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    print(item) {
      this.$refs.reportViewer.open('delivery-order', item.code)
    },
    async save(closeDialog) {
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      
      if (_sumBy(this.gridItem.data, 'qty') <= 0) {
        this.$store.dispatch('app/showInfo', 'Jumlah pengiriman tidak boleh 0.')
        return
      }

      for (let i = 0; i < this.gridBonus.data.length; i++)  {
        if (this.gridBonus.data[i].qty > this.gridBonus.data[i].outstandingQty) {
          this.$store.dispatch('app/showInfo', 'Terdapat barang bonus yang qty-nya melebihi qty tersedia')
          return
        }
      }

      const data = this.data
      for (let i = 0; i < this.gridItem.data.length; i++) {
        const listFreeItem = data.action === 'add' ? this.gridBonus.data.filter(x => x.orderDetailId === this.gridItem.data[i].soDetailId) : this.gridBonus.data.filter(x => x.dlvOrderDetailId === this.gridItem.data[i].id)
        if (listFreeItem) {
          this.gridItem.data[i].freeItemDetails = listFreeItem
        }
      }
      data.itemDetails = this.gridItem.data

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.delivery, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.delivery, data.code, data)
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
    saveInv() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      const data = this.data
      data.itemDetails = this.gridItem.data
      this.$refs.soSi.open(data, false)
    },
    closeInv() {
      this.dialog.add = false
      this.getList()
    },
    addItem() {
      if (!this.data.transCode) {
        this.$store.dispatch('app/showInfo', 'Mohon pilih penjualan terlebih dahulu.')
        return
      }

      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0]?.itemId ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.data.code,
          itemId: null,
          itemCode: null,
          itemName: null,
          orderQty: 0,
          outstandingQty: 0,
          qty: 1,
          uomId: null,
          unitId: null,
          unitName: null,
          unitPrice: 0,
          itemSellPrice: 0,
          disc: 0,
          nettPrice: 0,
          total: 0,
          typeId: 1,
          typeName: 'Bonus',
          state: 'A'
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

        // Calc price
        this.calcPrice()
      }
    },
    srcTransChange() {
      if (this.data.srcTrans === 1) {
        this.lblTransCode = 'Kode Order Penjualan'
      } else {
        this.lblTransCode = 'Kode Retur Penjualan'
      }
      this.data.transCode = null
      this.data.custCode = null
      this.data.custName = null
      this.data.currCode = null
      this.data.rate = 0
      this.data.dpp = 0
      this.data.subTotal = 0
      this.data.finalDisc = 0
      this.data.includeTax = 0
      this.data.taxAmount = 0
      this.data.total = 0
      this.gridItem.data = []
      this.gridRelated.data = []
    },
    transCodeChange() {
      if (this.data.srcTrans === 1) {
        // Get sales order details
        api.getAll(this.endpoint.sales.order, {
          params: {
            filters: JSON.stringify([{
              field: 'code',
              operator: 'eq',
              keyword: this.data.transCode
            }, {
              field: 'mark',
              operator: 'doesnotcontain',
              keyword: ['V', 'CLS', 'CMP']
            }])
          }
        })
          .then(response => {
            this.bindTransData(response.data.tableData[0] ?? null)
          })
      } else {
        // Get sales return details
        api.getAll(this.endpoint.sales.return, {
          params: {
            filters: JSON.stringify([{
              field: 'code',
              operator: 'eq',
              keyword: this.data.transCode
            }, {
              field: 'type',
              operator: 'contains',
              keyword: [2, 3]
            }, {
              field: 'mark',
              operator: 'doesnotcontain',
              keyword: ['V', 'CLS', 'CMP']
            }])
          }
        })
          .then(response => {
            this.bindTransData(response.data.tableData[0] ?? null)
          })
      }
    },
    calcItemTax(item) {
      const tax = this.taxes.find(t => t.id === item.taxId)
      if (tax) {
        if (this.data.includeTax) {
          item.taxAmount = (item.unitPrice - item.disc) - ((item.unitPrice - item.disc) / (1 + (tax.rate / 100)))
          item.nettPrice = item.unitPrice - item.disc
          item.dpp = item.unitPrice - item.disc - item.taxAmount
        } else {
          item.taxAmount = (item.unitPrice - item.disc) * (tax.rate / 100)
          item.nettPrice = item.unitPrice - item.disc + item.taxAmount
          item.dpp = item.unitPrice - item.disc
        }
      }
    },
    calcItemPrice(item, calcPrice = true) {
      //this.calcItemTax(item)
      item.total = item.qty * item.nettPrice
      item.totTax = item.qty * item.taxAmount
      item.totDPP = item.qty * item.dpp
      
      if (calcPrice) {
        this.calcPrice()
      }
    },
    calcPrice() {
      this.data.subTotal = _sumBy(this.gridItem.data, 'total')
      this.data.taxAmount = _sumBy(this.gridItem.data, 'totTax')
      this.data.dpp = _sumBy(this.gridItem.data, 'totDPP') - this.data.finalDisc
      this.calcGrandTotal()
    },
    calcGrandTotal() {
      this.data.total = this.data.subTotal - this.data.finalDisc
      // if (this.data.includeTax) {
      //   this.data.total = this.data.subTotal - this.data.finalDisc
      // } else {
      //   this.data.total = this.data.subTotal - this.data.finalDisc + this.data.taxAmount
      // }
    },
    showFindTransDialog() {
      if (this.data.srcTrans === 1) {
        this.$refs.findSO.open()
      } else {
        this.$refs.findReturn.open()
      }
    },
    async bindTransData(item) {
      if (item) {
        this.data.transCode = item.code
        this.data.custCode = item.custCode
        this.data.custName = item.custName
        this.data.currCode = item.currCode
        this.data.rate = item.rate
        this.data.dpp = item.dpp
        this.data.subTotal = item.subTotal
        this.data.finalDisc = item.finalDisc
        this.data.includeTax = item.includeTax
        this.data.taxAmount = item.taxAmount
        this.data.total = item.total
        const test = true
        if (!item.called || test) {
          // Get customer details
          this.bindCustData(this.data)

          if (this.data.srcTrans === 1) {
            // Get sales order item details
            api.getAll(`${this.endpoint.sales.order}/item`, {
              params: {
                code: item.code,
                fullDelivered: false
              }
            })
              .then(response => {
                this.gridItem.data = [...response.data.tableData]
                for (let i = 0; i < this.gridItem.data.length; i++) {
                  this.gridItem.data[i].soDetailId = this.gridItem.data[i].id
                  this.gridItem.data[i].id = randomNumber(-1, -1000)
                  this.gridItem.data[i].orderQty = this.gridItem.data[i].qty
                  this.gridItem.data[i].outstandingQty = this.gridItem.data[i].qty - this.gridItem.data[i].qtyDlv
                  this.gridItem.data[i].qty = this.gridItem.data[i].outstandingQty
                  this.gridItem.data[i].typeName = 'Normal'
                  this.calcItemPrice(this.gridItem.data[i], false)
                }
                this.calcPrice()
              })

            const response = await api.getAll(`${this.endpoint.sales.order}/free-item`, {
              params: { code: item.code, fullDlv: false }
            })
            for (let i = 0; i < response.data.tableData.length; i++) {
              response.data.tableData[i].bonusQty = response.data.tableData[i].qty 
              response.data.tableData[i].outstandingQty = response.data.tableData[i].qty - response.data.tableData[i].qtyClosed 
            }
            this.gridBonus.data = response.data.tableData
          } else {
            // Get sales return item details
            api.getAll(item.type === 2 ? `${this.endpoint.sales.return}/item` : `${this.endpoint.sales.return}/diff-item`, {
              params: {
                code: item.code,
                fullDelivered: false
              }
            })
              .then(response => {
                this.gridItem.data = [...response.data.tableData]
                for (let i = 0; i < this.gridItem.data.length; i++) {
                  this.gridItem.data[i].soDetailId = this.gridItem.data[i].id
                  this.gridItem.data[i].id = randomNumber(-1, -1000)
                  this.gridItem.data[i].orderQty = this.gridItem.data[i].qty
                  this.gridItem.data[i].outstandingQty = this.gridItem.data[i].qty - this.gridItem.data[i].qtyDlv
                  this.gridItem.data[i].qty = this.gridItem.data[i].outstandingQty
                  this.gridItem.data[i].typeName = 'Normal'
                  this.calcItemPrice(this.gridItem.data[i], false)
                }
                this.calcPrice()
              })
          }
        }
      } else {
        this.data.custCode = null
        this.data.custName = null
        this.data.custAddr = null
        this.data.custPhone = null
        this.data.custFax = null
        this.data.warehouseCode = null
        this.data.dpp = 0
        this.data.subTotal = 0
        this.data.finalDisc = 0
        this.data.taxAmount = 0
        this.data.total = 0
        this.gridItem.data = []
      }
    },
    bindCustData(item) {
      api.getOne(this.endpoint.general.customer.customer, item.custCode)
        .then(response => {
          if (response.data) {
            item.custAddr = response.data.address1
            item.custPhone = response.data.phone
            item.custFax = response.data.fax
          }
        })
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
    clearDate(item) {
      if (item === 'tax') {
        this.data.taxInvoiceDate = null
      }
    }
  }
}
</script>
