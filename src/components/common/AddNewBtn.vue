<template>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          v-shortkey="['ctrl', 'alt', 'n']"
          color="green darken-1"
          class="font-weight-regular"
          dark
          small
          tile
          @click="add"
          @shortkey="add"
        >
          <v-icon left>mdi-plus</v-icon>
          New
        </v-btn>
      </template>
      <span class="text-caption">(Ctrl + Alt + N)</span>
    </v-tooltip>
</template>

<script>
export default {
  methods: {
    add() {
      this.$emit('add')
    }
  }
}
</script> 