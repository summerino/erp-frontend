<template>
  <v-dialog
    v-model="dialog"
    :width="options.width"
    persistent
    @keydown.esc="close"
  >
    <v-card>
    <v-toolbar
        color="indigo darken-1"
        dark
        dense
      >
        <v-toolbar-title>Upload Template</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form
        ref="form"
        v-model="valid"
      >
        <v-card-text class="px-2 pt-1">
          <v-row no-gutters>
            <v-col cols="12">
              <v-file-input
                v-model="uploadedFile"
                :rules="rules.required"
                accept=".xlsx"
                truncate-length="50"
              ></v-file-input>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="justify-end pb-2 pr-2">
          <v-btn
            color="green"
            class="font-weight-regular"
            dark
            small
            tile
            @click="upload"
          >
            <v-icon left>mdi-file-upload</v-icon>
            Upload
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>


<script>

import { mapState } from 'vuex'
import api from '@/services/axios.service'
import templateExcelService from '@/services/templateExcel.service.js'

export default {
  props: ['type', 'grid'],
  
  computed: {
    ...mapState({ 
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint })
  },
  
  data: () => ({
    dialog: false,
    uploadedFile: undefined,
    options: {
      width: 800
    },
    valid: false
  }),

  methods: {
    reset() {
      this.uploadedFile = undefined
    },
    open() {
      this.reset()
      this.dialog = true
    },
    close() {
      this.dialog = false
    },
    async upload() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = await this.extractData()

      if (this.type === 'bb-ap') {
        const resp = await api.create(`${this.endpoint.accounting.beginBalance.ap}/upload`, data)
        this.grid.data = resp.data.tableData
        this.grid.total = resp.data.rowCount
      } else if (this.type === 'bb-ar') {
        const resp = await api.create(`${this.endpoint.accounting.beginBalance.ar}/upload`, data)
        this.grid.data = resp.data.tableData
        this.grid.total = resp.data.rowCount
      } else if (this.type === 'bb-dm') {
        const resp = await api.create(`${this.endpoint.accounting.beginBalance.dm}/upload`, data)
        this.grid.data = resp.data.tableData
        this.grid.total = resp.data.rowCount
      } else if (this.type === 'bb-cm') {
        const resp = await api.create(`${this.endpoint.accounting.beginBalance.cm}/upload`, data)
        this.grid.data = resp.data.tableData
        this.grid.total = resp.data.rowCount
      }
      this.close()
      this.$emit('uploadCmp')
    },
    async extractData() {
      const result = await templateExcelService.extractData(this.uploadedFile)
      return result
    }
  }  
}
</script>
