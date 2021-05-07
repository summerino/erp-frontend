<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>        
          <v-col cols="12" md="6" >
            <v-row no-gutters>
              <v-col cols="9">
                <v-text-field
                  :readonly="isAdvancedSearch"
                  v-model="grid.search"
                  append-icon="mdi-magnify"
                  class="flex-grow-1 mr-md-2"
                  solo
                  hide-details
                  dense
                  clearable
                  @keyup.enter="search()"
                ></v-text-field>
              </v-col>
              <v-col cols="3" class="text-right">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      v-shortkey="['ctrl', 'alt', 's']"
                      color="primary"
                      class="font-weight-regular"
                      dark
                      small
                      tile
                      @click="advSearch"
                      @shortkey="advSearch"
                    >
                      Advanced Search
                    </v-btn>
                  </template>
                  <span class="text-caption">(Ctrl + Alt + S)</span>
                </v-tooltip>
                
              </v-col>
            </v-row>
            <v-row no-gutters v-if="isAdvancedSearch">
              <v-col class="pt-0 mt-0">
                <div class="pt-0 mt-0" v-for="(item, index) in filter.searches" :key="index">
                  <v-row class="pl-2 mt-0 pt-0" no-gutters>
                    <v-col cols="3" class="ma-0 pa-0">
                      <v-select
                        v-model="item.field"
                        :items="filter.fields"
                        @change="onChangeField(index, item.field)"
                        label="Field"
                        class="mt-0 ml-1 font-weight-regular"
                      ></v-select>
                    </v-col>
                    <v-col cols="3" class="ma-0 pa-0">
                      <v-select
                        v-model="item.operator"
                        :items="item.operators"
                        label="Operator"
                        class="mt-0 ml-1 font-weight-regular"
                      ></v-select>
                    </v-col>
                    <v-col cols="4" class="ma-0 pa-0">
                      <div v-if="getCategoryFromDataField(item.field) === 'number' || getCategoryFromDataField(item.field) === 'text' || getCategoryFromDataField(item.field) === ''">  
                        <v-text-field class="mt-0 ml-1 font-weight-regular" v-model="item.keyword" label="Keyword" @keyup.enter="advancedSearch()"></v-text-field>                
                      </div>
                      <div v-else-if="getCategoryFromDataField(item.field) === 'bit'"> bit </div>
                      <div v-else-if="getCategoryFromDataField(item.field) === 'datetime'"> 
                        <v-menu
                              v-model="item.show"
                              :close-on-content-click="false"
                              transition="scale-transition"
                              min-width="290px"
                              offset-y
                          >
                              <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                  v-bind="attrs"
                                  v-on="on"
                                  v-model="item.keyword"
                                  label="Date"
                                  class="mt-0 ml-1 font-weight-regular"
                                  readonly
                              ></v-text-field>
                              </template>
                              <v-date-picker
                                  v-model="item.keyword"
                                  no-title
                                  scrollable
                                  @change="item.show = false"
                              ></v-date-picker>
                          </v-menu>
                      </div>

                    </v-col>
                    <v-col cols="2" class="ma-0 pa-0">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            v-on="on"
                            class="mt-2"
                            icon
                            @click="removeSearch(index)"
                          >
                            <v-icon>mdi-trash-can</v-icon>
                          </v-btn>
                        </template>
                        <span class="text-caption">Remove search item</span>
                      </v-tooltip>
                      <v-tooltip v-if="index === filter.searches.length - 1" bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn v-if="isAdvancedSearch"
                            v-bind="attrs"
                            v-on="on"
                            class="mt-2"
                            icon
                            small
                            @click="addSearch()"
                          >
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                        </template>
                        <span class="text-caption">Add search item</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </div>
                <div>
                  <v-row class="pl-2 mt-0 pt-0" no-gutters>
                    <v-col cols="10 text-right">
                      <v-btn
                        small
                        text
                        @click="resetAdvancedFilter()"
                      >Cancel</v-btn>
                      <v-btn
                        class="primary"
                        text
                        small
                        @click="advancedSearch()"
                        tile
                      >Apply</v-btn>
                    </v-col>
                  </v-row>
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
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
                >
                  <v-icon left>mdi-plus</v-icon>
                  New
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + Alt + N)</span>
            </v-tooltip>
          </v-col>
        </v-row>
        
      </v-card-title>
      <v-data-table
        :headers="grid.columns"
        :items="grid.data"
        class="flex-grow-1"
      >
        <template v-for="header in grid.columns" v-slot:[header.slot]="{ item }">
          <div v-if="header.copyLabel" :key="header.value">
            <div class="d-flex align-center py-1">
              <div class="ml-1 caption font-weight-bold">
                <copy-label :text="item[header.value]" />
              </div>
            </div>
          </div>
          <div v-else-if="header.displayAs==='tick'" :key="header.value" class="text-xs-center">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-if="item[header.value]"  v-on="on"  small color="success">
                  mdi-check-circle
                </v-icon>
                <v-icon v-else small v-on="on" :key="header.value">
                  mdi-circle-outline
                </v-icon>
                </template>
              <span>{{item[header.value]}}</span>
            </v-tooltip>
          </div> 
          <div v-else-if="header.dateFormat" :key="header.value">
          <!-- {{ item[header.value] | formatDate(header.dateFormat) }} -->
            {{ item[header.value] | formatDate('dd-MMM-yyyy')}}
          </div>
          <div v-else-if="header.numberFormat" :key="header.value">
            <!-- {{ item[header.value] | numberFormatWithString(header.numberFormat) }} -->
            {{ item[header.value] | formatCurrency }}
          </div>
          <v-chip
            v-else-if="header.displayAs=='hightlights' && header.hightlightValue " 
            label
            small
            class="font-weight-bold"
            :color="item.role === header.hightlightValue ? 'primary' : undefined"
            :key="header.value"
          >{{ item[header.value] | capitalize }}</v-chip>
          <div v-else :key="header.value">
            {{item[header.value]}}
          </div>
        </template>
        
        <template v-slot:[`item.sw_action`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                :to="`/parameter/item/${param}/edit/${item[grid.primaryKey]}`"
                color="orange lighten-1"
                icon
                small
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Edit</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                icon
                small
                color="red"
                @click="remove(`${item[grid.primaryKey]}`)"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </template>
          
      </v-data-table>
    </v-card>
    <confirm ref="confirm"></confirm>
  </div>
</template>

<script>
import CopyLabel from '@/components/common/CopyLabel'
import api from '@/services/axios.service'
import { mapState } from 'vuex'
import { format, parseISO, isValid } from 'date-fns'
import Confirm from '@/components/dialog/Confirm'

export default {
  components: {
    CopyLabel,
    Confirm
  },
  props: ['param', 'id'],
  created: function () {
    this.getView()
  },
  data() {
    return {
      isAdvancedSearch: false,
      isLoading: false,
      grid:{
        data: [],
        columns: [],
        primaryKey: null,
        rowCount: 0,
        options: {
          sortBy: [],
          sortDesc: []
        }
      },
      filter: {
        operator: [
          { text: 'Equal', value: '1', allowedCategoryTypes: ['number', 'datetime', 'text', 'bit'] },
          { text: 'Not Equal', value: '2', allowedCategoryTypes: ['number', 'datetime', 'text', 'bit'] },
          { text: 'Start With', value: '3', allowedCategoryTypes: ['text'] },
          { text: 'End With', value: '4', allowedCategoryTypes: ['text'] },
          { text: 'Contains', value: '5', allowedCategoryTypes: ['text'] },
          { text: 'Not Contains', value: '6', allowedCategoryTypes: ['text'] },
          { text: 'Less than', value: '7', allowedCategoryTypes: ['number', 'datetime'] },
          { text: 'Greater than', value: '8', allowedCategoryTypes: ['number', 'datetime'] },
          { text: 'Less than equal', value: '9', allowedCategoryTypes: ['number', 'datetime'] },
          { text: 'Greater than equal', value: '10', allowedCategoryTypes: ['number', 'datetime'] }
        ],
        fields: [],
        search: '',
        searches: []
      },
      mapDataTypeToCategory: [
        {
          category: 'number',
          dataTypes: [
            'bigint',
            'decimal',
            'float',
            'int',
            'money',
            'real',
            'smallint',
            'smallmoney',
            'tinyint'
          ]
        },
        {
          category: 'text',
          dataTypes: [
            'nchar',
            'ntext',
            'nvarchar',
            'text',
            'varchar',
            'char'
          ]
        },
        {
          category: 'datetime',
          dataTypes: [
            'datetime',
            'timestamp',
            'date',
            'time',
            'datetime2'
          ]
        },
        {
          category: 'bit',
          dataTypes: [
            'bit'
          ]
        }
      ]
    }
  },
  watch: {
    param() {
      this.getView()
    }
  },
  computed: {
    ...mapState({
      gridDefaultHeight: state => state.app.grid.height,
      gridDefOpts: state => state.app.grid,
      endpoint: state => state.api.endpoint
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    formatDate(date) {
      return date ? format(parseISO(date), 'dd-MMM-yyyy') : ''
    },
    numberFormatWithString(number) {
      return number
    }
  },
  methods: {
   
    refresh() {
      this.grid.search = ''
      this.search()
    },
    search(filters = [], isAdvancedSearch = false) {
      const sorts = []
      sorts.push({
        field: this.grid.primaryKey,
        direction: 'desc'
      })
      if (!isAdvancedSearch) {
        filters = this.getFilter()
      }
      api.getAll(this.endpoint.general.master, {
        params: {
          param:this.param,
          filters: JSON.stringify(filters),
          skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
          take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
          sorts: JSON.stringify(sorts),
          isAdvancedSearch: isAdvancedSearch
        }
      }).then(response => {
        this.grid.data = response.data.tableData
        this.grid.columns = response.data.metaData
        this.grid.primaryKey = response.data.pkColumnName        
        this.grid.rowCount = response.data.RowCount
      })
    },
    getView() {
      
      api.getAll(this.endpoint.general.master, {
        params:{
          param:this.param
        }
      }
      ).then(response => {
        this.grid.data = response.data.tableData
        this.grid.columns = response.data.metaData
        this.grid.primaryKey = response.data.pkColumnName      
        this.grid.rowCount = response.data.RowCount
        this.generateField()
      })
    },
    generateField() {
      this.grid.columns.forEach(data => {
        if (data.value !== 'sw_action' && data.displayAs !== 'tick') {
          this.filter.fields.push({text:data.text, value: data.value, dataType: data.dataType.toLowerCase()})
        }
        if (data.value === 'sw_action') {
          data.width = '90'
        }
      })
    },
    getFilter() {
      const filters = []
      if (this.grid.search) {
        this.grid.columns.forEach(data => {
          if (data.value !== 'sw_action') {
            if (this.getCategoryFromDataType(data.dataType) === 'number') {
              if (!isNaN(this.grid.search)) {
                filters.push({
                  field: data.value,
                  operator: '1',
                  keyword: this.grid.search
                })
              }
            } else if (this.getCategoryFromDataType(data.dataType) === 'text') {
              filters.push({
                field: data.value,
                operator: '5',
                keyword: this.grid.search
              })
            } else if (this.getCategoryFromDataType(data.dataType) === 'datetime') {
              if (isValid(new Date(this.grid.search))) {
                filters.push({
                  field: data.value,
                  operator: '1',
                  keyword: this.grid.search
                })
              }
            }
          }
        })
      }
      return filters
    },
    advSearch() {
      this.filter.searches = []
      this.isAdvancedSearch = !this.isAdvancedSearch
      if (this.isAdvancedSearch) this.addSearch()
    },
    addSearch() {
      const search = { field: '', operator:'', keyword: '', show: false}
      this.filter.searches.push(search)
    },
    advancedSearch() {
      const filters = this.filter.searches.filter(x => x.operator !== '' && x.field !== '' && x.keyword !== '')
      this.search(filters, true)
    },
    resetAdvancedFilter() {
      this.filter.searches = []
      this.isAdvancedSearch = true
      this.addSearch()
      this.search()
    },
    removeSearch(index) {
      this.filter.searches.splice(index, 1)
      if (this.filter.searches.length === 0) this.isAdvancedSearch = false
    },
    async remove(id) {
      const ids = {}
      ids[`${this.grid.primaryKey}`] = id
      if (
        await this.$refs.confirm.open(
          'Delete?',
          'Are you sure want to delete this data?')
      ) {
        const strIds = JSON.stringify(ids)
        api.deletemaster(`${this.endpoint.general.master}?param=${this.param}&ids=${strIds}`)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getView()
            }
          })
      }
    },
    onChangeField(index, field) {
      this.filter.searches[index].operator = null
      const category = this.getCategoryFromDataField(field)
      if (category === 'datetime') {
        this.filter.searches[index].keyword = format(new Date(), 'yyyy-MM-dd')
      } else {
        this.filter.searches[index].keyword = ''
      }
      this.filter.searches[index].operators = this.filter.operator.filter(x => x.allowedCategoryTypes.includes(category))
    },
    getCategoryFromDataField(field) {
      if (field === '') return ''
      const selectedField = this.filter.fields.find(x => x.value === field)
      const temp = this.mapDataTypeToCategory.find(x => x.dataTypes.includes(selectedField.dataType))
      return temp.category
    },
    getCategoryFromDataType(dataType) {
      dataType = dataType.toLowerCase()
      const temp = this.mapDataTypeToCategory.find(x => x.dataTypes.includes(dataType))
      return temp.category
    },
    add() {
      this.$router.push({ name: 'parameter-master-add', params: { param: this.param} })
    }
  },
  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  }
}

</script>

<style lang="scss" scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>