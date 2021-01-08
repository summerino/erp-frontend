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
          dark
          small
          tile
          color="red darken-2"
          class="font-weight-regular">
          OK
        </v-btn>
        <v-btn
          small
          tile
          class="font-weight-regular ml-1">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/*
|---------------------------------------------------------------------
| Toolbar Apps Component
|---------------------------------------------------------------------
|
| Quickmenu for applications in the toolbar
|
*/
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
    }
  }
}
</script>
