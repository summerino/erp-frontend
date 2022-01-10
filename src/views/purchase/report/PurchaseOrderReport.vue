<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Order Pembelian
              </v-col>
              <v-col cols="12" md="6" class="text-right">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      v-shortkey="['ctrl', 'alt', 's']"
                      color="blue darken-1"
                      class="font-weight-regular"
                      dark
                      small
                      tile
                      @click="getList"
                      @shortkey="getList"
                    >
                      <v-icon left>mdi-magnify</v-icon>
                      Cari
                    </v-btn>
                  </template>
                  <span class="text-caption">(Ctrl + Alt + S)</span>
                </v-tooltip>
                <v-menu
                  bottom
                  open-on-hover
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      color="blue darken-1"
                      dark
                      tile
                      small
                      :disabled="!auth.allowPrint"
                    >
                      <v-icon>mdi-menu-down</v-icon>
                    </v-btn>
                  </template>
                  <v-list class="cursor-pointer">
                    <v-list-item>
                      <v-list-item-title>
                        <export-excel
                          ref="exportExcel"
                          :company="companyName"
                          :filters="exportFilter"
                          :grid="grid"
                          :gridDefOpts="gridDefOpts"
                          title="Daftar Laporan Order Pembelian"
                        ></export-excel>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      v-shortkey="['ctrl', 'alt', 'f']"
                      color="green darken-1"
                      class="font-weight-regular ml-1"
                      dark
                      small
                      tile
                      @click="showfilter"
                      @shortkey="showfilter"
                    >
                      <v-icon left>mdi-filter</v-icon>
                      Filter
                    </v-btn>
                  </template>
                  <span class="text-caption">(Ctrl + Alt + F)</span>
                </v-tooltip>
              </v-col>
            </v-row>
            <v-row v-else no-gutters>
              <v-col cols="12" md="8">
                Laporan Order Pembelian - Detail {{ this.data.typeName }} - {{ this.data.detailName}}
              </v-col>
              <v-col cols="12" md="4" class="text-right">
                <v-menu
                  bottom
                  open-on-hover
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      color="blue darken-1"
                      dark
                      tile
                      small
                      :disabled="!auth.allowPrint"
                    >
                      <v-icon>mdi-menu-down</v-icon>
                    </v-btn>
                  </template>
                  <v-list class="cursor-pointer">
                    <v-list-item>
                      <v-list-item-title>
                        <export-excel
                          ref="exportExcel"
                          :company="companyName"
                          :filters="exportFilter"
                          :grid="grid"
                          :gridDefOpts="gridDefOpts"
                          :title="`Daftar Laporan Order Pembelian - Detail ${ this.data.typeName } - ${ this.data.detailName }`"
                        ></export-excel>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      v-shortkey="['esc']"
                      color="green darken-1"
                      class="font-weight-regular ml-1"
                      dark
                      small
                      tile
                      @click="back"
                      @shortkey="back"
                    >
                      <v-icon left>mdi-undo-variant</v-icon>
                      Kembali
                    </v-btn>
                  </template>
                  <span class="text-caption">(Esc)</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text v-if="this.filter" class="pa-2">
            <v-row no-gutters>
              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="data.type"
                  :items="types"                  
                  label="Tipe Laporan"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  @change="clearTable()"
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-menu
                  v-model="menu.startDate"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatStartDate"
                      label="Tanggal Mulai"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearDate('start')"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.startDate"
                    no-title
                    scrollable
                    @change="menu.startDate = false; changeStartDate();"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-menu
                  v-model="menu.endDate"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatEndDate"
                      label="Tanggal Akhir"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearDate('end')"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.endDate"
                    no-title
                    scrollable
                    @change="menu.endDate = false; changeEndDate();"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-autocomplete
                  v-model="data.supplier"
                  :items="suppliers"
                  :item-text="item => `${item.initial} - ${item.name}`"
                  label="Pemasok"
                  item-value="code"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="data.status"
                  :items="statuses"
                  label="Status"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
                <v-autocomplete
                  v-model="data.itemId"
                  :items="items"
                  :item-text="item => `${item.initial} - ${item.name}`"
                  label="Barang"
                  item-value="id"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
                <v-autocomplete
                  v-model="data.categoryId"
                  :items="itemCategories"
                  :item-text="item => `${item.initial} - ${item.name}`"
                  label="Kategori Barang"
                  item-value="id"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12">
          <v-card>
          <v-data-table  
            :headers="grid.columns"
            :height="grid.height"
            :items="grid.data"
            :items-per-page="-1"
            :options.sync="grid.options"
            :sort-by="grid.options.sortBy"
            :sort-desc="grid.options.sortDesc"
            :class="['elevation-1', this.main && this.data.type < 5 ? 'row-pointer' : '']"
            fixed-header
            hide-default-footer
            disable-pagination
            disable-sort
            @dblclick:row="dblclickRow"
          >
          <template v-slot:[`item.code`]="{ item }">
            <span :class="item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.code }}
            </span>
          </template>
          <template v-slot:[`item.name`]="{ item }">
            <span :class="item.name === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.name }}
            </span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            {{ item.date | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.totalTrans`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalTrans }}
            </span>
          </template>
          <template v-slot:[`item.qty`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qty | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.subTotal`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.subTotal | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.disc`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.disc | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.discHeader`]="{ item }">
           <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.discHeader | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.dpp`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.dpp | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.taxAmount`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.taxAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.total`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.total | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.grossAmount`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.grossAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.nettPrice`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.nettPrice | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalGrossAmount`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalGrossAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalDisc`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalDisc | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalDiscHeader`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalDiscHeader | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalAfterDisc`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalAfterDisc | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalDpp`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalDpp | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalTaxAmount`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalTaxAmount | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.totalNettPrice`]="{ item }">
            <span :class="item.name === 'Total' || item.code === 'Total' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.totalNettPrice | formatCurrency }}
            </span>
          </template>
          </v-data-table>
        </v-card>
      </v-col> 
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import ExportExcel from '@/components/common/ExportExcel.vue'

export default {
  components:{
    ExportExcel
  },

  data: () => ({
    main: true,
    menu: {
      startDate: false,
      endDate: false
    },
    grid: {
      height: 100,
      columns: [],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0
    },
    filter: false,
    supColumn: [
      { text: 'Kd. Pemasok', value: 'code', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Nm. Pemasok', value: 'name', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Jml. Transaksi', value: 'totalTrans', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Harga Kotor', value: 'grossAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Diskon', value: 'disc', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Sub Total', value: 'subTotal', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'DPP', value: 'dpp', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Pajak', value: 'taxAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total', value: 'total', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    codeColumn: [
      { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
      { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kd. Pemasok', value: 'supCode', divider: true, width: '100', excelColWidth:'18' },
      { text: 'Nm. Pemasok', value: 'supName', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Harga Kotor', value: 'grossAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Diskon', value: 'disc', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Sub Total', value: 'subTotal', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'DPP', value: 'dpp', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Pajak', value: 'taxAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total', value: 'total', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Status', value: 'status',  width: '160', excelColWidth:'20' }
    ],
    itemColumn: [
      { text: 'Ins. Barang', value: 'initial', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Nm. Barang', value: 'name', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Ins. Kategori', value: 'categoryInitial', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Jml. Transaksi', value: 'totalTrans', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Satuan', value: 'unitName', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Harga Kotor', value: 'grossAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Diskon', value: 'disc', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Diskon H', value: 'discHeader', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Sub Total', value: 'subTotal', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'DPP', value: 'dpp', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Pajak', value: 'taxAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total', value: 'total', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    detailColumn: [
      { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
      { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Kd. Pemasok', value: 'supCode', divider: true, width: '100', excelColWidth:'18' },
      { text: 'Nm. Pemasok', value: 'supName', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Ins. Barang', value: 'itemInitial', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Nm. Barang', value: 'itemName', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Ins. Kategori', value: 'categoryInitial', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Status', value: 'status', divider: true, width: '160', excelColWidth:'20' },
      { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Satuan', value: 'unitName', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Harga Kotor', value: 'grossAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Diskon', value: 'disc', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Diskon H', value: 'discHeader', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Sub Total', value: 'subTotal', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'DPP', value: 'dpp', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Pajak', value: 'taxAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Harga Nett', value: 'nettPrice', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Harga Kotor', value: 'totalGrossAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Diskon', value: 'totalDisc', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Diskon H', value: 'totalDiscHeader', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Stlh. Disk.', value: 'totalAfterDisc', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total DPP', value: 'totalDpp', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Pajak', value: 'totalTaxAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total Harga Nett', value: 'totalNettPrice', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Status', value: 'status',  width: '160', excelColWidth:'20' }
    ],
    categoryColumn: [
      { text: 'Ins. Kategori', value: 'initial', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Nm. Kategori', value: 'name', divider: true, width: '300', excelColWidth:'40' },
      { text: 'Jml. Transaksi', value: 'totalTrans', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '100', excelColWidth:'20' },
      { text: 'Satuan', value: 'unitName', divider: true, width: '120', excelColWidth:'12' },
      { text: 'Harga Kotor', value: 'grossAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Diskon', value: 'disc', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Diskon H', value: 'discHeader', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Sub Total', value: 'subTotal', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'DPP', value: 'dpp', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Pajak', value: 'taxAmount', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Total', value: 'total', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    itemCategories: [],
    items: [],
    statuses: [{ id: 'A', name: 'Aktif' }, { id: 'PR', name: 'Diterima Sebagian' }, { id: 'CMP', name: 'Diterima Seluruhnya' },
      { id: 'CLS', name: 'Ditutup' }, { id: 'V', name: 'Void' }],
    suppliers: [],
    types: [{ id: 1, name: 'Berdasarkan Kode' }, { id: 2, name: 'Berdasarkan Pemasok' },
      { id: 3, name: 'Berdasarkan Barang' }, { id: 4, name: 'Berdasarkan Kategori Barang' },
      { id: 5, name: 'Berdasarkan Rincian Detail' }],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tipe Laporan', value: 'type'},
        {text: 'Tanggal Mulai', value: 'startDate'},
        {text: 'Tanggal Akhir', value: 'endDate'},
        {text: 'Pemasok', value: 'supplier'},
        {text: 'Status', value: 'status'},
        {text: 'Barang', value: 'item'},
        {text: 'Kategori Barang', value: 'category'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getSupplierLists()
    this.getItemLists()
    this.getItemCategoryLists()
    auth.getAction(this.endpoint, this.menuId.purchaseOrderReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Pembelian'
      }, {
        text: 'Laporan'
      }, {
        text: 'Order Pembelian'
      }])
      this.setGridDefaultHeight()
    }, 0)
  },

  computed: {
    ...mapState({
      gridDefOpts: state => state.app.grid,
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint,
      companyName: state => state.api.companyName,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    }),
    formatStartDate() {
      return this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
    },
    formatEndDate() {
      return this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
    }
  },
  
  methods:{
    setGridDefaultHeight() {
      this.grid.height = 100
      setTimeout(() => {
        this.grid.height = this.$el.clientHeight - this.$refs.filter.clientHeight - 61
      }, 0)
    },
    reset() {
      this.data = {        
        type: 1,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        supplier: null,
        status: 'A',
        itemId: null,
        code: null,
        isDetail: false,
        categoryId: null,
        unitId: null
      }
      this.filter = true
    },
    getList() {
      if (this.main) {
        this.grid.columns = this.data.type === 1 ? this.codeColumn : 
          this.data.type === 2 ? this.supColumn : 
            this.data.type === 3 ? this.itemColumn :
              this.data.type === 4 ? this.categoryColumn : this.detailColumn
      } else {
        this.grid.columns = this.detailColumn
      }
      
      api.getAll(this.endpoint.purchase.poReport, {
        params: {
          type: this.data.type,
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          supCode: this.data.supplier,
          status: this.data.status,
          itemId: this.data.itemId,
          code: this.data.code,
          isDetail: !this.main,
          categoryId: this.data.categoryId,
          unitId: this.data.unitId
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          this.appendFilter()
        })
    },
    back() {
      this.data.type = this.data.oldType
      this.data.startDate = this.data.oldStartDate
      this.data.endDate = this.data.oldEndDate
      this.data.supplier = this.data.oldSupplier
      this.data.status = this.data.oldStatus
      this.data.itemId = this.data.oldItemId
      this.data.code = this.data.oldCode
      this.data.categoryId = this.data.oldCategoryId
      this.data.unitId = this.data.oldUnitId
      this.filter = true
      this.main = true
      this.getList()
      this.setGridDefaultHeight()
    },
    showfilter() {
      this.filter = !this.filter
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    getSupplierLists() {
      api.getAll(`${this.endpoint.general.supplier.supplier}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.suppliers = response.data.tableData
        })
    },
    dblclickRow(event, { item }) {
      if (this.main && this.data.type < 5) {
        this.data.oldType = this.data.type
        this.data.oldStartDate = this.data.startDate
        this.data.oldEndDate = this.data.endDate
        this.data.oldSupplier = this.data.supplier
        this.data.oldStatus = this.data.status
        this.data.oldItemId = this.data.itemId
        this.data.oldCode = this.data.code
        this.data.oldCategoryId = this.data.categoryId
        this.data.oldUnitId = this.data.unitId
        if (this.data.type === 1) {
          const type = this.types.find(x => x.id === 1)
          this.data.typeName = type.name
          this.data.code = item.code
          this.data.detailName = item.code
        } else if (this.data.type === 2) {
          const type = this.types.find(x => x.id === 2)
          this.data.typeName = type.name
          this.data.supplier = item.code
          const sup = this.suppliers.find(x => x.code === item.code)
          this.data.detailName = `${sup.initial} - ${sup.name} (${sup.code})`
        } else if (this.data.type === 3) {
          const type = this.types.find(x => x.id === 3)
          this.data.typeName = type.name
          const uItem = this.items.find(x => x.initial === item.initial)
          this.data.itemId = uItem.id
          this.data.unitId = item.unitId
          this.data.detailName = `${item.initial} - ${item.name}`
        } else if (this.data.type === 4) {
          const type = this.types.find(x => x.id === 4)
          this.data.typeName = type.name
          const uCtg = this.itemCategories.find(x => x.initial === item.initial)
          this.data.categoryId = uCtg.id
          this.data.unitId = item.unitId
          this.data.detailName = `${item.initial} - ${item.name}`
        }
        this.filter = false
        this.main = false
        this.getList()
        this.setGridDefaultHeight()
      }
    },
    appendFilter() {
      this.exportFilter.searches = []
      const searchType = {
        field: 'type',
        keyword: '',
        operator: 'eq'
      }
      const searchStartDate = {
        field: 'startDate',
        keyword: '',
        operator: 'eq'
      }

      const searchEndDate = {
        field: 'endDate',
        keyword: '',
        operator: 'eq'
      }

      const report = this.types.find(x => x.id === this.data.type)
      searchType.keyword = report.name
      this.exportFilter.searches.push(searchType)

      searchStartDate.keyword = this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchStartDate)

      searchEndDate.keyword = this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchEndDate)

      const sup = this.suppliers.find(x => x.code === this.data.supplier)
      if (sup) {
        const searchSup = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchSup.field = 'supplier'
        searchSup.keyword = sup.name
        this.exportFilter.searches.push(searchSup)
      }

      const sts = this.statuses.find(x => x.id === this.data.status)
      if (sts) {
        const searchStatus = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchStatus.field = 'status'
        searchStatus.keyword = sts.name
        this.exportFilter.searches.push(searchStatus)
      }

      const item = this.items.find(x => x.id === this.data.itemId)
      if (item) {
        const searchItem = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchItem.field = 'item'
        searchItem.keyword = item.name
        this.exportFilter.searches.push(searchItem)
      }

      const category = this.itemCategories.find(x => x.id === this.data.categoryId)
      if (category) {
        const searchCategory = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchCategory.field = 'category'
        searchCategory.keyword = item.name
        this.exportFilter.searches.push(searchCategory)
      }
    },
    clearTable() {
      this.grid.data = []
      this.grid.columns = []
    },
    changeStartDate() {
      if (this.data.startDate > this.data.endDate) {
        this.data.endDate = this.data.startDate
      }
      this.clearTable()
    },
    changeEndDate() {
      if (this.data.endDate < this.data.startDate) {
        this.data.startDate = this.data.endDate
      }
      this.clearTable()
    },
    clearDate(item) {
      if (item === 'end') {
        this.data.endDate = null
      } else if (item === 'start') {
        this.data.startDate = null
      }
      this.clearTable()
    },
    getItemLists() {
      api.getAll(this.endpoint.inventory.item.item, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }])
        }
      })  
        .then(response => {
          this.items = response.data.tableData
        })
    },
    getItemCategoryLists() {
      api.getAll(`${this.endpoint.inventory.item.category}/lists`, {})
        .then(response => {
          this.itemCategories = response.data.tableData
        })
    }
  }
}

</script>
