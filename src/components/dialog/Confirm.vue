<template>
  <v-dialog
    v-model="dialog"
    :width="options.width"
    persistent>
    <v-card>
      <v-card-title class="error--text">{{ title }}</v-card-title>
      <v-card-text v-show="message">{{ message }}</v-card-text>
      <v-card-actions class="justify-center pb-2">
        <v-btn
          color="red darken-2"
          class="font-weight-regular"
          dark
          small
          tile
        >
          OK
        </v-btn>
        <v-btn
          class="font-weight-regular ml-1"
          small
          tile
          @click="dialog = false"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      title: null,
      message: null,
      options: {
        width: 290
      }
    }
  },
  methods: {
    open(title, message, options) {
      this.dialog = true
      this.title = title
      this.message = message
      this.options = Object.assign(this.options, options)
    },
    close() {
      this.dialog = false
    }
  }
}
</script>
