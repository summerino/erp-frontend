<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="2">
            Faktur Penjualan
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
                <span class="text-caption">Pencarian Lanjutan</span>
              </v-tooltip>
              <export-excel
                ref="exportExcel"
                :company="companyName"
                :filters="filter"
                :grid="grid"
                :gridDefOpts="gridDefOpts"
                title="Daftar Faktur Penjualan"
              ></export-excel>
            </v-row>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
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
                  :disabled="!auth.allowCreate"
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
                  :disabled="!auth.allowCreate"
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
                  :disabled="!auth.allowCreate"
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
                @click="print('inv', item)"
              >
                <v-list-item-title>
                  <span class="text-caption">
                    Cetak Faktur Penjualan
                  </span>
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                dense
                @click="print('receipt', item)"
              >
                <v-list-item-title>
                  <span class="text-caption">
                    Cetak Tanda Terima Faktur
                  </span>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.custName`]="{ item }">
          {{ item.custCode }} - {{ item.custName }}
        </template>
        <template v-slot:[`item.salesName`]="{ item }">
          {{ item.salesInitial }} - {{ item.salesName }}
        </template>
        <template v-slot:[`item.fromDirectInvoice`]="{ item }">
          {{ item.fromDirectInvoice ? 'Penjualan Langsung' : 'Faktur Penjualan' }}
        </template>
        <template v-slot:[`item.total`]="{ item }">
          {{ item.total | formatCurrency }}
        </template>
        <template v-slot:[`item.paidAmount`]="{ item }">
          {{ item.paidAmount | formatCurrency }}
        </template>
        <template v-slot:[`item.remaining`]="{ item }">
          {{ item.remaining | formatCurrency }}
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
                  v-shortkey="['ctrl', 'alt', 'i']"
                  :disabled="isVoid || (data.action === 'edit' && !auth.allowPrint) || data.action === 'add'"
                  dark
                  text
                  @click="print('inv', data)"
                  @shortkey="print('inv', data)"
                >Cetak Faktur Penjualan</v-btn>
              </template>
              <span class="text-caption">(Ctrl + Alt + I)</span>
            </v-tooltip>
            <v-divider vertical></v-divider>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'alt', 'r']"
                  :disabled="isVoid || (data.action === 'edit' && !auth.allowPrint) || data.action === 'add'"
                  dark
                  text
                  @click="print('receipt', data)"
                  @shortkey="print('receipt', data)"
                >Cetak Tanda Terima</v-btn>
              </template>
              <span class="text-caption">(Ctrl + Alt + R)</span>
            </v-tooltip>
            <v-divider vertical></v-divider>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="isVoid || hasRelatedTrans || (data.action === 'edit' && (!auth.allowUpdate || seenByOthers))"
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
                  @click="save(false)"
                  @shortkey="save(false)"
                  :disabled="isVoid || hasRelatedTrans || (data.action === 'edit' && (!auth.allowUpdate || seenByOthers))"
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
                          label="Kode"
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
                          :disabled="!auth.allowChangeDate"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-bind="attrs"
                              v-on="on"
                              :rules="rules.required"
                              :value="formatInvDate"
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
                            :min="dataStartDate"
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
                          :readonly="hasRelatedTrans"
                          :rules="rules.required"
                          label="Kode Order Penjualan"
                          class="mt-0"
                          required
                          @change="soCodeChange"
                        >
                          <template v-slot:append>
                              <v-btn
                                :disabled="hasRelatedTrans"
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
                    <v-tab key="memo">Nota</v-tab>
                    <v-tab v-if="allowSalesDownPayment" key="sales-down-payment">Uang Muka Penjualan</v-tab>
                    <v-tab key="related-trans">Transaksi Terkait</v-tab>
                    <v-tab v-if="arRecogTime === 'SI'" key="tax">Faktur Pajak</v-tab>

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
                                :disabled="isVoid || hasRelatedTrans || (data.action === 'add' && !auth.allowCreate) || (data.action === 'edit' && !auth.allowUpdate) || hasPayments"
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
                                  :disabled="isVoid || hasRelatedTrans || (data.action === 'add' && !auth.allowCreate) || (data.action === 'edit' && !auth.allowUpdate) || hasPayments"
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
                              :readonly="hasRelatedTrans || hasPayments"
                              :rules="rules.required"
                              item-text="code"
                              item-value="code"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="doCodeChange(item)"
                            >
                              <template v-slot:append>
                                <v-btn
                                  :disabled="hasRelatedTrans || hasPayments"
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
                          <template v-slot:[`item.exemptTaxAmount`]="{ item }">
                            {{ item.exemptTaxAmount | formatCurrency }}
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
                      key="memo"
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
                                v-shortkey="['ctrl', 'm']"
                                :disabled="isVoid || hasRelatedTrans || (data.action === 'add' && !auth.allowCreate) || (data.action === 'edit' && !auth.allowUpdate)"
                                class="blue--text"
                                small
                                tile
                                @click="addMemo"
                                @shortkey="addMemo"
                              >
                                <v-icon left>mdi-plus</v-icon>
                                Tambah
                              </v-btn>
                            </template>
                            <span class="text-caption">(Ctrl + M)</span>
                          </v-tooltip>
                        </v-app-bar>
                      </v-card>
                      <v-data-table
                        :headers="gridMemo.columns"
                        :items="gridMemo.data"
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
                                @click="removeMemo(item)"
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
                        <template v-slot:[`item.type`]="{ item }">
                          {{ item.type === 1 ? 'Saldo Awal' : 'Retur' }}
                        </template>
                        <template v-slot:[`item.creditMemoAmount`]="{ item }">
                          {{ item.creditMemoAmount | formatCurrency }}
                        </template>
                      </v-data-table>
                    </v-tab-item>
                    <v-tab-item
                      key="sales-down-payment"
                      transition="false"
                    >
                      <v-data-table
                        :headers="gridSalesDownPayment.columns"
                        :items="gridSalesDownPayment.data"
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
                                @click="removeMemo(item)"
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
                        <template v-slot:[`item.creditMemoAmount`]="{ item }">
                          {{ item.creditMemoAmount | formatCurrency }}
                        </template>
                        <template v-slot:[`item.creditMemoTaxAmount`]="{ item }">
                          {{ item.creditMemoTaxAmount | formatCurrency }}
                        </template>
                        <template v-slot:[`item.creditMemoTotal`]="{ item }">
                          {{ item.creditMemoTotal | formatCurrency }}
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
                      v-if="arRecogTime === 'SI'"
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
    <report-viewer ref="reportViewer"></report-viewer>
    <find-so
      ref="findSO"
      :invCode="data.code"
      caller="inv"
      @dblclick:row="bindSOData"
    ></find-so>
    <find-do
      ref="findDO"
      :so-code="data.soCode"
      :list-do-code="gridDet.data.map(x => x.doCode)"
      @dblclick:row="bindDOData"
    ></find-do>
    <memo
      ref="memo"
      :supOrCustCode="data.custCode"
      :amount="data.total"
      transType="credit"
      @bindMemo="bindMemo"
    ></memo>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO, addDays } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'
import auth from '@/services/authorization.service'
import activeTrans from '@/services/activeTransaction.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import ReportViewer from '@/components/dialog/ReportViewer'
import FindSo from '@/components/dialog/sales/FindSO'
import FindDo from '@/components/dialog/sales/FindDO'
import Memo from '@/components/dialog/Memo.vue'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    ReportViewer,
    FindSo,
    FindDo,
    Memo
  },

  data: () => ({
    filterFields: [{
      text: 'Kode', value: 'code', dataType: 'text'
    }, {
      text: 'Tanggal', value: 'date', dataType: 'datetime'
    }, {
      text: 'Tipe', 
      value: 'fromDirectInvoice', 
      dataType: 'bit', 
      options: [{ 
        text: 'Penjualan Langsung',
        value: true
      }, { 
        text: 'Faktur Penjualan',
        value: false
      }]
    }, {
      text: 'Kd.Pelanggan', value: 'custCode', dataType: 'text'
    }, {
      text: 'Nama Pelanggan', value: 'custName', dataType: 'text'
    }, {
      text: 'Inisial Penjual', value: 'salesInitial', dataType: 'text'
    }, {
      text: 'Nama Penjual', value: 'salesName', dataType: 'text'
    }, {
      text: 'Kd. Ord. Penjualan', value: 'soCode', dataType: 'text'
    }, {
      text: 'Tgl. Jatuh Tempo', value: 'dueDate', dataType: 'datetime'
    }, {
      text: 'Status', value: 'mark', dataType: 'text'
    }],
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
        { value: 'action', sortable: false, divider: true, width: '120' },
        { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'18' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'20', isDateTime: true },
        { text: 'Tipe', value: 'fromDirectInvoice', divider: true, width: '170', excelColWidth:'20', isBool: true, customValues: [{state: true, value: 'Penjualan Langsung'}, {state: false, value: 'Faktur Penjualan'}] },
        { text: 'Penjual', value: 'salesName', divider: true, width: '270', excelColWidth:'35', customValues: ['salesInitial', 'salesName'] },
        { text: 'Pelanggan', value: 'custName', divider: true, width: '270', excelColWidth:'35', customValues: ['custCode', 'custName'] },
        { text: 'Kd. Ord. Penjualan', value: 'soCode', divider: true, width: '150', excelColWidth:'18' },
        { text: 'Total', value: 'total', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
        { text: 'Nilai Sudah Dibayar', value: 'paidAmount', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
        { text: 'Sisa', value: 'remaining', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
        { text: 'Tgl. Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '120', excelColWidth:'20', isDateTime: true },
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
    gridDet: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Kode Pengiriman', value: 'doCode', divider: true, width: '200' },
        { text: 'Total Sebelum Pajak', value: 'dpp', align: 'right', divider: true, width: '120' },
        { text: 'Pajak', value: 'taxAmount', align: 'right', divider: true, width: '120' },
        { text: 'Pajak Yang Dibebaskan', value: 'exemptTaxAmount', align: 'right', divider: true, width: '120' },
        { text: 'Biaya Pengiriman', value: 'shipmentFee', align: 'right', divider: true, width: '120' },
        { text: 'Biaya Penanganan', value: 'handlingFee', align: 'right', divider: true, width: '120' },
        { text: 'Total', value: 'total', align: 'right', width: '120' }
      ],
      data: []
    },
    gridRelated: {
      columns: [
        { text: 'Kode Trans.', value: 'code', divider: true },
        { text: 'Tipe Trans.', value: 'type', divider: true },
        { text: 'Tgl. Trans.', value: 'date', align: 'right', divider: true },
        { text: 'Nilai', value: 'total', align: 'right', divider: true }
      ],
      data: []
    },
    gridMemo: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Kode', value: 'creditMemoCode', divider: true },
        { text: 'Tanggal', value: 'date', divider: true },
        { text: 'Tipe', value: 'type', divider: true },
        { text: 'Nilai', value: 'creditMemoAmount', align: 'right', divider: true }
      ],
      data: []
    },
    gridSalesDownPayment: {
      columns: [
        { text: 'Kode', value: 'creditMemoCode', divider: true },
        { text: 'Tanggal', value: 'date', divider: true },
        { text: 'Nilai Uang Muka', value: 'creditMemoAmount', align: 'right', divider: true },
        { text: 'Pajak', value: 'creditMemoTaxAmount', align: 'right', divider: true },
        { text: 'Total', value: 'creditMemoTotal', align: 'right' }
      ],
      data: []
    },
    valid: false,
    dataStartDate: null,
    employees: [],
    dlvOrders: [],
    paymentTerms: [],
    data: {},
    seenByOthers: false,
    arRecogTime: null,
    salesDownPaymentAction: []
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getEmployeeLists()
    this.getPaymentTermLists()
    this.getSysARRecog()
    auth.getAction(this.endpoint, this.menuId.salesInvoice)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    auth.getAction(this.endpoint, this.menuId.salesDownPayment)
      .then((response) => {
        this.salesDownPaymentAction = response.data
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
      companyName: state => state.api.companyName,
      filter: state => state.app.filter,
      auth: state => state.api.authorization,
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
    hasRelatedTrans() {
      return (this.gridRelated?.data?.length > 0)
    },
    isVoid() {
      return (this.data?.mark?.toUpperCase() === 'V')
    },
    formatInvoiceDate() {
      return this.data.taxInvoiceDate ? format(parseISO(this.data.taxInvoiceDate), 'dd-MMM-yyyy') : ''
    },
    allowSalesDownPayment() {
      return this.arRecogTime === 'SI' && this.salesDownPaymentAction.length > 0
    },
    hasPayments() {
      return (this.data?.mark?.toUpperCase() === 'PP' || this.data?.mark?.toUpperCase() === 'CMP')
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
        curr: 'IDR',
        notes: null,
        paidAmount: 0,
        total: 0
      }
      this.gridDet.data = []
      this.gridMemo.data = []
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
            if (item) {
              this.edit(item)
            } else {
              api.getAll(this.endpoint.sales.invoice, {
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
    async close() {
      if (this.data.action === 'edit') {
        activeTrans.released('SI', this.data.code)
      }
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
    async edit(item) {
      if (!item) return
            
      const resp = await activeTrans.locked('SI', item.code)
      this.seenByOthers = (resp?.data?.message === 'used')

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
        originalDate: item.date,
        originalDueDate: item.dueDate,
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

      // Get related transaction details
      api.getAll(`${this.endpoint.sales.directInvoice}/related-trans`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridRelated.data = response.data.tableData
        })

      // Get Memo List
      api.getAll(`${this.endpoint.sales.invoice}/memo`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridMemo.data = response.data.tableData
        })

      if (this.allowSalesDownPayment) {
        // Get Sales Down Payment List
        api.getAll(`${this.endpoint.sales.invoice}/sales-down-payment`, {
          params: { code: item.code }
        })
          .then(response => {
            this.gridSalesDownPayment.data = response.data.tableData
          })
      }

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
          'Void?',
          'Apakah anda yakin ingin membuat void data ini?')
      ) {
        api.delete(this.endpoint.sales.invoice, item.code, {data: item})
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    print(caller, item) {
      if (caller === 'inv') {
        this.$refs.reportViewer.open('sales-invoice', item.code)
      } else if (caller === 'receipt') {
        this.$refs.reportViewer.open('invoice-receipt', item.code)
      }
    },
    async save(closeDialog) {
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      
      const data = this.data
      data.details = this.gridDet.data
      data.memos = this.gridMemo.data
      data.salesDownPayments = this.gridSalesDownPayment.data

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
          exemptTaxAmount: 0,
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
    addMemo() {
      if (!this.data.soCode) {
        this.$store.dispatch('app/showInfo', 'Silahkan pilih order penjualan terlebih dahulu.')
        return
      }
      this.$refs.memo.open()
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

        // get SDP
        this.getSalesDownPayment()
      }
    },
    async removeMemo(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridMemo.data.findIndex(i => i.creditMemoCode === item.creditMemoCode)
        this.gridMemo.data.splice(idx, 1)
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
        item.exemptTaxAmount = data_d.exemptTaxAmount
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

        if (this.allowSalesDownPayment) {
          this.getSalesDownPayment()
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
    bindMemo(data) {
      for (let i = 0; i < data.length; i++) {
        this.gridMemo.data.push({
          creditMemoCode: data[i].code,
          date: data[i].date,
          type: data[i].type,
          creditMemoAmount: data[i].transAmount,
          src: 'CM'          
        })
      }
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    isMemoDuplicate() {
      const valueArr = this.gridMemo.data.map(function (item) { return item.creditMemoCode })
      const isDuplicate = valueArr.some(function (item, idx) { 
        return valueArr.indexOf(item) !== idx 
      })
      return isDuplicate
    },
    getSysARRecog() {
      const codes = ['AR_RECOG_TIME']
      api.getAll(`${this.endpoint.systemManagement.parameter}/lists`, {
        params: {
          codes: JSON.stringify(codes)
        }
      })
        .then(response => {
          this.arRecogTime = response.data.tableData[0].value
        })
    },
    clearDate(item) {
      if (item === 'tax') {
        this.data.taxInvoiceDate = null
      }
    },
    getSalesDownPayment() {
      api.getAll(this.endpoint.sales.downPayment, {
        params: {
          filters: JSON.stringify([{
            field: 'srcTrans',
            operator: 'eq',
            keyword: 3
          },
          {
            field: 'transCode',
            operator: 'eq',
            keyword: this.data.soCode
          },
          {
            field: 'mark',
            operator: 'contains',
            keyword: ['A', 'PU']
          }])
        }
      })
        .then(response => {
          const data = []
          let totalAmount = _sumBy(this.gridDet.data, 'total')
          let totalDpp = _sumBy(this.gridDet.data, 'dpp')
          let totalTaxAmount = _sumBy(this.gridDet.data, 'taxAmount') - _sumBy(this.gridDet.data, 'exemptTaxAmount')
          for (let i = 0; i < response.data.tableData.length; i++) {
            if (response.data.tableData[i].total <= totalAmount && totalAmount > 0) {
              data.push({
                creditMemoCode: response.data.tableData[i].code,
                date: response.data.tableData[i].date,
                creditMemoAmount: response.data.tableData[i].remaining - response.data.tableData[i].taxAmount,
                creditMemoTaxAmount: response.data.tableData[i].taxAmount,
                creditMemoTotal: response.data.tableData[i].remaining,
                src: 'DP'
              })
              totalAmount -= response.data.tableData[i].amount
              totalDpp -= (response.data.tableData[i].amount - response.data.tableData[i].taxAmount)
              totalTaxAmount -= response.data.tableData[i].taxAmount
            } else if (totalAmount > 0) {
              data.push({
                creditMemoCode: response.data.tableData[i].code,
                date: response.data.tableData[i].date,
                creditMemoAmount: totalDpp,
                creditMemoTaxAmount: totalTaxAmount,
                creditMemoTotal: totalAmount,
                src: 'DP'
              })
              totalAmount -= totalAmount
              totalDpp -= totalDpp
              totalTaxAmount -= totalTaxAmount
            }
          }
          this.gridSalesDownPayment.data = data
        })
    }
  }
}
</script>
