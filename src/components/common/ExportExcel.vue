<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        v-shortkey="['ctrl', 'alt', 'p']"
          icon
        color="green"
        @click="exportExcel"
        @shortkey="exportExcel"
      >
        <v-icon>mdi-file-excel-outline</v-icon>
      </v-btn>
    </template>
    <span class="text-caption text-center">Export Excel<br/>(Ctrl + Alt + P)</span>
  </v-tooltip>
</template>


<script>
import excelService from '@/services/excel.service.js'

export default {
  props: ['title', 'grid', 'gridDefOpts', 'filters'],
  
  methods: {
    async exportExcel() {
      excelService.export(this.title, this.grid, this.gridDefOpts, this.filters)
    }
  }  
}
</script>
