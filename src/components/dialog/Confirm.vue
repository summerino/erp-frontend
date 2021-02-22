<template>
  <v-dialog
    v-model="dialog"
    :width="options.width"
    persistent
    @keydown.esc="cancel"
  >
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
          @click="submit"
        >
          OK
        </v-btn>
        <v-btn
          ref="cancel"
          class="font-weight-regular ml-1"
          small
          tile
          @click="cancel"
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
      resolve: null,
      reject: null,
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
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    submit() {
      this.resolve(true)
      this.dialog = false
    },
    cancel() {
      this.resolve(false)
      this.dialog = false
    }
  }
}
</script>
