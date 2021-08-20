<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="2">
            Retur Penjualan
          </v-col>
          <v-col cols="12" md="6">
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
              <export-excel title="Daftar Retur Penjualan" :grid="grid" :gridDefOpts="gridDefOpts" :filters="filter" ref="exportExcel"></export-excel>
            </v-row>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'alt', 'n']"
                  :disabled="!auth.allowCreate"
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
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.custName`]="{ item }">
          {{ item.custCode }} - {{ item.custName }}
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
          <v-toolbar-title>Retur Penjualan Tanpa Dokumen</v-toolbar-title>
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
                          v-model="menu.returnDate"
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
                              :value="formatReturnDate"
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
                            @change="menu.returnDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                          v-model="data.type"
                          :items="types"
                          :rules="rules.required"
                          :readonly="hasRelatedTrans"
                          label="Tipe"
                          item-text="name"
                          item-value="id"
                          class="mt-0"
                          required
                          @change="typeChange"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="6" >
                        <v-checkbox
                          v-model="data.nonTax"
                          label="Tidak Ada Pajak"
                          class="shrink ml-1"
                          @change="nonTaxChange"
                          :disabled="data.type !== 1"
                          :readonly="hasRelatedTrans"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                          v-model="data.taxIncluded"
                          label="Termasuk Pajak"
                          class="shrink ml-1"
                          @change="calcTax"
                          :disabled="data.type !== 1 || data.nonTax"
                          :readonly="hasRelatedTrans"
                        ></v-checkbox>
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
                          <v-autocomplete
                            v-model="data.custCode"
                            :items="customers"
                            :item-text="item => `${item.code} - ${item.initial}`"
                            :rules="rules.required"
                            :disabled="hasRelatedTrans"
                            label="Kode"
                            item-value="code"
                            class="mt-0"
                            @change="custCodeChange"
                            required
                          ></v-autocomplete>
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
                            :disabled="hasRelatedTrans || !auth.allowChangeWarehouse"
                            :item-text="item => `${item.initial} - ${item.name}`"
                            :rules="rules.required"
                            item-value="code"
                            label="Gudang"
                            class="mt-0"
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
                          rows="4"
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
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.salesBy"
                            :items="employees"
                            :item-text="item => `${item.initial} - ${item.firstName}`"
                            :rules="rules.required"
                            label="Dijual Oleh"
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
                            label="Diperbarui Tanggal"
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
                    <v-tab key="related-trans">Transaksi Terkait</v-tab>
                    <v-tab key="tax">Faktur Pajak</v-tab>

                    <v-tab-item
                      key="item"
                      transition="false"
                    >
                      <v-card>
                        <v-app-bar dense flat>
                          <label v-if="data.type === 3">Barang Masuk</label>
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
                          <template v-slot:[`item.itemId`]="{ item }">
                            <v-autocomplete
                              ref="itemId"
                              v-model="item.itemId"
                              :items="items"
                              :rules="rules.required"
                              :readonly="hasRelatedTrans"
                              item-text="initial"
                              item-value="id"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="itemIdChange(item)"
                            >
                              <template v-slot:append>
                                <v-btn
                                  :disabled="hasRelatedTrans"
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
                              :readonly="hasRelatedTrans"
                              class="text-body-2 text-right mt-0"
                              dense
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.unitName`]="{ item }">
                            <v-autocomplete
                              v-model="item.unitId"
                              :items="item.units"
                              :readonly="hasRelatedTrans"
                              item-text="unitEquivalent"
                              item-value="id"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="unitItemChange(item)"
                            ></v-autocomplete>
                          </template>
                          <template v-slot:[`item.unitPrice`]="{ item }">
                            <v-currency-field
                              v-model="item.unitPrice"
                              :readonly="hasRelatedTrans"
                              class="text-body-2 text-right mt-0"
                              dense
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.taxAmount`]="{ item }">
                            {{ item.taxAmount | formatCurrency }}
                          </template>
                          <template v-slot:[`item.nettPrice`]="{ item }">
                            {{ item.nettPrice | formatCurrency }}
                          </template>
                          <template v-slot:[`item.total`]="{ item }">
                            {{ item.total | formatCurrency }}
                          </template>
                        </v-data-table>
                      </v-card>

                      <v-card v-if="data.type === 3" class="rounded-t-0 pt-2">
                        <v-app-bar dense flat>
                          <label v-if="data.type === 3">Barang Keluar</label>
                          <v-spacer></v-spacer>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                v-bind="attrs"
                                v-on="on"
                                v-shortkey="['ctrl', 'alt', 'i']"
                                :disabled="isVoid || hasRelatedTrans"
                                class="blue--text"
                                small
                                tile
                                @click="addDiffItem"
                                @shortkey="addDiffItem"
                              >
                                <v-icon left>mdi-plus</v-icon>
                                Tambah
                              </v-btn>
                            </template>
                            <span class="text-caption">(Ctrl + Alt + I)</span>
                          </v-tooltip>
                        </v-app-bar>
                        <v-data-table
                          :headers="gridDiffItem.columns"
                          :items="gridDiffItem.data"
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
                                  color="red"
                                  icon
                                  small
                                  :disabled="isVoid || hasRelatedTrans"
                                  @click="removeDiffItem(item)"
                                >
                                  <v-icon small>mdi-close-thick</v-icon>
                                </v-btn>
                              </template>
                              <span class="text-caption">Delete</span>
                            </v-tooltip>
                          </template>
                          <template v-slot:[`item.itemId`]="{ item }">
                            <v-autocomplete
                              ref="itemId"
                              v-model="item.itemId"
                              :items="items"
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
                              class="text-body-2 text-right mt-0"
                              dense
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.unitName`]="{ item }">
                            <v-autocomplete
                              v-model="item.unitId"
                              :items="item.units"
                              :rules="rules.required"
                              :readonly="hasRelatedTrans"
                              item-text="unitEquivalent"
                              item-value="id"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="unitItemChange(item)"
                            ></v-autocomplete>
                          </template>
                          <template v-slot:[`item.unitPrice`]="{ item }">
                            <v-currency-field
                              v-model="item.unitPrice"
                              class="text-body-2 text-right mt-0"
                              dense
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
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
                          <v-row dense>
                            <v-col cols="12" md="6">
                              <v-currency-field
                                label="Sebelum Pajak"
                                v-model="data.dpp"
                                readonly
                                class="text-body-2 text-right mt-0"
                              ></v-currency-field>
                            </v-col>
                            <v-col cols="12" md="6" class="pl-md-1">
                              <v-currency-field
                                label="Pajak"
                                v-model="data.taxAmount"
                                readonly
                                class="text-body-2 text-right mt-0"
                              ></v-currency-field>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                  </v-tabs>
                </v-card>
              </v-col>
            </v-row>
            <v-row dense v-if="data.type === 3">
              <v-col cols="12" md="12">
                <v-card>
                  <v-card-text>
                    <v-row dense>
                      <v-col cols="4" md="4">   
                        <v-currency-field
                          v-model="data.totalIn"
                          class="text-right"
                          :readonly="true"
                          label="Harga Barang Masuk"
                        ></v-currency-field>
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-currency-field
                          v-model="data.totalOut"
                          class="text-right"
                          :readonly="true"
                          label="Harga Barang Keluar"
                        ></v-currency-field> 
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-currency-field
                          v-model="data.difference"
                          :min="-Number.MAX_SAFE_INTEGER"
                          :max="Number.MAX_SAFE_INTEGER"
                          :allow-negative="true"
                          class="text-right"
                          :readonly="true"
                          label="Selisih"
                        ></v-currency-field>
                      </v-col>
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
    <find-item
      ref="findItem"
      @dblclick:row="bindItemData"
    ></find-item>
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
import FindItem from '@/components/dialog/inventory/FindItem'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    FindItem
  },

  data: () => ({
    filterFields: [{
      text: 'Kode', value: 'code', dataType: 'text'
    }, {
      text: 'Tanggal', value: 'date', dataType: 'datetime'
    }, {
      text: 'Tipe', value: 'returnType', dataType: 'text'
    }, {
      text: 'Kd. Pelanggan', value: 'custCode', dataType: 'text'
    }, {
      text: 'Nama Pelanggan', value: 'custName', dataType: 'text'
    }, {
      text: 'Gudang', value: 'warehouseCode', dataType: 'text'
    }, {
      text: 'Dijual Oleh', value: 'salesInitial', dataType: 'text'
    }],
    dialog: {
      add: false
    },
    menu: {
      returnDate: false,
      invoiceDate: false
    },
    tab: {
      cust: null,
      location: null,
      notes: null,
      user: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'19' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Tipe', value: 'returnType', divider: true, width: '160', excelColWidth:'19' },
        { text: 'Pelanggan', value: 'custName', divider: true, width: '220', excelColWidth:'35', customValues: ['custCode', 'custName'] },
        { text: 'Gudang', value: 'warehouseCode', divider: true, width: '100', excelColWidth:'13' },
        { text: 'Dijual Oleh', value: 'salesInitial', divider: true, width: '180', excelColWidth:'23' },
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
    gridItem: {
      columns: [],
      data: []
    },
    gridDiffItem: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Kode', value: 'itemId', divider: true, width: '100' },
        { text: 'Nama', value: 'itemName', divider: true, width: '280' },
        { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
        { text: 'Satuan', value: 'unitName', divider: true, width: '90' },
        { text: 'Harga Satuan', value: 'unitPrice', align: 'right', divider: true, width: '120' }
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
    valid: false,
    dataStartDate: null,
    defTaxInc: false,
    defWarehouseCode: '',
    types: [{ id: 1, name: 'Tukar Memo' }, { id: 2, name: 'Tukar Barang Sama' }, { id: 3, name: 'Tukar Barang Beda' }],
    employees: [],
    warehouses: [],
    taxes: [],
    items: [],
    data: {},
    customers: []
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getEmployeeLists()
    this.getCustomerLists()
    this.getWarehouseLists()
    this.getTaxLists()
    this.getItemLists()
    auth.getAction(this.endpoint, this.menuId.salesReturn)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    this.$store.commit('app/setFilterFields', this.filterFields)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Penjualan'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Penjualan'
      }, {
        text: 'Retur'
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
      menuId: state => state.api.menus
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatReturnDate() {
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
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 1,
        nonTax: this.defNonTax,
        taxIncluded: this.defTaxInc,
        custCode: null,
        custName: null,
        custAddr: null,
        custPhone: null,
        custFax: null,
        warehouseCode: null,
        notes: null,
        salesBy: null,
        approveBy: null,
        dpp: 0,
        taxAmount: 0,
        taxInvoiceDate: null,
        taxInvoiceNo: null,
        totalIn: 0,
        totalOut: 0,
        difference: 0
      }
      this.gridItem.data = []
      this.gridRelated.data = []
      this.tab.cust = 0
      this.tab.location = 0
      this.tab.notes = 0
      this.tab.user = 0

      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }

      // Define column
      this.typeChange()
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
      api.getAll(this.endpoint.sales.return, {
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
            operator: 'contains',
            keyword: ['DATA_START_DATE', 'DEF_SALES_TAX_INC', 'DEF_SLS_RTN_NONTAX']
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.dataStartDate = response.data.tableData[0].value
          this.defTaxInc = (response.data.tableData[1].value === '1')
          this.defNonTax = (response.data.tableData[2].value === '1')
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
    getCustomerLists() {
      api.getAll(`${this.endpoint.general.customer.customer}/lists`, {
        params: {
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.customers = response.data.tableData
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
          
          // // Set default warehouse
          // const defWarehouse = this.warehouses.find(w => w.isDefault)
          // if (defWarehouse) {
          //   this.defWarehouseCode = defWarehouse.code
          // }

          // set default warehouse
          this.setDefaultWarehouse()

        })
    },
    getTaxLists() {
      api.getAll(this.endpoint.general.tax, {
        params: {
          filters: JSON.stringify([{
            field: 'typeId',
            operator: 'eq',
            keyword: 1
          }])
        }
      })
        .then(response => {
          this.taxes = response.data.tableData
        })
    },
    getItemLists() {
      api.getAll(this.endpoint.inventory.item.item)  
        .then(response => {
          this.items = response.data.tableData
        })
    },
    getUnitItemLists(item) {
      api.getAll(`${this.endpoint.inventory.uom}/item`, {
        params: { uomId: item.uomId }
      })
        .then(response => {
          item.units = response.data.tableData
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

      // get customer data
      this.custCodeChange()
      setTimeout(() => {
        // Get item details
        api.getAll(`${this.endpoint.sales.return}/item`, {
          params: { code: item.code }
        })
          .then(response => {
            this.gridItem.data = response.data.tableData
            //this.calcPrice()  
            // Get item details
            api.getAll(`${this.endpoint.sales.return}/diff-item`, {
              params: { code: item.code }
            })
              .then(response => {
                this.gridDiffItem.data = response.data.tableData  
                this.calcPrice()  
              })
          })
        
      }, 0)
      
      // Get related transaction details
      api.getAll(`${this.endpoint.sales.return}/related-trans`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridRelated.data = response.data.tableData
        })

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
        api.delete(this.endpoint.sales.return, item.code, {data: item})
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
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = this.data
      data.itemDetails = this.gridItem.data
      data.diffItemDetails = this.gridDiffItem.data
      data.currCode = 'IDR'

      if (data.itemDetails.length === 0 || (data.type === 3 && data.diffItemDetails.length === 0)) {
        this.$store.dispatch('app/showInfo', 'Detail tidak boleh kosong.')
        return
      }

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.return, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.return, data.code, data)
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
      
      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0]?.itemId ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.data.code,
          itemId: null,
          itemName: null,
          qty: 1,
          qtyDlv: 0,
          length: null,
          width: null,
          height: null,
          weight: null,
          dimensionMeasurement: null,
          weightMeasurement: null,
          units: [],
          uomId: null,
          oldUnitId: null,
          oldUnitName: null,
          oldUnitPrice: 0,
          unitId: null,
          unitName: null,
          unitPrice: 0,
          taxAmount: 0,
          taxAmountTemp: 0,
          nettPrice: 0,
          total: 0,
          dpp: 0,
          totTax: 0,
          totDPP: 0,
          totalIn: 0,
          totalOut: 0,
          difference: 0,
          state: 'A'
        }
        this.gridItem.data.push(item)

        setTimeout(() => {
          this.$refs.itemId.focus()
        }, 0)
      }
    },
    addDiffItem() {
      const item = {
        id: randomNumber(-1, -1000),
        code: this.data.code,
        itemId: null,
        itemName: null,
        qty: 1,
        qtyDlv: 0,
        length: null,
        width: null,
        height: null,
        weight: null,
        dimensionMeasurement: null,
        weightMeasurement: null,
        units: [],
        uomId: null,
        oldUnitId: null,
        oldUnitName: null,
        oldUnitPrice: 0,
        unitId: null,
        unitName: null,
        unitPrice: 0,
        taxAmount: 0,
        taxAmountTemp: 0,
        nettPrice: 0,
        total: 0,
        dpp: 0,
        totTax: 0,
        totDPP: 0,
        state: 'A'
      }
      this.gridDiffItem.data.push(item)
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
    async removeDiffItem(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridDiffItem.data.findIndex(i => i.id === item.id)
        this.gridDiffItem.data.splice(idx, 1)
      }
    },
    typeChange() {
      
      if (this.data.type === 1) {
        this.gridItem.columns = [
          { value: 'action', sortable: false, divider: true, width: '90' },
          { text: 'Inisial', value: 'itemId', divider: true, width: '100' },
          { text: 'Nama', value: 'itemName', divider: true, width: '280' },
          { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
          { text: 'Satuan', value: 'unitName', divider: true, width: '90' },
          { text: 'Harga Satuan', value: 'unitPrice', align: 'right', divider: true, width: '120' },
          { text: 'Pajak', value: 'taxAmount', align: 'right', divider: true, width: '120' },
          { text: 'Harga Bersih', value: 'nettPrice', align: 'right', divider: true, width: '120' },
          { text: 'Total Harga', value: 'total', align: 'right', divider: true, width: '120' }
        ]
      } else if (this.data.type === 2) {
        this.gridItem.columns = [
          { value: 'action', sortable: false, divider: true, width: '90' },
          { text: 'Inisial', value: 'itemId', divider: true, width: '100' },
          { text: 'Nama', value: 'itemName', divider: true, width: '280' },
          { text: 'Qty Return', value: 'qty', align: 'right', divider: true, width: '90' },
          { text: 'Qty Masuk', value: 'qtyDlv', align: 'right', divider: true, width: '90' },
          { text: 'Satuan', value: 'unitName', divider: true, width: '90' }
        ]
      } else {
        this.gridItem.columns = [
          { value: 'action', sortable: false, divider: true, width: '90' },
          { text: 'Inisial', value: 'itemId', divider: true, width: '100' },
          { text: 'Nama', value: 'itemName', divider: true, width: '280' },
          { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
          { text: 'Satuan', value: 'unitName', divider: true, width: '90' },
          { text: 'Harga Satuan', value: 'unitPrice', align: 'right', divider: true, width: '120' },
          { text: 'Pajak', value: 'taxAmount', align: 'right', divider: true, width: '120' },
          { text: 'Harga Bersih', value: 'nettPrice', align: 'right', divider: true, width: '120' },
          { text: 'Total Harga', value: 'total', align: 'right', divider: true, width: '120' }
        ]
      }
      this.data.taxIncluded = this.defTaxInc
      this.data.nonTax = this.defNonTax
      this.gridItem.data = []
      this.gridDiffItem.data = []
      this.data.difference = 0
      this.data.totalIn = 0
      this.data.totalOut = 0
      this.calcPrice()
    },
    nonTaxChange() {
      if (this.data.nonTax) {
        for (let i = 0; i < this.gridItem.data.length; i++) {
          this.gridItem.data[i].taxAmount = 0 
        }
        for (let i = 0; i < this.gridDiffItem.data.length; i++) {
          this.gridDiffItem.data[i].taxAmount = 0 
        }
        this.data.taxIncluded = false
      } else {
        for (let i = 0; i < this.gridItem.data.length; i++) {
          this.gridItem.data[i].taxAmount = this.gridItem.data[i].taxAmountTemp 
        }
        for (let i = 0; i < this.gridDiffItem.data.length; i++) {
          this.gridDiffItem.data[i].taxAmount = 0 
        }
      }
      this.calcTax()
    },
    itemIdChange(item) {
      
      const data_i = this.items.find(i => i.id === item.itemId)
      if (data_i) {
        item.itemName = data_i.name
        item.qty = 1
        item.length = data_i.length
        item.width = data_i.width
        item.height = data_i.height
        item.weight = data_i.weight
        item.dimensionMeasurement = data_i.dimensionMeasurement
        item.weightMeasurement = data_i.weightMeasurement
        item.uomId = data_i.uomId
        item.oldUnitId = data_i.uomSellId
        item.oldUnitName = data_i.uomSellName
        item.oldUnitPrice = data_i.sellPrice
        item.unitId = data_i.uomSellId
        item.unitName = data_i.uomSellName
        item.unitPrice = data_i.sellPrice
        item.taxId = data_i.purchaseTaxId
        item.taxAmount = 0
        item.taxAmountTemp = 0
        item.nettPrice = data_i.sellPrice
        item.dpp = data_i.sellPrice
        if (item.state !== 'A') {
          item.state = 'M'
        }

        // Get unit item lists
        this.getUnitItemLists(item)

        // Calc item price
        this.calcItemPrice(item)
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
        item.unitPrice = item.oldUnitPrice * item.uomConversion
      } else {
        item.uomConversion = 1
        if (unit.unitEquivalent !== item.oldUnitName) {
          this.calcUomConversion(false, item, unit.unitEquivalent)
        }
        item.unitPrice = item.oldUnitPrice / item.uomConversion
      }

      // Calc item price
      this.calcItemPrice(item)
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
    calcItemTax(item) {
      const tax = this.taxes.find(t => t.id === item.taxId)
      if (tax) {
        if (this.data.includeTax) {
          item.taxAmount = Math.round((item.unitPrice) - ((item.unitPrice) / (1 + (tax.rate / 100))))
          item.taxAmountTemp = item.taxAmount
          item.nettPrice = item.unitPrice 
          item.dpp = item.unitPrice - item.taxAmount
        } else {
          item.taxAmount = Math.round((item.unitPrice) * (tax.rate / 100))
          item.taxAmountTemp = item.taxAmount
          item.nettPrice = item.unitPrice + item.taxAmount
          item.dpp = item.unitPrice 
        }
      }
    },
    calcItemPrice(item, calcPrice = true) {
      this.calcItemTax(item)
      item.total = item.qty * item.nettPrice
      item.totTax = item.qty * item.taxAmount
      item.totDPP = item.qty * item.dpp

      if (calcPrice) {
        this.calcPrice()
      }
    },
    calcTax() {
      for (let i = 0; i < this.gridItem.data.length; i++) {
        this.calcItemPrice(this.gridItem.data[i], false)
      }
      this.calcPrice()
    },
    calcPrice() {
      

      this.data.subTotalIn = _sumBy(this.gridItem.data, 'total')
      this.data.taxAmountIn = _sumBy(this.gridItem.data, 'totTax')
      this.data.dppOut = _sumBy(this.gridItem.data, 'totDPP')

      this.data.subTotalOut = _sumBy(this.gridDiffItem.data, 'total')
      this.data.taxAmountOut = _sumBy(this.gridDiffItem.data, 'totTax')
      this.data.dppIn = _sumBy(this.gridDiffItem.data, 'totDPP')
      
      this.data.dpp = this.data.dppOut + this.data.dppIn
      this.data.taxAmount = this.data.taxAmountIn + this.data.taxAmountOut

      this.calcGrandTotal()
    },
    calcGrandTotal() {
      
      if (this.data.taxIncluded) {
        this.data.totalIn = this.data.subTotalIn 
        this.data.totalOut = this.data.subTotalOut 
      } else {
        this.data.totalIn = this.data.subTotalIn  + this.data.taxAmountIn
        this.data.totalOut = this.data.subTotalOut + this.data.taxAmountOut
      }
      this.data.difference = this.data.totalIn - this.data.totalOut
    },
    showFindItemDialog(item) {
      this.$refs.findItem.open(item)
    },
    bindItemData(rowItem) {
      this.itemIdChange(rowItem)
    },
    custCodeChange() {
      const customer = this.customers.find(s => s.code === this.data.custCode)
      if (customer) {
        this.data.custName = customer.name
        this.data.custAddr = customer.address1
        this.data.custPhone = customer.phone
        this.data.custFax = customer.fax
      }
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
    }
  }
}
</script>
