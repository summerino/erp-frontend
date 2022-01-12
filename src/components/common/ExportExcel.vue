<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        v-shortkey="defaultShortcut"
        :color="defaultColor"
        icon
        small
        @click="exportExcel"
        @shortkey="exportExcel"
      >
        <v-icon>mdi-file-excel-outline</v-icon>
      </v-btn>
    </template>
    <span class="text-caption text-center">{{ defaultCaption }}<br/>{{ defaultShortcutCaption }}</span>
  </v-tooltip>
</template>


<script>
import excelService from '@/services/excel.service.js'

export default {
  props: ['company', 'title', 'grid', 'gridDefOpts', 'filters', 'color', 'caption', 'shortcut', 'shortcutCaption'],

  computed: {
    defaultColor() {
      if (this.color === undefined) return 'green'
      return this.color
    },
    defaultCaption() {
      if (this.caption === undefined) return 'Export Excel'
      return this.caption
    },
    defaultShortcut() {
      if (this.shortcut === undefined) return ['ctrl', 'alt', 'e']
      return this.shortcut
    },
    defaultShortcutCaption() {
      if (this.shortcutCaption === undefined) return '(Ctrl + Alt + E)'
      return this.shortcutCaption
    }
  },
  
  methods: {
    async exportExcel() {
      excelService.export(this.company, this.title, this.grid, this.gridDefOpts, this.filters)
    }
  }  
}
</script>
