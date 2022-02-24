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
        <v-toolbar-title>Klon Data Target Penjual</v-toolbar-title>
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
              <v-text-field
                v-model="data.name"
                :rules="[rules.required[0], rules.max50chars[0]]"
                :counter="50"
                label="Nama Target Penjual"
                class="mt-0"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" md="6">
              <v-menu
                v-model="menu.startDate"
                :close-on-content-click="false"
                transition="scale-transition"
                min-width="290px"
                offset-y
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-bind="attrs"
                    v-on="on"
                    :rules="rules.required"
                    :value="formatStartDate"
                    label="Tanggal Mulai"
                    class="mt-0"
                    readonly
                    required
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="data.startDate"
                  :min="dataStartDate"
                  no-title
                  scrollable
                  @change="menu.startDate = false; changeStartDate();"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12" md="6" class="pl-md-1">
              <v-menu
                v-model="menu.endDate"
                :close-on-content-click="false"
                transition="scale-transition"
                min-width="290px"
                offset-y
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-bind="attrs"
                    v-on="on"
                    :rules="rules.required"
                    :value="formatEndDate"
                    label="Tanggal Akhir"
                    class="mt-0"
                    readonly
                    required
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="data.endDate"
                  :min="dataStartDate"
                  no-title
                  scrollable
                  @change="menu.endDate = false; changeEndDate();"
                ></v-date-picker>
              </v-menu>
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
            @click="save"
          >
            <v-icon left>mdi-content-save</v-icon>
            Simpan
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import api from '@/services/axios.service'

export default {
  data: () => ({
    dialog: false,
    options: {
      width: 800
    },
    data: {},
    menu: {
      startDate: false,
      endDate: false
    },
    valid: false
  }),
  computed: {
    ...mapState({ 
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint
    }),
    formatStartDate() {
      return this.data.startDate ? format(parseISO(this.data.startDate), 'dd-MMM-yyyy') : ''
    },
    formatEndDate() {
      return this.data.endDate ? format(parseISO(this.data.endDate), 'dd-MMM-yyyy') : ''
    }
  },
  methods: {
    reset() {
      this.data = {
        code: null,
        name: null,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      }
    },
    open(item) {
      this.reset()
      this.dialog = true
      this.data.code = item
      setTimeout(() => {
        this.$refs.code.focus()
      }, 0)
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

      const resp = await api.create(`${this.endpoint.sales.salesmanTarget}/clone`, this.data)
      result = resp.data

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.close()
        this.$emit('closeClone')
      } else {
        this.$store.dispatch('app/showInfo', result.message)
      }
    },
    changeStartDate() {
      if (this.data.startDate > this.data.endDate) {
        this.data.endDate = this.data.startDate
      }
    },
    changeEndDate() {
      if (this.data.endDate < this.data.startDate) {
        this.data.startDate = this.data.endDate
      }
    }
  }
}
</script>
