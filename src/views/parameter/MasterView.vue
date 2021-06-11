<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters> 
          <v-col cols="12" md="2">
            {{ param }}
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
                @keyup.enter="getList()"
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
            </v-row>
          </v-col>    
          <v-col cols="12" md="1">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'alt', 'p']"
                  icon
                  color="green"
                  @click="exportExcel"
                  @shortkey="exportExcel"
                >
                  <v-icon>mdi-file-excel-outline</v-icon>
                </v-btn>
              </template>
              <span class="text-caption text-center">Export Excel<br/>(Ctrl + Alt + P)</span>
            </v-tooltip>
          </v-col> 
          <v-col cols="12" md="3" class="text-right">
            <add-new-btn @add="add"></add-new-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text v-if="true" class="pb-1">
        <advanced-search :source="source" @search="search"></advanced-search>
      </v-card-text>
      <main-grid :grid="grid" @edit="edit" @remove="remove"></main-grid>
    </v-card>
    <confirm ref="confirm"></confirm>
  </div>
</template>

<script>
import api from '@/services/axios.service'
import { mapState } from 'vuex'
import Confirm from '@/components/dialog/Confirm'
import MainGrid from '../../components/common/MainGrid.vue'
import AdvancedSearch from '../../components/common/AdvancedSearch.vue'
import AddNewBtn from '../../components/common/AddNewBtn.vue'
import excelService from '@/services/excel.service'
export default {
  components: {
    Confirm,
    MainGrid,
    AdvancedSearch,
    AddNewBtn
  },
  props: ['param', 'id'],
  created: function () {
    this.getView()
  },
  data() {
    return {
      source: 'swift',
      grid:{
        data: [],
        columns: [],
        primaryKey: null,
        rowCount: 0,
        options: {
          sortBy: [],
          sortDesc: []
        },
        search: null
      },      
      filterfields: []     
    }
  },
  watch: {
    param() {
      this.getView()
    }
  },
  computed: {
    ...mapState({
      filter: state => state.app.filter,
      endpoint: state => state.api.endpoint,
      gridDefOpts: state => state.app.grid
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }   
  },
  methods: {
    advancedSearch() {
      this.grid.search = null
      this.$store.commit('app/advSearch')
      if (this.filter.isAdvancedSearch) {
        this.$store.commit('app/addSearch')
      }
    },
    search(vm) {
      this.getList(vm.filters, vm.isAdvancedSearch)
    },
    getList(filters = [], isAdvancedSearch = false) {
      const sorts = []
      sorts.push({
        field: this.grid.primaryKey,
        direction: 'desc'
      })
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
        this.grid.columns = response.data.metaData.filter(x => !x.isHidden)
        this.grid.primaryKey = response.data.pkColumnName        
        this.grid.rowCount = response.data.rowCount
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
        this.grid.columns = response.data.metaData.filter(x => !x.isHidden)
        this.grid.primaryKey = response.data.pkColumnName      
        this.grid.rowCount = response.data.rowCount
        this.generateField()
      })
    },
    generateField() {
      this.grid.columns.forEach(data => {
        if (data.value !== 'sw_action' && data.displayAs !== 'tick' && !data.isHidden) {
          this.filterfields.push({text:data.text, value: data.value, dataType: data.dataType.toLowerCase()})
        }
        if (data.value === 'sw_action') {
          data.width = '90'
        }
      })
      this.$store.commit('app/setFilterFields', this.filterfields)
    },
    add() {
      this.$router.push({ name: 'parameter-master-add', params: { param: this.param} })
    },
    edit(id) {
      this.$router.push({ name: 'parameter-master-edit', params: { param: this.param, id: id} })
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
    async exportExcel() {
      const title = `Data ${this.param}`
      excelService.export(title, this.grid, this.gridDefOpts, true)
    }
  }
}
</script>