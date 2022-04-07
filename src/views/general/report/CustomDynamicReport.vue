<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row no-gutters>
              <v-col cols="12" md="6">
                Laporan Dinamis Kustom
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
                          :grid="grid"
                          :gridDefOpts="gridDefOpts"
                          title="Daftar Test Query"
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
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="data.templateId"
                  :items="templates"                  
                  label="Template"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  @change="clearTable(); changeTemplate();"
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
                <v-autocomplete
                  v-if="data.dataTypeParameter1 === 'list'"
                  v-model="data.parameter1"
                  :items="listParam1"                  
                  :item-text="item => formatList1(item)"
                  :item-value="data.dropdownValueParameter1"
                  label="Parameter 1"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                >
                </v-autocomplete>
                <v-checkbox
                  v-else-if="data.dataTypeParameter1 === 'boolean'"
                  v-model="data.parameter1"
                  label="Parameter 1"
                  class="mt-0"
                  dense
                ></v-checkbox>
                <v-text-field
                  v-else-if="data.dataTypeParameter1 === 'string'"
                  v-model="data.parameter1"
                  label="Parameter 1"
                  class="mt-0"
                  dense
                ></v-text-field>
                <v-menu
                  v-else-if="data.dataTypeParameter1 === 'date'"
                  v-model="menu.date1"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatDate1"
                      label="Parameter 1"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearTable()"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.parameter1"
                    no-title
                    scrollable
                    @change="menu.date1 = false; clearTable();"
                  ></v-date-picker>
                </v-menu>
                <v-text-field
                  v-else
                  label="Parameter 1"
                  class="mt-0"
                  disabled
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
                <v-autocomplete
                  v-if="data.dataTypeParameter2 === 'list'"
                  v-model="data.parameter2"
                  :items="listParam2"                  
                  :item-text="item => formatList2(item)"
                  :item-value="data.dropdownValueParameter2"
                  label="Parameter 2"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                >
                </v-autocomplete>
                <v-checkbox
                  v-else-if="data.dataTypeParameter2 === 'boolean'"
                  v-model="data.parameter2"
                  label="Parameter 2"
                  class="mt-0"
                  dense
                ></v-checkbox>
                <v-text-field
                  v-else-if="data.dataTypeParameter2 === 'string'"
                  v-model="data.parameter2"
                  label="Parameter 2"
                  class="mt-0"
                  dense
                ></v-text-field>
                <v-menu
                  v-else-if="data.dataTypeParameter2 === 'date'"
                  v-model="menu.date2"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatDate2"
                      label="Parameter 2"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearTable()"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.parameter2"
                    no-title
                    scrollable
                    @change="menu.date2 = false; clearTable();"
                  ></v-date-picker>
                </v-menu>
                <v-text-field
                  v-else
                  label="Parameter 2"
                  class="mt-0"
                  disabled
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-if="data.dataTypeParameter3 === 'list'"
                  v-model="data.parameter3"
                  :items="listParam3"                  
                  :item-text="item => formatList3(item)"
                  :item-value="data.dropdownValueParameter3"
                  label="Parameter 3"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                >
                </v-autocomplete>
                <v-checkbox
                  v-else-if="data.dataTypeParameter3 === 'boolean'"
                  v-model="data.parameter3"
                  label="Parameter 3"
                  class="mt-0"
                  dense
                ></v-checkbox>
                <v-text-field
                  v-else-if="data.dataTypeParameter3 === 'string'"
                  v-model="data.parameter3"
                  label="Parameter 3"
                  class="mt-0"
                  dense
                ></v-text-field>
                <v-menu
                  v-else-if="data.dataTypeParameter3 === 'date'"
                  v-model="menu.date3"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatDate3"
                      label="Parameter 3"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearTable()"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.parameter3"
                    no-title
                    scrollable
                    @change="menu.date3 = false; clearTable();"
                  ></v-date-picker>
                </v-menu>
                <v-text-field
                  v-else
                  label="Parameter 3"
                  class="mt-0"
                  disabled
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
                <v-autocomplete
                  v-if="data.dataTypeParameter4 === 'list'"
                  v-model="data.parameter4"
                  :items="listParam4"                  
                  :item-text="item => formatList4(item)"
                  :item-value="data.dropdownValueParameter4"
                  label="Parameter 4"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                >
                </v-autocomplete>
                <v-checkbox
                  v-else-if="data.dataTypeParameter4 === 'boolean'"
                  v-model="data.parameter4"
                  label="Parameter 4"
                  class="mt-0"
                  dense
                ></v-checkbox>
                <v-text-field
                  v-else-if="data.dataTypeParameter4 === 'string'"
                  v-model="data.parameter4"
                  label="Parameter 4"
                  class="mt-0"
                  dense
                ></v-text-field>
                <v-menu
                  v-else-if="data.dataTypeParameter4 === 'date'"
                  v-model="menu.date4"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatDate4"
                      label="Parameter 4"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearTable()"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.parameter4"
                    no-title
                    scrollable
                    @change="menu.date4 = false; clearTable();"
                  ></v-date-picker>
                </v-menu>
                <v-text-field
                  v-else
                  label="Parameter 4"
                  class="mt-0"
                  dense
                  disabled
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4" class="pl-1">
                <v-autocomplete
                  v-if="data.dataTypeParameter5 === 'list'"
                  v-model="data.parameter5"
                  :items="listParam5"                  
                  :item-text="item => formatList5(item)"
                  :item-value="data.dropdownValueParameter5"
                  label="Parameter 5"
                  class="mt-0"
                  dense
                  clearable
                  @change="clearTable()"
                >
                </v-autocomplete>
                <v-checkbox
                  v-else-if="data.dataTypeParameter5 === 'boolean'"
                  v-model="data.parameter5"
                  label="Parameter 5"
                  class="mt-0"
                  dense
                ></v-checkbox>
                <v-text-field
                  v-else-if="data.dataTypeParameter5 === 'string'"
                  v-model="data.parameter5"
                  label="Parameter 5"
                  class="mt-0"
                  dense
                ></v-text-field>
                <v-menu
                  v-else-if="data.dataTypeParameter5 === 'date'"
                  v-model="menu.date5"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="590px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatDate5"
                      label="Parameter 5"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearTable()"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.parameter5"
                    no-title
                    scrollable
                    @change="menu.date5 = false; clearTable();"
                  ></v-date-picker>
                </v-menu>
                <v-text-field
                  v-else
                  label="Parameter 5"
                  class="mt-0"
                  dense
                  disabled
                ></v-text-field>
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
            :options.sync="grid.options"
            :sort-by="grid.options.sortBy"
            :sort-desc="grid.options.sortDesc"
            :class="['elevation-1']"
            fixed-header
            hide-default-footer
            disable-pagination
            disable-sort
          >
          <template v-slot:[`item.${n.value}`]="{ item }" v-for="n in this.grid.columns">
            <span :key="n.value" v-if="n.columnType === 'Decimal'">
              {{ item[n.value] | formatCurrency }}
            </span>
            <span :key="n.value" v-else-if="n.columnType === 'DateTime'">
              {{ (item[n.value] !== null ? formatDateLocal(item[n.value], 'dd-MMM-yyyy') : '') }}
            </span>
            <v-tooltip :key="n.value" v-else-if="n.columnType === 'Boolean'" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon 
                  v-bind="attrs" 
                  v-on="on" 
                  :color="item[n.value] === true ? 'green' : 'red'"
                >
                  {{ item[n.value] === true ? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline' }}
                </v-icon>
              </template>
              <span class="text-caption">
                  {{ item[n.value] === true ? 'True' : 'False' }}
              </span>
            </v-tooltip>
            <span :key="n.value" v-else>
              {{ item[n.value] }}
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
      date1: false,
      date2: false,
      date3: false,
      date4: false,
      date5: false
    },
    grid: {
      height: 100,
      columns: [],
      data: [],
      options: {
        sortBy: [],
        sortDesc: [false]
      },
      total: 0
    },
    data: {},
    filter: false,
    listParam1: [],
    listParam2: [],
    listParam3: [],
    listParam4: [],
    listParam5: [],
    templates: []
  }),

  created: function () {
    this.getTemplateLists()
    this.reset()
    auth.getAction(this.endpoint, this.menuId.customDynamicReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Umum'
      }, {
        text: 'Laporan'
      }, {
        text: 'Dinamis Kustom'
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
      menuId: state => state.api.menus
    }),
    formatDate1() {
      return this.data.parameter1 ? format(parseISO(this.data.parameter1), 'dd-MMM-yyyy') : ''
    },
    formatDate2() {
      return this.data.parameter2 ? format(parseISO(this.data.parameter2), 'dd-MMM-yyyy') : ''
    },
    formatDate3() {
      return this.data.parameter3 ? format(parseISO(this.data.parameter3), 'dd-MMM-yyyy') : ''
    },
    formatDate4() {
      return this.data.parameter4 ? format(parseISO(this.data.parameter4), 'dd-MMM-yyyy') : ''
    },
    formatDate5() {
      return this.data.parameter5 ? format(parseISO(this.data.parameter5), 'dd-MMM-yyyy') : ''
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
        templateId: null,
        dataTypeParameter1: null,
        sourceParameter1: null,
        dropdownValueParameter1: null,
        dropdownTextParameter1: null,
        dataTypeParameter2: null,
        sourceParameter2: null,
        dropdownValueParameter2: null,
        dropdownTextParameter2: null,
        dataTypeParameter3: null,
        sourceParameter3: null,
        dropdownValueParameter3: null,
        dropdownTextParameter3: null,
        dataTypeParameter4: null,
        sourceParameter4: null,
        dropdownValueParameter4: null,
        dropdownTextParameter4: null,
        dataTypeParameter5: null,
        sourceParameter5: null,
        dropdownValueParameter5: null,
        dropdownTextParameter5: null,
        parameter1: null,
        parameter2: null,
        parameter3: null,
        parameter4: null,
        parameter5: null
      }
      this.filter = true
    },
    getList() {
      if (this.data.templateId === null) {
        this.$store.dispatch('app/showInfo', 'Pilih template laporan terlebih dahulu.')
        return
      }
      this.grid.data = []
      this.grid.columns = []
      this.grid.total = 0
      api.getAll(this.endpoint.general.customDynamicReport, {
        params: {
          id: this.data.templateId,
          param1: this.data.parameter1,
          param2: this.data.parameter2,
          param3: this.data.parameter3,
          param4: this.data.parameter4,
          param5: this.data.parameter5
        }
      })  
        .then(response => {
          const keys = Object.keys(response.data.data.result[0])
          for (let i = 0; i < response.data.data.columns.length; i++) {
            if (i === 0) {
              this.grid.options.sortBy = [keys[i]]
            }
            
            switch (response.data.data.columns[i].columnType) {
            case 'Boolean':
              this.grid.columns.push({ text: response.data.data.columns[i].columnName, value: keys[i], divider: true, width: '150', excelColWidth:'15', isBool: true, columnType: response.data.data.columns[i].columnType })
              break
            
            case 'Decimal':
              this.grid.columns.push({ text: response.data.data.columns[i].columnName, value: keys[i], align: 'right', divider: true, width: '150', excelColWidth:'15', isCurrency: true, columnType: response.data.data.columns[i].columnType  })
              break
            
            case 'Int32':
              this.grid.columns.push({ text: response.data.data.columns[i].columnName, value: keys[i], align: 'right', divider: true, width: '150', excelColWidth:'15', isNumber: true, columnType: response.data.data.columns[i].columnType })
              break

            case 'Int64':
              this.grid.columns.push({ text: response.data.data.columns[i].columnName, value: keys[i], align: 'right', divider: true, width: '150', excelColWidth:'15', isNumber: true, columnType: response.data.data.columns[i].columnType })
              break

            case 'DateTime':
              this.grid.columns.push({ text: response.data.data.columns[i].columnName, value: keys[i], divider: true, width: '150', excelColWidth:'15', isFullDateTime: true, columnType: response.data.data.columns[i].columnType  })
              break

            default:
              this.grid.columns.push({ text: response.data.data.columns[i].columnName, value: keys[i], divider: true, width: '150', excelColWidth:'15', columnType: response.data.data.columns[i].columnType })
              break
            }
          }
          this.grid.data = response.data.data.result
          this.grid.total = response.data.count
        })
    },
    async getSourceLists(source) {
      return await api.getAll(`${this.endpoint.general.customDynamicReport}/source`, {
        params: {
          source: source
        }
      })
    },
    async exportExcel() {
      this.exportExcel.export()
    },
    showfilter() {
      this.filter = !this.filter
    },
    getTemplateLists() {
      api.getAll(this.endpoint.general.dynamicReportTemplate, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }])
        }
      })  
        .then(response => {
          this.templates = response.data.tableData
        })
    },
    clearTable() {
      this.grid.data = []
      this.grid.columns = []
    },
    async changeTemplate() {
      const item = this.templates.find(x => x.id === this.data.templateId)
      if (item) {
        this.data.dataTypeParameter1 = item.dataTypeParameter1
        this.data.sourceParameter1 = item.sourceParameter1
        this.data.dropdownValueParameter1 = item.dropdownValueParameter1
        this.data.dropdownTextParameter1 = item.dropdownTextParameter1
        this.data.dataTypeParameter2 = item.dataTypeParameter2
        this.data.sourceParameter2 = item.sourceParameter2
        this.data.dropdownValueParameter2 = item.dropdownValueParameter2
        this.data.dropdownTextParameter2 = item.dropdownTextParameter2
        this.data.dataTypeParameter3 = item.dataTypeParameter3
        this.data.sourceParameter3 = item.sourceParameter3
        this.data.dropdownValueParameter3 = item.dropdownValueParameter3
        this.data.dropdownTextParameter3 = item.dropdownTextParameter3
        this.data.dataTypeParameter4 = item.dataTypeParameter4
        this.data.sourceParameter4 = item.sourceParameter4
        this.data.dropdownValueParameter4 = item.dropdownValueParameter4
        this.data.dropdownTextParameter4 = item.dropdownTextParameter4
        this.data.dataTypeParameter5 = item.dataTypeParameter5
        this.data.sourceParameter5 = item.sourceParameter5
        this.data.dropdownValueParameter5 = item.dropdownValueParameter5
        this.data.dropdownTextParameter5 = item.dropdownTextParameter5

        if (this.data.dataTypeParameter1 === 'list') {
          const result = await this.getSourceLists(this.data.sourceParameter1)
          this.listParam1 = result.data.data.result
        }
        if (this.data.dataTypeParameter2 === 'list') {
          const result = await this.getSourceLists(this.data.sourceParameter2)
          this.listParam2 = result.data.data.result
        }
        if (this.data.dataTypeParameter3 === 'list') {
          const result = await this.getSourceLists(this.data.sourceParameter3)
          this.listParam3 = result.data.data.result
        }
        if (this.data.dataTypeParameter4 === 'list') {
          const result = await this.getSourceLists(this.data.sourceParameter4)
          this.listParam4 = result.data.data.result
        }
        if (this.data.dataTypeParameter5 === 'list') {
          const result = await this.getSourceLists(this.data.sourceParameter5)
          this.listParam5 = result.data.data.result
        }
      }
    },
    formatList1(item) {
      let a = this.data.dropdownTextParameter1
      const regArr = a.match(/[^{}]+(?=})/g, a)
      if (regArr.length > 0) {
        for (let i = 0; i < regArr.length; i++) {
          const c = item[regArr[i]]
          a = a.replace(`{${regArr[i]}}`, c)
        }
      }
      return a 
    },
    formatList2(item) {
      let a = this.data.dropdownTextParameter2
      const regArr = a.match(/[^{}]+(?=})/g, a)
      if (regArr.length > 0) {
        for (let i = 0; i < regArr.length; i++) {
          const c = item[regArr[i]]
          a = a.replace(`{${regArr[i]}}`, c)
        }
      }
      return a 
    },
    formatList3(item) {
      let a = this.data.dropdownTextParameter3
      const regArr = a.match(/[^{}]+(?=})/g, a)
      if (regArr.length > 0) {
        for (let i = 0; i < regArr.length; i++) {
          const c = item[regArr[i]]
          a = a.replace(`{${regArr[i]}}`, c)
        }
      }
      return a 
    },
    formatList4(item) {
      let a = this.data.dropdownTextParameter4
      const regArr = a.match(/[^{}]+(?=})/g, a)
      if (regArr.length > 0) {
        for (let i = 0; i < regArr.length; i++) {
          const c = item[regArr[i]]
          a = a.replace(`{${regArr[i]}}`, c)
        }
      }
      return a 
    },
    formatList5(item) {
      let a = this.data.dropdownTextParameter5
      const regArr = a.match(/[^{}]+(?=})/g, a)
      if (regArr.length > 0) {
        for (let i = 0; i < regArr.length; i++) {
          const c = item[regArr[i]]
          a = a.replace(`{${regArr[i]}}`, c)
        }
      }
      return a 
    },
    formatDateLocal(value, filterFormat) {
      if (value) {
        return format(parseISO(value), filterFormat)
      }
    }
  }
}

</script>
