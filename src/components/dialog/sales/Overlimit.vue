<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    :width="options.width"  
    persistent
    @keydown.esc="close"
  >
    <v-card>
      <v-toolbar
        color="indigo darken-1"
        max-height="64"
        dark
      >
        <v-toolbar-title>Persetujuan Kelebihan Batas Kredit</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          class="ma-2"
          icon
          @click="save"
        >
          Simpan
        </v-btn>
        <v-divider vertical></v-divider>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
          <v-card>
            <v-card-text>
              <v-form
                ref="form"
                v-model="valid"
              >
                <v-row dense>
                  <v-col cols="12">
                    <v-textarea
                      v-model="reason"
                      :rules="[rules.max256chars[0], rules.required[0]]"
                      label="Alasan"
                      counter="256"
                      class="mt-0"
                      rows="6"
                      required
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

import api from '@/services/axios.service'

export default {
  data() {
    return {
      dialog: false,
      options: {
        width: 800
      },
      reason : null,
      data: [],
      valid: false
    }
  },

  computed: {
    ...mapState({
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint
    })
  },
  
  methods: {
    reset() {
      this.data = []
      this.reason = null
    },
    open(selected) {
      this.dialog = true
      this.reset()
      this.data = selected
    },
    close() {
      this.dialog = false
    },
    async save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }
      let result = { success: false, message: '' }
      const resp = await api.create(this.endpoint.sales.overlimitApproval, this.data, { params: {
        data: this.data,
        reason: this.reason
      }})
      result = resp.data
      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.close()
        this.$emit('closeParent')
      }
    }
  }
}
</script>
