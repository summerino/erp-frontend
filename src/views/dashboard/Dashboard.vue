<template>
  <div class="w-full">
    <v-row no-gutters>
      <v-col cols="12"></v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$store.commit('app/setBreadcrumbs', [])
  }
}
</script>
