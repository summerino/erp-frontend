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
        <v-toolbar-title>Gambar</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <div class="image-container">
          <img :src="link">
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    options: {
      width: 800
    },
    link: null
  }),

  methods: {
    show(link) {
      this.link = `${process.env.VUE_APP_API_BASE_URL}/${link}`
      this.dialog = true
    },
    close() {
      this.dialog = false
    }
  }
}
</script>

<style scoped>
.image-container {
  width:100%;
  height:100%;
  display: flex;
  align-items: center;
  position:relative;
  overflow: hidden;
}
img {
  transform: translate(-50%, -50%);
  top:50%;
  left:50%;
  position:absolute;
  max-width: 100%;
  max-height: 100%;
}
</style>