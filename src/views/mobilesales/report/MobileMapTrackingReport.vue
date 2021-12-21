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
                  v-model="menu.date"
                  :close-on-content-click="false"
                  :disabled="isLastPosition"
                  transition="scale-transition"
                  min-width="290px"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      :disabled="isLastPosition"
                      :value="formatDate"
                      label="Tanggal"
                      class="mt-0"
                      dense
                      readonly
                      @click:clear="clearDate"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.date"
                    no-title
                    scrollable
                    @change="menu.date = false;"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="6" class="pl-1">
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
          <gmap-map
            :center="center"
            :options="mapOptions"
            :zoom="zoom"
            style="height:500px"
          >
            <gmap-info-window
              :options="infoOptions"
              :position="infoWindowPos"
              :opened="infoWinOpen"
              @closeclick="infoWinOpen=false" />
            <gmap-marker
              v-for="(customer, index) in customers"
              :key="`cm${index}`"
              :position="customer"
              :icon="shopIcon"
              :clickable="true"
              @click="toggleInfoWindow('cust', customer, index)" />
            <gmap-marker
              v-for="(path, index) in paths"
              :key="`tm${index}`"
              :label="!isLastPosition ? { text: (index + 1).toString(), fontWeight: '600' } : null"
              :position="path"
              :icon="truckIcon"
              :clickable="true"
              @click="toggleInfoWindow('path', path, index)" />
            <gmap-polyline
              v-if="paths.length > 0 && !isLastPosition"
              :path="paths"
              :options="{ strokeColor: '#ff0000' }" />
          </gmap-map>
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

export default {
  data: () => ({
    menu: {
      date: false
    },
    filter: false,
    employees: [],
    data: {},
    center: { lat: -6.2293867, lng: 106.6894286 },
    mapOptions: {
      disableDefaultUI: true,
      fullscreenControl: true
    },
    zoom: 10,
    customers: [],
    paths: [],
    currentIdx: null,
    infoWinOpen: false,
    infoWindowPos: { lat: -6.2293867, lng: 106.6894286 },
    infoOptions: {
      content: '',
      pixelOffset: {
        width: 0,
        height: -48
      }
    },
    shopIcon: { url: '../../images/shop-marker.png' },
    truckIcon: { url: '../../images/truck-marker.png' },
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
          this.data.date = format(new Date(), 'yyyy-MM-dd')
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
    formatDate() {
      return this.data.date ? format(parseISO(this.data.date), 'dd-MMM-yyyy') : ''
    },
    isLastPosition() {
      return this.data.type === 2
    }
  },
  
  methods:{
    reset() {
      this.data = {        
        date: format(new Date(), 'yyyy-MM-dd'),
        salesId: null,
        type: 1
      }
      this.filter = true
    },
    getData() {
      clearInterval(this.countInterval)
      this.showMap()

      if (this.isLastPosition) {
        this.countInterval = setInterval(() => {
          this.showMap()
        }, 5000)
      }
    },
    showMap() {
      api.getAll(this.endpoint.mobileSales.mapTrackingReport, {
        params: {
          date: this.data.date,
          salesId: this.data.salesId,
          type: this.data.type
        }
      })
        .then(response => {
          this.customers = response.data.customer
          this.paths = response.data.tracking
          this.currentIdx = null
          this.infoWinOpen = false

          if (this.customers.length === 0 && this.paths.length === 0) {
            return
          }

          if (this.paths.length > 0) {
            this.center = { lat: this.paths[0].lat, lng: this.paths[0].lng }
          } else if (this.customers.length > 0) {
            this.center = { lat: this.customers[0].lat, lng: this.customers[0].lng }
          }
          
          this.zoom = !this.isLastPosition ? 16 : 18
          // if (!this.isLastPosition) {
          //   let origin = {}
          //   let destination = {}
          //   const waypoints = []

          //   for (let j = 0; j < locations.length; j++) {
          //     if (j === 0) {
          //       origin = { lat: locations[j].lat, lng: locations[j].lng }
          //       this.center = origin
          //     } else if (j === locations.length - 1) {
          //       destination = { lat: locations[j].lat, lng: locations[j].lng }
          //     } else if (j > 0) {
          //       waypoints.push({
          //         location: { lat: locations[j].lat, lng: locations[j].lng }
          //       })
          //     }
          //   }

          //   this.directions.push({
          //     origin: origin,
          //     destination: destination,
          //     waypoints: waypoints
          //   })
          // }
        })
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
      this.center = { lat: -6.2293867, lng: 106.6894286 }
      this.zoom = 10
      this.customers = []
      this.paths = []
      this.position = {}
      this.currentIdx = null
      this.infoWinOpen = false
      clearInterval(this.countInterval)
    },
    clearDate() {
      this.data.date = null
      this.clearMap()
    },
    toggleInfoWindow(type, data, idx) {
      this.infoWindowPos = { lat: data.lat, lng: data.lng }
      if (type === 'cust') {
        this.infoOptions.content = `${data.code} - ${data.name}`
      } else {
        this.infoOptions.content = `Waktu Pelacakan: ${format(parseISO(data.trackedDate), 'HH:mm:ss')}`
      }

      if (this.currentIdx === idx) {
        this.infoWinOpen = !this.infoWinOpen
      } else {
        this.infoWinOpen = true
        this.currentIdx = idx
      }
    }
  }
}
</script>
