<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>
          <v-col cols="12" md="8">
            Rencana Kunjungan
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="1" class="text-left">
            <v-btn
              fab
              text
              small
              color="grey darken-2"
              @click="$refs.calendar.prev()"
            >
              <v-icon small>
                mdi-chevron-left
              </v-icon>
            </v-btn>
          </v-col>
          <v-col cols="12" md="2" class="text-center">
            <span v-if="$refs.calendar">
              {{ $refs.calendar.title }}
            </span>
            <span v-else>
              Month
            </span>
          </v-col>
          <v-col cols="12" md="1" class="text-right">
            <v-btn
              fab
              text
              small
              color="grey darken-2"
              @click="$refs.calendar.next()"
            >
              <v-icon small>
                mdi-chevron-right
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-sheet height="500">
          <v-calendar
            ref="calendar"
            v-model="value"
            :type="type"
            :events="events"
            :month-format="getMonth"
            :weekdays="weekday"
            :weekday-format="getDay"
            color="primary"
            locale="id-ID"
            @click:event="showEvent"
            @click:date="viewDay"
            @change="updateRange"
          ></v-calendar>
          <v-menu
            v-model="selectedOpen"
            :close-on-content-click="false"
            :activator="selectedElement"
            offset-x
          >
            <v-card
              color="grey lighten-4"
              min-width="400px"
              flat
            >
              <v-toolbar
                :color="selectedEvent.color"
                dark
              >
                <v-toolbar-title v-html="selectedEvent.titleCard"></v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-data-table
                  :headers="gridDetails.columns"
                  :items="gridDetails.data"
                  :items-per-page="-1"
                  height="200"
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
                          color="orange lighten-1"
                          icon
                          small
                          @click="edit(item)"
                        >
                          <v-icon small>mdi-eye</v-icon>
                        </v-btn>
                      </template>
                      <span class="text-caption">Detail</span>
                    </v-tooltip>
                  </template>
                  <template v-slot:[`item.actionDelete`]="{ item }">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs"
                          v-on="on"
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
                </v-data-table>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  text
                  color="secondary"
                  @click="selectedOpen = false"
                >
                  Tutup
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-sheet>
      </v-card-text>
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
          <v-toolbar-title>Rencana Kunjungan</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="data.mark === 'V' || hasRelatedTrans"
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
                  :disabled="data.mark === 'V' || hasRelatedTrans"
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
                <v-list-item
                  v-shortkey="['ctrl', 'alt', 'n']"
                  :disabled="data.mark === 'V' || data.code === null || hasRelatedTrans"
                  @click="newVisitOrder(true)"
                  @shortkey="newVisitOrder(true)"
                >
                  <v-list-item-title>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                        >
                          Buat Perintah Kunjungan
                        </span>
                      </template>
                      <span class="text-caption">(Ctrl + Alt + N)</span>
                    </v-tooltip>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-shortkey="['ctrl', 'alt', 'a']"
                  :disabled="data.mark === 'V' || data.code === null || !hasRelatedTrans"
                  @click="abortVisitOrder"
                  @shortkey="abortVisitOrder"
                >
                  <v-list-item-title>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                        >
                          Batalkan Perintah Kunjungan
                        </span>
                      </template>
                      <span class="text-caption">(Ctrl + Alt + A)</span>
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
              <v-col cols="7">
                <v-card>
                  <v-card-title>Umum</v-card-title>
                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-text-field
                          ref="code"
                          v-model="data.code"
                          label="No. Renc. Kunjungan"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-text-field
                          ref="VisitDate"
                          v-model="data.date"
                          label="Tanggal"
                          class="mt-0"
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-autocomplete
                          ref="SalesmanGroup"
                          v-model="data.groupId"
                          :items="salesmanGroupRef"
                          :item-text="item => `${item.name}`"
                          :rules="rules.required"
                          :readonly="hasRelatedTrans"
                          label="Grup Sales"
                          item-value="id"
                          class="mt-0"
                          required
                          @change="getEmployee"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="5">
                <v-card>
                  <v-tabs v-model="tab.usersItem">
                    <v-tab key="user">Pengguna</v-tab>

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

            <v-row dense>
              <v-col cols="12">
                <v-card>
                  <v-tabs v-model="tab.advancedItem">
                    <v-tab key="detail">Detail</v-tab>
                    <v-tab key="faktur">Faktur Penjualan</v-tab>
                    <v-tab key="related">Transaksi Terkait</v-tab>

                    <v-tab-item
                      key="detail"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="12">
                              <v-data-table
                                :headers="gridSales.columns"
                                :items="gridSales.data"
                                :items-per-page="-1"
                                :expanded.sync="expanded"
                                :item-key="data.action === 'edit' ? 'visitPlanDetailId' : 'salesmanScheduleId'"
                                height="300"
                                class="elevation-1"
                                dense
                                disable-sort
                                fixed-header
                                hide-default-footer
                                show-expand
                              >
                                <template v-if="data.action === 'edit'" v-slot:expanded-item="{ headers, item }">
                                  <td :colspan="headers.length">
                                    <v-row :key="item.visitPlanDetailId" dense>
                                      <v-col cols="12">
                                        <v-data-table
                                          :headers="gridCustomer.columns"
                                          :items="getDetailCustomer(item.visitPlanDetailId, 'edit')"
                                          :items-per-page="-1"
                                          class="elevation-1"
                                          dense
                                          disable-sort
                                          fixed-header
                                          hide-default-footer
                                        ></v-data-table>
                                      </v-col>
                                    </v-row>
                                  </td>
                                </template>
                                <template v-else v-slot:expanded-item="{ headers, item }">
                                  <td :colspan="headers.length">
                                    <v-row :key="item.salesmanScheduleId" dense>
                                      <v-col cols="12">
                                        <v-data-table
                                          :headers="gridCustomer.columns"
                                          :items="getDetailCustomer(item.salesmanScheduleId, 'add')"
                                          :items-per-page="-1"
                                          class="elevation-1"
                                          dense
                                          disable-sort
                                          fixed-header
                                          hide-default-footer
                                        ></v-data-table>
                                      </v-col>
                                    </v-row>
                                  </td>
                                </template>     
                              </v-data-table>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="faktur"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="12">
                              <v-data-table
                                :headers="gridFaktur.columns"
                                :items="gridFaktur.data"
                                :items-per-page="-1"
                                height="300"
                                class="elevation-1"
                                dense
                                disable-sort
                                fixed-header
                                hide-default-footer
                              ></v-data-table>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>

                    <v-tab-item
                      key="related"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="12">
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
                              ></v-data-table>
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'
import { randomNumber } from '@/helpers/math-helpers'

import api from '@/services/axios.service'

import Confirm from '@/components/dialog/Confirm'

export default {
  components: {
    Confirm
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      receiveDate: false
    },
    tab: {
      advancedItem: null,
      usersItem: null
    },
    gridDetails: {
      columns: [
        { value: 'action', sortable: false, divider: false, width: '1' },
        { value: 'actionDelete', sortable: false, divider: true, width: '1' },
        { text: 'No. Renc. Kunjungan', value: 'code', divider: true, width: '200' },
        { text: 'Dibuat Oleh', value: 'createdInitial', divider: true, width: '120' },
        { text: 'Grup', value: 'groupName', divider: true, width: '120' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridSales: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '1' },
        { text: 'Inisial Karyawan', value: 'initial', divider: true, width: '150' },
        { text: 'Nama Karyawan', value: 'fullName', divider: true, width: '350' },
        { text: 'Jenis Kelamin', value: 'genderInitial', divider: true, width: '80' },
        { text: 'Inisial Grup', value: 'groupInitial', divider: true, width: '150' },
        { text: 'Nama Grup', value: 'groupNameInitial', divider: true, width: '200' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridCustomer: {
      columns: [
        { text: 'Inisial Pelanggan', value: 'initial', divider: true, width: '150' },
        { text: 'Nama Pelanggan', value: 'name', divider: true, width: '350' },
        { text: 'Wilayah', value: 'areaName1', divider: true, width: '200' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridFaktur: {
      columns: [
        { text: 'No. Faktur', value: 'code', divider: true, width: '150' },
        { text: 'Tgl. Transaksi', value: 'date', divider: true, width: '100' },
        { text: 'Tgl. Jatuh Tempo', value: 'dueDate', divider: true, width: '100' },
        { text: 'Penjual', value: 'employeeInitial', divider: true, width: '150' },
        { text: 'Pelanggan', value: 'customerInitial', divider: true, width: '150' },
        { text: 'Status', value: 'status', divider: true, width: '70' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    gridRelated: {
      columns: [
        { text: 'No. Perintah Kunjungan', value: 'code', divider: true, width: '150' },
        { text: 'No. Faktur', value: 'invCode', divider: true, width: '100' },
        { text: 'Tanggal', value: 'date', divider: true, width: '100' },
        { text: 'Inisial Pelanggan', value: 'custCode', divider: true, width: '150' },
        { text: 'Nama Pelanggan', value: 'customerName', divider: true, width: '150' },
        { text: 'Status', value: 'status', divider: true, width: '70' }
      ],
      data: [],
      options: {
        sortBy: ['code'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    type: 'month',
    mode: 'stack',
    weekday: [0, 1, 2, 3, 4, 5, 6],
    value: '',
    saveState: false,
    currentDate: null,
    currentGroup: null,
    customerDetail: [],
    dataInOneMonth: [],
    daysOfWeek: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    events: [],
    expanded: [],
    monthOfYear: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sept', 'Okt', 'Nov', 'Des'],
    salesmanGroupRef: [],
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    visitPlanDetail: [],
    visitPlanDetailCustomer: [],
    visitOrderData: {},
    data: {}
  }),

  // created: function () {
  //   this.getAreaName()
  // },

  mounted: function () {
    setTimeout(() => {
      this.value = format(new Date(), 'yyyy-MM-dd')      
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Penjualan'
      }, {
        text: 'Transaksi'
      }, {
        text: 'Rencana Kunjungan'
      }])
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  // watch: {
  //   'grid.options': {
  //     handler() {
  //       this.getList()
  //     },
  //     deep: true
  //   }
  // },

  computed: {
    ...mapState({
      gridDefOpts: state => state.app.grid,
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    hasRelatedTrans() {
      return (this.gridRelated?.data?.length > 0)
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        code: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        groupId: null
      }
      this.tab.advancedItem = 0
      this.tab.usersItem = 0
      this.gridSales.data = []
      this.gridCustomer.data = []
      this.customerDetail = []
      this.visitPlanDetail = []
      this.visitPlanDetailCustomer = []
      this.salesmanGroupRef = []

      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }
    },
    getList(startDate, endDate) {
      api.getAll(this.endpoint.sales.visitPlan, {
        params: {
          filters: JSON.stringify([{
            field: 'date',
            operator: 'gte',
            keyword: startDate
          }, {
            field: 'date',
            operator: 'lte',
            keyword: endDate
          }, {
            field: 'mark',
            operator: 'eq',
            keyword: 'A'
          }]),
          sorts: JSON.stringify([{
            field: 'date',
            direction: 'asc'
          }, {
            field: 'groupId',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.dataInOneMonth = response.data.tableData
          this.fillDataCalendar()
        })
    },
    close() {
      this.dialog.add = false
      this.refreshCalendar()
    },
    add(visitDate) {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add' 
      this.data.date = format(parseISO(visitDate), 'dd-MMM-yyyy')  
      this.data.approvedDate = format(new Date(), 'dd-MMM-yyyy HH:mm:ss')

      this.gridDetails.data = []
      this.getEvents(visitDate)
      this.getSalesmanGroup()

      setTimeout(() => {
        // Set focus to receive SalesmanGroup field
        this.$refs.SalesmanGroup.focus()

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
        oldGroupId: item.groupId,
        date: format(parseISO(item.date), 'dd-MMM-yyyy'),
        createdDate: format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss'),
        approvedDate: format(parseISO(item.approvedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get item details
      this.getVisitPlanDetail()
      this.getSalesmanGroup()
      this.loadRelated()

      // Set focus to receive code field
      setTimeout(() => {
        this.$refs.SalesmanGroup.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Non-Aktif?',
          'Apakah anda yakin ingin me-non-aktifkan data ini?')
      ) {
        api.delete(this.endpoint.sales.visitPlan, item.code)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.refreshCalendar()
            }
          })
      }
    },
    async save(closeDialog) {
      if (!this.$refs.form.validate()) {
        if (this.saveState) {
          this.data.action = 'edit'
          this.saveState = false
        }
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      if (!this.gridSales.data.length || this.gridSales.data.length === 0) {
        if (this.saveState) {
          this.data.action = 'edit'
          this.saveState = false
        }
        this.$store.dispatch('app/showInfo', 'Silahkan isi jadwal kunjungan terlebih dahulu pada menu karyawan.')
        return
      }

      let isOtherGroupExist = []
      if (this.data.action === 'add') {
        isOtherGroupExist = this.gridDetails.data.find(x => x.groupId === this.data.groupId)
      } else {
        isOtherGroupExist = this.gridDetails.data.find(x => x.groupId === this.data.groupId && x.code !== this.data.code)
      }
      if (isOtherGroupExist) {
        if (this.saveState) {
          this.data.action = 'edit'
          this.saveState = false
        }
        this.$store.dispatch('app/showInfo', 'Grup ini sudah ada pada rencana kunjungan lain.')
        return
      }

      // Prevent save data user action from edit mode
      if (this.saveState) {
        this.data.action = 'edit'
        this.saveState = false
      }

      const data = this.data
      data.date = this.value

      this.newMappingVisitPlanDetail(this.gridSales.data)
      data.itemDetails = this.visitPlanDetail
      data.customerDetails = this.visitPlanDetailCustomer

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.sales.visitPlan, data)
        result = resp.data
      } else if (data.action === 'edit') {
        const resp = await api.update(this.endpoint.sales.visitPlan, data.code, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else {
          this.data.code = result.data
        }
        this.refreshCalendar()
      }
    },
    async newVisitOrder(closeDialog) {
      const details = []
      for (let i = 0; i < this.customerDetail.length; i++) {
        details.push({
          code: '',
          custCode: this.customerDetail[i].code,
          replacingForSalesmanId: 0, // Default sementara
          visited: true // Default sementara
        })
      }

      this.visitOrderData = {
        code: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        salesmanId: this.data.groupId,
        visitPlanCode: this.data.code,
        notes: '',
        createdDate: format(new Date(), 'yyyy-MM-dd'),
        updatedDate: format(new Date(), 'yyyy-MM-dd'),
        approvedDate: format(new Date(), 'yyyy-MM-dd'),
        customerDetails: details,
        invoiceDetails: []
      }

      let result = { success: false, message: '' }
      const resp = await api.create(this.endpoint.sales.visitOrder, this.visitOrderData)
      result = resp.data

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        }
        this.refreshCalendar()
      }
    },
    async abortVisitOrder() {
      if (this.gridRelated.data.length) {
        api.delete(this.endpoint.sales.visitOrder, this.gridRelated.data[0].code)
          .then(response => {
            if (response.data.success) {
              const msg = response.data.message
              this.$store.dispatch('app/showSuccess', msg.replace('dihapus.', 'dibatalkan.'))
              this.dialog.add = false
              this.refreshCalendar()
            }
          })
      }
    },
    loadRelated() {
      api.getAll(this.endpoint.sales.visitOrder, {
        params: {
          filters: JSON.stringify([{
            field: 'visitPlanCode',
            operator: 'eq',
            keyword: this.data.code
          }, {
            field: 'mark',
            operator: 'eq',
            keyword: 'A'
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.gridRelated.data = response.data.tableData
        })
    },
    newMappingVisitPlanDetail(item) {
      if (item.length) {
        for (let i = 0; i < item.length; i++) {
          const newId = randomNumber(-1, -1000)
          const newItem = {
            id: newId,
            code: this.data.code,
            salesmanId: item[i].id
          }
          this.visitPlanDetail.push(newItem)

          const customerFilter = this.getDetailCustomer(item[i].salesmanScheduleId, 'add')
          if (customerFilter.length) {
            for (let j = 0; j < customerFilter.length; j++) {
              const newCustomer = {
                id: randomNumber(-1, -1000),
                visitPlanDetailId: newId,
                custCode: customerFilter[j].code
              }
              this.visitPlanDetailCustomer.push(newCustomer)
            }
          }
        }
      }
    },
    viewDay({ date }) {
      this.value = date
      this.add(date)
    },
    getDay(d) {
      return this.daysOfWeek[d.weekday]
    },
    getMonth(m) {
      return this.monthOfYear[m.month - 1]
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        this.selectedOpen = true
        requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen))
      }
      if (this.selectedOpen) {
        this.selectedOpen = false
        requestAnimationFrame(() => requestAnimationFrame(() => open()))
      } else {
        open()
        this.gridDetails.data = []
        this.getEvents(format(this.selectedEvent.start, 'yyyy-MM-dd'))
      }
      nativeEvent.stopPropagation()
    },
    updateRange({ start, end }) {
      const min = start.date // Tanggal 1
      const max = end.date // Tanggal akhir bulan

      this.events = []
      this.currentDate = null
      this.currentGroup = null
      // Diambil dari total VisitPlan dalam sebulan, distinct tanggal per bulan dari min dan max
      this.getList(min, max)
    },
    fillDataCalendar() {
      const events = []
      let planCount = 0

      for (let i = 0; i < this.dataInOneMonth.length; i++) {
        // Set events in the next loop
        if (this.currentDate !== this.dataInOneMonth[i].date) {
          const first = new Date(this.currentDate)
          const second = new Date(this.currentDate)

          events.push({
            name: `${planCount} Rencana Kunjungan`,
            start: first,
            end: second,
            color: 'indigo',
            timed: false, //no timestamp
            titleCard: `${this.daysOfWeek[first.getDay()]}, ${format(first, 'dd-MMM-yyyy')}`,
            visitDay: first.getDay()
          })

          // Reset
          planCount = 0
          this.currentDate = this.dataInOneMonth[i].date
          this.currentGroup = null
        }

        // First time looping
        if (i === 0) {
          this.currentDate = this.dataInOneMonth[i].date
          this.currentGroup = this.dataInOneMonth[i].groupId
          planCount += 1
        }

        // Check visit plan count in 1 day
        if (this.currentDate === this.dataInOneMonth[i].date && this.currentGroup !== this.dataInOneMonth[i].groupId) {
          planCount += 1
        }

        this.currentDate = this.dataInOneMonth[i].date
        this.currentGroup = this.dataInOneMonth[i].groupId

        // Last row, will be pushed without next loop
        if (i === this.dataInOneMonth.length - 1) {
          events.push({
            name: `${planCount} Rencana Kunjungan`,
            start: new Date(this.currentDate),
            end: new Date(this.currentDate),
            color: 'indigo',
            timed: false, //no timestamp
            titleCard: `${this.daysOfWeek[new Date(this.currentDate).getDay()]}, ${format(new Date(this.currentDate), 'dd-MMM-yyyy')}`,
            visitDay: new Date(this.currentDate).getDay()
          })
        }
      }

      this.events = events
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a
    },
    getSalesmanGroup() {
      api.getAll(this.endpoint.sales.salesman, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
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
          this.salesmanGroupRef = response.data.tableData
        })
    },
    getEvents(d) {
      api.getAll(this.endpoint.sales.visitPlan, {
        params: {
          filters: JSON.stringify([{
            field: 'date',
            operator: 'eq',
            keyword: d
          }, {
            field: 'mark',
            operator: 'eq',
            keyword: 'A'
          }]),
          sorts: JSON.stringify([{
            field: 'code',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.gridDetails.data = response.data.tableData
        })
    },
    getEmployee() {
      if (this.data.action === 'edit') {
        const dt = this.data.date
        this.value = dt
        this.saveState = true
        this.data.action = 'add'
      }

      // this.gridSales.data = []
      // this.customerDetail = []

      const visitDate = new Date(this.value)
      api.getAll(`${this.endpoint.sales.salesman}/salesman-schedule`, {
        params: {
          groupId: this.data.groupId,
          startDate: this.data.date,
          recurrence: '1',
          visitDay: visitDate.getDay()
        }
      })
        .then(response => {
          this.gridSales.data = response.data.tableData
          this.getVisitPlanDetailCustomer(this.gridSales.data, 'add')
        })
    },
    getVisitPlanDetail() {
      api.getAll(`${this.endpoint.sales.visitPlan}/visit-plan-detail`, {
        params: {
          code: this.data.code
        }
      })
        .then(response => {
          this.gridSales.data = response.data.tableData
          this.getVisitPlanDetailCustomer(this.gridSales.data, 'edit')
        })
    },
    getVisitPlanDetailCustomer(salesData, action) {
      const arrId = []
      if (salesData.length) {
        for (let i = 0; i < salesData.length; i++) {
          if (action === 'edit') {
            arrId.push(salesData[i].visitPlanDetailId)
          } else {
            arrId.push(salesData[i].salesmanScheduleId)
          }
        }
      }

      // Get customer list
      if (action === 'edit') {
        api.getAll(`${this.endpoint.sales.visitPlan}/visit-plan-detail-customer`, {
          params: {
            ids: JSON.stringify(arrId)
          }
        })
          .then(response => {
            this.customerDetail = response.data.tableData
          })
      } else {
        api.getAll(`${this.endpoint.sales.salesman}/salesman-schedule-customer`, {
          params: {
            ids: JSON.stringify(arrId)
          }
        })
          .then(response => {
            this.customerDetail = response.data.tableData
          })
      }
    },
    getDetailCustomer(id, action) {
      if (action === 'edit') {
        return this.customerDetail.filter(x => x.visitPlanDetailId === id)
      } else {
        return this.customerDetail.filter(x => x.salesmanScheduleId === id)
      }
    },
    refreshCalendar() {
      const date = new Date() 
      const y = date.getFullYear()
      const m = date.getMonth()
      const firstDay = new Date(y, m, 1)
      const lastDay = new Date(y, m + 1, 0)

      this.gridDetails.data = []
      this.events = []
      this.currentDate = null
      this.currentGroup = null
      this.getList(format(firstDay, 'yyyy-MM-dd'), format(lastDay, 'yyyy-MM-dd'))
    }
  }
}
</script>
