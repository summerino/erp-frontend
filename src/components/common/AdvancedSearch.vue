<template>
  <v-col cols="12" md="6" >
    <v-row no-gutters>
      <v-col cols="9">
        <v-text-field
          :readonly="filter.isAdvancedSearch"
          v-model="search"
          label="Cari..."
          append-icon="mdi-magnify"
          class="font-weight-regular mt-0 pt-0"
          single-line
          @keyup.enter="getList(false)"
        ></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              v-shortkey="['ctrl', 'alt', 's']"
              tile
              icon
              @click="advSearch"
              @shortkey="advSearch"
            >
              <v-icon>mdi-magnify-plus-outline</v-icon>
            </v-btn>
          </template>
          <span class="text-caption"><div>Pencarian Lanjutan</div></span>
        </v-tooltip>
        
      </v-col>
    </v-row>
    <v-row no-gutters v-if="filter.isAdvancedSearch">
      <v-col class="pt-0 mt-0">
        <div class="pt-0 mt-0" v-for="(item, index) in filter.searches" :key="index">
          <v-row class="pl-2 mt-0 pt-0" no-gutters>
            <v-col cols="3" class="ma-0 pa-0">
              <v-select
                v-model="item.field"
                :items="filter.fields"
                @change="onChangeField(index, item.field)"
                label="Kolom"
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
                <v-text-field class="mt-0 ml-1 font-weight-regular" v-model="item.keyword" label="Kata Kunci" @keyup.enter="advancedSearch()"></v-text-field>                
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
                          label="Tanggal"
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
                <span class="text-caption">Hapus Pencarian</span>
              </v-tooltip>
              <v-tooltip v-if="index === filter.searches.length - 1" bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-if="filter.isAdvancedSearch"
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
                <span class="text-caption">Tambah Pencarian</span>
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
              >Batal</v-btn>
              <v-btn
                class="primary"
                text
                small
                @click="advancedSearch()"
                tile
              >Cari</v-btn>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-col>
</template>


<script>
import { mapState } from 'vuex'

export default {


  data: () => ({
    search: null,
    searches: []    
  }),

  computed: {
    ...mapState({
      filter: state => state.app.filter
    })    
  },
  methods: {
    advSearch() {
      this.$store.commit('app/advSearch')
      if (this.filter.isAdvancedSearch) this.addSearch()
    },
    addSearch() {
      this.$store.commit('app/addSearch')
    },
    advancedSearch() {      
      const filters = this.filter.searches.filter(x => x.operator !== '' && x.field !== '' && x.keyword !== '')
      this.getList(false, filters)
    },
    resetAdvancedFilter() {
      this.$store.commit('app/resetAdvancedFilter')
      this.addSearch()
      this.getList(false)

    },
    removeSearch(index) {
      this.$store.commit('app/removeSearch', index)
    },
    onChangeField(index, field) {
      this.filter.searches[index].operator = null
      const category = this.getCategoryFromDataField(field)
      const vm = {
        index: index,
        category: category
      }
      this.$store.commit('app/onChangeField', vm)
    },
    getCategoryFromDataField(field) {
      if (field === '') return ''
      const selectedField = this.filter.fields.find(x => x.value === field)
      const temp = this.filter.mapDataTypeToCategory.find(x => x.dataTypes.includes(selectedField.dataType))
      return temp.category
    },
    getList(bindToForm, filters = []) {
      const vm = {
        bindToForm: bindToForm,
        filters: filters,
        search: this.search
      }
      this.$emit('search', vm)
    }
  }
}
</script>
