<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row no-gutters>   
          <v-col cols="12" md="6" >
            <advanced-search :source="source"  @search="search"></advanced-search>
          </v-col>     
          <v-col cols="12" md="6" class="text-right">
            <add-new-btn @add="add"></add-new-btn>
          </v-col>
        </v-row>
      </v-card-title>
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
        }
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
      endpoint: state => state.api.endpoint,
      gridDefOpts: state => state.app.grid
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }   
  },
  methods: {
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
    }
  }
}

</script>

