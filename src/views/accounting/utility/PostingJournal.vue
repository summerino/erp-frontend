<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="8">
            Posting Jurnal
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
        >
          <v-container class="px-1 pt-0 pb-1">
            <v-row no-gutters>
              <v-col cols="2">
                <v-menu
                  v-model="menu.date"
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
                      :value="formatDate"
                      label="Tanggal"
                      class="mt-0"
                      readonly
                      required
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="data.date"
                    type="month"
                    no-title
                    scrollable
                    @change="menu.date = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="2">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      v-shortkey="['ctrl', 'alt', 'p']"
                      color="green darken-1"
                      class="font-weight-regular"
                      dark
                      small
                      tile
                      @click="save()"
                      @shortkey="save()"
                      :disabled="!auth.allowPost"
                    >
                      <v-icon left>mdi-alpha-p-box-outline</v-icon>
                      Posting
                    </v-btn>
                  </template>
                  <span class="text-caption">(Ctrl + Alt + P)</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

export default {
  data: () => ({
    menu: {
      date: false
    },
    valid: false,
    data: {}
  }),

  created: function () {
    this.reset()
    auth.getAction(this.endpoint, this.menuId.postingJournal)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Utilitas'
      }, {
        text: 'Posting'
      }])
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  computed: {
    ...mapState({
      gridDefOpts: state => state.app.grid,
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    }),
    formatDate() {
      return this.data.date ? format(parseISO(this.data.date), 'MMM-yyyy') : format(new Date(), 'MMM-yyyy')
    } 
  },
  
  methods:{
    reset() {
      this.data = {        
        date: format(new Date(), 'yyyy-MM-dd')
      }
    },
    async save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Tolong cek kembali bagian formulir yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      let result = { success: false, message: '' }
      const resp = await api.create('journal', this.data)
      result = resp.data

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
      }
    }
  }
}

</script>
