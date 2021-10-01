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
        <v-toolbar-title>Persetujuan Biaya Sales</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-2 pt-1">
        <v-form
          ref="form"
          v-model="valid"
        >
          <v-row no-gutters>
            <v-col cols="12" md="6">
              <v-menu
                v-model="menu.cbDate"
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
                  :value="formatCbDate"
                  label="Tanggal"
                  class="mt-0"
                  readonly
                  required
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="data.cbDate"
                no-title
                scrollable
                @change="menu.cbDate = false"
              ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12" md="6" class="pl-md-1">
              <v-autocomplete
                v-model="data.coaCode"
                :items="coas"
                :item-text="item => `${item.code} - ${item.name}`"
                label="Akun"
                item-value="code"
                class="text-body-2 mt-0"
                :rules="rules.required"
                required
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12">
              <v-textarea
                v-model="data.notes"
                :rules="[rules.required[0],rules.max256chars[0]]"
                label="Catatan"
                counter="256"
                class="mt-0"
                rows="3"
                required
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end pb-2 pr-2">
        <v-btn
          :disabled="!auth.allowApprove"
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
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import api from '@/services/axios.service'

export default {
  props: {
    selected: Array
  },
  data: () => ({
    dialog: false,
    options: {
      width: 800
    },
    data: {},
    menu: {
      cbDate: false
    },
    coas: [],
    valid: false
  }),
  computed: {
    ...mapState({
      auth: state => state.api.authorization, 
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint }),
    formatCbDate() {
      return this.data.cbDate ? format(parseISO(this.data.cbDate), 'dd-MMM-yyyy') : ''
    }
  },
  methods: {
    open(item) {
      this.dialog = true
      this.data = item
      this.getCOAList()
    },
    close() {
      this.dialog = false
      this.data.notes = null
      this.data.cbDate = format(new Date(), 'yyyy-MM-dd')
      this.data.coaCode = null
    },
    async save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      let result = { success: false, message: '' }
      const resp = await api.updatemaster(`${this.endpoint.mobileSales.salesCost}/approve`, this.selected, {
        params: { date: this.data.cbDate, coa: this.data.coaCode, notes: this.data.notes }
      })

      result = resp.data
      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.close()
        this.$emit('closeApprove')
      }
    },
    getCOAList() {
      api.getAll(`${this.endpoint.accounting.coa}/lists`, {
        params: {
          filters: JSON.stringify([{
            field: 'isActive',
            operator: 'eq',
            keyword: true
          }])
        }
      })
        .then(response => {
          this.coas = response.data.tableData
        })
    }
  }
}
</script>
