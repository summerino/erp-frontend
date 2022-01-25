<template>
  <v-dialog
    v-model="dialog"
    :width="options.width"
    transition="dialog-bottom-transition"
    fullscreen
    hide-overlay
    persistent
    scrollable
    @keydown.esc="close"
  >
    <v-card :style="{ background: $vuetify.theme.themes[theme].surface }">
      <v-toolbar
        color="indigo darken-1"
        dark
        dense
      >
        <v-toolbar-title>Jadwal Kunjungan</v-toolbar-title>
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
                @click="save"
                @shortkey="save"
              >
                <v-icon left>mdi-content-save</v-icon>
                Simpan
              </v-btn>
            </template>
            <span class="text-caption">(Ctrl + Enter)</span>
          </v-tooltip>
        </v-toolbar-items>
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
    <v-card-text>
    <v-form
      ref="form"
      v-model="valid"
    >
      <v-card-text class="px-2 pt-1">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>Wilayah</v-card-title>
              <v-card-text>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-autocomplete
                      ref="area1"
                      v-model="data.areaId1"
                      :items="area1Ref"
                      :item-text="item => `${item.name}`"
                      item-value="id"
                      label="Wilayah 1"
                      class="mt-0"
                      @change="fillAreaRef(2)"
                    ></v-autocomplete>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-autocomplete
                      ref="area2"
                      v-model="data.areaId2"
                      :items="area2Ref"
                      item-text="name"
                      item-value="id"
                      label="Wilayah 2"
                      class="mt-0"
                      @change="fillAreaRef(3)"
                    ></v-autocomplete>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-autocomplete
                      ref="area3"
                      v-model="data.areaId3"
                      :items="area3Ref"
                      item-text="name"
                      item-value="id"
                      label="Wilayah 3"
                      class="mt-0"
                      @change="fillAreaRef(4)"
                    ></v-autocomplete>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-autocomplete
                      ref="area4"
                      v-model="data.areaId4"
                      :items="area4Ref"
                      item-text="name"
                      item-value="id"
                      label="Wilayah 4"
                      class="mt-0"
                      @change="fillAreaRef(5)"
                    ></v-autocomplete>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-autocomplete
                      ref="area5"
                      v-model="data.areaId5"
                      :items="area5Ref"
                      item-text="name"
                      item-value="id"
                      label="Wilayah 5"
                      class="mt-0"
                    ></v-autocomplete>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>Pelanggan</v-card-title>
              <v-card-text>
                <v-row dense>
                  <v-col cols="12">
                    <v-app-bar dense flat>
                      <v-spacer></v-spacer>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            v-on="on"
                            v-shortkey="['ctrl', 'alt', 'n']"
                            :disabled="!data.areaId1"
                            class="blue--text"
                            small
                            tile
                            @click="addCustomer"
                            @shortkey="addCustomer"
                          >
                            <v-icon left>mdi-plus</v-icon>
                            Tambah
                          </v-btn>
                        </template>
                        <span class="text-caption">(Ctrl + Alt + N)</span>
                      </v-tooltip>
                    </v-app-bar>
                    <v-data-table
                      :headers="gridCustomer.columns"
                      :items="gridCustomer.data"
                      :items-per-page="-1"
                      height="265"
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
                            >
                              <v-icon small>mdi-close-thick</v-icon>
                            </v-btn>
                          </template>
                          <span class="text-caption">Hapus</span>
                        </v-tooltip>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col col="12">
            <v-card>
              <v-card-title>Waktu Kunjungan</v-card-title>
              <v-card-text>
                <v-row no-gutters>
                  <v-col cols="12" md="3">
                    <v-autocomplete
                      ref="Recurrence"
                      v-model="data.recurrence"
                      :items="recurrenceRef"
                      :item-text="item => `${item.text}`"
                      item-value="value"
                      label="Berulang setiap"
                      class="mt-0"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" md="9" class="pl-md-3">
                    &nbsp;
                  </v-col>
                </v-row>

                <v-row no-gutters>
                  <v-col cols="12">
                    Pada hari :
                  </v-col>
                </v-row>

                <v-row no-gutters>
                  <v-col cols="2">
                    <input 
                     type="radio" 
                     id="0" 
                     value="0" 
                     v-model="data.visitDay">
                    <label for="0">&nbsp;Minggu</label>
                  </v-col>
                  <v-col cols="2">
                    <input 
                     type="radio" 
                     id="1" 
                     value="1" 
                     v-model="data.visitDay">
                    <label for="1">&nbsp;Senin</label>
                  </v-col>
                  <v-col cols="2">
                    <input 
                     type="radio" 
                     id="2" 
                     value="2" 
                     v-model="data.visitDay">
                    <label for="2">&nbsp;Selasa</label>
                  </v-col>
                  <v-col cols="6">
                    <input 
                     type="radio" 
                     id="3" 
                     value="3" 
                     v-model="data.visitDay">
                    <label for="3">&nbsp;Rabu</label>
                  </v-col>
                </v-row>
                <br/>
                <v-row no-gutters>
                  <v-col cols="2">
                    <input 
                     type="radio" 
                     id="4" 
                     value="4" 
                     v-model="data.visitDay">
                    <label for="4">&nbsp;Kamis</label>
                  </v-col>
                  <v-col cols="2">
                    <input 
                     type="radio" 
                     id="5" 
                     value="5" 
                     v-model="data.visitDay">
                    <label for="5">&nbsp;Jumat</label>
                  </v-col>
                  <v-col cols="8">
                    <input 
                     type="radio" 
                     id="6" 
                     value="6" 
                     v-model="data.visitDay">
                    <label for="6">&nbsp;Sabtu</label>
                  </v-col>
                </v-row>
                <br/>
                <v-row no-gutters>
                  <v-col cols="12" md="6">
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
                          :rules="rules.required"
                          :value="formatStartDate"
                          label="Tanggal Mulai"
                          class="mt-0"
                          required
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="data.startDate"
                        no-title
                        scrollable
                        @change="menu.startDate = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" md="6" class="pl-md-1">
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
                          :rules="rules.required"
                          :value="formatEndDate"
                          label="Tanggal Berakhir"
                          class="mt-0"
                          required
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="data.endDate"
                        no-title
                        scrollable
                        @change="menu.endDate = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>  
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
    </v-card-text>
    </v-card>

    <v-dialog
      v-model="dialogCustomer"
      width="600"
      hide-overlay
      persistent
      scrollable
      @keydown.esc="dialogCustomer = false"
    >
      <v-card>
        <v-toolbar
          color="indigo darken-1"
          dark
          dense
        >
          <v-toolbar-title>Pilih Pelanggan</v-toolbar-title>
          <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            v-if="selected.length > 0"
            text
            @click="chooseCust"
          >Simpan</v-btn>
        </v-toolbar-items>
          <v-btn
            icon
            @click="dialogCustomer = false"
          >
            <v-icon>mdi-window-close</v-icon>
          </v-btn>
        </v-toolbar>
        <br/>
        <v-card-text>
          <v-row no-gutters>
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="dataSearch.by"
              :items="dataSearch.items"
              label="Cari Berdasarkan"
              class="mt-0"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="8" class="pl-md-1">
            <v-text-field
              ref="search"
              v-model="dataSearch.value"
              label="Teks Pencarian"
              class="mt-0"
              @keyup.enter="search"
            ></v-text-field>
          </v-col>
        </v-row>
          <v-data-table
            :headers="gridCustomerDetail.columns"
            :items="gridCustomerDetail.data"
            :items-per-page="-1"
            height="250"
            class="elevation-1 row-pointer"
            dense
            disable-sort
            fixed-header
            hide-default-footer
            item-key="code"
            v-model="selected"
            show-select
          >
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <confirm ref="confirm"></confirm>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import api from '@/services/axios.service'
import Confirm from '@/components/dialog/Confirm'
// import { randomNumber } from '@/helpers/math-helpers'

export default {
  components:{
    Confirm
  },

  data: () => ({
    dialog: false,
    dialogCustomer: false,
    menu: {
      startDate: false,
      endDate: false
    },
    options: {
      width: 800
    },
    gridCustomer: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '30' },
        { text: 'Inisial', value: 'initial', divider: true, width: '100' },
        { text: 'Nama', value: 'name', divider: true, width: '200' },
        { text: 'Alamat', value: 'address1', divider: true, width: '350' }
      ],
      data: [],
      height: 100
    },
    gridCustomerDetail: {
      columns: [
        { text: 'ID Pelanggan', value: 'code', divider: true, width: '80' },
        { text: 'Inisial', value: 'initial', divider: true, width: '80' },
        { text: 'Nama', value: 'name', divider: true, width: '120' },
        { text: 'Email', value: 'email', divider: true, width: '100' },
        { text: 'Wilayah', value: 'areaName1', divider: true, width: '250' }
      ],
      data: [],
      height: 100
    },
    dataSearch: {
      by: 'code',
      value: '',
      items: [
        { text: 'ID Pelanggan', value: 'code' },
        { text: 'Inisial', value: 'initial' },
        { text: 'Nama', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Wilayah', value: 'areaName1' }
      ]
    },
    valid: false,
    areaRef: [],
    area1Ref: [],
    area2Ref: [],
    area3Ref: [],
    area4Ref: [],
    area5Ref: [],
    tempCustomerList: [],
    selected: [],
    listCode: [],
    recurrenceRef: [{ value: 1, text: '1 Minggu' }, { value: 2, text: '2 Minggu' }, { value: 3, text: '3 Minggu' }, { value: 4, text: '4 Minggu' }, { value: 5, text: '5 Minggu' }],
    data: {}
  }),
  computed: {
    ...mapState({ 
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint }),
    formatStartDate() {
      return this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
    },
    formatEndDate() {
      return this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
    },
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },
  created: function () {
    this.getAreaParent()
  },
  watch: {
    'gridCustomer.data': {
      handler() {
        this.getListCode()
      },
      deep: true
    }
  },
  methods: {
    reset() {
      this.data = {
        salesmanScheduleId: 0,
        id: 0,
        initial: null,
        type: 0,
        salesGroupId: 0,
        firstName: null,
        lastName: null,
        sex: null,
        birthDate: null,
        birthPlace: null,
        maritalStatus: null,
        identityCardNo: null,
        religion: null,
        address1: null,
        address2: null,
        phone: null,
        warehouseCode: null,
        areaId1: null,
        areaName1: null,
        areaId2: null,
        areaName2: null,
        areaId3: null,
        areaName3: null,
        areaId4: null,
        areaName4: null,
        areaId5: null,
        areaName5: null,
        startDate: null,
        endDate: null,
        recurrence: null,
        visitDay: null,
        fullName: null,
        customerList: [],
        action: null
      }
      this.gridCustomer.data = []
      this.gridCustomerDetail.data = []
    },
    open(action, item) {
      this.dialog = true
      this.reset()
      this.getListCode()

      this.data = {
        ...item,
        action: action
      }

      if (this.data.customerList) {
        this.gridCustomer.data = this.data.customerList
      }

      if (!this.data.recurrence) {
        this.data.recurrence = 1
      }

      setTimeout(() => {
        this.$refs.area1.focus()
      }, 0)
    },
    close() {
      this.dialog = false
    },
    save() {
      let isValidSave = true
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        isValidSave = false
      }

      if (this.data.startDate > this.data.endDate) {
        this.$store.dispatch('app/showInfo', 'Tanggal Mulai tidak boleh lebih besar dari Tanggal Berakhir.')
        isValidSave = false
      }

      if (!this.data.visitDay) {
        this.$store.dispatch('app/showInfo', 'Hari kunjungan harus dipilih.')
        isValidSave = false
      }

      if (isValidSave) {
        this.data.customerList = this.gridCustomer.data

        this.$emit('click:save', this.data)
        this.close()
      }
    },
    addCustomer() {
      this.dialogCustomer = true
      this.gridCustomerDetail.data = []
      this.dataSearch.by = 'code'
      this.dataSearch.value = ''

      setTimeout(() => {
        this.$refs.search.focus()
      }, 0)
    },
    async removeItem(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        const idx = this.gridCustomer.data.findIndex(i => i.code === item.code)
        if (idx !== -1) {
          this.gridCustomer.data.splice(idx, 1)
        }
      }
    },
    getAreaParent() {
      api.getAll(this.endpoint.sales.area, {
        params: {
          filters: JSON.stringify([{
            field: 'deep',
            operator: 'eq',
            keyword: 1
          }, {
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
          this.area1Ref = response.data.tableData
        })
    },
    fillAreaRef(deep) {
      let parentId = 0
      if (deep === 2) {
        // Clear area 2-5 & customer list if area 1 changed
        this.area2Ref = []
        this.area3Ref = []
        this.area4Ref = []
        this.area5Ref = []
        this.data.areaId2 = null
        this.data.areaId3 = null
        this.data.areaId4 = null
        this.data.areaId5 = null
        this.gridCustomer.data = []
        parentId = this.data.areaId1
      } else if (deep === 3) {
        parentId = this.data.areaId2
      } else if (deep === 4) {
        parentId = this.data.areaId3
      } else if (deep === 5) {
        parentId = this.data.areaId4
      }
      api.getAll(this.endpoint.sales.area, {
        params: {
          filters: JSON.stringify([{
            field: 'deep',
            operator: 'eq',
            keyword: deep
          }, {
            field: 'parentId',
            operator: 'eq',
            keyword: parentId
          }, {
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
          if (deep === 2) {
            this.area2Ref = response.data.tableData
          } else if (deep === 3) {
            this.area3Ref = response.data.tableData
          } else if (deep === 4) {
            this.area4Ref = response.data.tableData
          } else if (deep === 5) {
            this.area5Ref = response.data.tableData
          }
        })
    },
    search() {
      const filter = [{
        field: this.dataSearch.by,
        operator: 'contains',
        keyword: this.dataSearch.value
      }, {
        field: 'isActive',
        operator: 'eq',
        keyword: true
      }]

      if (this.data.areaId1) {
        filter.push({
          field: 'areaId1',
          operator: 'eq',
          keyword: this.data.areaId1
        })
      }

      if (this.data.areaId2) {
        filter.push({
          field: 'areaId2',
          operator: 'eq',
          keyword: this.data.areaId2
        })
      }

      if (this.data.areaId3) {
        filter.push({
          field: 'areaId3',
          operator: 'eq',
          keyword: this.data.areaId3
        })
      }

      if (this.data.areaId4) {
        filter.push({
          field: 'areaId4',
          operator: 'eq',
          keyword: this.data.areaId4
        })
      }

      if (this.data.areaId5) {
        filter.push({
          field: 'areaId5',
          operator: 'eq',
          keyword: this.data.areaId5
        })
      }
      
      api.getAll(this.endpoint.general.customer.customer, {
        params: {
          filters: JSON.stringify(filter),
          sorts: JSON.stringify([{
            field: this.dataSearch.by,
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.gridCustomerDetail.data = response.data.tableData.filter(x => !this.listCode.includes(x.code))
        })
    },
    bindItemData(item) {
      if (!item) return

      for (let i = 0; i < item.length; i++) {
        const newItem = {
          address1: item[i].address1,
          address2: item[i].address2,
          areaId1: item[i].areaId1,
          areaId2: item[i].areaId2,
          areaId3: item[i].areaId3,
          areaId4: item[i].areaId4,
          areaId5: item[i].areaId5,
          billingAddressId: item[i].billingAddressId,
          called: 'dialogCustomer',
          code: item[i].code,
          contactPerson: item[i].contactPerson,
          createdBy: item[i].createdBy,
          createdDate: item[i].createdDate,
          creditLimit: item[i].creditLimit,
          email: item[i].email,
          fax: item[i].fax,
          initial: item[i].initial,
          initialAddress: item[i].initialAddress,
          isActive: item[i].isActive,
          name: item[i].name,
          notes: item[i].notes,
          paymentTermId: item[i].paymentTermId,
          phone: item[i].phone,
          refNo: item[i].refNo,
          shippingAddressId: item[i].shippingAddressId,
          typeId: item[i].typeId,
          typeName: item[i].typeName,
          updatedBy: item[i].updatedBy,
          updatedDate: item[i].updatedDate,
          updatedInitial: item[i].updatedInitial,
          website: item[i].website
        }
        this.gridCustomer.data.push(newItem) 
      }    
    },
    chooseCust() {
      this.dialogCustomer = false
      this.bindItemData(this.selected)
      this.selected = []
    },
    getListCode() {
      this.listCode.splice(0, this.listCode.length)
      for (let i = 0; i < this.gridCustomer.data.length; i++) {
        this.listCode.push(this.gridCustomer.data[i].code)
      }
    }
  }
}
</script>
