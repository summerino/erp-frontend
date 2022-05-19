<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="2">
            Faktur Pembelian
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
                title="Daftar Faktur Pembelian"
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
          <v-toolbar-title>Faktur Pembelian</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'alt', 'p']"
                  :disabled="isVoid || (data.action === 'edit' && !auth.allowPrint) || data.action === 'add'"
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
                  :disabled="isVoid || hasRelatedTrans || (data.action === 'edit' && (!auth.allowUpdate || seenByOthers))"
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
                          v-model="data.code"
                          label="Kode"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          v-model="data.refNo"
                          label="No. Ref."
                          class="mt-0"
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
                          v-model="data.poCode"
                          :readonly="hasRelatedTrans"
                          :rules="rules.required"
                          label="Kode Order Pembelian"
                          class="mt-0"
                          required
                          @change="poCodeChange"
                        >
                          <template v-slot:append>
                              <v-btn
                                :disabled="hasRelatedTrans"
                                color="primary"
                                icon
                                small
                                @click="showFindPODialog"
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
                  <v-tabs v-model="tab.sup">
                    <v-tab key="sup">Pemasok</v-tab>
                    <v-tab key="user">Pengguna</v-tab>
                    <v-tab key="notes">Catatan</v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab.sup" class="pa-2">
                    <v-tab-item
                      key="sup"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="3">
                          <v-text-field
                            v-model="data.supCode"
                            :rules="rules.required"
                            label="Kode"
                            class="mt-0"
                            readonly
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="9" class="pl-1">
                          <v-text-field
                            v-model="data.supName"
                            label="Nama"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            v-model="data.supAddr"
                            label="Alamat"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-text-field
                            v-model="data.supPhone"
                            label="Telepon"
                            class="mt-0"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model="data.supFax"
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
                    <v-tab key="related-trans">Transaksi Terkait</v-tab>
                    <v-tab v-if="apRecogTime === 'PI'" key="tax">Faktur Pajak</v-tab>

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
                          <template v-slot:[`item.rcvCode`]="{ item }">
                            <v-autocomplete
                              ref="rcvCode"
                              v-model="item.rcvCode"
                              :items="receives"
                              :readonly="hasRelatedTrans"
                              :rules="rules.required"
                              item-text="code"
                              item-value="code"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="rcvCodeChange(item)"
                            >
                              <template v-slot:append>
                                <v-btn
                                  :disabled="hasRelatedTrans"
                                  color="primary"
                                  icon
                                  x-small
                                  @click="showFindRcvDialog(item)"
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
                        <template v-slot:[`item.debitMemoAmount`]="{ item }">
                          {{ item.debitMemoAmount | formatCurrency }}
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
                      v-if="apRecogTime === 'PI'"
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
                  </v-tabs>

                  <v-tabs-items v-model="tab.foot" class="pa-2">
                    <v-tab-item
                      key="dp"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-currency-field
                          v-model="data.downPayment"
                          :allow-negative="false"
                          label="Down Payment"
                          class="text-right mt-0"
                          @change="calcDP"
                        ></v-currency-field>
                        <v-checkbox
                          v-model="data.applyTax"
                          label="Apply Tax"
                          class="shrink ml-1"
                          @change="calcDP"
                        ></v-checkbox>
                      </v-row>
                      <v-currency-field
                        v-model="data.dpTax"
                        label="Tax"
                        class="text-right mt-0"
                        readonly
                      ></v-currency-field>
                      <v-currency-field
                        v-model="data.dpTotal"
                        label="Total DP"
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
    <find-po
      ref="findPO"
      :invCode="data.code"
      caller="inv"
      @dblclick:row="bindPOData"
    ></find-po>
    <find-rcv
      ref="findRcv"
      :trans-code="data.poCode"
      :mark-exclude="['V', 'INV']"
      @dblclick:row="bindRcvData"
    ></find-rcv>
    <memo
      ref="memo"
      :supOrCustCode="data.supCode"
      :amount="data.total"
      transType="debit"
      @bindMemo="bindMemo"
    ></memo>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { sumBy as _sumBy } from 'lodash'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'
import auth from '@/services/authorization.service'
import activeTrans from '@/services/activeTransaction.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import ReportViewer from '@/components/dialog/ReportViewer'
import FindPo from '@/components/dialog/purchase/FindPO'
import FindRcv from '@/components/dialog/purchase/FindRcv'
import Memo from '@/components/dialog/Memo.vue'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    ReportViewer,
    FindPo,
    FindRcv,
    Memo
  },

  data: () => ({
    filterFields: [{
      text: 'Kode', value: 'code', dataType: 'text'
    }, {
      text: 'Tanggal', value: 'date', dataType: 'datetime'
    }, {
      text: 'Pemasok', value: 'supName', dataType: 'text'
    }, {
      text: 'Kd. Ord. Pembelian', value: 'poCode', dataType: 'text'
    }, {
      text: 'Tgl. Jatuh Tempo', value: 'dueDate', dataType: 'datetime'
    }, {
      text: 'No. Ref', value: 'refNo', dataType: 'text'
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
      sup: null,
      det: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '120' },
        { text: 'Kode', value: 'code', divider: true, width: '160', excelColWidth:'19' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'Pemasok', value: 'supName', divider: true, width: '200', excelColWidth:'23' },
        { text: 'Kd. Ord. Pembelian', value: 'poCode', divider: true, width: '150', excelColWidth:'18' },
        { text: 'Total', value: 'total', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
        { text: 'Nilai Sudah Dibayar', value: 'paidAmount', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
        { text: 'Sisa', value: 'remaining', align: 'right', divider: true, width: '120', excelColWidth:'15', isCurrency: true },
        { text: 'Tgl. Jatuh Tempo', value: 'dueDate', align: 'right', divider: true, width: '120', excelColWidth:'15', isDateTime: true },
        { text: 'No. Ref.', value: 'refNo', width: '120', excelColWidth:'15' },
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
        { text: 'Kode Penerimaan', value: 'rcvCode', divider: true, width: '200' },
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
        { text: 'Nilai', value: 'total', align: 'right' }
      ],
      data: []
    },
    gridMemo: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1%' },
        { text: 'Kode', value: 'debitMemoCode', divider: true },
        { text: 'Tanggal', value: 'date', divider: true },
        { text: 'Tipe', value: 'type', divider: true },
        { text: 'Nilai', value: 'debitMemoAmount', align: 'right', divider: true }
      ],
      data: []
    },
    valid: false,
    dataStartDate: null,
    employees: [],
    receives:[],
    data: {},
    apRecogTime: null,
    seenByOthers: false
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getEmployeeLists()
    this.getSysAPRecog()
    auth.getAction(this.endpoint, this.menuId.purchaseInvoice)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    this.$store.commit('app/setFilterFields', this.filterFields)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Pembelian'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Pembelian'
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
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        action: '',
        code: null,
        refNo: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        poCode: null,
        supCode: null,
        supName: null,
        supAddr: null,
        supPhone: null,
        supFax: null,
        curr: 'IDR',
        notes: null,
        paidAmount: 0,
        total: 0
      }
      this.gridDet.data = []
      this.gridMemo.data = []
      this.tab.sup = 0
      this.tab.det = 0

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
      api.getAll(this.endpoint.purchase.invoice, {
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
              api.getAll(this.endpoint.purchase.invoice, {
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
    getReceiveLists(bindToGridDet = false) {
      api.getAll(`${this.endpoint.purchase.receive}/un-invoice`, {
        params: {
          poCode: this.data.poCode,
          invCode: this.data.code
        }
      })
        .then(response => {
          this.receives = JSON.parse(JSON.stringify(response.data.tableData))
          if (bindToGridDet) {
            this.gridDet.data = response.data.tableData
            for (let i = 0; i < this.gridDet.data.length; i++) {
              this.gridDet.data[i].id = randomNumber(-1, -1000)
              this.gridDet.data[i].rcvCode = this.gridDet.data[i].code
              this.gridDet.data[i].code = this.data.code
              this.gridDet.data[i].state = 'A'
            }
            this.calcPrice()
          }
        })
    },
    async close() {
      if (this.data.action === 'edit') {
        activeTrans.released('PI', this.data.code)
      }
      this.dialog.add = false
    },
    add() {
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

      const resp = await activeTrans.locked('PI', item.code)
      this.seenByOthers = (resp?.data?.message === 'used')

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

      // Get supplier details
      this.bindSupData(this.data)
      
      // Get invoice details
      api.getAll(`${this.endpoint.purchase.invoice}/detail`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridDet.data = response.data.tableData
        })

      // Get purchase receive details
      this.getReceiveLists()

      // Get related transaction details
      api.getAll(`${this.endpoint.sales.directInvoice}/related-trans`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridRelated.data = response.data.tableData
        })

      // Get Memo List
      api.getAll(`${this.endpoint.purchase.invoice}/memo`, {
        params: { code: item.code }
      })
        .then(response => {
          this.gridMemo.data = response.data.tableData
        })
      // Set focus to invoice code field
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
        api.delete(this.endpoint.purchase.invoice, item.code, {data: item})
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    print(item) {
      this.$refs.reportViewer.open('purchase-invoice', item.code)
    },
    async save(closeDialog) {
      if (!this.dialog.add) return
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      
      if (this.isMemoDuplicate()) {
        this.$store.dispatch('app/showInfo', 'Tidak bisa melakukan simpan karena terdapat debit memo dengan kode yang sama.')
        return
      }
      
      const data = this.data
      data.details = this.gridDet.data
      data.memos = this.gridMemo.data
      
      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.purchase.invoice, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.purchase.invoice, data.code, data)
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
      if (!this.data.poCode) {
        this.$store.dispatch('app/showInfo', 'Silahkan pilih order pembelian terlebih dahulu.')
        return
      }

      if (this.gridDet.data.length === 0 || (this.gridDet.data.slice(-1)[0]?.rcvCode ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          code: this.data.code,
          rcvCode: null,
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
          this.$refs.rcvCode.focus()
        }, 0)
      }
    },
    addMemo() {
      if (!this.data.poCode) {
        this.$store.dispatch('app/showInfo', 'Silahkan pilih order pembelian terlebih dahulu.')
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
      }
    },
    async removeMemo(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridMemo.data.findIndex(i => i.debitMemoCode === item.debitMemoCode)
        this.gridMemo.data.splice(idx, 1)
      }
    },
    poCodeChange() {
      api.getAll(this.endpoint.purchase.order, {
        params: {
          filters: JSON.stringify([{
            field: 'code',
            operator: 'eq',
            keyword: this.data.poCode
          }, {
            field: 'mark',
            operator: 'contains',
            keyword: ['PR', 'CMP']
          }])
        }
      })
        .then(response => {
          this.bindPOData(response.data.tableData[0] ?? null)
        })
    },
    rcvCodeChange(item) {
      const data_d = this.receives.find(r => r.code.toUpperCase() === item.rcvCode.toUpperCase())
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
    showFindPODialog() {
      this.$refs.findPO.open()
    },
    showFindRcvDialog(item) {
      this.$refs.findRcv.open(item)
    },
    bindPOData(item) {
      if (item) {
        this.data.poCode = item.code
        this.data.supCode = item.supCode
        this.data.supName = item.supName
        this.data.currCode = item.currCode
        this.data.total = 0

        if (!item.called) {
          // Get supplier details
          this.bindSupData(this.data)

          // Get purchase receive details
          this.getReceiveLists(true)
        }
      } else {
        this.data.supCode = null
        this.data.supName = null
        this.data.supAddr = null
        this.data.supPhone = null
        this.data.supFax = null
        this.data.currCode = null
        this.data.total = 0
        this.gridDet.data = []
      }
    },
    bindSupData(item) {
      api.getOne(this.endpoint.general.supplier.supplier, item.supCode)
        .then(response => {
          if (response.data) {
            item.supAddr = response.data.address1
            item.supPhone = response.data.phone
            item.supFax = response.data.fax
          }
        })
    },
    bindRcvData(rowItem) {
      this.rcvCodeChange(rowItem)
    },
    bindMemo(data) {
      for (let i = 0; i < data.length; i++) {
        this.gridMemo.data.push({
          debitMemoCode: data[i].code,
          date: data[i].date,
          type: data[i].type,
          debitMemoAmount: data[i].transAmount          
        })
      }
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    isMemoDuplicate() {
      const valueArr = this.gridMemo.data.map(function (item) { return item.debitMemoCode })
      const isDuplicate = valueArr.some(function (item, idx) { 
        return valueArr.indexOf(item) !== idx 
      })
      return isDuplicate
    },
    getSysAPRecog() {
      const codes = ['AP_RECOG_TIME']
      api.getAll(`${this.endpoint.systemManagement.parameter}/lists`, {
        params: {
          codes: JSON.stringify(codes)
        }
      })
        .then(response => {
          this.apRecogTime = response.data.tableData[0].value
        })
    },
    clearDate(item) {
      if (item === 'tax') {
        this.data.taxInvoiceDate = null
      }
    }
  }
}
</script>
