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
import { mapState } from 'vuex'
import excelService from '@/services/excel.service.js'
import api from '@/services/axios.service'

export default {
  props: ['company', 'title', 'grid', 'gridDefOpts', 'filters', 'color', 'caption', 'shortcut', 'shortcutCaption', 'data', 'menuId', 'isMain', 'useBackend'],

  computed: {
    ...mapState({
      endpoint: state => state.api.endpoint
    }),
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
      if (this.useBackend) {
        console.log(this.useBackend)
        try {
          const response = await api.getAll(`${this.endpoint.accounting.generalLedgerReport}/excel`, {
            headers:
            {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            responseType: 'blob',
            params: {
              data: JSON.stringify(this.data),
              title: this.title,
              caller: this.menuId,
              filters: JSON.stringify(this.filters),
              isMain: this.isMain
            }
          })
          
          const url = window.URL.createObjectURL(response.data)
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', `${this.title}.xlsx`)
          document.body.appendChild(link)
          link.click()
        } catch (error) {
          console.log(error)
        }
      } else {
        excelService.export(this.company, this.title, this.grid, this.gridDefOpts, this.filters)
      }
    }
  }  
}
</script>
