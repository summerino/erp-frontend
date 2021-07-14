<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12">
            Ubah kata sandi
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
        >
          <v-row>
            <v-col cols="12" md="3">
              <h3>Username</h3>
            </v-col>
            <v-col cols="12" md="3" class="pl-md-1">
              <h3><b>{{ data.username }}</b></h3>
            </v-col>
            <v-col cols="12" md="6" class="pl-md-1">
              &nbsp;
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="3">
              <h3>Kata sandi lama</h3>
            </v-col>
            <v-col cols="12" md="3" class="pl-md-1">
              <v-text-field
                v-model="data.password"
                :rules="rules.required"
                type="password"
                class="mt-0"
                required
                dense
                @keyup.enter="save"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="pl-md-1">
              &nbsp;
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="3">
              <h3>Kata sandi baru</h3>
            </v-col>
            <v-col cols="12" md="3" class="pl-md-1">
              <v-text-field
                v-model="data.newPassword"
                :rules="rules.required"
                type="password"
                class="mt-0"
                required
                dense
                @keyup.enter="save"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="pl-md-1">
              &nbsp;
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="3">
              <h3>Konfirmasi kata sandi baru</h3>
            </v-col>
            <v-col cols="12" md="3" class="pl-md-1">
              <v-text-field
                v-model="data.confirmPassword"
                :rules="rules.required"
                type="password"
                class="mt-0"
                required
                dense
                @keyup.enter="save"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="pl-md-1">
              &nbsp;
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="3">
              &nbsp;
            </v-col>
            <v-col cols="12" md="1" class="pl-md-1">
              <v-btn
                color="blue darken-2"
                class="font-weight-regular"
                dark
                small
                tile
                @click="save"
              >
                <v-icon left>
                  mdi-content-save
                </v-icon>
                Simpan
              </v-btn>
            </v-col>
            <v-col cols="12" md="8" class="pl-md-1">
              <v-btn
                color="blue darken-2"
                class="font-weight-regular"
                dark
                small
                tile
                @click="cancel"
              >
                <v-icon left>
                  mdi-close-thick
                </v-icon>
                Batalkan
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
    
    <confirm ref="confirm"></confirm>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import auth from '@/services/authorization.service'
// import { format, parseISO }  from 'date-fns'

import api from '@/services/axios.service'
import Confirm from '@/components/dialog/Confirm'

export default {
  components:{
    Confirm
  },

  data: () => ({
    main: true,
    valid: false,
    data: {}
  }),

  created: function () {
    this.loadUserInfo()
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [])
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  computed: {
    ...mapState({
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint
    })
  },
  
  methods:{
    reset() {
      this.data = {
        catalogUserId: null,
        userId: null,
        username: null,
        password: null,
        newPassword: null,
        confirmPassword: null
      }
    },
    loadUserInfo() {
      this.reset()
      const user = auth.getUserInfo()
      this.data = {
        catalogUserId: user.CatalogUserId,
        userId: user.UserId,
        username: user.given_name,
        name: user.given_name,
        initial: user.given_name,
        password: null,
        newPassword: null,
        confirmPassword: null
      }
    },
    async save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = this.data
      
      let result = { success: false, message: '' }
      
      const resp = await api.update(`${this.endpoint.systemManagement.user}/change-password`, data.userId, data)
      result = resp.data

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.data.catalogUserId = result.data
        this.cancel()
      }
    },
    cancel() {
      this.$router.push('/dashboard/analytics') 
    }
  }
}

</script>

<style>
</style>