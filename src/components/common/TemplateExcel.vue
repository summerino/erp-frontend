<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        v-shortkey="['ctrl', 'alt', 't']"
        icon
        color="blue"
        @click="templateExcel"
        @shortkey="templateExcel"
      >
        <v-icon>mdi-microsoft-excel</v-icon>
      </v-btn>
    </template>
    <span class="text-caption text-center">Download Template Import<br/>(Ctrl + Alt + T)</span>
  </v-tooltip>
</template>


<script>
import templateExcelService from '@/services/templateExcel.service.js'

export default {
  props: ['title', 'grid'],
  
  methods: {
    async templateExcel() {
      templateExcelService.export(this.title, this.grid)
    }
  }  
}
</script>
