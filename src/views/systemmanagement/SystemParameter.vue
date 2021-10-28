<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            Pengaturan Sistem
          </v-col>
          <v-col cols="12" md="8" class="text-right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 's']"
                  color="blue darken-2"
                  class="font-weight-regular"
                  dark
                  small
                  tile
                  @click="save"
                  @shortkey="save"
                  :disabled="!auth.allowUpdate"
                >
                  <v-icon left>
                    mdi-content-save
                  </v-icon>
                  Simpan
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + S)</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12" md="3">
            <v-treeview
              activatable
              :items="items"
              class="pr-md-1"
              @click="onChangeParam"
            >
              <template slot="label" slot-scope="{ item }">
                <div @click="onChangeParam(item)">{{ item.name }}</div>
              </template>
            </v-treeview>
          </v-col>
          <v-col cols="12" md="9">
            <v-form ref="form">
              <v-row v-for="item in data" :key="item.id" no-gutters>
                <template v-if="item.dataType === 'bool'">
                  <v-checkbox  v-model="item.value" :label="item.description" v-if="item.dataType === 'bool'"></v-checkbox>
                </template>
                <template v-else>
                  <v-text-field  
                    v-model="item.value"
                    :label="item.description"
                    class="mt-0"
                  ></v-text-field>
                </template>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

export default {
  data: () => ({   
    valid: false,
    data: [],
    items: []      
  }),

  created: function () {
    this.getHierarchy(true)
    auth.getAction(this.endpoint, this.menuId.parameter)
      .then((response) => {
        this.$store.commit('api/setAuth', response.data)
      })
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setBreadcrumbs', [{
        text: 'Manajemen Sistem'
      }, {
        text: 'Data Master'
      }, {
        text: 'Pengaturan Sistem'
      }])
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  computed: {
    ...mapState({
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    })
  },

  methods: {    
    getHierarchy(setDefaultValue = false) {
      api.getAll(this.endpoint.systemManagement.parameter)
        .then(response => {
          this.items = response.data
          if (setDefaultValue) {
            const defaultValue = this.items[0].children[0]
            this.bindForm(defaultValue)
          }
          
        })

    },
    onChangeParam(data) {
      if (data.depth === 1) {
        this.bindForm(data)
      }
    }, 
    bindForm(data) {
      this.data = data.listParameters
    }, 
    async save() {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = this.items
      let result = { success: false, message: '' }
      const resp = await api.create(this.endpoint.systemManagement.parameter, data)
      result = resp.data
      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.getHierarchy()
      }
    }    
  }
}
</script>
