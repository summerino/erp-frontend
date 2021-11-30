<template>
  <div class="w-full">
    <v-row ref="filter" no-gutters>
      <v-col cols="12">
        <v-card>
          <v-card-title class="indigo--text text--lighten-2 pb-1">
            <v-row no-gutters>
              <v-col cols="12" md="6">
                Laporan Riwayat Pelacakan
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
                      @click="getData"
                      @shortkey="getData"
                    >
                      <v-icon left>mdi-magnify</v-icon>
                      Cari
                    </v-btn>
                  </template>
                  <span class="text-caption">(Ctrl + Alt + S)</span>
                </v-tooltip>
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
              <v-col cols="12" md="3">
                <v-menu
                  v-model="menu.startDate"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                  :disabled="isLastPosition"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatStartDate"
                      label="Tanggal Mulai"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearDate('start')"
                      :disabled="isLastPosition"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.startDate"
                    no-title
                    scrollable
                    @change="menu.startDate = false; changeStartDate();"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-menu
                  v-model="menu.endDate"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                  :disabled="isLastPosition"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :value="formatEndDate"
                      label="Tanggal Akhir"
                      class="mt-0"
                      dense
                      readonly
                      clearable
                      @click:clear="clearDate('end')"
                      :disabled="isLastPosition"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.endDate"
                    no-title
                    scrollable
                    @change="menu.endDate = false; changeEndDate();"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-autocomplete
                  v-model="data.salesId"
                  :items="employees"
                  :item-text="item => `${item.initial} - ${item.firstName}`"
                  :rules="rules.required"
                  label="Penjual"
                  item-value="id"
                  class="mt-0"
                  dense
                  required
                  @change="clearMap()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3" class="pl-1">
                <v-autocomplete
                  v-model="data.type"
                  :items="types"
                  :rules="rules.required"
                  label="Tipe"
                  item-text="name"
                  item-value="id"
                  class="mt-0"
                  dense
                  required
                  @change="clearMap()"
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12">
        <v-card>
          <div class="custom-map">
            <gmap-map
              v-if="path.length > 0"
              :zoom="10"    
              :center="center"
              style="height:500px"
            >
              <DirectionsRenderer :key="index" v-for="(m, index) in path" :origin="path[index]" :destination="index === path.length - 1 ? path[index] : path[index + 1]"/>
            </gmap-map>
          </div>
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
import DirectionsRenderer from '@/configs/directionsrenderer'


export default {
  components: {
    DirectionsRenderer
  },

  data: () => ({
    menu: {
      startDate: false,
      endDate: false
    },
    center: null,
    filter: false,
    employees: [],
    data: {},
    path: [],
    types: [{ id: 1, name: 'Riwayat Pelacakan' }, { id: 2, name: 'Posisi Terakhir'}],
    countInterval: null
  }),

  created: function () {
    this.reset()
    this.getSalesmanLists()
    auth.getAction(this.endpoint, this.menuId.mobileMapTrackingReport)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  beforeDestroy: function () {
    clearInterval(this.countInterval)
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Mobile Penjual'
      }, {
        text: 'Laporan'
      }, {
        text: 'Riwayat Pelacakan'
      }])
    }, 0)
  },

  watch: {
    'data.type': {
      handler() {
        if (this.isLastPosition) {
          this.data.startDate = format(new Date(), 'yyyy-MM-dd')
          this.data.endDate = format(new Date(), 'yyyy-MM-dd')
        } else {
          clearInterval(this.countInterval)
        }
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
      auth: state => state.api.authorization,
      action: state => state.api.action,
      menuId: state => state.api.menus
    }),
    formatStartDate() {
      return this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
    },
    formatEndDate() {
      return this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
    },
    isLastPosition() {
      return this.data.type === 2
    }
  },
  
  methods:{
    reset() {
      this.data = {        
        salesId: null,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        type: 1
      }
      this.filter = true
    },
    getData() {
      api.getAll(this.endpoint.mobileSales.mapTrackingReport, {
        params: {
          salesId: this.data.salesId,
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          type: this.data.type
        }
      })
        .then(response => {
          this.path = response.data.tableData
          if (this.path[0] !== null || this.path !== undefined) {
            this.center = this.path[0]
          }
        })

      if (this.isLastPosition) {
        this.countInterval = setInterval(() => {
          api.getAll(this.endpoint.mobileSales.mapTrackingReport, {
            params: {
              salesId: this.data.salesId,
              startDate: this.data.startDate,
              endDate: this.data.endDate,
              type: this.data.type
            }
          })
            .then(response => {
              this.path = response.data.tableData
              if (this.path[0] !== null || this.path !== undefined) {
                this.center = this.path[0]
              }
            })
        }, 5000)
      } else {
        clearInterval(this.countInterval)
      }
    },
    showfilter() {
      this.filter = !this.filter
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
          this.data.salesId = this.employees[0].id
        })
    },
    clearMap() {
      this.center = null
      this.path = []
    },
    changeStartDate() {
      if (this.data.startDate > this.data.endDate) {
        this.data.endDate = this.data.startDate
      }
      this.clearMap()
    },
    changeEndDate() {
      if (this.data.endDate < this.data.startDate) {
        this.data.startDate = this.data.endDate
      }
      this.clearMap()
    },
    clearDate(item) {
      if (item === 'start') {
        this.data.startDate = null
      } else {
        this.data.endDate = null
      }
      this.clearMap()
    }
  }
}

</script>

<style lang="scss">
.vue-map-container,
.vue-map-container .vue-map {
  width: 100%;
  height: 100%;
}
.custom-map {
  width : 100%;
  height : 100%;
}
</style>