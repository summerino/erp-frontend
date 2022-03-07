<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row v-if="main" no-gutters>
              <v-col cols="12" md="6">
                Laporan Mutasi Barang
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
                          title="Daftar Laporan Mutasi Barang"
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
                Laporan Mutasi Barang - Detail Berdasarkan {{ this.data.filterName }} - {{ this.data.initial }} - {{ this.data.name }}
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
                          :title="`Daftar Laporan Mutasi Barang - Detail Berdasarkan ${this.data.filterName}`"
                        ></export-excel>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                  <v-list v-if="this.data.filterName === 'Gudang'">
                    <v-list-item>
                      <v-list-item-title>
                        <export-excel
                          ref="exportExcelInv"
                          :caption="'Export Excel Stok Opname'"
                          :color="'red'"
                          :company="companyName"
                          :filters="exportFilter"
                          :grid="gridInv"
                          :gridDefOpts="gridDefOpts"
                          :shortcut="['ctrl', 'alt', 's']"
                          :shortcutCaption="'(Ctrl + Alt + S)'"
                          :title="`Stock Opname - Detail Berdasarkan ${this.data.filterName} - ${this.data.name} (${this.data.initial}) `"
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
              <v-col cols="12" md="4">
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
              <v-col cols="12" md="2" class="pl-1">
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
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.startDate"
                    no-title
                    scrollable
                    @change="menu.startDate = false; clearTable();"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="2" class="pl-1">
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
                    @change="menu.endDate = false; clearTable();"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="2" class="pl-1">
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
              <v-col cols="12" md="2" class="pl-1">
                <v-autocomplete
                  v-model="data.typeUnit"
                  :items="typeUnits"                  
                  label="Satuan"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  @change="clearTable()"
                >
                </v-autocomplete>
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
            :class="['elevation-1', this.data.type === 2 ? 'row-pointer' : !this.data.isSM ? 'row-pointer' : '']"
            :disable-sort="this.data.isSM"
            fixed-header
            hide-default-footer
            disable-pagination
            @dblclick:row="dblclickRow"
          >
          <template v-slot:[`item.transCode`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.transCode }}
            </span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span v-if="!item.isBold">
              {{ item.date | formatDate('dd-MMM-yyyy') }}
            </span>
            <span v-else>
              
            </span>
          </template>
          <template v-slot:[`item.qtyBegin`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyBegin | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyIn`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyIn | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyOut`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyOut | formatCurrency}}
            </span>
          </template>
          <template v-slot:[`item.qtyEnd`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyEnd | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invBegin`]="{ item }">
            {{ item.invBegin | formatCurrency }}
          </template>
          <template v-slot:[`item.invIn`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invIn | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invOut`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invOut | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invEnd`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invEnd | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyInPO`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyInPO | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyInRtn`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyInRtn | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyInTS`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyInTS | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyInCNEE`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyInCNEE | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyInADJ`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyInADJ | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyOutDO`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyOutDO | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyOutDI`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyOutDI | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyOutRtn`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyOutRtn | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyOutTS`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyOutTS | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyOutCNEE`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyOutCNEE | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.qtyOutADJ`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.qtyOutADJ | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invInPO`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invInPO | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invInRtn`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invInRtn | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invInTS`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invInTS | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invInCNEE`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invInCNEE | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invInADJ`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invInADJ | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invOutDO`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invOutDO | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invOutDI`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invOutDI | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invOutRtn`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invOutRtn | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invOutTS`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invOutTS | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invOutCNEE`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invOutCNEE | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.invOutADJ`]="{ item }">
            <span :class="item.isBold ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.invOutADJ | formatCurrency }}
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
        sortBy: ['initial'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridInv:{
      height: 100,
      columns: [{ text: 'Inisial', value: 'initial', excelColWidth:'13'},
        { text: 'Nama', value: 'name', excelColWidth:'40'},
        { text: 'Ins. Kategori', value: 'categoryInitial', excelColWidth:'13' },
        { text: 'Satuan', value: 'unit', excelColWidth:'12' },
        { text: 'Qty Sistem', value: 'qtyEnd', align: 'right', excelColWidth:'20', isNumber: true },
        { text: 'Qty Aktual', excelColWidth:'20'},
        { text: 'Selisih', excelColWidth:'20' },
        { text: 'Keterangan', excelColWidth:'30' }],
      data: [],
      options: {
        sortBy: ['initial'],
        sortDesc: [false]
      }
    },
    filter: false,
    whColumn: [
      { text: 'Kode', value: 'code', divider: true, width: '100', excelColWidth:'13' },
      { text: 'Inisial', value: 'initial', divider: true, width: '120', excelColWidth:'13'},
      { text: 'Nama', value: 'name', divider: true, width: '300', excelColWidth:'40'},
      { text: 'Qty Awal', value: 'qtyBegin', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Masuk', value: 'qtyIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Keluar', value: 'qtyOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Akhir', value: 'qtyEnd', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Awal', value: 'invBegin', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Persediaan Masuk', value: 'invIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Persediaan Keluar', value: 'invOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Persediaan Akhir', value: 'invEnd', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    itemColumn: [
      { text: 'Inisial', value: 'initial', divider: true, width: '120', excelColWidth:'13'},
      { text: 'Nama', value: 'name', divider: true, width: '300', excelColWidth:'40'},
      { text: 'Ins. Kategori', value: 'categoryInitial', divider: true, width: '120', excelColWidth:'13' },
      { text: 'Satuan', value: 'unit', divider: true, width: '100', excelColWidth:'12' },
      { text: 'Qty Awal', value: 'qtyBegin', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Masuk', value: 'qtyIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Keluar', value: 'qtyOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Akhir', value: 'qtyEnd', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Awal', value: 'invBegin', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Persediaan Masuk', value: 'invIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Persediaan Keluar', value: 'invOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Persediaan Akhir', value: 'invEnd', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    typeColumn: [
      { text: 'Inisial', value: 'initial', divider: true, width: '120', excelColWidth:'13'},
      { text: 'Nama', value: 'name', divider: true, width: '300', excelColWidth:'40'},
      { text: 'Ins. Kategori', value: 'categoryInitial', divider: true, width: '120', excelColWidth:'13' },
      { text: 'Satuan', value: 'unit', divider: true, width: '100', excelColWidth:'12' },
      { text: 'Qty Awal', value: 'qtyBegin', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Terima (PO)', value: 'qtyInPO', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Terima (Retur)', value: 'qtyInRtn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Transfer +', value: 'qtyInTS', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Konsinyasi +', value: 'qtyInCNEE', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Peny. +', value: 'qtyInADJ', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Kirim (SJ)', value: 'qtyOutDO', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Kirim (DI)', value: 'qtyOutDI', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Kirim (Retur)', value: 'qtyOutRtn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Transfer -', value: 'qtyOutTS', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Konsinyasi -', value: 'qtyOutCNEE', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Peny. -', value: 'qtyOutADJ', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Akhir', value: 'qtyEnd', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Awal', value: 'invBegin', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Persediaan Terima (PO)', value: 'invInPO', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Terima (Retur)', value: 'invInRtn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Transfer +', value: 'invInTS', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Konsinyasi +', value: 'invInCNEE', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Peny. +', value: 'invInADJ', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Kirim (SJ)', value: 'invOutDO', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Kirim (DI)', value: 'invOutDI', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Kirim (Retur)', value: 'invOutRtn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Transfer -', value: 'invOutTS', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Konsinyasi -', value: 'invOutCNEE', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Peny. -', value: 'invOutADJ', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Akhir', value: 'invEnd', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    smColumn: [
      { text: 'Tgl. Transaksi', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true},
      { text: 'Kode Transaksi', value: 'transCode', divider: true, width: '160', excelColWidth:'20'},
      { text: 'Tipe Transaksi', value: 'srcTrans', divider: true, width: '180', excelColWidth:'22' },
      { text: 'Qty Masuk', value: 'qtyIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Keluar', value: 'qtyOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Qty Akhir', value: 'qtyEnd', align: 'right', divider: true, width: '100', excelColWidth:'20', isNumber: true },
      { text: 'Persediaan Masuk', value: 'invIn', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Persediaan Keluar', value: 'invOut', align: 'right', divider: true, width: '100', excelColWidth:'20', isCurrency: true },
      { text: 'Persediaan Akhir', value: 'invEnd', align: 'right', width: '100', excelColWidth:'20', isCurrency: true }
    ],
    types: [{ id: 1, name: 'Berdasarkan Barang' }, { id: 2, name: 'Berdasarkan Gudang' }, { id: 3, name: 'Berdasarkan Tipe Transaksi' }],
    typeUnits: [{ id: 1, name: 'Satuan Terkecil' }, { id: 2, name: 'Satuan Beli' }, { id: 3, name: 'Satuan Jual' }],
    items: [],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tipe Laporan', value: 'type'},
        {text: 'Tanggal Mulai', value: 'startDate'},
        {text: 'Tanggal Akhir', value: 'endDate'},
        {text: 'Barang', value: 'item'},
        {text: 'Satuan', value: 'unit'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getItemLists()
    auth.getAction(this.endpoint, this.menuId.smReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Persediaan'
      }, {
        text: 'Laporan'
      }, {
        text: 'Mutasi Barang'
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
      action: state => state.api.action,
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
        endDate: null,
        whCode: null,
        itemId: null,
        typeUnit: 2,
        isSM: false
      }
      this.filter = true
    },
    getList() {
      this.checkInvAuth()
      this.grid.columns = this.data.type === 1 ? this.data.isSM ? this.smColumn : this.itemColumn :
        this.data.type === 2 ? this.whColumn : this.typeColumn
      
      api.getAll(this.endpoint.inventory.smReport, {
        params: {
          type: this.data.type,
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          whCode: this.data.whCode,
          itemId: this.data.itemId,
          typeUnit: this.data.typeUnit,
          isSM: this.data.isSM
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          this.gridInv.data = this.grid.data
          this.appendFilter()
        })
    },
    back() {
      if (this.data.isSM) {
        this.data.type = 1
        this.data.isSM = false
        this.grid.columns = this.itemColumn
        this.grid.options.sortBy = ['initial']
        if (this.data.whCode !== null) {
          this.data.filterName = this.data.oldFilterName
          this.data.initial = this.data.oldInitial
          this.data.name = this.data.oldName
          this.data.itemId = null
          this.filter = false
          this.getList()
          this.main = false
        } else {
          this.data.filterName = null
          this.data.itemId = this.data.oldItemId
          this.filter = true
          this.getList()
          this.main = true
        }
      } else {
        this.data.filterName = null
        this.data.type = 2
        this.data.isSM = false
        this.grid.columns = this.whColumn
        this.grid.options.sortBy = ['initial']
        this.data.itemId = null
        this.data.whCode = null
        this.filter = true
        this.getList()
        this.main = true
      }
      this.setGridDefaultHeight()
    },
    showfilter() {
      this.filter = !this.filter
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    getItemLists() {
      api.getAll(this.endpoint.inventory.item.item)  
        .then(response => {
          this.items = response.data.tableData
        })
    },
    dblclickRow(event, { item }) {
      if (!this.data.isSM) {
        if (this.data.type === 1) {
          if (this.data.filterName !== undefined) {
            this.data.oldFilterName = this.data.filterName
            this.data.oldInitial = this.data.initial
            this.data.oldName = this.data.name
          }
          this.data.oldItemId = this.data.itemId
          this.data.filterName = 'Barang'
          this.data.initial = item.initial
          this.data.name = item.name
          this.data.type = 1
          this.data.itemId = item.id
          this.data.isSM = true
          this.filter = false
          this.grid.options.sortBy = []
          this.getList()
          this.main = false
        } else if (this.data.type === 2) {
          this.data.filterName = 'Gudang'
          this.data.initial = item.initial
          this.data.name = item.name
          this.data.type = 1
          this.data.whCode = item.code
          this.data.isSM = false
          this.filter = false
          this.grid.options.sortBy = ['initial']
          this.getList()
          this.main = false
        }
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
      const searchUnit = {
        field: 'unit',
        keyword: '',
        operator: 'eq'
      }

      const report = this.types.find(x => x.id === this.data.type)
      searchType.keyword = report.name
      this.exportFilter.searches.push(searchType)

      searchStartDate.keyword = this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchStartDate)

      searchEndDate.keyword = this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
      if (searchEndDate.keyword !== '') {
        this.exportFilter.searches.push(searchEndDate)
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

      const unitType = this.typeUnits.find(x => x.id === this.data.typeUnit)
      searchUnit.keyword = unitType.name
      this.exportFilter.searches.push(searchUnit)
    },
    clearTable() {
      this.grid.data = []
      this.grid.columns = []
    },
    clearDate(item) {
      if (item === 'end') {
        this.data.endDate = null
      }
      this.clearTable()
    },
    checkInvAuth() {
      if (!this.auth.allowShowInventoryValue) {
        const removed = ['invBegin', 'invIn', 'invOut', 'invEnd']
        this.whColumn = this.whColumn.filter(x => !removed.includes(x.value))
        this.itemColumn = this.itemColumn.filter(x => !removed.includes(x.value))
        this.smColumn = this.smColumn.filter(x => !removed.includes(x.value))
      }
    }
  }
}

</script>
