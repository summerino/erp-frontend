<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row no-gutters>
              <v-col cols="12" md="6">
                Laporan Arus Kas
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
                          title="Daftar Laporan Arus Kas"
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
                  v-model="menu.dateFrom"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatDateFrom"
                      label="Tanggal Mulai"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearDate('start')"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.dateFrom"
                    no-title
                    scrollable
                    @change="menu.dateFrom = false; changeDateFrom();"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-menu
                  v-model="menu.dateTo"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatDateTo"
                      label="Tanggal Akhir"
                      class="mt-0"
                      dense
                      readonly
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.dateTo"
                    no-title
                    scrollable
                    @change="menu.dateTo = false; changeDateTo();"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-autocomplete
                  v-model="data.coaCode"
                  :items="coas"
                  label="Akun"
                  :item-text="item => `${item.code} - ${item.name}`"
                  item-value="code"
                  class="mt-0"
                  clearable
                  dense
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
            class="elevation-1"
            fixed-header
            hide-default-footer
            disable-pagination
            disable-sort
          >
          <template v-slot:[`item.description`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.description }}
            </span>
          </template>
          <template v-slot:[`item.amountAll`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amountAll | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amountIdr`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amountIdr | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amountOc`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amountOc | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount1`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount1 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount2`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount2 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount3`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount3 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount4`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount4 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount5`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount5 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount6`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount6 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount7`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount7 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount8`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount8 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount9`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount9 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount10`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount10 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount11`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount11 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount12`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount12 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount13`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount13 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount14`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount14 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount15`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount15 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount16`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount16 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount17`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount17 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount18`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount18 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount19`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount19 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount20`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount20 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount21`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount21 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount22`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount22 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount23`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount23 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount24`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount24 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount25`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount25 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount26`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount26 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount27`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount27 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount28`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount28 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount29`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount29 | formatCurrency }}
            </span>
          </template>
          <template v-slot:[`item.amount30`]="{ item }">
            <span :class="item.isBold === '1' ? 'font-weight-black' : 'font-weight-medium'">
              {{ item.amount30 | formatCurrency }}
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
    menu: {
      dateFrom: false,
      dateTo: false
    },
    grid: {
      height: 100,
      columns: [],
      data: [],
      total: 0,
      search: null
    },
    filter: false,
    sumColumn: [
      { text: 'Deskripsi', value: 'description', divider: true, width: '150', excelColWidth:'25' },
      { text: 'Total', value: 'amountAll', align: 'right', divider: true, width: '200', excelColWidth:'30', isCurrency: true },
      { text: 'KAS', value: 'amount1', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'KAS KECIL GK', value: 'amount2', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'KAS KECIL WL', value: 'amount3', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'KAS POOL FUNDING', value: 'amount4', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'AGRIS PT. APNM', value: 'amount5', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'DANAMON TAB PT. APNM', value: 'amount6', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BRI PT. APNM', value: 'amount7', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BNI PT. APNM', value: 'amount8', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BCA PT. APNM', value: 'amount9', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'AGRIS TAB CATRIN OR HENDRIK LIMAH', value: 'amount10', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'AGRIS GIRO HENDRIK LIMAH', value: 'amount11', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'AGRIS TAB HENDRIK LIMAH', value: 'amount12', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BNI HENDRIK LIMAH', value: 'amount13', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'DANAMON YOAN OR CATRIN', value: 'amount14', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'PANIN TAB HENDRIK LIMAH', value: 'amount15', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'PANIN GIRO HENDRIK LIMAH', value: 'amount16', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'MEGA PT. APNM', value: 'amount17', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BANK POOL FUNDING', value: 'amount18', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'AGRIS PT. SMS', value: 'amount19', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'EKONOMI PT. SMS', value: 'amount20', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'DANAMON TAB PT. SMS', value: 'amount21', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'DANAMON GIRO PT. SMS', value: 'amount22', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BCA PT. SMS', value: 'amount23', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BCA CATRIN OR HENDRIK LIMAH', value: 'amount24', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BCA GIRO CATRIN / HENDRIK LIMAH', value: 'amount25', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BRI PT. SMS', value: 'amount26', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BANK MANDIRI PT. SMS', value: 'amount27', align: 'right', width: '120', excelColWidth:'20', isCurrency: true }
    ],
    sumCoaColumn: [
      { text: 'Deskripsi', value: 'description', divider: true, width: '33%', excelColWidth:'25' },
      { text: 'Total', value: 'amountIdr', align: 'right', divider: true, width: '33%', excelColWidth:'30', isCurrency: true },
      { text: '', value: 'amountOc', align: 'right', width: '33%', excelColWidth:'20', isCurrency: true }
    ],
    detColumn: [
      { text: 'Deskripsi', value: 'description', divider: true, width: '150', excelColWidth:'25' },
      { text: 'Kode', value: 'coa', divider: true, width: '150', excelColWidth:'25'},
      { text: 'Catatan', value: 'notes', divider: true, width: '150', excelColWidth:'25'},
      { text: 'Kd. Trans.', value: 'transCode', divider: true, width: '150', excelColWidth:'25'},
      { text: 'KAS', value: 'amount1', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'KAS KECIL GK', value: 'amount2', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'KAS KECIL WL', value: 'amount3', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'KAS POOL FUNDING', value: 'amount4', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'AGRIS PT. APNM', value: 'amount5', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'DANAMON TAB PT. APNM', value: 'amount6', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BRI PT. APNM', value: 'amount7', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BNI PT. APNM', value: 'amount8', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BCA PT. APNM', value: 'amount9', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'AGRIS TAB CATRIN OR HENDRIK LIMAH', value: 'amount10', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'AGRIS GIRO HENDRIK LIMAH', value: 'amount11', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'AGRIS TAB HENDRIK LIMAH', value: 'amount12', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BNI HENDRIK LIMAH', value: 'amount13', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'DANAMON YOAN OR CATRIN', value: 'amount14', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'PANIN TAB HENDRIK LIMAH', value: 'amount15', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'PANIN GIRO HENDRIK LIMAH', value: 'amount16', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'MEGA PT. APNM', value: 'amount17', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BANK POOL FUNDING', value: 'amount18', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'AGRIS PT. SMS', value: 'amount19', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'EKONOMI PT. SMS', value: 'amount20', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'DANAMON TAB PT. SMS', value: 'amount21', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'DANAMON GIRO PT. SMS', value: 'amount22', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BCA PT. SMS', value: 'amount23', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BCA CATRIN OR HENDRIK LIMAH', value: 'amount24', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BCA GIRO CATRIN / HENDRIK LIMAH', value: 'amount25', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BRI PT. SMS', value: 'amount26', align: 'right', divider: true, width: '120', excelColWidth:'20', isCurrency: true },
      { text: 'BANK MANDIRI PT. SMS', value: 'amount27', align: 'right', width: '120', excelColWidth:'20', isCurrency: true }
    ],
    detCoaColumn: [
      { text: 'Deskripsi', value: 'description', divider: true, width: '25%', excelColWidth:'25' },
      { text: 'Kode', value: 'coa', divider: true, width: '25%', excelColWidth:'25'},
      { text: 'Catatan', value: 'notes', divider: true, width: '25%', excelColWidth:'25'},
      { text: 'Kd. Trans.', value: 'transCode', divider: true, width: '25%', excelColWidth:'25'},
      { text: '', value: 'amountOc', align: 'right', width: '25%', excelColWidth:'20', isCurrency: true }
    ],
    coas: [],
    types: [{ id: 1, name: 'Rekapan' }, { id: 2, name: 'Terperinci' }],
    data: {},
    exportFilter:{
      fields : [
        {text: 'Tipe Laporan', value: 'type'},
        {text: 'Tanggal Mulai', value: 'dateFrom'},
        {text: 'Tanggal Akhir', value: 'dateTo'},
        {text: 'Akun', value: 'coa'}
      ],
      operator: [{ text: 'Sama dgn.', value: 'eq'}],
      searches: []
    }  
  }),

  created: function () {
    this.reset()
    this.getCOAList()
    auth.getAction(this.endpoint, this.menuId.cfReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Keuangan'
      }, {
        text: 'Laporan'
      }, {
        text: 'Arus Kas'
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
    formatDateFrom() {
      return this.data.dateFrom ? format(parseISO(this.data.dateFrom), 'dd-MMM-yyyy') : ''
    },
    formatDateTo() {
      return this.data.dateTo ? format(parseISO(this.data.dateTo), 'dd-MMM-yyyy') : ''
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
        dateFrom: format(new Date(), 'yyyy-MM-dd'),
        dateTo: format(new Date(), 'yyyy-MM-dd'),
        coaCode: null
      }
      this.filter = true
    },
    getList() {

      if (this.data.coaCode !== null) {
        this.grid.columns = this.data.type === 1 ? this.sumCoaColumn : this.detCoaColumn
        const selectedCoa = this.coas.find(x => x.code === this.data.coaCode)
        const getColumn = this.grid.columns.find(x => x.value === 'amountOc')
        getColumn.text = selectedCoa.name
      } else {
        this.grid.columns = this.data.type === 1 ? this.sumColumn : this.detColumn
      }
      
      api.getAll(this.endpoint.finance.cfReport, {
        params: {
          type: this.data.type,
          dateFrom: this.data.dateFrom,
          dateTo: this.data.dateTo,
          coaCode: this.data.coaCode
        }
      })
        .then(response => {
          this.grid.data = this.data.type === 1 ? response.data.tableData : response.data.tableData.slice(0, -8)
          this.grid.total = this.data.type === 1 ? response.data.rowCount : response.data.rowCount - 8
          this.appendFilter()
        })
    },
    showfilter() {
      this.filter = !this.filter
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    getCOAList() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'typeId',
            operator: 'eq',
            keyword: 1
          }])
        }
      })
        .then(response => {
          this.coas = response.data.tableData
        })
    },
    appendFilter() {
      this.exportFilter.searches = []
      const searchType = {
        field: 'type',
        keyword: '',
        operator: 'eq'
      }
      const searchDateFrom = {
        field: 'dateFrom',
        keyword: '',
        operator: 'eq'
      }
      const searchDateTo = {
        field: 'dateTo',
        keyword: '',
        operator: 'eq'
      }

      const report = this.types.find(x => x.id === this.data.type)
      if (report) {
        searchType.keyword = report.name
        this.exportFilter.searches.push(searchType)
      }

      searchDateFrom.keyword = this.data.dateFrom ? format(parseISO(this.data.dateFrom), 'dd-MMM-yyyy') : ''
      this.exportFilter.searches.push(searchDateFrom)

      searchDateTo.keyword = this.data.dateTo ? format(parseISO(this.data.dateTo), 'dd-MMM-yyyy') : ''
      if (searchDateTo.keyword !== '') {
        this.exportFilter.searches.push(searchDateTo)
      }

      const coa = this.coas.find(x => x.code === this.data.coaCode)
      if (coa) {
        const searchCoa = {
          field: '',
          keyword: '',
          operator: 'eq'
        }
        searchCoa.field = 'coa'
        searchCoa.keyword = `${coa.code} - ${coa.name}`
        this.exportFilter.searches.push(searchCoa)
      }
    },
    clearTable() {
      this.grid.data = []
      this.grid.columns = []
    },
    changeDateFrom() {
      if (this.data.dateFrom > this.data.dateTo) {
        this.data.dateTo = this.data.dateFrom
      }
      this.clearTable()
    },
    changeDateTo() {
      if (this.data.dateTo < this.data.dateFrom) {
        this.data.dateFrom = this.data.dateTo
      }
      this.clearTable()
    },
    clearDate(item) {
      if (item === 'start') {
        this.data.dateFrom = null
      }
      this.clearTable()
    }
  }
}

</script>
