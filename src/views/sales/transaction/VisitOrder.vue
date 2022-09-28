<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="3">
            Perintah Kunjungan
          </v-col>
          <v-col cols="12" md="5">
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
                title="Daftar Perintah Kunjungan"
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
                :disabled="!auth.allowVoid || item.mark === 'CMP' || item.mark === 'V'"
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
            <span class="text-caption">Cetak Daftar Pelanggan</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | formatDate('dd-MMM-yyyy') }}
        </template>
        <template v-slot:[`item.salesmanName`]="{ item }">
          {{ `${item.salesmanInitial} - ${item.salesmanName}` }}
        </template>
        <template v-slot:[`item.groupName`]="{ item }">
          {{ `${item.groupInitial} - ${item.groupName}` }}
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
          <v-btn icon dark @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Perintah Kunjungan</v-toolbar-title>
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
                  :disabled="data.mark === 'CMP' || data.mark === 'V' || (data.action === 'edit' && (!auth.allowUpdate || seenByOthers))"
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
                  :disabled="data.mark === 'CMP' || data.mark === 'V' || (data.action === 'edit' && (!auth.allowUpdate || seenByOthers))"
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
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="Code"
                          v-model="data.code"
                          label="Kode"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-menu
                          v-model="menu.visitDate"
                          :close-on-content-click="false"
                          :disabled="data.mark === 'CMP' || data.mark === 'V' || data.action === 'edit'"
                          transition="scale-transition"
                          min-width="290px"
                          offset-y                          
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              ref="date"
                              v-bind="attrs"
                              v-on="on"
                              :rules="rules.required"
                              :value="formatVisitDate"
                              :readonly="data.mark === 'CMP' || data.mark === 'V' || data.action === 'edit'"
                              label="Tanggal"
                              class="mt-0"
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="data.date"
                            :disabled="data.mark === 'CMP' || data.mark === 'V' || data.action === 'edit'"
                            :min="dataStartDate"
                            no-title
                            scrollable
                            @change="menu.visitDate = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-autocomplete
                          ref="Source"
                          v-model="data.sourceTransaction"
                          :items="sourceTransactionRef"
                          :disabled="isSalesHasScheduledVisitOrder"
                          item-text="textValue"
                          item-value="textValue"
                          label="Sumber Transaksi"
                          class="mt-0"
                          @change="onSourceChange"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          v-model="employee.aliases"
                          :readonly="data.mark === 'CMP' || data.mark === 'V' || data.action === 'edit'"
                          :rules="rules.required"
                          label="Penjual"
                          class="mt-0"
                          required
                        >
                          <template v-slot:append>
                            <v-btn
                              color="primary"
                              :disabled="data.mark === 'CMP' || data.mark === 'V' || data.action === 'edit'"
                              icon
                              small
                              @click="showFindSalesDialog"
                            >
                              <v-icon>
                                mdi-shopping-search
                              </v-icon>
                            </v-btn>
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="IDGroup"
                          v-model="employee.groupAliases"
                          label="Grup Penjual"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card>
                  <v-tabs v-model="tab.signatureItem">
                    <v-tab key="user">Pengguna</v-tab>
                    <v-tab key="notes">Catatan</v-tab>

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
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="notes"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-textarea
                            v-model="data.notes"
                            :rules="rules.max256chars"
                            :readonly="data.mark === 'CMP' || data.mark === 'V'"
                            label="Catatan"
                            counter="256"
                            class="mt-0"
                            rows="6"
                          ></v-textarea>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                  </v-tabs>
                </v-card>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-tabs v-model="tab.advancedItem">
                    <v-tab key="customer">Pelanggan</v-tab>
                    <v-tab key="invoice">Faktur</v-tab>

                    <v-tab-item
                      key="customer"
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
                                :disabled="data.mark === 'CMP' || data.mark === 'V' || isScheduledVisit"
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

                        <v-card-text>
                          <template>
                            <v-row no-gutters>
                              <v-col cols="12">
                                <v-data-table
                                  :headers="gridCustomer.columns"
                                  :items="gridCustomer.data"
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
                                          :disabled="data.mark === 'CMP' || data.mark === 'V' || isScheduledVisit"
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
                                  <template v-slot:[`item.custCode`]="{ item }">
                                    <v-autocomplete
                                      ref="CustomerCode"
                                      v-model="item.custCode"
                                      :items="items"
                                      :readonly="data.mark === 'CMP' || data.mark === 'V'"
                                      :rules="rules.required"
                                      item-text="initial"
                                      item-value="code"
                                      class="text-body-2 mt-0"
                                      dense
                                      required
                                      @change="custCodeChange(item)"
                                    >
                                      <template v-slot:append>
                                        <v-btn
                                          :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                          color="primary"
                                          icon
                                          x-small
                                          @click="showFindCustomerDialog(item)"
                                        >
                                          <v-icon>
                                            mdi-settings-helper
                                          </v-icon>
                                        </v-btn>
                                      </template>
                                    </v-autocomplete>
                                  </template>
                                  <template v-slot:[`item.replacemanName`]="{ item }">
                                    <v-text-field
                                      ref="ReplacemanName"
                                      v-model="item.replacemanName"
                                      class="text-body-2 mt-0"
                                      readonly
                                      dense
                                    >
                                      <template v-slot:append>
                                        <v-btn
                                          :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                          color="primary"
                                          icon
                                          x-small
                                          @click="showFindReplacemanDialog(item)"
                                        >
                                          <v-icon>
                                            mdi-settings-helper
                                          </v-icon>
                                        </v-btn>
                                      </template>
                                    </v-text-field>
                                  </template>
                                  <template v-slot:[`item.visited`]="{ item }">
                                    <v-checkbox
                                      ref="chkVisited"
                                      v-model="item.visited"
                                      :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                      class="align-center justify-center"
                                      dense
                                    ></v-checkbox>
                                  </template>                           
                                </v-data-table>
                              </v-col>
                            </v-row>
                          </template>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="invoice"
                      transition="false"
                    >
                      <v-card>
                        <v-app-bar dense flat>
                          <v-row no-gutters>
                            <v-col cols="11" class="text-right">
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    v-bind="attrs"
                                    v-on="on"
                                    v-shortkey="['ctrl', 'alt', 'd']"
                                    :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                    class="blue--text"
                                    small
                                    tile
                                    @click="addAllInvoice"
                                    @shortkey="addAllInvoice"
                                  >
                                    <v-icon left>mdi-plus</v-icon>
                                    Tambah Semua Faktur
                                  </v-btn>
                                </template>
                                <span class="text-caption">(Ctrl + Alt + D)</span>
                              </v-tooltip>
                            </v-col>
                            <v-col cols="1" class="text-right">
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    v-bind="attrs"
                                    v-on="on"
                                    v-shortkey="['ctrl', 'alt', 'i']"
                                    :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                    class="blue--text"
                                    small
                                    tile
                                    @click="addItemInvoice"
                                    @shortkey="addItemInvoice"
                                  >
                                    <v-icon left>mdi-plus</v-icon>
                                    Tambah
                                  </v-btn>
                                </template>
                                <span class="text-caption">(Ctrl + Alt + I)</span>
                              </v-tooltip>
                            </v-col>
                          </v-row>
                        </v-app-bar>

                        <v-card-text>
                          <template>
                            <v-row no-gutters>
                              <v-col cols="12">
                                <v-data-table
                                  :headers="gridInvoice.columns"
                                  :items="gridInvoice.data"
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
                                          :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                          color="red"
                                          icon
                                          small
                                          @click="removeItemInvoice(item)"
                                        >
                                          <v-icon small>mdi-close-thick</v-icon>
                                        </v-btn>
                                      </template>
                                      <span class="text-caption">Hapus</span>
                                    </v-tooltip>
                                  </template> 
                                  <template v-slot:[`item.failCollect`]="{ item }">
                                    <v-checkbox
                                      ref="chkFailCollect"
                                      v-model="item.failCollect"
                                      :disabled="data.mark === 'CMP' || data.mark === 'V'"
                                      class="align-center justify-center"
                                      dense
                                    ></v-checkbox>
                                  </template>
                                  <template v-slot:[`item.invCode`]="{ item }">
                                    <v-text-field
                                      v-model="item.invCode"
                                      :rules="rules.required"
                                      class="text-body-2 mt-0"
                                      dense
                                      required
                                      readonly
                                    >
                                      <template v-slot:append>
                                        <v-btn
                                          :disabled="data.mark === 'V'"
                                          color="primary"
                                          icon
                                          x-small
                                          @click="showFindInvoiceDialog(item)"
                                        >
                                          <v-icon>
                                            mdi-settings-helper
                                          </v-icon>
                                        </v-btn>
                                      </template>
                                    </v-text-field>
                                  </template>
                                  <template v-slot:[`item.transactionDate`]="{ item }">
                                    {{ item.transactionDate | formatDate('dd-MMM-yyyy') }}
                                  </template>
                                  <template v-slot:[`item.invoiceDueDate`]="{ item }">
                                    {{ item.invoiceDueDate | formatDate('dd-MMM-yyyy') }}
                                  </template>     
                                  <template v-slot:[`item.total`]="{ item }">
                                    {{ item.total | formatCurrency }}
                                  </template>   
                                  <template v-slot:[`item.notesFailCollect`]="{ item }">
                                    <v-text-field
                                      ref="NotesFailCollect"
                                      v-model="item.notesFailCollect"
                                      :readonly="data.mark === 'CMP' || data.mark === 'V'"
                                      class="text-body-2 mt-0"
                                      dense
                                    ></v-text-field>
                                  </template>                 
                                </v-data-table>
                              </v-col>
                            </v-row>
                          </template>
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
    <find-salesman
      ref="findSalesman"
      @dblclick:row="bindSalesman"
    ></find-salesman>
    <find-salesman
      ref="findReplaceman"
      @dblclick:rep="bindReplaceman"
    ></find-salesman>
    <find-customer
      ref="findCustomer"
      @dblclick:row="bindCustomer"
    ></find-customer>
    <find-invoice
      ref="findInvoice"
      :list-cust-code="listCustCode"
      :list-inv-code="listInvCode"
      @dblclick:row="bindInvoice"
    ></find-invoice>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'
import { randomNumber } from '@/helpers/math-helpers'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'
import activeTrans from '@/services/activeTransaction.service'

import AdvancedSearch from '@/components/common/AdvancedSearch'
import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'
import ReportViewer from '@/components/dialog/ReportViewer'
import FindSalesman from '@/components/dialog/sales/FindSalesman'
import FindCustomer from '@/components/dialog/sales/FindCustomerVO'
import FindInvoice from '@/components/dialog/sales/FindInvoiceVO'

export default {
  components: {
    AdvancedSearch,
    ExportExcel,
    Confirm,
    ReportViewer,
    FindSalesman,
    FindCustomer,
    FindInvoice
  },

  data: () => ({
    filterFields: [
      { text: 'Kode', value: 'code', dataType: 'text' },
      { text: 'Tanggal', value: 'date', dataType: 'datetime' },
      { text: 'Inisial Penjual', value: 'salesmanInitial', dataType: 'text' },
      { text: 'Nama Penjual', value: 'salesmanName', dataType: 'text' },
      { text: 'Inisial Grup Penjual', value: 'groupInitial', dataType: 'text' },
      { text: 'Nama Grup Penjual', value: 'groupName', dataType: 'text' },
      { text: 'Sumber Transaksi', value: 'sourceTransaction', dataType: 'text' },
      { text: 'Status', value: 'mark', dataType: 'text' }
    ],
    dialog: {
      add: false
    },
    menu: {
      visitDate: false
    },
    tab: {
      advancedItem: null,
      signatureItem: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '120' },
        { text: 'Kode', value: 'code', divider: true, width: '150', excelColWidth:'10' },
        { text: 'Tanggal', value: 'date', align: 'right', divider: true, width: '120', excelColWidth:'30' },
        { text: 'Penjual', value: 'salesmanName', divider: true, width: '250', excelColWidth:'35' },
        { text: 'Grup Penjual', value: 'groupName', divider: true, width: '250', excelColWidth:'20' },
        { text: 'Sumber Transaksi', value: 'sourceTransaction', divider: true, width: '150', excelColWidth:'18' },
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
    gridCustomer: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '30' },
        { text: 'Inisial', value: 'custCode', divider: true, width: '110'  },
        { text: 'Nama', value: 'customerName', divider: true, width: '120' },
        { text: 'Alamat', value: 'address', divider: true, width: '200' },
        { text: 'Wilayah', value: 'areaName1', divider: true, width: '120' },
        { text: 'Pengganti', value: 'replacemanName', divider: true, width: '120' },
        { text: 'Terkunjungi', value: 'visited', divider: true, width: '30'}
      ],
      data: [],
      options: {
        sortBy: ['id'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridInvoice: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '30' },
        { text: 'Gagal Tagih', value: 'failCollect', divider: true, width: '60'  },
        { text: 'No. Faktur', value: 'invCode', divider: true, width: '120' },
        { text: 'Nama Pelanggan', value: 'customerName', divider: true, width: '150' },
        { text: 'Tanggal Transaksi', value: 'transactionDate', align: 'right', divider: true, width: '110' },
        { text: 'Tanggal Jatuh Tempo', value: 'invoiceDueDate', align: 'right', divider: true, width: '110' },
        { text: 'Nilai', value: 'total', align: 'right', divider: true, width: '150' },
        { text: 'Alasan Gagal Tagih', value: 'notesFailCollect', divider: true, width: '150' }
      ],
      data: [],
      options: {
        sortBy: ['id'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    dataStartDate: null,
    areaReference: [],
    cAddress: [],
    employee: [],
    employeeRef: [],
    itemInvoice: [],
    items: [],
    listCustCode: [],
    listInvCode: [],
    sourceTransactionRef: [{ textValue: 'Manual' }, { textValue: 'Jadwal Kunjungan' }],
    data: {},
    isSalesHasScheduledVisitOrder: false,
    seenByOthers: false
  }),

  created: function () {
    this.getList()
    this.getSystemParameter()
    this.getArea()
    auth.getAction(this.endpoint, this.menuId.visitOrder)
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
        text: 'Perintah Kunjungan'
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
    'data.salesmanId': {
      handler() {
        if (this.data.action === 'add') {
          this.verifySales()
        }
      },
      deep: true
    },
    'data.date': {
      handler() {
        if (this.data.action === 'add') {
          this.verifySales()
        }
      },
      deep: true
    },
    'gridCustomer.data': {
      handler() {
        this.getListCustCode()
      },
      deep: true
    },
    'gridInvoice.data': {
      handler() {
        this.getListInvCode()
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
    isActive() {
      return (this.data?.IsActive?.IsActive === true)
    },
    formatVisitDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    isScheduledVisit() {
      return this.data.sourceTransaction === 'Jadwal Kunjungan'
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        code: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        salesmanId: null,
        visitPlanCode: null,
        notes: null,
        salesmanInitial: null,
        salesmanName: null,
        groupInitial: null,
        groupName: null,
        sourceTransaction: null,
        status: null,
        createdInitial: null,
        updatedInitial: null,
        approvedInitial: null
      }
      this.employee = []
      this.gridCustomer.data = []
      this.gridInvoice.data = []
      this.tab.advancedItem = 0
      this.tab.signatureItem = 0
      this.isSalesHasScheduledVisitOrder = false


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

      api.getAll(this.endpoint.sales.visitOrder, {
        params: {
          search: this.grid.search,
          skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
          take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
          filters: JSON.stringify(filters),
          sorts: JSON.stringify(sorts)
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
            operator: 'eq',
            keyword: 'DATA_START_DATE'
          }])
        }
      })
        .then(response => {
          this.dataStartDate = response.data.tableData[0].value
        })
    },
    async close() {
      if (this.data.action === 'edit') {
        activeTrans.released('VO', this.data.code)
      }
      this.dialog.add = false
    },
    async add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'  
      this.data.sourceTransaction = 'Jadwal Kunjungan'  

      await this.getCustomer()
      await this.getInvoice()

      setTimeout(() => {
        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    async edit(item) {
      if (!item) return
            
      const resp = await activeTrans.locked('VO', item.code)
      this.seenByOthers = (resp?.data?.message === 'used')

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        originalDate: item.date,
        createdDate: format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      await this.getCustomer()
      await this.getInvoice()

      this.loadEmployee()
      this.loadCustomer()
      this.loadInvoice()

      // Set focus to receive code field
      setTimeout(() => {
        this.$refs.date.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Void?',
          'Apakah anda yakin ingin membuat void data ini?')
      ) {
        api.delete(this.endpoint.sales.visitOrder, item.code, {data: item})
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    print(item) {
      this.$refs.reportViewer.open('visit-order-customer', item.code)
    },
    async save(closeDialog) {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = this.data
      data.customerDetails = this.gridCustomer.data
      data.invoiceDetails = this.gridInvoice.data

      if (data.sourceTransaction === 'Manual') {
        data.visitPlanCode = null
      } else {
        data.visitPlanCode = 'Jadwal'
      }

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.visitOrder, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.visitOrder, data.code, data)
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
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridCustomer.data.findIndex(i => i.id === item.id)
        this.gridCustomer.data.splice(idx, 1)
      }
    },
    async removeItemInvoice(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridInvoice.data.findIndex(i => i.id === item.id)
        this.gridInvoice.data.splice(idx, 1)
      }
    },
    showFindSalesDialog() {
      this.$refs.findSalesman.open()
    },
    showFindReplacemanDialog(item) {
      const idx = this.gridCustomer.data.findIndex(i => i.id === item.id)
      this.$refs.findReplaceman.openReplaceman(idx)
    },
    showFindCustomerDialog(item) {
      this.$refs.findCustomer.open(item)
    },
    showFindInvoiceDialog(item) {
      this.$refs.findInvoice.open(item)
    },
    bindSalesman(item) {
      this.data.salesmanId = item.id

      this.employee = {
        ...item,
        aliases: `${item.initial} - ${item.fullName}`,
        groupAliases: `${item.groupInitial} - ${item.groupName}`
      }

      if (this.data.sourceTransaction === 'Jadwal Kunjungan') {
        this.mappingVisitSchedule()
      }
    },
    bindReplaceman(rowItem) {
      this.gridCustomer.data[rowItem.gridIndex].replacingForSalesmanId = rowItem.id
      this.gridCustomer.data[rowItem.gridIndex].replacemanInitial = rowItem.initial
      this.gridCustomer.data[rowItem.gridIndex].replacemanName = rowItem.fullName
    },
    bindCustomer(rowItem) {
      this.custCodeChange(rowItem)
    },
    bindInvoice(rowItem) {
      this.invCodeChange(rowItem)
    },
    mappingVisitSchedule() {
      const arrId = []
      let customerList = []
      let dataSchedule = []

      api.getAll(`${this.endpoint.general.employee}/salesman-schedule-by-id-with-date`, {
        params: {
          id: this.employee.id,
          date: this.data.date
        }
      })
        .then(response => {
          dataSchedule = response.data.tableData

          if (dataSchedule) {
            for (let i = 0; i < dataSchedule.length; i++) {
              arrId.push(dataSchedule[i].salesmanScheduleId)
            }
          }

          api.getAll(`${this.endpoint.general.employee}/salesman-schedule-customer`, {
            params: {
              ids: JSON.stringify(arrId)
            }
          })
            .then(response => {
              customerList = response.data.tableData

              if (customerList) {
                for (let i = 0; i < customerList.length; i++) {
                  this.getCustomerAddressByCode(customerList[i].code)
                    .then(result => { 
                      const item = {
                        id: randomNumber(-1, -1000),
                        custCode: customerList[i].code,
                        replacingForSalesmanId: null,
                        visited: false,
                        customerInitial: customerList[i].initial,
                        customerName: customerList[i].name,
                        address: result,
                        areaName1: customerList[i].areaName1,
                        areaName2: customerList[i].areaName2,
                        replacemanInitial: null,
                        replacemanName: null,
                        state: 'A'
                      }
                      this.gridCustomer.data.push(item)
                    })
                }
              }
            })
        })
    },
    addItem() {
      if (this.gridCustomer.data.length === 0 || (this.gridCustomer.data.slice(-1)[0]?.custCode ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          custCode: null,
          replacingForSalesmanId: null,
          visited: false,
          customerInitial: null,
          customerName: null,
          address: null,
          areaName1: null,
          areaName2: null,
          replacemanInitial: null,
          replacemanName: null,
          state: 'A'
        }
        this.gridCustomer.data.push(item)
      }
    },
    custCodeChange(item) {
      const gdItem = this.gridCustomer.data.find(x => x.custCode === item.custCode && x.id !== item.id)
      if (gdItem) {
        this.$store.dispatch('app/showInfo', 'Data Pelanggan sudah tersedia, hanya data pertama yang akan disimpan.')
      }

      const data_i = this.items.find(i => i.code === item.custCode)
      if (data_i) {
        item.custCode = data_i.code
        item.replacingForSalesmanId = data_i.replacingForSalesmanId
        item.visited = data_i.visited
        item.customerInitial = data_i.initial
        item.customerName = data_i.name
        item.address = data_i.address1
        item.areaName1 = this.getAreaName(data_i.areaId1 === null ? 0 : data_i.areaId1)
        item.areaName2 = this.getAreaName(data_i.areaId2 === null ? 0 : data_i.areaId2)
        item.replacemanInitial = data_i.replacemanInitial
        item.replacemanName = data_i.replacemanName
        if (item.state !== 'A') {
          item.state = 'M'
        }
      }
    },
    addItemInvoice() {
      if (this.gridInvoice.data.length === 0 || (this.gridInvoice.data.slice(-1)[0]?.invCode ?? null)) {
        const item = {
          id: randomNumber(-1, -1000),
          invCode: null,
          failCollect: false,
          notesFailCollect: null,
          customerName: null,
          transactionDate: null,
          invoiceDueDate: null,
          salesName: null,
          total: 0,
          state: 'A'
        }
        this.gridInvoice.data.push(item)
      }
    },
    invCodeChange(item) {      
      const gdItem = this.gridInvoice.data.find(x => x.invCode === item.invCode && x.id !== item.id)
      if (gdItem) {
        this.$store.dispatch('app/showInfo', 'Data Invoice sudah tersedia, hanya data pertama yang akan disimpan.')
      }

      const data_i = this.itemInvoice.find(i => i.code === item.invCode)
      if (data_i) {
        item.invCode = data_i.code
        item.failCollect = data_i.failCollect
        item.notesFailCollect = data_i.notesFailCollect
        item.customerName = data_i.custName
        item.transactionDate = data_i.date
        item.invoiceDueDate = data_i.dueDate
        item.salesName = data_i.salesName
        item.total = data_i.total
        if (item.state !== 'A') {
          item.state = 'M'
        }
      }
    },
    getCustomer() {
      return api.getAll(`${this.endpoint.general.customer.customer}/lists`, {
        params: { 
          filters: JSON.stringify([{
            field: 'isactive',
            operator: 'eq',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: 'name',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.items = response.data.tableData
        })
    },
    getInvoice() {
      return api.getAll(this.endpoint.sales.invoice, {
        params: { 
          filters: JSON.stringify([{
            field: 'mark',
            operator: 'contains',
            keyword: ['A', 'CMP', 'PP']
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.itemInvoice = response.data.tableData
        })
    },
    loadEmployee() {
      api.getAll(this.endpoint.general.employee, {
        params: {
          filters: JSON.stringify([{
            field: 'id',
            operator: 'eq',
            keyword: this.data.salesmanId
          }]),
          sorts: JSON.stringify([{
            field: 'id',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.employee = response.data.tableData
          this.fillAliases(this.employee)
        })
    },
    fillAliases(item) {
      if (item.length) {
        this.$set(item, 'aliases', `${item[0].initial} - ${item[0].fullName}`)
        this.$set(item, 'groupAliases', `${item[0].groupInitial} - ${item[0].groupName}`)
      }
    },
    loadCustomer() {
      api.getAll(`${this.endpoint.sales.visitOrder}/visit-order-customer`, {
        params: { code: this.data.code }
      })
        .then(response => {
          this.gridCustomer.data = response.data.tableData
        })
    },
    loadInvoice() {
      api.getAll(`${this.endpoint.sales.visitOrder}/visit-order-invoice`, {
        params: { code: this.data.code }
      })
        .then(response => {
          this.gridInvoice.data = response.data.tableData
        })
    },
    getArea() {
      api.getAll(`${this.endpoint.sales.area}/lists`, {})
        .then(response => {
          this.areaReference = response.data.tableData
        })
    },
    getAreaName(id) {
      const item = this.areaReference.find(x => x.id === id)

      if (item) {
        return item.name
      } else {
        return ''
      }
    },
    getCustomerAddressByCode(code) {
      return api.getAll(`${this.endpoint.general.customer.customer}/addresses`, {
        params: { code: code}
      })
        .then(response => {
          this.cAddress = response.data.tableData

          return this.getCustomerAddressName()
        })
    },
    getCustomerAddressName() {
      const item = this.cAddress.find(x => x.isDefault)

      if (item) {
        return item.address1
      } else {
        return ''
      }
    },
    onSourceChange() {
      if (this.data.sourceTransaction === 'Manual') {
        this.gridCustomer.data = []
      }
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    verifySales() {
      if (this.data.salesmanId !== null) {
        return api.getAll(`${this.endpoint.sales.visitOrder}/verify-sales`, {
          params: { salesId: this.data.salesmanId, date: this.data.date }
        })
          .then(response => {
            this.isSalesHasScheduledVisitOrder = response.data
            if (this.isSalesHasScheduledVisitOrder) {
              this.data.sourceTransaction = 'Manual'
            }
          })
      }
    },
    getListCustCode() {
      this.listCustCode.splice(0, this.listCustCode.length)
      for (let i = 0; i < this.gridCustomer.data.length; i++) {
        this.listCustCode.push(this.gridCustomer.data[i].custCode)
      }
    },
    getListInvCode() {
      this.listInvCode.splice(0, this.listInvCode.length)
      for (let i = 0; i < this.gridInvoice.data.length; i++) {
        this.listInvCode.push(this.gridInvoice.data[i].invCode)
      }
    },
    addAllInvoice() {
      api.getAll(this.endpoint.sales.invoice, {
        params: { 
          filters: JSON.stringify([{
            field: 'mark',
            operator: 'contains',
            keyword: ['A', 'PP']
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          const data = response.data.tableData.filter(x => this.listCustCode.includes(x.custCode) && !this.listInvCode.includes(x.code))
          for (let i = 0; i < data.length; i++) {
            if (this.gridInvoice.data.length === 0 || (this.gridInvoice.data.slice(-1)[0]?.invCode ?? null)) {
              const item = {
                id: randomNumber(-1, -1000),
                invCode: null,
                failCollect: false,
                notesFailCollect: null,
                customerName: null,
                transactionDate: null,
                invoiceDueDate: null,
                salesName: null,
                total: 0,
                state: 'A'
              }
              item.invCode = data[i].code
              item.customerName = data[i].custName
              this.invCodeChange(item)
              this.gridInvoice.data.push(item)
            }
          }
        })
    }
  }
}
</script>
