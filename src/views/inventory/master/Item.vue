<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Barang
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="grid.search"
              append-icon="mdi-magnify"
              label="Cari..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList()"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="1">
            <export-excel title="Daftar Barang" :grid="grid" :gridDefOpts="gridDefOpts"  ref="exportExcel"></export-excel>
          </v-col>
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
                :disabled="!auth.allowDelete"
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
        <template v-slot:[`item.sellPrice`]="{ item }">
          {{ item.sellPrice | formatCurrency }}
        </template>
        <template v-slot:[`item.buyPrice`]="{ item }">
          {{ item.buyPrice | formatCurrency }}
        </template>
        <template v-slot:[`item.isActive`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon 
                v-bind="attrs" 
                v-on="on" 
                :color="item.isActive === true ? 'green' : 'red'"
              >
                {{ item.isActive === true ? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline' }}
              </v-icon>
            </template>
            <span class="text-caption">
                {{ item.isActive === true ? 'Aktif' : 'Tidak Aktif' }}
            </span>
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
          <v-toolbar-title>Barang</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="isActive || (data.action === 'edit' && !auth.allowUpdate)"
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
                  :disabled="isActive || (data.action === 'edit' && !auth.allowUpdate)"
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
              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Umum</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="Initial"
                          v-model="data.initial"
                          :counter="20"
                          label="Inisial"
                          class="mt-0"
                          :rules="[rules.required[0], rules.max20chars[0]]"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="Name"
                          v-model="data.name"
                          :counter="50"
                          label="Nama"
                          class="mt-0"
                          :rules="[rules.required[0], rules.max50chars[0]]"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                            v-model="data.categoryId"
                            :items="itemCtg"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            label="Kategori"
                            item-value="id"
                            class="mt-0"
                            :rules="rules.required"
                            required
                            @change="loadSubGroup"
                          ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="Description"
                          v-model="data.description"
                          :counter="100"
                          label="Deskripsi"
                          class="mt-0"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6" class="pr-md-3">
                        <v-checkbox
                          v-model="data.isActive"
                          label="Aktif"
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Lainnya</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                            v-model="data.uomId"
                            :items="uom"
                            :rules="rules.required"
                            label="Satuan Ukuran"
                            item-text="initial"
                            item-value="id"
                            class="mt-0"
                            required
                            @change="categoryChanged"
                          ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="3">
                        <v-autocomplete
                            v-model="data.uomSellId"
                            :items="unitUomSell"
                            :rules="rules.required"
                            label="Satuan Jual"
                            item-text="unitEquivalent"
                            item-value="id"
                            class="mt-0"
                            required
                            @change="loadUnitQuantity"
                          ></v-autocomplete>
                      </v-col>
                      <v-col cols="9" class="pl-md-1">
                        <v-currency-field
                          ref="SellPrice"
                          v-model="data.sellPrice"
                          :rules="rules.required"
                          label="Harga Jual"
                          class="mt-0"
                          required
                        ></v-currency-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="3">
                        <v-autocomplete
                            v-model="data.uomBuyId"
                            :rules="rules.required"
                            :items="unitUomBuy"
                            label="Satuan Beli"
                            item-text="unitEquivalent"
                            item-value="id"
                            class="mt-0"
                            required
                            @change="loadUnitQuantity"
                          ></v-autocomplete>
                      </v-col>
                      <v-col cols="9" class="pl-md-1">
                        <v-currency-field
                          ref="BuyPrice"
                          v-model="data.buyPrice"
                          :rules="rules.required"
                          label="Harga Beli"
                          class="mt-0"
                          required
                        ></v-currency-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-autocomplete
                            v-model="data.salesTaxId"
                            :items="slsTaxes"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            :rules="rules.required"
                            label="Pajak Penjualan"
                            item-value="id"
                            class="mt-0"
                            required
                          ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-3">
                        <v-autocomplete
                            v-model="data.purchaseTaxId"
                            :items="purcTaxes"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            :rules="rules.required"
                            label="Pajak Pembelian"
                            item-value="id"
                            class="mt-0"
                            required
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
                  <v-tabs v-model="tab.advancedItem">
                    <v-tab key="quantity">Kuantitas</v-tab>
                    <v-tab key="dimension">Dimensi</v-tab>
                    <v-tab key="account">Akun</v-tab>
                    <v-tab key="group">Grup</v-tab>
                    <v-tab key="user">Pengguna</v-tab>

                    <v-tab-item
                      key="quantity"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <template>
                            <v-row no-gutters>
                              <v-col cols="4" md="4">
                                <v-autocomplete
                                  v-model="data.viewUnit"
                                  :items="quantityViewRef"
                                  :item-text="item => `${item.text}`"
                                  item-value="value"
                                  label="Qty ditampilkan dalam"
                                  class="mt-0"
                                  @change="getQuantity"
                                ></v-autocomplete>
                              </v-col>
                            </v-row>

                            <v-row no-gutters>
                              <v-col cols="12">
                                <v-data-table
                                  :headers="gridQuantity.columns"
                                  :items="gridQuantity.data"
                                  :items-per-page="-1"
                                  height="300"
                                  class="elevation-1"
                                  dense
                                  disable-sort
                                  fixed-header
                                  hide-default-footer
                                >
                                  <template v-slot:[`item.qtyOnAvailable`]="{ item }">
                                    {{ calcQtyAvailable(item.qtyOnHand, item.qtyOnOrder) }}
                                  </template>
                                  <template v-slot:[`item.qtyOnOrder`]="{ item }">
                                    <v-chip
                                    label
                                    link
                                    small
                                    @click="detailQty(item, 1)"
                                    >
                                    {{ item.qtyOnOrder }}</v-chip>
                                  </template>
                                  <template v-slot:[`item.qtyOnIndent`]="{ item }">
                                    <v-chip
                                    label
                                    link
                                    small
                                    @click="detailQty(item, 2)"
                                    >
                                    {{ item.qtyOnIndent }}</v-chip>
                                  </template>
                                  <template v-slot:[`item.qtyOnTransfer`]="{ item }">
                                    <v-chip
                                    label
                                    link
                                    small
                                    @click="detailQty(item, 3)"
                                    >
                                    {{ item.qtyOnTransfer }}</v-chip>
                                  </template>
                                  <template v-slot:[`item.updatedDate`]="{ item }">
                                    {{ item.updatedDate | formatDate('dd-MMM-yyyy') }}
                                  </template>                                
                                </v-data-table>
                              </v-col>
                            </v-row>
                          </template>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="dimension"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="2">
                              <v-text-field
                                ref="Length"
                                v-model="data.length"
                                label="Panjang"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" class="pl-md-1">
                              <v-text-field
                                ref="Width"
                                v-model="data.width"
                                label="Lebar"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" class="pl-md-1">
                              <v-text-field
                                ref="Height"
                                v-model="data.height"
                                label="Tinggi"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" offset-md="1" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.dimensionMeasurement"
                                :items="dimensionOfMeasurement"
                                :item-text="item => `${item.text}`"
                                label="Satuan Dimensi"
                                item-value="text"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>

                          <v-row no-gutters>
                            <v-col cols="2">
                              <v-text-field
                                ref="Weight"
                                v-model="data.weight"
                                label="Berat"
                                class="mt-0"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="2" offset-md="5" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.weightMeasurement"
                                :items="weightOfMeasurement"
                                :item-text="item => `${item.text}`"
                                label="Satuan Berat"
                                item-value="text"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="account"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>

                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-autocomplete
                                v-model="data.coaInventory"
                                :items="coas"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun persediaan"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaCogs"
                                :items="coas"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun harga pokok penjualan"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>

                          <!-- <v-row no-gutters>
                            <v-col cols="6">
                              <v-autocomplete
                                v-model="data.coaPurc"
                                :items="coas"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun pembelian"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaSls"
                                :items="coas"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun penjualan"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row> -->

                          <v-row no-gutters>
                            <!-- <v-col cols="6">
                              <v-autocomplete
                                v-model="data.coaPurcDisc"
                                :items="coas"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun diskon pembelian"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col> -->
                            <v-col cols="12">
                              <v-autocomplete
                                v-model="data.coaSlsDisc"
                                :items="coas"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun diskon penjualan"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row>

                          <!-- <v-row no-gutters>
                            <v-col cols="6">
                              <v-autocomplete
                                v-model="data.coaPurcReturn"
                                :items="coas"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun pengembalian pembelian"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaSlsReturn"
                                :items="coas"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun pengembalian penjualan"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row> -->

                          <!-- <v-row no-gutters>
                            <v-col cols="6">
                              <v-autocomplete
                                v-model="data.coaCost"
                                :items="coas"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun biaya"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-autocomplete
                                v-model="data.coaExpense"
                                :items="coas"
                                :item-text="item => `${item.code} - ${item.name}`"
                                label="Kode akun pengeluaran"
                                item-value="code"
                                class="mt-0"
                              ></v-autocomplete>
                            </v-col>
                          </v-row> -->

                          <v-row no-gutters>
                            <v-col cols="12">
                              <span class="red--text">
                                Jika akun kosong, maka sistem akan melihat akun di pengaturan sistem.
                              </span>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="group"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <template v-for="(items, index) in subGroupRef">
                            <v-row :key="index" no-gutters>
                              <v-col cols="12">
                                <v-autocomplete
                                  v-model="data[`subGroup${index + 1}`]"
                                  :items="items.value.split(';')"
                                  :item-text="item => `${item.value}`"
                                  :label="items.name"
                                  :item-value="item => `${item.value}`"
                                  class="mt-0"
                                ></v-autocomplete>
                              </v-col>
                            </v-row>
                          </template>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="user"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-text-field
                                v-model="data.createdInitial"
                                label="Dibuat Oleh"
                                class="mt-0"
                                readonly
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
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
                            <v-col cols="6" class="pl-md-1">
                              <v-text-field
                                v-model="data.updatedDate"
                                label="Tanggal Diperbarui"
                                class="mt-0"
                                readonly
                              ></v-text-field>
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
    <related-trans ref="relatedTrans"></related-trans>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import RelatedTrans from '@/components/dialog/inventory/RelatedTrans'

export default {
  components: {
    ExportExcel,
    Confirm,
    RelatedTrans
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      receiveDate: false
    },
    tab: {
      advancedItem: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'Inisial', value: 'initial', divider: true, width: '110', excelColWidth:'10' },
        { text: 'Nama', value: 'name', divider: true, width: '270', excelColWidth:'30' },
        { text: 'Kategori', value: 'categoryName', divider: true, width: '270', excelColWidth:'30' },
        { text: 'Satuan Ukuran', value: 'uomInitial', divider: true, width: '270', excelColWidth:'30' },
        { text: 'Satuan Jual', value: 'uomSellName', divider: true, width: '60', excelColWidth:'10' },
        { text: 'Harga Jual', value: 'sellPrice', align: 'right', divider: true, width: '150', excelColWidth:'18', isCurrency: true },
        { text: 'Satuan Beli', value: 'uomBuyName', divider: true, width: '60', excelColWidth:'10' },
        { text: 'Harga Beli', value: 'buyPrice', align: 'right', divider: true, width: '150', excelColWidth:'18', isCurrency: true },
        { text: 'Status', value: 'isActive', align: 'center', width: '50', excelColWidth:'10', isBool: true }
      ],
      data: [],
      options: {
        sortBy: ['initial'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridQuantity: {
      columns: [
        { text: 'Lokasi Gudang', value: 'warehouseInitial', divider: true, width: '200'  },
        { text: 'Qty Sistem', value: 'qtyOnHand', align: 'right', divider: true, width: '120' },
        { text: 'Qty Dipesan', value: 'qtyOnOrder', align: 'right', divider: true, width: '120' },
        { text: 'Qty Tersedia', value: 'qtyOnAvailable', align: 'right', divider: true, width: '120' },
        { text: 'Qty Indent', value: 'qtyOnIndent', align: 'right', divider: true, width: '120' },
        { text: 'Qty Titik Pemesanan Kembali', value: 'qtyReorderPoint', align: 'right', divider: true, width: '120'},
        { text: 'Qty Transfer', value: 'qtyOnTransfer', align: 'right', divider: true, width: '120' },
        { text: 'Diperbarui Tgl.', value: 'updatedDate', divider: true, width: '60' }
      ],
      data: [],
      options: {
        sortBy: ['warehouseCode'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    unitUomSell: [],
    unitUomBuy: [],
    itemCtg: [],
    uom: [],
    slsTaxes: [],
    purcTaxes: [],
    dimensionOfMeasurement: [{text: 'mm'}, {text: 'cm'}, {text: 'm'}],
    weightOfMeasurement: [{text: 'g'}, {text: 'ons'}, {text: 'kg'}],
    quantityViewRef: [{value: 1, text: 'Satuan Terkecil'}, {value: 2, text: 'Satuan Beli'}, {value: 3, text: 'Satuan Jual'}],
    coas: [],
    subGroupRef: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.getCategory()
    this.getUOM()
    this.getSellingTaxes()
    this.getBuyingTaxes()
    this.getCOATypeId2()
    auth.getAction(this.endpoint, this.menuId.item)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Persediaan'
      }, {
        text: 'Data Master'
      }, {
        text: 'Barang'
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
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    isActive() {
      return (this.data?.IsActive?.IsActive === true)
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        initial: '',
        name: '',
        description: '',
        categoryId: '',
        typeId: 0,
        costOfGoodSold: '',
        valuationMethod: 0,
        stockType: 0,
        uomId: 0,
        uomSellId: 0,
        sellPrice: '',
        uomBuyId: 0,
        buyPrice: '',
        salesTaxId: 0,
        purchaseTaxId: 0,
        category1: '',
        category2: '',
        category3: '',
        category4: '',
        category5: '',
        subGroup1: '',
        subGroup2: '',
        subGroup3: '',
        subGroup4: '',
        subGroup5: '',
        coaInventory: '',
        coaCogs: '',
        coaPurc: '',
        coaPurcDisc: '',
        coaPurcReturn: '',
        coaSls: '',
        coaSlsReturn: '',
        coaSlsDisc: '',
        coaOffSet: '',
        coaCost: '',
        coaExpense: '',
        length: 0,
        width: 0,
        height: 0,
        dimensionMeasurement: '',
        weight: 0,
        weightMeasurement: '',
        categoryName: '',
        uomInitial: '',
        uomSellName: '',
        uomBuyName: '',
        viewUnit: 0
      }

      const item = {
        warehouseCode: null,
        itemId: 0,
        qtyOnAvailable: 0,
        qtyOnHand: 0,
        qtyOnOrder: 0,
        qtyOnIndent: 0,
        qtyReorderPoint: 0,
        qtyOnTransfer: 0,
        uomConversion: 0,
        updatedDate: null
      }
      this.gridQuantity.data.push(item)

      this.tab.advancedItem = 0
      this.subGroupRef = []
      this.gridQuantity.data = []

      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }
    },
    getList(bindToForm = false) {
      const sorts = []
      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }

      api.getAll(this.endpoint.inventory.item.item, {
        params: {
          search: this.grid.search,
          skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
          take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
          sorts: JSON.stringify(sorts)
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          if (bindToForm) {
            const item = this.grid.data.find(h => h.initial === this.data.initial)
            this.edit(item)
          }
        })
    },
    getQuantity() {
      api.getAll(this.endpoint.inventory.warehouseQuantity, {
        params: {
          filters: JSON.stringify([{
            field: 'itemid',
            operator: 'eq',
            keyword: this.data.id
          }]),
          sorts: JSON.stringify([{
            field: 'warehousecode',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.gridQuantity.data = response.data.tableData
          if (this.data.viewUnit !== 1) {
            this.calcQuantity()
          }
        })
    },
    getUnitSellingOrBuying() {
      return api.getAll(`${this.endpoint.inventory.uom}/item`, {
        params: {
          uomId: (this.data.uomId === null) ? 0 : this.data.uomId
        }
      })
        .then(response => {
          this.unitUomSell = response.data.tableData
          this.unitUomBuy = response.data.tableData
          
          // Load unit on tab quantity
          this.loadUnitQuantity()
        })
    },
    getCategory() {
      api.getAll(`${this.endpoint.inventory.item.category}/lists`, {})
        .then(response => {
          this.itemCtg = response.data.tableData
        })
    },
    getUOM() {
      api.getAll(`${this.endpoint.inventory.uom}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.uom = response.data.tableData
        })
    },
    getSellingTaxes() {
      api.getAll(`${this.endpoint.general.tax}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'typeId',
            operator: 'eq',
            keyword: 2
          }]),
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.slsTaxes = response.data.tableData
        })
    },
    getBuyingTaxes() {
      api.getAll(`${this.endpoint.general.tax}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'typeId',
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
          this.purcTaxes = response.data.tableData
        })
    },
    getCOATypeId2() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'typeid',
            operator: 'neq',
            keyword: 2
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.coas = response.data.tableData
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
        // Set focus to receive initial field
        this.$refs.Initial.focus()

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    async edit(item) {
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        createdDate: format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      await this.getUnitSellingOrBuying()
      this.loadSubGroup()
      this.getQuantity()

      // Set focus to receive code field
      setTimeout(() => {
        this.$refs.Initial.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus Data?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        api.delete(this.endpoint.inventory.item.item, item.id)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async save(closeDialog) {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = this.data
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.inventory.item.item, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.inventory.item.item, data.id, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else {
          this.data.initial = result.data
        }
        this.getList(!closeDialog)
      }
    },
    categoryChanged() {
      this.getUnitSellingOrBuying()
    },
    loadSubGroup() {
      const item = this.itemCtg.find(x => x.id === this.data.categoryId)

      // Get Sub Group
      api.getAll(`${this.endpoint.inventory.item.group}/item-by-id`, {
        params: { id: item.groupId }
      })
        .then(response => {
          this.subGroupRef = response.data.tableData
        })
    },
    loadUnitQuantity() {
      this.quantityViewRef = [{value: 1, text: 'Satuan Terkecil'}, {value: 2, text: 'Satuan Beli'}, {value: 3, text: 'Satuan Jual'}]

      const smallestUnit = this.quantityViewRef[0].text
      const sellUnit = this.quantityViewRef[1].text
      const buyUnit = this.quantityViewRef[2].text

      this.quantityViewRef[0].text = `${smallestUnit} (${this.unitUomSell.find(x => x.isBaseUnit).unitEquivalent})`

      const uomSellRef = this.unitUomSell.find(x => x.id === this.data.uomSellId)
      if (uomSellRef) {
        this.quantityViewRef[1].text = `${sellUnit} (${uomSellRef.unitEquivalent})`
      }

      const uomBuyRef = this.unitUomBuy.find(x => x.id === this.data.uomBuyId)
      if (uomBuyRef) {
        this.quantityViewRef[2].text = `${buyUnit} (${uomBuyRef.unitEquivalent})`
      }

      if (this.data.action === 'edit') {
        this.data.viewUnit = 2
      }
    },
    calcQuantity() {
      for (let i = 0; i < this.gridQuantity.data.length; i++) {
        this.convertQuantity(this.gridQuantity.data[i], this.data.viewUnit)
      }
    },
    convertQuantity(item, unit) {
      let buyOrSellId = 0
      if (unit === 2) {
        buyOrSellId = this.data.uomSellId
      } else if (unit === 3) {
        buyOrSellId = this.data.uomBuyId
      }

      const unitSellId = this.unitUomSell.find(x => x.id === buyOrSellId)
      let conversionValue = 1

      for (let i = 0; i < this.unitUomSell.length; i++) {
        if (this.unitUomSell[i].seq <= unitSellId.seq) {
          conversionValue *= this.unitUomSell[i].conversion
        }
      }

      item.qtyOnHand /= conversionValue
      item.qtyOnOrder /= conversionValue
      item.qtyOnIndent /= conversionValue
      item.qtyReorderPoint /= conversionValue
      item.qtyOnTransfer /= conversionValue
    },
    calcQtyAvailable(qtySystem, qtyOrder) {
      return (qtySystem - qtyOrder < 0) ? 0 : qtySystem - qtyOrder
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    detailQty(item, from) {
      this.$refs.relatedTrans.open(item, from)
    }
  }
}
</script>
