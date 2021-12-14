<template>
  <div class="w-full">
    <v-dialog
      :value="true"
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
          <v-toolbar-title>Penjualan Langsung</v-toolbar-title>
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
                  :disabled="isVoid || hasRelatedTrans || (data.action === 'edit' && !auth.allowUpdate)"
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
                  :disabled="isVoid || hasRelatedTrans || (data.action === 'edit' && !auth.allowUpdate)"
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
                              :value="formatDate(data.date)"
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
                              :value="formatDate(data.dueDate)"
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
                        <v-autocomplete
                          v-model="data.salesBy"
                          :items="employees"
                          :item-text="item => `${item.initial} - ${item.firstName}`"
                          :rules="rules.required"
                          label="Penjual"
                          item-value="id"
                          class="mt-0"
                          required
                          @change="changeSeller()"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
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
                            @change="changeSeller(); custCodeChange(); findPromo(); calcPromo();"
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
                            @change="calcPromo()"
                          >
                          </v-checkbox>
                        </template>
                      </v-data-table>
                    </v-tab-item>

                    <v-tab-item
                      key="payment"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                          v-model="data.paymentTermId"
                          :items="paymentTerms"
                          :item-text="item => `${item.initial} - ${item.name}`"
                          :rules="rules.required"
                          label="Pembayaran"
                          item-value="id"
                          class="mt-0"
                          @change="findPromo()"
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
                            required
                            :disabled="this.data.isConsignee || !auth.allowChangeWarehouse"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.issuedBy"
                            :items="employees"
                            :item-text="item => `${item.initial} - ${item.firstName}`"
                            :rules="rules.required"
                            label="Dikeluarkan Oleh"
                            item-value="id"
                            class="mt-0"
                            required
                          ></v-autocomplete>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12" md="6">
                          <v-checkbox
                            v-model="data.includeTax"
                            :disabled="hasRelatedTrans"
                            label="Termasuk Pajak"
                            class="shrink mt-0"
                            @change="calcTax"
                          ></v-checkbox>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-checkbox
                            v-model="data.isConsignee"
                            :disabled="hasRelatedTrans"
                            label="Konsinyasi"
                            class="shrink mt-0"
                            @change="changeConsign()"
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

                    <!-- <v-tab-item
                      key="cust-payment"
                      transition="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.billAddr"
                            :items="deliveries"
                            label="Biling Address"
                            class="mt-0"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>

                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="data.top"
                            :items="tops"
                            label="Payment Term"
                            class="mt-0"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                    </v-tab-item> -->
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
                    <v-tab key="memo">Nota</v-tab>
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
                              :readonly="hasRelatedTrans"
                              :rules="rules.required"
                              item-text="initial"
                              item-value="id"
                              class="text-body-2 mt-0"
                              dense
                              required
                              @change="itemIdChange(item); findPromo(); calcPromo();"
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
                              @change="calcItemPrice(item); calcPromo();"
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
                              @change="unitItemChange(item); calcPromo();"
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
                              @blur="calcItemPrice(item)"
                              readonly
                            >
                              <template v-slot:append>
                                <v-btn
                                  :readonly="hasRelatedTrans"
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
                            label="Diskon Final"
                            class="text-right mt-0"
                            @change="discChange"
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
    <find-customer
      ref="findCust"
      @dblclick:row="bindCustData"
    ></find-customer>
    <find-item
      ref="findItem"
      :warehouseCode="data.warehouseCode"
      @dblclick:row="bindItemData"
    ></find-item>
    <so-promo
      ref="soPr"
    ></so-promo>
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
import { sumBy as _sumBy, cloneDeep as _cloneDeep } from 'lodash'

import { randomNumber } from '@/helpers/math-helpers'
import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import Confirm from '@/components/dialog/Confirm'
import FindCustomer from '@/components/dialog/general/FindCustomer'
import FindItem from '@/components/dialog/inventory/FindItem'
import SoPromo from '@/components/dialog/sales/SOPromo'
import Memo from '@/components/dialog/Memo.vue'

export default {
  components: {
    Confirm,
    FindCustomer,
    FindItem,
    SoPromo,
    Memo
  },

  data: () => ({
    menu: {
      invDate: false,
      dueDate: false
    },
    tab: {
      cust: null,
      item: null,
      foot: null
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
    valid: false,
    dataStartDate: null,
    employees: [],
    customers: [],
    warehouses: [],
    taxes: [],
    items: [],
    promos: [],
    paymentTerms: [],
    accounts: [],
    invPromos: [],
    data: {
      action: '',
      code: null,
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      salesBy: null,
      currCode: 'IDR',
      rate: 1,
      custCode: null,
      custName: null,
      custAddr: null,
      custPhone: null,
      custFax: null,
      warehouseCode: null,
      issuedBy: null,
      notes: null,
      dpp: 0,
      subTotal: 0,
      finalDiscPercent: 0,
      finalDisc: 0,
      includeTax: false,
      taxAmount: 0,
      total: 0
    }
  }),

  created: function () {
    this.getSystemParameter()
    this.getSalesmanLists()
    this.getCustomerLists()
    this.getWarehouseLists()
    this.getTaxLists()
    this.getItemLists()
    this.defineAction()
    this.getPromoLists()
    auth.getAction(this.endpoint, this.menuId.directInvoice)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
    this.getPaymentTermLists()
    this.getAccountLists()

  },

  computed: {
    ...mapState({
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    hasRelatedTrans() {
      return (this.gridRelated?.data?.length > 0)
    },
    isVoid() {
      return (this.data?.mark?.toUpperCase() === 'V')
    }
  },

  watch: {
    'data.date': {
      handler() {
        this.getPromoLists()
      },
      deep: true
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

      // // Set default warehouse
      // const defWarehouse = this.warehouses.find(w => w.isDefault)
      // if (defWarehouse) {
      //   this.data.warehouseCode = defWarehouse.code
      // }

      // set default warehouse
      this.setDefaultWarehouse()

    },
    formatDate(date) {
      return date ? format(parseISO(date), 'dd-MMM-yyyy') : ''
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
          this.data.includeTax = (response.data.tableData[1].value === '1')
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
          sorts: JSON.stringify([{
            field: 'initial',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.warehouses = response.data.tableData
          this.setDefaultWarehouse()
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
    async defineAction() {
      if (this.$route.params.action.toLowerCase() === 'edit') {
        // Get invoice details
        const resp = await api.getOne(this.endpoint.sales.directInvoice, this.$route.params.code)

        if (!resp.data) return

        this.data = {
          ...resp.data,
          action: 'edit',
          originalDate: resp.data.date,
          originalDueDate: resp.data.dueDate,
          isConsignee: resp.data.warehouseCode === resp.data.custCode ?? false,
          createdDate: (resp.data.createdDate === null) ? null : format(parseISO(resp.data.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
          updatedDate: (resp.data.updatedDate === null) ? null : format(parseISO(resp.data.updatedDate), 'dd-MMM-yyyy HH:mm:ss'),
          approvedDate: (resp.data.approvedDate === null) ? null : format(parseISO(resp.data.approvedDate), 'dd-MMM-yyyy HH:mm:ss')
        }

        // Get customer details
        this.custCodeChange()

        // Get item details
        api.getAll(`${this.endpoint.sales.order}/item`, {
          params: { code: resp.data.soCode }
        })
          .then(response => {
            this.gridItem.data = response.data.tableData
          })

        // Get bonus item details
        api.getAll(`${this.endpoint.sales.order}/free-item`, {
          params: { code: resp.data.code }
        })
          .then(response => {
            this.gridBonus.data = response.data.tableData
          })

        // Get related transaction details
        api.getAll(`${this.endpoint.sales.directInvoice}/related-trans`, {
          params: { code: resp.data.code }
        })
          .then(response => {
            this.gridRelated.data = response.data.tableData
          })

        // Get Memo List
        api.getAll(`${this.endpoint.sales.invoice}/memo`, {
          params: { code: resp.data.code }
        })
          .then(response => {
            this.gridMemo.data = response.data.tableData
          })

        // Get Promo
        api.getAll(`${this.endpoint.sales.promo}/list`, {
          params: { code: resp.data.code }
        })
          .then(response => {
            const data = response.data.tableData
            const obj = new Object()
            const result = []
            for (let i = 0; i < data.length; i++) {
              obj['name'] = data[i]
              obj['usePromo'] = true
              result.push(obj)
            }
            this.gridPromo.data = result
          })
      } else {
        this.data.action = 'add'
        
        // Validate form first
        setTimeout(() => {
          this.$refs.form.validate()
        }, 0)
      }

      // Set focus to order code field
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
    },
    close() {
      this.$router.push({ name: 'sales-invoice' })
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Void?',
          'Apakah anda yakin ingin membuat void data ini?')
      ) {
        api.delete(this.endpoint.sales.directInvoice, item.code, {data: item})
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
            }
          })
      }
    },
    async save(closeDialog) {
      document.activeElement.blur()
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      
      if (this.isMemoDuplicate()) {
        this.$store.dispatch('app/showInfo', 'Tidak bisa melakukan simpan karena terdapat kredit memo dengan kode yang sama.')
        return
      }

      const data = this.data
      for (let i = 0; i < this.gridItem.data.length; i++) {
        const bonusData = this.gridBonus.data.filter(x => x.orderDetailId === this.gridItem.data[i].id)
        this.gridItem.data[i].freeItemDetails = bonusData
        this.gridItem.data[i].discountItemDetails = this.gridItem.data[i].discPromo
      }
      data.itemDetails = this.gridItem.data
      data.memos = this.gridMemo.data

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.directInvoice, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.directInvoice, data.code, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.close()
        } else {
          this.data.code = result.data
        }
      }
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
    addMemo() {
      if (!this.data.custCode || !this.data.total || !this.data.total === 0) {
        this.$store.dispatch('app/showInfo', 'Silahkan pilih pesanan dan pelanggan terlebih dahulu.')
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
        const idx = this.gridItem.data.findIndex(i => i.id === item.id)
        this.gridItem.data.splice(idx, 1)
        
        // Find Promo
        await this.findPromo()

        // Calc Promo
        await this.calcPromo()

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
        const idx = this.gridMemo.data.findIndex(i => i.creditMemoCode === item.creditMemoCode)
        this.gridMemo.data.splice(idx, 1)
      }
    },
    custCodeChange() {
      const customer = this.customers.find(s => s.code === this.data.custCode)
      if (customer) {
        this.data.custName = customer.name
        this.data.custAddr = customer.address1
        this.data.custPhone = customer.phone1
        this.data.custFax = customer.fax
        this.data.paymentTermId = customer.paymentTermId
        this.data.custTypeId = customer.typeId

        const paymentData = this.paymentTerms.find(x => x.id === customer.paymentTermId)
        if (paymentData) {
          const date = addDays(parseISO(this.data.date), paymentData.due)
          this.data.dueDate = format(date, 'yyyy-MM-dd')
        }
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
      this.data.finalDisc = this.data.dpp * (this.data.finalDiscPercent / 100)
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
      this.data.taxAmount = Math.round(_sumBy(this.gridItem.data, 'totTax'))
      this.data.dpp = Math.round(_sumBy(this.gridItem.data, 'totDPP')) - this.data.finalDisc
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
    },
    bindItemData(rowItem) {
      this.itemIdChange(rowItem)

      //find Promo
      this.findPromo()
    },
    async findPromo() {
      const gridData = this.gridItem.data
      this.gridPromo.data = []
      for (let k = 0; k < gridData.length; k++) {
        for (let i = 0; i < this.promos.length; i++) {
          let appliedHeader = false
          const applied = this.promos[i].itemDetails.find(x => x.itemId === gridData[k].itemId || x.itemId === gridData[k].categoryId || x.applyTo === 2)
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
              this.promos[i].usePromo = true
              this.gridPromo.data.push(this.promos[i])
            }
          }
        }
      }
    },
    async calcPromo() {
      const dataPromo = this.gridPromo.data.filter(x => x.usePromo === true)
      const gridData = this.gridItem.data
      const mainData = this.data
      mainData.finalDisc = 0
      mainData.finalDiscPercent = 0
      const bonusPromo = [] 
      for (let k = 0; k < gridData.length; k++) {
        if (dataPromo.length > 0) {
          let totalDisc = 0 
          const discPromo = []
          for (let i = 0; i < dataPromo.length; i++) {
            for (let j = 0; j < dataPromo[i].itemDetails.length; j++) {
              const applyTo = dataPromo[i].itemDetails[j].applyTo
              if (applyTo === 1) {
                if (dataPromo[i].itemDetails[j].itemId === gridData[k].itemId) {
                  if (dataPromo[i].itemDetails[j].promoType === 1) {
                    // Apply to Barang - Promo Method Reguler
                    if (dataPromo[i].itemDetails[j].isPercentage) {
                      totalDisc += gridData[k].unitPrice * (dataPromo[i].itemDetails[j].valuePercentage / 100)
                      discPromo.push({
                        id: randomNumber(-1, -1000),
                        promoDetailId: dataPromo[i].itemDetails[j].id,
                        promoCode: dataPromo[i].code,
                        name: dataPromo[i].name, 
                        promoMethod: 1, 
                        value: dataPromo[i].itemDetails[j].valuePercentage, 
                        nettPrice: 0, 
                        coaCode: dataPromo[i].coaCost, 
                        amount: gridData[k].unitPrice * (dataPromo[i].itemDetails[j].valuePercentage / 100), 
                        fromPromo: true, 
                        isPercentage: dataPromo[i].itemDetails[j].isPercentage
                      })
                    } else {
                      totalDisc += dataPromo[i].itemDetails[j].valueAmount
                      discPromo.push({
                        id: randomNumber(-1, -1000),
                        promoDetailId: dataPromo[i].itemDetails[j].id,
                        promoCode: dataPromo[i].code,
                        name: dataPromo[i].name, 
                        promoMethod: 2, 
                        value: dataPromo[i].itemDetails[j].valueAmount,  
                        nettPrice: 0, 
                        coaCode: dataPromo[i].coaCost, 
                        amount: dataPromo[i].itemDetails[j].valueAmount, 
                        fromPromo: true, 
                        isPercentage: dataPromo[i].itemDetails[j].isPercentage
                      })
                    }
                  } else if (dataPromo[i].itemDetails[j].promoType === 2) {
                    // Apply to Barang - Promo Method Qty Barang
                    const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => gridData[k].qty >= x.fromQty && gridData[k].qty <= x.toQty)
                    if (tierData) {
                      if (dataPromo[i].itemDetails[j].isPercentage) {
                        if (tierData.applyToAllUnit) {
                          const promoUnit = gridData[k].units.find(x => x.id === tierData.saleUnit)
                          const itemUnit = gridData[k].units.find(x => x.id === gridData[k].unitId)
                          if (itemUnit.seq >= promoUnit.seq) {
                            totalDisc += gridData[k].unitPrice * (tierData.value / 100)
                            discPromo.push({
                              id: randomNumber(-1, -1000),
                              promoDetailId: dataPromo[i].itemDetails[j].id,
                              promoCode: dataPromo[i].code,
                              name: dataPromo[i].name, 
                              promoMethod: 1, 
                              value: tierData.value, 
                              nettPrice: 0, 
                              coaCode: dataPromo[i].coaCost, 
                              amount: gridData[k].unitPrice * (tierData.value / 100), 
                              fromPromo: true, 
                              isPercentage: dataPromo[i].itemDetails[j].isPercentage
                            })
                          }
                        } else if (gridData[k].unitId === tierData.saleUnit) {
                          totalDisc += gridData[k].unitPrice * (tierData.value / 100)
                          discPromo.push({
                            id: randomNumber(-1, -1000),
                            promoDetailId: dataPromo[i].itemDetails[j].id,
                            promoCode: dataPromo[i].code,
                            name: dataPromo[i].name, 
                            promoMethod: 1, 
                            value: tierData.value, 
                            nettPrice: 0, 
                            coaCode: dataPromo[i].coaCost, 
                            amount: gridData[k].unitPrice * (tierData.value / 100), 
                            fromPromo: true, 
                            isPercentage: dataPromo[i].itemDetails[j].isPercentage
                          })
                        }
                      } else if (tierData.applyToAllUnit) {
                        const promoUnit = gridData[k].units.find(x => x.id === tierData.saleUnit)
                        const itemUnit = gridData[k].units.find(x => x.id === gridData[k].unitId)
                        if (itemUnit.seq >= promoUnit.seq) {
                          totalDisc += tierData.value
                          discPromo.push({
                            id: randomNumber(-1, -1000),
                            promoDetailId: dataPromo[i].itemDetails[j].id,
                            promoCode: dataPromo[i].code,
                            name: dataPromo[i].name, 
                            promoMethod: 2, 
                            value: tierData.value, 
                            nettPrice: 0, 
                            coaCode: dataPromo[i].coaCost, 
                            amount: tierData.value, 
                            fromPromo: true, 
                            isPercentage: dataPromo[i].itemDetails[j].isPercentage
                          })
                        }
                      } else if (gridData[k].unitId === tierData.saleUnit) {
                        totalDisc += tierData.value
                        discPromo.push({
                          id: randomNumber(-1, -1000),
                          promoDetailId: dataPromo[i].itemDetails[j].id,
                          promoCode: dataPromo[i].code,
                          name: dataPromo[i].name, 
                          promoMethod: 2, 
                          value: tierData.value, 
                          nettPrice: 0, 
                          coaCode: dataPromo[i].coaCost, 
                          amount: tierData.value, 
                          fromPromo: true, 
                          isPercentage: dataPromo[i].itemDetails[j].isPercentage
                        })
                      }
                    }
                  } else if (dataPromo[i].itemDetails[j].promoType === 3) {
                    // Apply to Barang - Promo Method Bonus
                    const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => gridData[k].qty >= x.fromQty && gridData[k].qty <= x.toQty)
                    if (tierData) {
                      if (tierData.isMultiple) {
                        if (gridData[k].unitId === tierData.saleUnit) {
                          const freeItem = _cloneDeep(this.items.find(x => x.id === tierData.freeGoodItemId))
                          freeItem.units = await this.getUnitItemLists(freeItem)
                          freeItem.itemId = freeItem.id
                          this.itemIdChange(freeItem)
                          freeItem.unitId = parseInt(tierData.unitFreeGood)
                          this.unitItemChange(freeItem)
                          freeItem.unitName = freeItem.units.find(x => x.id === parseInt(tierData.unitFreeGood)).unitEquivalent
                          const multipleValue = Math.floor(gridData[k].qty / tierData.fromQty)
                          const item = {
                            id: randomNumber(-1, -1000),
                            initial: freeItem.initial,
                            name: freeItem.name,
                            orderDetailId: gridData[k].id,
                            promoCode: dataPromo[i].code,
                            uomId: freeItem.uomId,
                            itemId: tierData.freeGoodItemId,
                            unitId: tierData.unitFreeGood,
                            unitName: freeItem.unitName,
                            qty: tierData.value * multipleValue,
                            qtyClosed: 0,
                            unitPrice: freeItem.unitPrice,
                            coaCode: dataPromo[i].coaCost
                          }
                          bonusPromo.push(item)
                        }
                      } else if (gridData[k].unitId === tierData.saleUnit) {
                        const freeItem = _cloneDeep(this.items.find(x => x.id === tierData.freeGoodItemId))
                        freeItem.units = await this.getUnitItemLists(freeItem)
                        freeItem.itemId = freeItem.id
                        this.itemIdChange(freeItem)
                        freeItem.unitId = parseInt(tierData.unitFreeGood)
                        this.unitItemChange(freeItem)
                        freeItem.unitName = freeItem.units.find(x => x.id === parseInt(tierData.unitFreeGood)).unitEquivalent
                        const item = {
                          id: randomNumber(-1, -1000),
                          initial: freeItem.initial,
                          name: freeItem.name,
                          orderDetailId: gridData[k].id,
                          promoCode: dataPromo[i].code,
                          uomId: freeItem.uomId,
                          itemId: tierData.freeGoodItemId,
                          unitId: tierData.unitFreeGood,
                          unitName: freeItem.unitName,
                          qty: tierData.value,
                          qtyClosed: 0,
                          unitPrice: freeItem.unitPrice,
                          coaCode: dataPromo[i].coaCost
                        }
                        bonusPromo.push(item)
                      }
                    }
                  } else if (dataPromo[i].itemDetails[j].promoType === 4) {
                    // Apply to Barang - Promo Method Payment Term
                    const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => x.paymentTermId === this.data.paymentTermId)
                    if (tierData) {
                      if (tierData.isPercentage) {
                        totalDisc += gridData[k].unitPrice * (tierData.value / 100)
                        discPromo.push({
                          id: randomNumber(-1, -1000),
                          promoDetailId: dataPromo[i].itemDetails[j].id,
                          promoCode: dataPromo[i].code,
                          name: dataPromo[i].name, 
                          promoMethod: 1, 
                          value: tierData.value, 
                          nettPrice: 0, 
                          coaCode: dataPromo[i].coaCost, 
                          amount: gridData[k].unitPrice * (tierData.value / 100), 
                          fromPromo: true, 
                          isPercentage: dataPromo[i].itemDetails[j].isPercentage
                        })
                      } else {
                        totalDisc += tierData.value
                        discPromo.push({
                          id: randomNumber(-1, -1000),
                          promoDetailId: dataPromo[i].itemDetails[j].id,
                          promoCode: dataPromo[i].code, 
                          name: dataPromo[i].name, 
                          promoMethod: 2, 
                          value: tierData.value, 
                          nettPrice: 0, 
                          coaCode: dataPromo[i].coaCost, 
                          amount: tierData.value, 
                          fromPromo: true, 
                          isPercentage: dataPromo[i].itemDetails[j].isPercentage
                        })
                      }
                    }
                  }
                }
              } else if (applyTo === 3) {
                const dtItem = this.items.find(i => i.id === gridData[k].itemId)
                if (dtItem.categoryId === dataPromo[i].itemDetails[j].itemId) {
                  if (dataPromo[i].itemDetails[j].promoType === 1) {
                    // Apply to Kategori Barang - Promo Method Reguler
                    if (dataPromo[i].itemDetails[j].isPercentage) {
                      totalDisc += gridData[k].unitPrice * (dataPromo[i].itemDetails[j].valuePercentage / 100)
                      discPromo.push({
                        id: randomNumber(-1, -1000),
                        promoDetailId: dataPromo[i].itemDetails[j].id,
                        promoCode: dataPromo[i].code,
                        name: dataPromo[i].name, 
                        promoMethod: 1, 
                        value: dataPromo[i].itemDetails[j].valuePercentage, 
                        nettPrice: 0, 
                        coaCode: dataPromo[i].coaCost, 
                        amount: gridData[k].unitPrice * (dataPromo[i].itemDetails[j].valuePercentage / 100), 
                        fromPromo: true, 
                        isPercentage: dataPromo[i].itemDetails[j].isPercentage
                      })
                    } else {
                      totalDisc += dataPromo[i].itemDetails[j].valueAmount
                      discPromo.push({
                        id: randomNumber(-1, -1000),
                        promoDetailId: dataPromo[i].itemDetails[j].id,
                        promoCode: dataPromo[i].code, 
                        name: dataPromo[i].name, 
                        promoMethod: 2, 
                        value: dataPromo[i].itemDetails[j].valueAmount, 
                        nettPrice: 0, 
                        coaCode: dataPromo[i].coaCost, 
                        amount: dataPromo[i].itemDetails[j].valueAmount, 
                        fromPromo: true, 
                        isPercentage: dataPromo[i].itemDetails[j].isPercentage
                      })
                    }
                  } else if (dataPromo[i].itemDetails[j].promoType === 2) {
                    // Apply to Kategori Barang - Promo Method Qty Barang
                    const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => gridData[k].qty >= x.fromQty && gridData[k].qty <= x.toQty)
                    if (tierData) {
                      if (dataPromo[i].itemDetails[j].isPercentage) {
                        totalDisc += gridData[k].unitPrice * (tierData.value / 100)
                        discPromo.push({
                          id: randomNumber(-1, -1000),
                          promoDetailId: dataPromo[i].itemDetails[j].id,
                          promoCode: dataPromo[i].code, 
                          name: dataPromo[i].name, 
                          promoMethod: 1, 
                          value: tierData.value, 
                          nettPrice: 0, 
                          coaCode: dataPromo[i].coaCost, 
                          amount: gridData[k].unitPrice * (tierData.value / 100), 
                          fromPromo: true, 
                          isPercentage: dataPromo[i].itemDetails[j].isPercentage
                        })
                      } else {
                        totalDisc += tierData.value
                        discPromo.push({
                          id: randomNumber(-1, -1000),
                          promoDetailId: dataPromo[i].itemDetails[j].id,
                          promoCode: dataPromo[i].code,
                          name: dataPromo[i].name, 
                          promoMethod: 2, 
                          value: tierData.value, 
                          nettPrice: 0, 
                          coaCode: dataPromo[i].coaCost, 
                          amount: tierData.value, 
                          fromPromo: true, 
                          isPercentage: dataPromo[i].itemDetails[j].isPercentage
                        })
                      }
                    }
                  } else if (dataPromo[i].itemDetails[j].promoType === 3) {
                    // Apply to Kategori Barang - Promo Method Bonus
                    const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => gridData[k].qty >= x.fromQty && gridData[k].qty <= x.toQty)
                    if (tierData) {
                      if (tierData.isMultiple) {
                        if (gridData[k].unitId === tierData.saleUnit) {
                          const freeItem = _cloneDeep(this.items.find(x => x.id === tierData.freeGoodItemId))
                          freeItem.units = await this.getUnitItemLists(freeItem)
                          freeItem.itemId = freeItem.id
                          this.itemIdChange(freeItem)
                          freeItem.unitId = parseInt(tierData.unitFreeGood)
                          this.unitItemChange(freeItem)
                          freeItem.unitName = freeItem.units.find(x => x.id === parseInt(tierData.unitFreeGood)).unitEquivalent
                          const multipleValue = Math.floor(gridData[k].qty / tierData.fromQty)
                          const item = {
                            id: randomNumber(-1, -1000),
                            initial: freeItem.initial,
                            name: freeItem.name,
                            orderDetailId: gridData[k].id,
                            promoCode: dataPromo[i].code,
                            uomId: freeItem.uomId,
                            itemId: tierData.freeGoodItemId,
                            unitId: tierData.unitFreeGood,
                            unitName: freeItem.unitName,
                            qty: tierData.value * multipleValue,
                            qtyClosed: 0,
                            unitPrice: freeItem.unitPrice,
                            coaCode: dataPromo[i].coaCost
                          }
                          bonusPromo.push(item)
                        }
                      } else if (gridData[k].unitId === tierData.saleUnit) {
                        const freeItem = _cloneDeep(this.items.find(x => x.id === tierData.freeGoodItemId))
                        freeItem.units = await this.getUnitItemLists(freeItem)
                        freeItem.itemId = freeItem.id
                        this.itemIdChange(freeItem)
                        freeItem.unitId = parseInt(tierData.unitFreeGood)
                        this.unitItemChange(freeItem)
                        freeItem.unitName = freeItem.units.find(x => x.id === parseInt(tierData.unitFreeGood)).unitEquivalent
                        const item = {
                          id: randomNumber(-1, -1000),
                          initial: freeItem.initial,
                          name: freeItem.name,
                          orderDetailId: gridData[k].id,
                          promoCode: dataPromo[i].code,
                          uomId: freeItem.uomId,
                          itemId: tierData.freeGoodItemId,
                          unitId: tierData.unitFreeGood,
                          unitName: freeItem.unitName,
                          qty: tierData.value,
                          qtyClosed: 0,
                          unitPrice: freeItem.unitPrice,
                          coaCode: dataPromo[i].coaCost
                        }
                        bonusPromo.push(item)
                      }
                    }
                  } else if (dataPromo[i].itemDetails[j].promoType === 4) {
                    // Apply to Kategori Barang - Promo Method Payment Term
                    const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => x.paymentTermId === this.data.paymentTermId)
                    if (tierData) {
                      if (tierData.isPercentage) {
                        totalDisc += gridData[k].unitPrice * (tierData.value / 100)
                        discPromo.push({
                          id: randomNumber(-1, -1000),
                          promoDetailId: dataPromo[i].itemDetails[j].id,
                          promoCode: dataPromo[i].code,
                          name: dataPromo[i].name, 
                          promoMethod: 1, 
                          value: tierData.value, 
                          nettPrice: 0, 
                          coaCode: dataPromo[i].coaCost, 
                          amount: gridData[k].unitPrice * (tierData.value / 100), 
                          fromPromo: true, 
                          isPercentage: dataPromo[i].itemDetails[j].isPercentage
                        })
                      } else {
                        totalDisc += tierData.value
                        discPromo.push({
                          id: randomNumber(-1, -1000),
                          promoDetailId: dataPromo[i].itemDetails[j].id,
                          promoCode: dataPromo[i].code, 
                          name: dataPromo[i].name, 
                          promoMethod: 2, 
                          value: tierData.value, 
                          nettPrice: 0, 
                          coaCode: dataPromo[i].coaCost, 
                          amount: tierData.value, 
                          fromPromo: true, 
                          isPercentage: dataPromo[i].itemDetails[j].isPercentage
                        })
                      }
                    }
                  }
                }
              } else if (applyTo === 2) { 
                if (dataPromo[i].itemDetails[j].promoType === 5) {     
                  // Apply to Faktur - Nilai Trans           
                  const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => mainData.subTotal >= x.fromQty && mainData.subTotal <= x.toQty)
                  if (tierData) {
                    if (tierData.isPercentage) {
                      const prorateValue = (gridData[k].unitPrice / _sumBy(gridData, 'unitPrice')) * (gridData[k].unitPrice * (tierData.value / 100)) / gridData[k].qty
                      totalDisc += prorateValue
                      discPromo.push({
                        id: randomNumber(-1, -1000),
                        promoDetailId: dataPromo[i].itemDetails[j].id,
                        promoCode: dataPromo[i].code,
                        name: dataPromo[i].name, 
                        promoMethod: 1, 
                        value: tierData.value, 
                        nettPrice: 0, 
                        coaCode: dataPromo[i].coaCost, 
                        amount: prorateValue, 
                        fromPromo: true, 
                        isPercentage: dataPromo[i].itemDetails[j].isPercentage
                      })
                    } else {
                      const prorateValue = (gridData[k].unitPrice / _sumBy(gridData, 'unitPrice')) * tierData.value / gridData[k].qty
                      totalDisc += prorateValue
                      discPromo.push({
                        id: randomNumber(-1, -1000),
                        promoDetailId: dataPromo[i].itemDetails[j].id,
                        promoCode: dataPromo[i].code, 
                        name: dataPromo[i].name, 
                        promoMethod: 2, 
                        value: tierData.value, 
                        nettPrice: 0, 
                        coaCode: dataPromo[i].coaCost, 
                        amount: prorateValue, 
                        fromPromo: true, 
                        isPercentage: dataPromo[i].itemDetails[j].isPercentage
                      })
                    }
                  }
                } else {
                  // Apply to Faktur - Promo Method Payment Term
                  const tierData = dataPromo[i].itemDetails[j].promoTierList.find(x => x.paymentTermId === this.data.paymentTermId)
                  if (tierData) {
                    if (tierData.isPercentage) {
                      const prorateValue = (gridData[k].unitPrice / _sumBy(gridData, 'unitPrice')) * (gridData[k].unitPrice * (tierData.value / 100)) / gridData[k].qty
                      totalDisc += prorateValue
                      discPromo.push({
                        id: randomNumber(-1, -1000),
                        promoDetailId: dataPromo[i].itemDetails[j].id,
                        promoCode: dataPromo[i].code,
                        name: dataPromo[i].name, 
                        promoMethod: 1, 
                        value: tierData.value, 
                        nettPrice: 0, 
                        coaCode: dataPromo[i].coaCost, 
                        amount: prorateValue, 
                        fromPromo: true, 
                        isPercentage: dataPromo[i].itemDetails[j].isPercentage
                      })
                    } else {
                      const prorateValue = (gridData[k].unitPrice / _sumBy(gridData, 'unitPrice')) * tierData.value / gridData[k].qty
                      totalDisc += prorateValue
                      discPromo.push({
                        id: randomNumber(-1, -1000),
                        promoDetailId: dataPromo[i].itemDetails[j].id,
                        promoCode: dataPromo[i].code, 
                        name: dataPromo[i].name, 
                        promoMethod: 2, 
                        value: tierData.value, 
                        nettPrice: 0, 
                        coaCode: dataPromo[i].coaCost, 
                        amount: prorateValue, 
                        fromPromo: true, 
                        isPercentage: dataPromo[i].itemDetails[j].isPercentage
                      })
                    }
                  }
                }
              }
            }
          }
          
          if (discPromo.length > 0 && gridData[k].discPromo.length === 0) {
            gridData[k].discPromo = discPromo
            gridData[k].disc = totalDisc
            this.calcItemPrice(gridData[k], false)
          } else if (discPromo.length > 0 && gridData[k].discPromo.length > 0) {
            const nDiscPromo = []
            for (let ip = 0; ip < discPromo.length; ip++) {
              nDiscPromo.push(discPromo[ip])
            }

            for (let iq = 0; iq < gridData[k].discPromo.length; iq++) {
              if (!('promoDetailId' in gridData[k].discPromo[iq]) || gridData[k].discPromo[iq].promoDetailId === null) {
                nDiscPromo.push(gridData[k].discPromo[iq])
              }
            }
            if (nDiscPromo.length > 0) {
              gridData[k].discPromo = nDiscPromo
              gridData[k].disc = _sumBy(gridData[k].discPromo, 'amount') 
              this.calcItemPrice(gridData[k], false)
            }
          } else if (discPromo.length === 0) {
            gridData[k].discPromo = []
            gridData[k].disc = 0
            this.calcItemPrice(gridData[k], false)
          }
        } else {
          const nDiscPromo = []
          for (let iq = 0; iq < gridData[k].discPromo.length; iq++) {
            if (!('promoDetailId' in gridData[k].discPromo[iq]) || gridData[k].discPromo[iq].promoDetailId === null) {
              nDiscPromo.push(gridData[k].discPromo[iq])
            }
          }
          if (nDiscPromo.length > 0) {
            gridData[k].discPromo = nDiscPromo
            gridData[k].disc = _sumBy(gridData[k].discPromo, 'amount') 
            this.calcItemPrice(gridData[k], false)
          } else {
            gridData[k].discPromo = []
            gridData[k].disc = 0
            this.calcItemPrice(gridData[k], false)
          }
        }
        
      }
      this.gridBonus.data = bonusPromo
      this.calcPrice() 
      // this.gridBonus.data = bonusPromo
      // mainData.subTotal = _sumBy(this.gridItem.data, 'total')
      // mainData.finalDisc += mainData.subTotal * (mainData.finalDiscPercent / 100)
      // mainData.finalDiscPercent = mainData.finalDisc / mainData.subTotal * 100
      // if (mainData.includeTax) {
      //   mainData.total = mainData.subTotal - mainData.finalDisc
      // } else {
      //   mainData.total = mainData.subTotal - mainData.finalDisc + mainData.taxAmount
      // }
      // this.data = mainData    
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
    changeWarehouse() {
      const employee = this.employees.find(x => x.id === this.data.salesBy)
      const defWarehouse = this.warehouses.find(w => w.isDefault)
      if (employee && employee.warehouseCode) {
        this.data.warehouseCode = employee.warehouseCode
      } else if (defWarehouse) {
        this.data.warehouseCode = defWarehouse.code
      }
    },
    changeWarehouseConsign() {
      const custWH = this.data.isConsignee ? this.warehouses.find(x => x.code === this.data.custCode) : null
      if (custWH) {
        this.data.warehouseCode = custWH.code
      } else {
        this.data.warehouseCode = null
      }
    },
    changeSeller() {
      this.changeWarehouse()
      this.data.isConsignee = false
    },
    changeConsign() {
      this.changeWarehouseConsign()
    },
    bindMemo(data) {
      for (let i = 0; i < data.length; i++) {
        this.gridMemo.data.push({
          creditMemoCode: data[i].code,
          date: data[i].date,
          type: data[i].type,
          creditMemoAmount: data[i].transAmount          
        })
      }
    },
    isMemoDuplicate() {
      const valueArr = this.gridMemo.data.map(function (item) { return item.creditMemoCode })
      const isDuplicate = valueArr.some(function (item, idx) { 
        return valueArr.indexOf(item) !== idx 
      })
      return isDuplicate
    }
  }
}
</script>
