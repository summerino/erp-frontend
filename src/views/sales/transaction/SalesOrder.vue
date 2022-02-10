<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="2">
            Order Penjualan
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
                title="Daftar Order Penjualan"
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
                :disabled="(item.mark.toUpperCase() !== 'A' && item.mark.toUpperCase() !== 'PS') || !auth.allowClose"
                color="blue darken-2"
                icon
                small
                @click="closeOrder(item)"
              >
                <v-icon small>mdi-lock</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Tutup</span>
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
        <template v-slot:[`item.total`]="{ item }">
          {{ item.total | formatCurrency }}
        </template>
        <template v-slot:[`item.mark`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                v-bind="attrs"
                v-on="on"
                :color="item.mark.toUpperCase() === 'CLS' ? 'grey darken-1' : item.mark.toUpperCase() === 'V' ? 'error' : 'green'"
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
          <v-toolbar-title>Order Penjualan</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'alt', 'p']"
                  :disabled="isVoid || !auth.allowPrint"
                  dark
                  text
                  @click="print(data)"
                  @shortkey="print(data)"
                >Cetak</v-btn>
              </template>
              <span class="text-caption">(Ctrl + Alt + P)</span>
            </v-tooltip>
            <v-divider vertical></v-divider>
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
                  @click="save(false)"
                  @shortkey="save(false)"
                  :disabled="(data.action === 'edit' && !auth.allowUpdate)"
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
                  v-shortkey="['ctrl', 'alt', 'r']"
                  :disabled="isSaveNDeliveryAble || !allowInsertSalesDelivery || (data.action === 'edit' && !auth.allowUpdate) "
                  @click="saveDlv()"
                  @shortkey="saveDlv()"
                >
                  <v-list-item-title>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                        >
                          Simpan & Kirim
                        </span>
                      </template>
                      <span class="text-caption">(Ctrl + Alt + R)</span>
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
                        <v-text-field
                          ref="code"
                          v-model="data.code"
                          label="Kode"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-menu
                          v-model="menu.orderDate"
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
                              :value="formatOrderDate"
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
                            @change="menu.orderDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                          v-model="data.salesBy"
                          :items="employees"
                          :item-text="item => `${item.initial} - ${item.firstName}`"
                          :rules="rules.required"
                          label="Penjual"
                          item-value="id"
                          class="mt-0"
                          required
                          @change="changeSales()"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <!-- <v-row no-gutters>
                      <v-col cols="5">
                        <v-combobox
                          v-model="data.currCode"
                          :items="currencies"
                          :readonly="hasRelatedTrans"
                          :rules="rules.required"
                          label="Mata Uang"
                          item-text="code"
                          item-value="code"
                          class="mt-0"
                          required
                        ></v-combobox>
                      </v-col>

                      <v-col cols="7" class="pl-1">
                        <v-currency-field
                          v-model="data.rate"
                          :readonly="hasRelatedTrans"
                          :rules="rules.required"
                          label="Nilai Tukar"
                          class="text-right mt-0"
                          required
                        ></v-currency-field>
                      </v-col>
                    </v-row> -->
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="8">
                <v-card>
                  <v-tabs v-model="tab.cust">
                    <v-tab key="cust">Pelanggan</v-tab>
                    <v-tab key="promo">Promo</v-tab>
                    <v-tab key="payment">Pembayaran</v-tab>
                    <v-tab key="others">Lainnya</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.cust" class="pa-2">
                    <v-tab-item
                      key="cust"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="4">
                          <v-autocomplete
                            v-model="data.custCode"
                            :items="customers"
                            :item-text="item => `${item.code} - ${item.initial}`"
                            :readonly="hasRelatedTrans"
                            :rules="rules.required"
                            label="Kode"
                            item-value="code"
                            class="mt-0"
                            required
                            @change="custCodeChange();"
                          ></v-autocomplete>
                        </v-col>

                        <v-col cols="8" class="pl-1">
                          <v-text-field
                            v-model="data.custName"
                            :rules="rules.required"
                            label="Nama"
                            class="mt-0"
                            readonly
                            required
                          >
                            <template v-slot:append-outer>
                              <v-btn
                                :disabled="hasRelatedTrans"
                                color="primary"
                                icon
                                @click="showFindCustDialog"
                              >
                                <v-icon>
                                  mdi-account-search
                                </v-icon>
                              </v-btn>
                            </template>
                          </v-text-field>
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
                      key="promo"
                      transition="false"
                    >
                      <v-data-table
                        :headers="gridPromo.columns"
                        :items="gridPromo.data"
                        :items-per-page="-1"
                        height="300"
                        class="elevation-1"
                        dense
                        disable-sort
                        fixed-header
                        hide-default-footer
                      >
                        <template v-slot:[`item.action`]="{ item }">
                          <v-checkbox
                            v-model="item.usePromo"
                            :disabled="hasRelatedTrans"
                          >
                          </v-checkbox>
                        </template>
                      </v-data-table>
                      <v-card-text>
                        <span >
                          <span class="red--text">Note: Promo akan dihitung ulang ketika transaksi disimpan dengan syarat dan ketentuan promo yang berlaku.</span>
                        </span>
                      </v-card-text>
                    </v-tab-item>

                    <v-tab-item
                      key="payment"
                      transition="false"
                    >
                      <!-- <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.billAddr"
                            :items="deliveries"
                            label="Biling Address"
                            class="mt-0"
                          ></v-autocomplete>
                        </v-col>
                      </v-row> -->

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                          v-model="data.paymentTermId"
                          :items="paymentTerms"
                          :item-text="item => `${item.initial} - ${item.name}`"
                          :rules="rules.required"
                          :disabled="hasRelatedTrans"
                          label="Pembayaran"
                          item-value="id"
                          class="mt-0"
                          >
                          </v-autocomplete>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                          v-model="data.billingAddressId"
                          :items="customerAddresses"
                          :rules="rules.required"
                          item-text="initial"
                          label="Alamat Tagih"
                          item-value="id"
                          class="mt-0"
                          >
                          </v-autocomplete>
                        </v-col>
                      </v-row>
                    </v-tab-item>
                    
                    <v-tab-item
                      key="others"
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
                            label="Gudang"
                            item-value="code"
                            class="mt-0"
                            :disabled="!auth.allowChangeWarehouse"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="data.includeTax"
                            :disabled="hasRelatedTrans"
                            label="Termasuk Pajak"
                            class="shrink mt-0"
                            @change="calcTax"
                          ></v-checkbox>
                        </v-col>
                      </v-row>

                      <!-- <v-row no-gutters>
                        <v-col cols="12">
                          <v-menu
                            v-model="menu.deliveryDate"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            min-width="290px"
                            offset-y
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-bind="attrs"
                                v-on="on"
                                :rules="rules.date"
                                :value="formatDeliveryDate"
                                label="Delivery Date"
                                class="mt-0"
                                readonly
                                required
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="data.deliveryDate"
                              :min="dataStartDate"
                              no-title
                              scrollable
                              @input="menu.deliveryDate = false"
                            ></v-date-picker>
                          </v-menu>
                        </v-col>
                      </v-row> -->
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
                    <v-tab key="bonus"><v-badge
                      :content="gridBonus.data.length"
                      :value="gridBonus.data.length"
                      color="red"
                    >
                    Bonus
                    </v-badge>
                    </v-tab>
                    <v-tab key="related-trans">Transaksi Terkait</v-tab>

                    <v-tab-item
                      key="item"
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
                                  color="red"
                                  icon
                                  small
                                  @click="removeItem(item)"
                                  :disabled="hasRelatedTrans || (!auth.allowInsert && (data.action === 'edit' && !auth.allowUpdate))"
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
                              :readonly="hasRelatedTrans"
                              :rules="rules.required"
                              item-text="initial"
                              item-value="id"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="itemIdChange(item);"
                            >
                              <template v-slot:append>
                                <v-btn
                                  color="primary"
                                  icon
                                  x-small
                                  :disabled="hasRelatedTrans"
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
                              @change="calcItemPrice(item);"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.unitName`]="{ item }">
                            <v-autocomplete
                              v-model="item.unitId"
                              :items="item.units"
                              :readonly="hasRelatedTrans"
                              :rules="rules.required"
                              item-text="unitEquivalent"
                              item-value="id"
                              class="text-body-2 text-right mt-0"
                              dense
                              required
                              @change="unitItemChange(item);"
                            ></v-autocomplete>
                          </template>
                          <template v-slot:[`item.unitPrice`]="{ item }">
                            <v-currency-field
                              v-model="item.unitPrice"
                              :readonly="hasRelatedTrans"
                              :rules="rules.above0"
                              class="text-body-2 text-right mt-0"
                              dense
                              @change="calcItemPrice(item)"
                            ></v-currency-field>
                          </template>
                          <template v-slot:[`item.disc`]="{ item }">
                            <v-currency-field
                              v-model="item.disc"
                              class="text-body-2 text-right mt-0"
                              dense
                              @change="calcItemPrice(item)"
                              readonly
                            >
                              <template v-slot:append>
                                <v-btn
                                  :disabled="hasRelatedTrans"
                                  color="primary"
                                  icon
                                  x-small
                                  @click="showPromoDialog(item)"
                                >
                                  <v-icon>
                                    mdi-settings-helper
                                  </v-icon>
                                </v-btn>
                              </template>
                            </v-currency-field>
                          </template>
                          <template v-slot:[`item.finalDiscHeader`]="{ item }">
                            {{ item.finalDiscHeader | formatCurrency }}
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
                      </v-data-table>
                    </v-tab-item>
                  </v-tabs>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12" md="5">
                <v-card>
                  <v-tabs v-model="tab.foot">
                    <v-tab key="notes">Catatan</v-tab>
                    <v-tab key="detail">Detail</v-tab>
                    <v-tab key="user">Pengguna</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.foot" class="pa-2">
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
                        rows="7"
                      ></v-textarea>
                    </v-tab-item>

                    <v-tab-item
                      key="detail"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-currency-field
                            v-model="data.dpp"
                            label="Total Sebelum Pajak"
                            class="text-right mt-0"
                            readonly
                          ></v-currency-field>
                        </v-col>
                      </v-row>
                      
                      <v-row no-gutters>
                        <v-col cols="4">
                          <v-currency-field
                            v-model="data.finalDiscPercent"
                            :allow-negative="false"
                            :readonly="hasRelatedTrans"
                            label="Persen Diskon"
                            suffix="%"
                            class="text-right mt-0"
                            @blur="discPercentChange"
                          ></v-currency-field>
                        </v-col>
                        <v-col cols="8" class="pl-1">
                          <v-currency-field
                            v-model="data.finalDisc"
                            :allow-negative="false"
                            :readonly="hasRelatedTrans"
                            label="Diskon Final"
                            class="text-right mt-0"
                            @blur="discChange"
                          ></v-currency-field>
                        </v-col>
                      </v-row>
                    </v-tab-item>

                    <v-tab-item
                      key="user"
                      transition="false"
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

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.approvedInitial"
                            label="Disetujui Oleh"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-md-1">
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

              <v-col cols="12" md="7">
                <v-card>
                  <v-card-text>
                    <v-row no-gutters>
                      <v-currency-field
                        v-model="data.subTotal"
                        label="Harga Total"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-row>

                    <v-row no-gutters>
                      <v-currency-field
                        v-model="data.taxAmount"
                        :allow-negative="false"
                        label="Jumlah Pajak"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                    </v-row>

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
    <report-viewer ref="reportViewer"></report-viewer>
    <find-customer
      ref="findCust"
      @dblclick:row="bindCustData"
    ></find-customer>
    <find-item
      ref="findItem"
      :warehouseCode="data.warehouseCode"
      @dblclick:row="bindItemData"
    ></find-item>
    <so-save-delivery
      ref="soSd"
     @closeParent="closeDlv"
    ></so-save-delivery>
    <so-save-Invoice
      ref="soSi"
     @closeParent="closeInv"
    ></so-save-Invoice>
    <so-promo
      ref="soPr"
    ></so-promo>
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
import FindCustomer from '@/components/dialog/general/FindCustomer'
import FindItem from '@/components/dialog/inventory/FindItem'
import SoSaveDelivery from '@/components/dialog/sales/SOSaveDelivery'
import SoSaveInvoice from '@/components/dialog/sales/SOSaveInvoice'
import SoPromo from '@/components/dialog/sales/SOPromo'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    ReportViewer,
    FindCustomer,
    FindItem,
    SoSaveDelivery,
    SoSaveInvoice,
    SoPromo
  },

  data: () => ({
    filterfields: [{
      text: 'Kode', value: 'code', dataType: 'text'
    }, {
      text: 'Tanggal', value: 'date', dataType: 'datetime'
    }, {
      text: 'Penjual', value: 'salesInitial', dataType: 'text'
    }, {
      text: 'Kd. Pelanggan', value: 'custCode', dataType: 'text'
    }, {
      text: 'Nama Pelanggan', value: 'custName', dataType: 'text'
    }],
    dialog: {
      add: false
    },
    menu: {
      orderDate: false,
      deliveryDate: false
    },
    tab: {
      cust: null,
      item: null,
      foot: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '150' },
        { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'19' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Penjual', value: 'salesInitial', divider: true, width: '180', excelColWidth:'23' },
        { text: 'Pelanggan', value: 'custName', divider: true, width: '220', excelColWidth:'35', customValues: ['custCode', 'custName'] },
        { text: 'Total', value: 'total', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
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
        { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
        { text: 'Satuan', value: 'unitName', divider: true, width: '90' }
      ]
    },
    gridItem: {
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Inisial', value: 'itemId', divider: true, width: '120' },
        { text: 'Nama', value: 'itemName', divider: true, width: '300' },
        { text: 'Qty', value: 'qty', align: 'right', divider: true, width: '90' },
        { text: 'Satuan', value: 'unitName', divider: true, width: '90' },
        { text: 'Harga Satuan', value: 'unitPrice', align: 'right', divider: true, width: '120' },
        { text: 'Diskon', value: 'disc', align: 'right', divider: true, width: '120' },
        { text: 'Diskon Header', value: 'finalDiscHeader', align: 'right', divider: true, width: '120' },
        { text: 'Pajak', value: 'taxAmount', align: 'right', divider: true, width: '120' },
        { text: 'Harga Nett', value: 'nettPrice', align: 'right', divider: true, width: '120' },
        { text: 'Harga Total', value: 'total', align: 'right', divider: true, width: '120' },
        { text: 'Catatan', value: 'notes', width: '200' }
      ]
    },
    gridPromo: {
      columns: [
        { text: 'Gunakan Promo', value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Nama Promo', value: 'name', divider: true, width: '120' }
      ],
      data: []
    },
    gridRelated: {
      columns: [
        { text: 'No. Dokumen', value: 'code', divider: true },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true },
        { text: 'Status', value: 'mark' }
      ],
      data: []
    },
    valid: false,
    dataStartDate: null,
    defTaxInc: false,
    employees: [],
    currencies: [],
    customers: [],
    warehouses: [],
    taxes: [],
    items: [],
    promos: [],
    paymentTerms: [],
    accounts: [],
    customerAddresses: [],
    data: {},
    allowInsertSalesInvoice: false,
    allowInsertSalesDelivery: false
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getSalesmanLists()
    // this.getCurrLists()
    this.getCustomerLists()
    this.getWarehouseLists()
    this.getTaxLists()
    this.getItemLists()
    auth.getAction(this.endpoint, this.menuId.salesOrder)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    auth.getAction(this.endpoint, this.menuId.salesDelivery, [1])
      .then((response) => {
        this.allowInsertSalesDelivery = response.data.some(x => x)
      })
    auth.getAction(this.endpoint, this.menuId.salesInvoice, [1])
      .then((response) => {
        this.allowInsertSalesInvoice = response.data.some(x => x)
      })
    this.getPaymentTermLists()
    this.getAccountLists()
    this.$store.commit('app/setFilterFields', this.filterfields)
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
        text: 'Order'
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
    },
    'data.date': {
      handler() {
        this.getPromoLists()
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
    formatOrderDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    formatDeliveryDate() {
      return this.data.deliveryDate ? format(parseISO(this.data.deliveryDate), 'dd-MMM-yyyy') : ''
    },
    hasRelatedTrans() {
      return (this.gridRelated?.data?.length > 0)
    },
    isVoid() {
      return (this.data?.mark?.toUpperCase() === 'V')
    },
    isSaveNDeliveryAble() {
      if (this.data.action === 'add') {
        return false
      } if (this.data.mark === 'A' && this.data.action === 'edit') {
        return false
      }
      return true
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
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        salesBy: null,
        currCode: 'IDR',
        rate: 1,
        custCode: null,
        custName: null,
        custAddr: null,
        custPhone: null,
        custFax: null,
        notes: null,
        dpp: 0,
        subTotal: 0,
        finalDiscPercent: 0,
        finalDisc: 0,
        includeTax: this.defTaxInc,
        taxAmount: 0,
        total: 0,
        dlvDate : format(new Date(), 'yyyy-MM-dd'),
        isSoDlv : false,
        paymentTermId: null
      }
      this.gridItem.data = []
      this.gridPromo.data = []
      this.gridBonus.data = []
      this.tab.cust = 0
      this.tab.item = 0
      this.tab.foot = 0
      
      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }

      // Set default warehouse
      this.setDefaultWarehouse()

      // const defWarehouse = this.warehouses.find(w => w.isDefault)
      // if (defWarehouse) {
      //   this.data.warehouseCode = defWarehouse.code
      // }
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

      api.getAll(this.endpoint.sales.order, {
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
              api.getAll(this.endpoint.sales.order, {
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
            operator: 'contains',
            keyword: ['DATA_START_DATE', 'DEF_SALES_TAX_INC']
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
        })
    },
    getSalesmanLists() {
      api.getAll(`${this.endpoint.general.employee}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'type',
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
          this.employees = response.data.tableData
        })
    },
    getCurrLists() {
      api.getAll(this.endpoint.master, {
        params: {
          param: 'currency',
          fieldNames: 'code',
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'EQUAL',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: 'sort',
            direction: 'asc'
          }]),
          includeMetaData: false
        }
      })
        .then(response => {
          this.currencies = response.data.tableData
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
    async getUnitItemLists(item) {
      const response = await api.getAll(`${this.endpoint.inventory.uom}/item`, {
        params: { uomId: item.uomId }
      })
      item.units = response.data.tableData
      return item.units
      // .then(response => {
      //   item.units = response.data.tableData
      // })
    },
    getPromoLists() {
      api.getAll(this.endpoint.sales.promo, {
        params: {
          filters: JSON.stringify([{
            field: 'mark',
            operator: 'eq',
            keyword: 'A'
          }, {
            field: 'startDate',
            operator: 'lte',
            keyword: this.data.date
          }, {
            field: 'endDate',
            operator: 'gte',
            keyword: this.data.date
          }])
        }
      })
        .then(response => {
          this.promos = response.data.tableData
          for (let i = 0; i < this.promos.length; i++) {
            this.getPromoDetail(this.promos[i])
            this.getPromoSubject(this.promos[i])
          }
        })
    },
    getPromoDetail(item) {
      api.getAll(`${this.endpoint.sales.promo}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          item.itemDetails = response.data.tableData
        })
    },
    getPromoSubject(item) {
      api.getAll(`${this.endpoint.sales.promo}/subject`, {
        params: { code: item.code }
      })
        .then(response => {
          item.subject = response.data.tableData
        })
    },
    getPaymentTermLists() {
      api.getAll('payment-term/lists')
        .then(response => {
          this.paymentTerms = response.data.tableData
        })
    },
    getAccountLists() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          // filters: JSON.stringify([{
          //   field: 'type',
          //   operator: 'eq',
          //   keyword: 3
          // }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.accounts = response.data.tableData
        })
    },
    getCustomerAddressesLists(item) {
      api.getAll(`${this.endpoint.general.customer.customer}/addresses`, {
        params: { code: item.code }
      })
        .then(response => {
          this.customerAddresses = response.data.tableData
          const data_c = this.customerAddresses.find(x => x.isDefault === true)
          if (data_c) {
            this.data.billingAddressId = data_c.id
          }
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
        // Set focus to order code field
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
        createdDate: (item.createdDate === null) ? null : format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: (item.updatedDate === null) ? null : format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss'),
        approvedDate: (item.approvedDate === null) ? null : format(parseISO(item.approvedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get customer details
      this.custCodeChange(true)

      // Get item details
      api.getAll(`${this.endpoint.sales.order}/item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridItem.data = response.data.tableData
          for (let i = 0; i < this.gridItem.data.length; i++) {
            this.addOldValue(this.gridItem.data[i])
          }
        })
      
      // Get item details
      api.getAll(`${this.endpoint.sales.order}/free-item`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridBonus.data = response.data.tableData
        })
        
      // Get related transaction details
      api.getAll(`${this.endpoint.sales.order}/related-trans`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridRelated.data = response.data.tableData
        })
      
      // Get Promo
      api.getAll(`${this.endpoint.sales.promo}/list`, {
        params: { code: item.code }
      })
        .then(response => {
          const data = response.data.tableData
          if (data.length > 0) {
            this.gridPromo.data = data
          } else {
            this.findPromo(true)
          }
        })

      // Set focus to order code field
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
        api.delete(this.endpoint.sales.order, item.code, {data: item})
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    print(item) {
      this.$refs.reportViewer.open('sales-order', item.code)
    },
    async save(closeDialog) {
      document.activeElement.blur()
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      
      const data = this.data
      for (let i = 0; i < this.gridItem.data.length; i++) {
        const bonusData = this.gridBonus.data.filter(x => x.orderDetailId === this.gridItem.data[i].id)
        this.gridItem.data[i].freeItemDetails = bonusData
        this.gridItem.data[i].discountItemDetails = this.gridItem.data[i].discPromo
      }
      data.itemDetails = this.gridItem.data

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.order, data)
        result = resp.data
      } else if (data.action === 'edit') {
        data.listPromo = this.gridPromo.data
        const resp = await api.update(this.endpoint.sales.order, data.code, data)
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
    saveDlv() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      const data = this.data
      data.itemDetails = this.gridItem.data
      this.$refs.soSd.open(data)
    },
    closeDlv() {
      this.dialog.add = false
      this.getList()
    },
    saveInv() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      const data = this.data
      data.itemDetails = this.gridItem.data
      this.$refs.soSi.open(data, true)
    },
    closeInv() {
      this.dialog.add = false
      this.getList()
    },
    addItem() {
      if (this.gridItem.data.length === 0 || (this.gridItem.data.slice(-1)[0].itemId ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.data.code,
          itemId: null,
          itemCode: null,
          itemName: null,
          qty: 1,
          length: null,
          width: null,
          height: null,
          weight: null,
          dimensionMeasurement: null,
          weightMeasurement: null,
          qtyDlv: 0,
          units: [],
          uomId: null,
          oldUnitId: null,
          oldUnitName: null,
          oldUnitPrice: 0,
          unitId: null,
          unitName: null,
          unitPrice: 0,
          disc: 0,
          finalDiscHeader: 0,
          taxId: null,
          taxAmount: 0,
          nettPrice: 0,
          total: 0,
          dpp: 0,
          totTax: 0,
          totDPP: 0,
          notes: null,
          state: 'A',
          discPromo: []
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
        
        // Find Promo
        //await this.findPromo()

        // Calc Promo
        //await this.calcPromo()
        
        // Calc price
        this.calcPrice()
      }
    },
    async closeOrder(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menutup  data ini?')
      ) {
        api.update(`${this.endpoint.sales.order}/close`, item.code, item)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    custCodeChange(loadEdit = false) {
      const customer = this.customers.find(s => s.code === this.data.custCode)
      if (customer) {
        this.data.custName = customer.name
        this.data.custAddr = customer.address1
        this.data.custPhone = customer.phone1
        this.data.custFax = customer.fax
        if (!loadEdit) {
          this.data.paymentTermId = customer.paymentTermId
        }
        this.data.custTypeId = customer.typeId
        this.getCustomerAddressesLists(customer)
      }
    },
    itemIdChange(item) {
      const data_i = this.items.find(i => i.id === item.itemId)
      if (data_i) {
        item.itemId = data_i.id
        item.itemName = data_i.name
        item.categoryId = data_i.categoryId
        item.qty = 1
        item.length = data_i.length
        item.width = data_i.width
        item.height = data_i.height
        item.weight = data_i.weight
        item.dimensionMeasurement = data_i.dimensionMeasurement
        item.weightMeasurement = data_i.weightMeasurement
        item.qtyDlv = 0
        item.uomId = data_i.uomId
        item.oldUnitId = data_i.uomSellId
        item.oldUnitName = data_i.uomSellName
        item.oldUnitPrice = data_i.sellPrice
        item.unitId = data_i.uomSellId
        item.unitName = data_i.uomSellName
        item.unitPrice = data_i.sellPrice
        item.itemSellPrice = data_i.sellPrice
        item.disc = 0
        item.taxId = data_i.salesTaxId
        item.taxAmount = 0
        item.nettPrice = data_i.sellPrice
        item.total = data_i.sellPrice
        item.dpp = data_i.sellPrice
        item.totTax = 0
        item.totDPP = data_i.sellPrice
        item.notes = null
        item.coaInventory = data_i.coaInventory
        item.coaCogs = data_i.coaCogs
        item.coaSls = data_i.coaSls
        item.coaSlsDisc = data_i.coaSlsDisc
        item.coaSlsReturn = data_i.coaSlsReturn
        if (item.state !== 'A') {
          item.state = 'M'
        }

        // Get unit item lists
        this.getUnitItemLists(item)

        // Calc unit item lists
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
      this.calcItemTax(item)
      item.total = item.qty * item.nettPrice
      item.totTax = item.qty * item.taxAmount
      item.totDPP = item.qty * item.dpp

      if (calcPrice) {
        this.calcPrice()
      }
    },
    discPercentChange() {
      this.data.finalDisc = Math.round(this.data.dpp * (this.data.finalDiscPercent / 100))
      this.calcGrandTotal()
    },
    discChange() {
      this.data.finalDiscPercent = this.data.finalDisc / this.data.dpp * 100
      this.calcGrandTotal()
    },
    calcTax() {
      for (let i = 0; i < this.gridItem.data.length; i++) {
        this.calcItemPrice(this.gridItem.data[i], false)
      }
      this.calcPrice()
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
    showFindCustDialog() {
      this.$refs.findCust.open()
    },
    showFindItemDialog(item) {
      this.$refs.findItem.open(item)
    },
    showPromoDialog(item) {
      this.$refs.soPr.open(item, this.accounts)
    },
    bindCustData(item) {
      this.data.custCode = item.code
      this.data.custName = item.name
      this.data.custAddr = item.address1
      this.data.custPhone = item.phone
      this.data.custFax = item.fax
      this.data.paymentTermId = item.paymentTermId
      this.data.custTypeId = item.typeId
      this.getCustomerAddressesLists(item)
    },
    bindItemData(rowItem) {
      this.itemIdChange(rowItem)

      //find Promo
      //this.findPromo()
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    async findPromo(fromEdit = false) {
      const gridData = this.gridItem.data
      this.gridPromo.data = []
      for (let k = 0; k < gridData.length; k++) {
        for (let i = 0; i < this.promos.length; i++) {
          let appliedHeader = false
          const applied = this.promos[i].itemDetails.find(x => x.itemId === gridData[k].itemId || x.itemId === gridData[k].categoryId)
          if (this.promos[i].applyTo === 1) {
            appliedHeader = true
          } else if (this.promos[i].applyTo === 2) {
            const resPromo = this.promos[i].subject.find(x => x.custCode === this.data.custCode)
            if (resPromo) {
              appliedHeader = true
            }
          } else if (this.promos[i].applyTo === 3) {
            const resPromo = this.promos[i].subject.find(x => x.custTypeId === this.data.custTypeId)
            if (resPromo) {
              appliedHeader = true
            }
          }
          if (applied && appliedHeader) {
            if (!this.gridPromo.data.includes(this.promos[i])) {
              if (fromEdit) {
                this.promos[i].usePromo = false
              } else {
                this.promos[i].usePromo = true
              }
              this.gridPromo.data.push(this.promos[i])
            }
          }
        }
      }
    },
    // async calcPromo() {
    //   const dataPromo = this.gridPromo.data.filter(x => x.usePromo === true)
    //   const gridData = this.gridItem.data
    //   const bonusPromo = [] 
    //   for (let k = 0; k < gridData.length; k++) {
    //     if (dataPromo.length > 0) {
    //       let totalDisc = 0 
    //       const discPromo = []
    //       for (let i = 0; i < dataPromo.length; i++) {
    //         for (let j = 0; j < dataPromo[i].itemDetails.length; j++) {
    //           const applyTo = dataPromo[i].itemDetails[j].applyTo
    //           if (applyTo === 1) {
    //             if (dataPromo[i].itemDetails[j].itemId === gridData[k].itemId) {
    //               if (dataPromo[i].itemDetails[j].promoType === 1) {
    //                 // Apply to Barang - Promo Method Reguler
    //                 if (dataPromo[i].itemDetails[j].isPercentage) {
    //                   totalDisc += gridData[k].unitPrice * (dataPromo[i].itemDetails[j].valuePercentage / 100)
    //                   discPromo.push({
    //                     id: randomNumber(-1, -1000),
    //                     promoDetailId: dataPromo[i].itemDetails[j].id,
    //                     promoCode: dataPromo[i].code,
    //                     name: dataPromo[i].name, 
    //                     promoMethod: 1, 
    //                     value: dataPromo[i].itemDetails[j].valuePercentage, 
    //                     nettPrice: 0, 
    //                     coaCode: dataPromo[i].coaCost, 
    //                     amount: gridData[k].unitPrice * (dataPromo[i].itemDetails[j].valuePercentage / 100), 
    //                     fromPromo: true, 
    //                     isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                   })
    //                 } else {
    //                   totalDisc += dataPromo[i].itemDetails[j].valueAmount
    //                   discPromo.push({
    //                     id: randomNumber(-1, -1000),
    //                     promoDetailId: dataPromo[i].itemDetails[j].id,
    //                     promoCode: dataPromo[i].code,
    //                     name: dataPromo[i].name, 
    //                     promoMethod: 2, 
    //                     value: dataPromo[i].itemDetails[j].valueAmount,  
    //                     nettPrice: 0, 
    //                     coaCode: dataPromo[i].coaCost, 
    //                     amount: dataPromo[i].itemDetails[j].valueAmount, 
    //                     fromPromo: true, 
    //                     isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                   })
    //                 }
    //               } else if (dataPromo[i].itemDetails[j].promoType === 2) {
    //                 // Apply to Barang - Promo Method Qty Barang
    //                 const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => gridData[k].qty >= x.fromQty && gridData[k].qty <= x.toQty)
    //                 if (tierData) {
    //                   if (dataPromo[i].itemDetails[j].isPercentage) {
    //                     if (tierData.applyToAllUnit) {
    //                       const promoUnit = gridData[k].units.find(x => x.id === tierData.saleUnit)
    //                       const itemUnit = gridData[k].units.find(x => x.id === gridData[k].unitId)
    //                       if (itemUnit.seq >= promoUnit.seq) {
    //                         totalDisc += gridData[k].unitPrice * (tierData.value / 100)
    //                         discPromo.push({
    //                           id: randomNumber(-1, -1000),
    //                           promoDetailId: dataPromo[i].itemDetails[j].id,
    //                           promoCode: dataPromo[i].code,
    //                           name: dataPromo[i].name, 
    //                           promoMethod: 1, 
    //                           value: tierData.value, 
    //                           nettPrice: 0, 
    //                           coaCode: dataPromo[i].coaCost, 
    //                           amount: gridData[k].unitPrice * (tierData.value / 100), 
    //                           fromPromo: true, 
    //                           isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                         })
    //                       }
    //                     } else if (gridData[k].unitId === tierData.saleUnit) {
    //                       totalDisc += gridData[k].unitPrice * (tierData.value / 100)
    //                       discPromo.push({
    //                         id: randomNumber(-1, -1000),
    //                         promoDetailId: dataPromo[i].itemDetails[j].id,
    //                         promoCode: dataPromo[i].code,
    //                         name: dataPromo[i].name, 
    //                         promoMethod: 1, 
    //                         value: tierData.value, 
    //                         nettPrice: 0, 
    //                         coaCode: dataPromo[i].coaCost, 
    //                         amount: gridData[k].unitPrice * (tierData.value / 100), 
    //                         fromPromo: true, 
    //                         isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                       })
    //                     }
    //                   } else if (tierData.applyToAllUnit) {
    //                     const promoUnit = gridData[k].units.find(x => x.id === tierData.saleUnit)
    //                     const itemUnit = gridData[k].units.find(x => x.id === gridData[k].unitId)
    //                     if (itemUnit.seq >= promoUnit.seq) {
    //                       totalDisc += tierData.value
    //                       discPromo.push({
    //                         id: randomNumber(-1, -1000),
    //                         promoDetailId: dataPromo[i].itemDetails[j].id,
    //                         promoCode: dataPromo[i].code,
    //                         name: dataPromo[i].name, 
    //                         promoMethod: 2, 
    //                         value: tierData.value, 
    //                         nettPrice: 0, 
    //                         coaCode: dataPromo[i].coaCost, 
    //                         amount: tierData.value, 
    //                         fromPromo: true, 
    //                         isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                       })
    //                     }
    //                   } else if (gridData[k].unitId === tierData.saleUnit) {
    //                     totalDisc += tierData.value
    //                     discPromo.push({
    //                       id: randomNumber(-1, -1000),
    //                       promoDetailId: dataPromo[i].itemDetails[j].id,
    //                       promoCode: dataPromo[i].code,
    //                       name: dataPromo[i].name, 
    //                       promoMethod: 2, 
    //                       value: tierData.value, 
    //                       nettPrice: 0, 
    //                       coaCode: dataPromo[i].coaCost, 
    //                       amount: tierData.value, 
    //                       fromPromo: true, 
    //                       isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                     })
    //                   }
    //                 }
    //               } else if (dataPromo[i].itemDetails[j].promoType === 3) {
    //                 // Apply to Barang - Promo Method Bonus
    //                 const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => gridData[k].qty >= x.fromQty && gridData[k].qty <= x.toQty)
    //                 if (tierData) {
    //                   if (tierData.isMultiple) {
    //                     if (gridData[k].unitId === tierData.saleUnit) {
    //                       const freeItem = _cloneDeep(this.items.find(x => x.id === tierData.freeGoodItemId))
    //                       freeItem.units = await this.getUnitItemLists(freeItem)
    //                       freeItem.itemId = freeItem.id
    //                       this.itemIdChange(freeItem)
    //                       freeItem.unitId = parseInt(tierData.unitFreeGood)
    //                       this.unitItemChange(freeItem)
    //                       freeItem.unitName = freeItem.units.find(x => x.id === parseInt(tierData.unitFreeGood)).unitEquivalent
    //                       const multipleValue = Math.floor(gridData[k].qty / tierData.fromQty)
    //                       const item = {
    //                         id: randomNumber(-1, -1000),
    //                         initial: freeItem.initial,
    //                         name: freeItem.name,
    //                         orderDetailId: gridData[k].id,
    //                         promoCode: dataPromo[i].code,
    //                         uomId: freeItem.uomId,
    //                         itemId: tierData.freeGoodItemId,
    //                         unitId: tierData.unitFreeGood,
    //                         unitName: freeItem.unitName,
    //                         qty: tierData.value * multipleValue,
    //                         qtyClosed: 0,
    //                         unitPrice: freeItem.unitPrice,
    //                         coaCode: dataPromo[i].coaCost
    //                       }
    //                       bonusPromo.push(item)
    //                     }
    //                   } else if (gridData[k].unitId === tierData.saleUnit) {
    //                     const freeItem = _cloneDeep(this.items.find(x => x.id === tierData.freeGoodItemId))
    //                     freeItem.units = await this.getUnitItemLists(freeItem)
    //                     freeItem.itemId = freeItem.id
    //                     this.itemIdChange(freeItem)
    //                     freeItem.unitId = parseInt(tierData.unitFreeGood)
    //                     this.unitItemChange(freeItem)
    //                     freeItem.unitName = freeItem.units.find(x => x.id === parseInt(tierData.unitFreeGood)).unitEquivalent
    //                     const item = {
    //                       id: randomNumber(-1, -1000),
    //                       initial: freeItem.initial,
    //                       name: freeItem.name,
    //                       orderDetailId: gridData[k].id,
    //                       promoCode: dataPromo[i].code,
    //                       uomId: freeItem.uomId,
    //                       itemId: tierData.freeGoodItemId,
    //                       unitId: tierData.unitFreeGood,
    //                       unitName: freeItem.unitName,
    //                       qty: tierData.value,
    //                       qtyClosed: 0,
    //                       unitPrice: freeItem.unitPrice,
    //                       coaCode: dataPromo[i].coaCost
    //                     }
    //                     bonusPromo.push(item)
    //                   }
    //                 }
    //               } else if (dataPromo[i].itemDetails[j].promoType === 4) {
    //                 // Apply to Barang - Promo Method Payment Term
    //                 const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => x.paymentTermId === this.data.paymentTermId)
    //                 if (tierData) {
    //                   if (tierData.isPercentage) {
    //                     totalDisc += gridData[k].unitPrice * (tierData.value / 100)
    //                     discPromo.push({
    //                       id: randomNumber(-1, -1000),
    //                       promoDetailId: dataPromo[i].itemDetails[j].id,
    //                       promoCode: dataPromo[i].code,
    //                       name: dataPromo[i].name, 
    //                       promoMethod: 1, 
    //                       value: tierData.value, 
    //                       nettPrice: 0, 
    //                       coaCode: dataPromo[i].coaCost, 
    //                       amount: gridData[k].unitPrice * (tierData.value / 100), 
    //                       fromPromo: true, 
    //                       isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                     })
    //                   } else {
    //                     totalDisc += tierData.value
    //                     discPromo.push({
    //                       id: randomNumber(-1, -1000),
    //                       promoDetailId: dataPromo[i].itemDetails[j].id,
    //                       promoCode: dataPromo[i].code, 
    //                       name: dataPromo[i].name, 
    //                       promoMethod: 2, 
    //                       value: tierData.value, 
    //                       nettPrice: 0, 
    //                       coaCode: dataPromo[i].coaCost, 
    //                       amount: tierData.value, 
    //                       fromPromo: true, 
    //                       isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                     })
    //                   }
    //                 }
    //               }
    //             }
    //           } else if (applyTo === 3) {
    //             const dtItem = this.items.find(i => i.id === gridData[k].itemId)
    //             if (dtItem.categoryId === dataPromo[i].itemDetails[j].itemId) {
    //               if (dataPromo[i].itemDetails[j].promoType === 1) {
    //                 // Apply to Kategori Barang - Promo Method Reguler
    //                 if (dataPromo[i].itemDetails[j].isPercentage) {
    //                   totalDisc += gridData[k].unitPrice * (dataPromo[i].itemDetails[j].valuePercentage / 100)
    //                   discPromo.push({
    //                     id: randomNumber(-1, -1000),
    //                     promoDetailId: dataPromo[i].itemDetails[j].id,
    //                     promoCode: dataPromo[i].code,
    //                     name: dataPromo[i].name, 
    //                     promoMethod: 1, 
    //                     value: dataPromo[i].itemDetails[j].valuePercentage, 
    //                     nettPrice: 0, 
    //                     coaCode: dataPromo[i].coaCost, 
    //                     amount: gridData[k].unitPrice * (dataPromo[i].itemDetails[j].valuePercentage / 100), 
    //                     fromPromo: true, 
    //                     isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                   })
    //                 } else {
    //                   totalDisc += dataPromo[i].itemDetails[j].valueAmount
    //                   discPromo.push({
    //                     id: randomNumber(-1, -1000),
    //                     promoDetailId: dataPromo[i].itemDetails[j].id,
    //                     promoCode: dataPromo[i].code, 
    //                     name: dataPromo[i].name, 
    //                     promoMethod: 2, 
    //                     value: dataPromo[i].itemDetails[j].valueAmount, 
    //                     nettPrice: 0, 
    //                     coaCode: dataPromo[i].coaCost, 
    //                     amount: dataPromo[i].itemDetails[j].valueAmount, 
    //                     fromPromo: true, 
    //                     isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                   })
    //                 }
    //               } else if (dataPromo[i].itemDetails[j].promoType === 2) {
    //                 // Apply to Kategori Barang - Promo Method Qty Barang
    //                 const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => gridData[k].qty >= x.fromQty && gridData[k].qty <= x.toQty)
    //                 if (tierData) {
    //                   if (dataPromo[i].itemDetails[j].isPercentage) {
    //                     totalDisc += gridData[k].unitPrice * (tierData.value / 100)
    //                     discPromo.push({
    //                       id: randomNumber(-1, -1000),
    //                       promoDetailId: dataPromo[i].itemDetails[j].id,
    //                       promoCode: dataPromo[i].code, 
    //                       name: dataPromo[i].name, 
    //                       promoMethod: 1, 
    //                       value: tierData.value, 
    //                       nettPrice: 0, 
    //                       coaCode: dataPromo[i].coaCost, 
    //                       amount: gridData[k].unitPrice * (tierData.value / 100), 
    //                       fromPromo: true, 
    //                       isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                     })
    //                   } else {
    //                     totalDisc += tierData.value
    //                     discPromo.push({
    //                       id: randomNumber(-1, -1000),
    //                       promoDetailId: dataPromo[i].itemDetails[j].id,
    //                       promoCode: dataPromo[i].code,
    //                       name: dataPromo[i].name, 
    //                       promoMethod: 2, 
    //                       value: tierData.value, 
    //                       nettPrice: 0, 
    //                       coaCode: dataPromo[i].coaCost, 
    //                       amount: tierData.value, 
    //                       fromPromo: true, 
    //                       isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                     })
    //                   }
    //                 }
    //               } else if (dataPromo[i].itemDetails[j].promoType === 3) {
    //                 // Apply to Kategori Barang - Promo Method Bonus
    //                 const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => gridData[k].qty >= x.fromQty && gridData[k].qty <= x.toQty)
    //                 if (tierData) {
    //                   if (tierData.isMultiple) {
    //                     if (gridData[k].unitId === tierData.saleUnit) {
    //                       const freeItem = _cloneDeep(this.items.find(x => x.id === tierData.freeGoodItemId))
    //                       freeItem.units = await this.getUnitItemLists(freeItem)
    //                       freeItem.itemId = freeItem.id
    //                       this.itemIdChange(freeItem)
    //                       freeItem.unitId = parseInt(tierData.unitFreeGood)
    //                       this.unitItemChange(freeItem)
    //                       freeItem.unitName = freeItem.units.find(x => x.id === parseInt(tierData.unitFreeGood)).unitEquivalent
    //                       const multipleValue = Math.floor(gridData[k].qty / tierData.fromQty)
    //                       const item = {
    //                         id: randomNumber(-1, -1000),
    //                         initial: freeItem.initial,
    //                         name: freeItem.name,
    //                         orderDetailId: gridData[k].id,
    //                         promoCode: dataPromo[i].code,
    //                         uomId: freeItem.uomId,
    //                         itemId: tierData.freeGoodItemId,
    //                         unitId: tierData.unitFreeGood,
    //                         unitName: freeItem.unitName,
    //                         qty: tierData.value * multipleValue,
    //                         qtyClosed: 0,
    //                         unitPrice: freeItem.unitPrice,
    //                         coaCode: dataPromo[i].coaCost
    //                       }
    //                       bonusPromo.push(item)
    //                     }
    //                   } else if (gridData[k].unitId === tierData.saleUnit) {
    //                     const freeItem = _cloneDeep(this.items.find(x => x.id === tierData.freeGoodItemId))
    //                     freeItem.units = await this.getUnitItemLists(freeItem)
    //                     freeItem.itemId = freeItem.id
    //                     this.itemIdChange(freeItem)
    //                     freeItem.unitId = parseInt(tierData.unitFreeGood)
    //                     this.unitItemChange(freeItem)
    //                     freeItem.unitName = freeItem.units.find(x => x.id === parseInt(tierData.unitFreeGood)).unitEquivalent
    //                     const item = {
    //                       id: randomNumber(-1, -1000),
    //                       initial: freeItem.initial,
    //                       name: freeItem.name,
    //                       orderDetailId: gridData[k].id,
    //                       promoCode: dataPromo[i].code,
    //                       uomId: freeItem.uomId,
    //                       itemId: tierData.freeGoodItemId,
    //                       unitId: tierData.unitFreeGood,
    //                       unitName: freeItem.unitName,
    //                       qty: tierData.value,
    //                       qtyClosed: 0,
    //                       unitPrice: freeItem.unitPrice,
    //                       coaCode: dataPromo[i].coaCost
    //                     }
    //                     bonusPromo.push(item)
    //                   }
    //                 }
    //               } else if (dataPromo[i].itemDetails[j].promoType === 4) {
    //                 // Apply to Kategori Barang - Promo Method Payment Term
    //                 const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => x.paymentTermId === this.data.paymentTermId)
    //                 if (tierData) {
    //                   if (tierData.isPercentage) {
    //                     totalDisc += gridData[k].unitPrice * (tierData.value / 100)
    //                     discPromo.push({
    //                       id: randomNumber(-1, -1000),
    //                       promoDetailId: dataPromo[i].itemDetails[j].id,
    //                       promoCode: dataPromo[i].code,
    //                       name: dataPromo[i].name, 
    //                       promoMethod: 1, 
    //                       value: tierData.value, 
    //                       nettPrice: 0, 
    //                       coaCode: dataPromo[i].coaCost, 
    //                       amount: gridData[k].unitPrice * (tierData.value / 100), 
    //                       fromPromo: true, 
    //                       isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                     })
    //                   } else {
    //                     totalDisc += tierData.value
    //                     discPromo.push({
    //                       id: randomNumber(-1, -1000),
    //                       promoDetailId: dataPromo[i].itemDetails[j].id,
    //                       promoCode: dataPromo[i].code, 
    //                       name: dataPromo[i].name, 
    //                       promoMethod: 2, 
    //                       value: tierData.value, 
    //                       nettPrice: 0, 
    //                       coaCode: dataPromo[i].coaCost, 
    //                       amount: tierData.value, 
    //                       fromPromo: true, 
    //                       isPercentage: dataPromo[i].itemDetails[j].isPercentage
    //                     })
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }

    //       if (discPromo.length > 0 && gridData[k].discPromo.length === 0) {
    //         gridData[k].discPromo = discPromo
    //         gridData[k].disc = totalDisc
    //         this.unitItemChangePromo(gridData[k])
    //         this.calcItemPrice(gridData[k], false)
    //       } else if (discPromo.length > 0 && gridData[k].discPromo.length > 0) {
    //         const nDiscPromo = []
    //         for (let ip = 0; ip < discPromo.length; ip++) {
    //           const dPromo = gridData[k].discPromo.find(x => x.promoDetailId === discPromo[ip].promoDetailId)
    //           if (!dPromo) {
    //             if (!('oldValue' in discPromo[ip]) && !discPromo[ip].isPercentage) {
    //               discPromo[ip].oldValue = discPromo[ip].value
    //             }
    //             nDiscPromo.push(discPromo[ip])
    //           }
    //         }

    //         for (let iq = 0; iq < gridData[k].discPromo.length; iq++) {
    //           if (!('oldValue' in gridData[k].discPromo[iq]) && !gridData[k].discPromo[iq].isPercentage) {
    //             gridData[k].discPromo[iq].oldValue = gridData[k].discPromo[iq].value
    //           }
    //           nDiscPromo.push(gridData[k].discPromo[iq])
    //         }
    //         if (nDiscPromo.length > 0) {
    //           gridData[k].discPromo = nDiscPromo
    //           gridData[k].disc = _sumBy(gridData[k].discPromo, 'amount') 
    //           this.unitItemChangePromo(gridData[k])
    //           this.calcItemPrice(gridData[k], false)
    //         }
    //       } else if (discPromo.length === 0) {
    //         const nDiscPromo = []
    //         for (let iq = 0; iq < gridData[k].discPromo.length; iq++) {
    //           if (!('oldValue' in gridData[k].discPromo[iq]) && !gridData[k].discPromo[iq].isPercentage) {
    //             gridData[k].discPromo[iq].oldValue = gridData[k].discPromo[iq].value
    //           }
    //           nDiscPromo.push(gridData[k].discPromo[iq])
    //         }
    //         if (nDiscPromo.length > 0) {
    //           gridData[k].discPromo = nDiscPromo
    //           gridData[k].disc = _sumBy(gridData[k].discPromo, 'amount') 
    //           this.unitItemChangePromo(gridData[k])
    //           this.calcItemPrice(gridData[k], false)
    //         } else {
    //           gridData[k].discPromo = []
    //           gridData[k].disc = 0
    //           this.calcItemPrice(gridData[k], false)
    //         }
    //       }
    //     } else {
    //       const nDiscPromo = []
    //       for (let iq = 0; iq < gridData[k].discPromo.length; iq++) {
    //         if (!('promoDetailId' in gridData[k].discPromo[iq]) || gridData[k].discPromo[iq].promoDetailId === null) {
    //           nDiscPromo.push(gridData[k].discPromo[iq])
    //         }
    //       }
    //       if (nDiscPromo.length > 0) {
    //         gridData[k].discPromo = nDiscPromo
    //         gridData[k].disc = _sumBy(gridData[k].discPromo, 'amount')
    //         this.unitItemChangePromo(gridData[k])
    //         this.calcItemPrice(gridData[k], false)
    //       } else {
    //         gridData[k].discPromo = []
    //         gridData[k].disc = 0
    //         this.calcItemPrice(gridData[k], false)
    //       }
    //     }
        
    //   }
    //   this.gridBonus.data = bonusPromo
    //   this.calcPrice()    
    // },
    setDefaultWarehouse() {
      const employee = this.employees.find(x => x.id === this.data.salesBy)
      const defWarehouse = this.warehouses.find(w => w.isDefault)
      if (employee && employee.warehouseCode) {
        this.data.warehouseCode = employee.warehouseCode
      } else if (defWarehouse) {
        this.data.warehouseCode = defWarehouse.code
      }
    },
    changeSales() {
      this.setDefaultWarehouse()
    },
    unitItemChangePromo(item) {
      if (item.discPromo.length > 0) {
        const oldUnit = item.units.find(u => u.id === item.oldUnitId)
        const unit = item.units.find(u => u.id === item.unitId)
        for (let i = 0; i < item.discPromo.length; i++) {
          if (i === 0) {
            if (item.discPromo[i].promoMethod === 1  || item.discPromo[i].isPercentage) {
              item.discPromo[i].amount = item.unitPrice * (item.discPromo[i].value / 100)
            } else if (item.uomConversion !== undefined) {
              const cseq = oldUnit.seq < unit.seq
              const vle = 'oldValue' in item.discPromo[i] ? item.discPromo[i].oldValue : item.discPromo[i].value
              item.discPromo[i].amount = cseq ? vle * item.uomConversion : vle / item.uomConversion
              item.discPromo[i].value = item.discPromo[i].amount
            }
            const calcValue = item.unitPrice - item.discPromo[i].amount
            item.discPromo[i].nettPrice = calcValue < 0 ? 0 : calcValue
            item.disc = item.discPromo[i].amount
          } else {
            if (item.discPromo[i].promoMethod === 1  || item.discPromo[i].isPercentage) {
              item.discPromo[i].amount = item.nettPrice * (item.discPromo[i].value / 100)
            } else if (item.uomConversion !== undefined) {              
              const cseq = oldUnit.seq < unit.seq
              const vle = 'oldValue' in item.discPromo[i] ? item.discPromo[i].oldValue : item.discPromo[i].value
              item.discPromo[i].amount = cseq ? vle * item.uomConversion : vle / item.uomConversion
              item.discPromo[i].value = item.discPromo[i].amount
            }
            const calcValue = item.nettPrice - item.discPromo[i].amount
            item.discPromo[i].nettPrice = calcValue < 0 ? 0 : calcValue
            item.disc += item.discPromo[i].amount
          }
          const calcValue = item.unitPrice - item.disc
          item.nettPrice = calcValue < 0 ? 0 : calcValue
        }
      } else {
        item.disc = 0
        item.nettPrice = item.unitPrice
      }
    },
    addOldValue(item) {
      if (item.discPromo.length > 0) {
        for (let i = 0; i < item.discPromo.length; i++) {
          const cPercent = Math.round(item.discPromo[i].value / item.unitPrice * 100)
          const cValue = Math.round(item.oldUnitPrice * (cPercent / 100))
          item.discPromo[i].oldValue = cValue
        }
      }
    }
  }
}
</script>
