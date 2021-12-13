import { MapElementFactory } from 'vue2-google-maps'

export default MapElementFactory({
  name: 'directionsRenderer',

  ctr() {
    return window.google.maps.DirectionsRenderer
  },

  events: [],

  mappedProps: {},

  props: {
    origin: { type: Object },
    destination: { type: Object },
    waypoints: { type: Array }
  },

  afterCreate(directionsRenderer) {
    const directionsService = new window.google.maps.DirectionsService()
    directionsService.route({
      origin: this.origin,
      destination: this.destination,
      travelMode: 'DRIVING',
      waypoints: this.waypoints
    }, (response, status) => {
      if (status !== 'OK') return
      directionsRenderer.setDirections(response)
    })
  }
})
