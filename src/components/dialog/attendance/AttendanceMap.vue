<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    @keydown.esc="close"
  >
    <v-card>
      <v-toolbar
        color="deep-purple darken-1"
        max-height="64"
        dark
      >
        <v-toolbar-title>Peta</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <div v-if="useRadius" class="custom-map">
          <gmap-map
            :zoom="14"    
            :center="center"
            style="width:100%  height: 600px"
          >
            <gmap-marker
              :key="index"
              v-for="(m, index) in locationMarkers"
              :position="m.position"
            ></gmap-marker>
            <gmap-circle
              key="0b"
              :center="locationMarkers[0].position"
              :radius="data.radius"
              :visible="true"
              :options="{fillColor:data.radiusColor,fillOpacity:0.5}"
            ></gmap-circle>
          </gmap-map>
        </div>
        <div v-else class="custom-map">
          <gmap-map
            :zoom="14"    
            :center="center"
            style="width:100%  height: 600px"
          >
            <gmap-marker
              :key="index"
              v-for="(m, index) in locationMarkers"
              :position="m.position"
            ></gmap-marker>
          </gmap-map>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    locationMarkers: [],
    dialog: false,
    center: null,
    options: {
      width: 800
    },
    useRadius: null,
    data: {}
  }),

  methods:{
    show(lat, lon, data = null, useRadius = false) {
      this.locationMarkers = []
      this.useRadius = useRadius
      this.dialog = true
      
      const marker = {
        lat: lat,
        lng: lon
      }
      this.locationMarkers.push({ position: marker })
      
      if (data !== null) {
        this.data = data
        const dataMarker = {
          lat: this.data.lat,
          lng: this.data.lng
        }
        this.locationMarkers.push({ position: dataMarker })
      }

      this.center = marker
    },
    close() {
      this.dialog = false
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