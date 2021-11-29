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
                      :disabled="disableControl"
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
                      :disabled="disableControl || !auth.allowPost"
                      color="green darken-1"
                      class="font-weight-regular"
                      dark
                      small
                      tile
                      @click="save()"
                      @shortkey="save()"
                    >
                      <v-icon left>mdi-alpha-p-box-outline</v-icon>
                      Posting
                    </v-btn>
                  </template>
                  <span class="text-caption">(Ctrl + Alt + P)</span>
                </v-tooltip>
              </v-col>
            </v-row>

            <v-row dense v-if="ongoingPost">
              <v-col cols="12">
                <v-progress-linear
                  v-model="this.postingState.percent"
                  color="red lighten-2"
                  height="20"
                  stream
                >
                </v-progress-linear>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-title class="indigo--text text--lighten-2 pt-1">
        <v-row no-gutters>
          <v-col cols="12" md="12">
            Sejarah Posting
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-data-table  
          :headers="grid.columns"
          :height="grid.height"
          :items="grid.data"
          class="elevation-1"
          disable-sort
          fixed-header
          hide-default-footer
          disable-pagination
        >
          <template v-slot:[`item.postedDate`]="{ item }">
            {{ item.postedDate | formatDate('dd-MMM-yyyy') }}
          </template>
          <template v-slot:[`item.isPosted`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon 
                  v-bind="attrs" 
                  v-on="on" 
                  :color="item.isPosted === true ? 'green' : 'red'"
                >
                  {{ item.isPosted === true ? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline' }}
                </v-icon>
              </template>
              <span class="text-caption">
                  {{ item.isPosted === true ? 'Sudah dipost' : 'Belum dipost' }}
              </span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO, getMonth }  from 'date-fns'

import auth from '@/services/authorization.service'
import axios from '@/axiosnoload'

export default {
  data: () => ({
    grid: {
      height: 300,
      columns: [
        { text: 'Periode', value: 'period', divider: true, width: '50%'},
        { text: 'Tanggal Post', value: 'postedDate', divider: true, width: '50%'},
        { text: 'Status Post', value: 'isPosted', width: '50%' }
      ],
      data: []
    },
    menu: {
      date: false
    },
    valid: false,
    data: {},
    postingState: {
      status: null
    },
    disableControl: true,
    countInterval: null
  }),

  created: function () {
    this.reset()
    this.countInterval = setInterval(() => {
      this.getPostingState()
      this.getHistoryPost()
    }, 3000)
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

  beforeDestroy: function () {
    clearInterval(this.countInterval)
  },

  watch: {
    'data': {
      handler() {
        this.getHistoryPost()
      },
      deep: true
    }
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
    },
    ongoingPost() {
      return this.postingState?.status?.toUpperCase() === 'ONGOING'
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
      this.disableControl = false

      axios.post('/journal', this.data)
    },
    getHistoryPost() {
      axios.post('journal/lists', this.data)
        .then(response => {
          this.grid.data = response.data.tableData
        })
    },
    getPostingState() {
      axios.get('journal/state')
        .then(response => {
          if (!response.data) {
            this.disableControl = false
          }

          if (response.data.status === 'ONGOING') {
            this.disableControl = true
            this.data.date = response.data.processDate
            response.data.percent = getMonth(parseISO(response.data.processDate)) === 11 ? (response.data.step / 21) * 100 : (response.data.step / 19) * 100
          } else if (response.data.status === 'FAILURE' && this.postingState.status !== 'FAILURE') {
            this.disableControl = false
            this.$store.dispatch('app/showError', `Posting journal periode ${format(parseISO(response.data.processDate), 'MMM-yyyy')} gagal.<br/>${response.data.notes}`)
          } else if (response.data.status === 'FINISH') {
            this.disableControl = false
            if (this.postingState.status === 'ONGOING') {
              this.$store.dispatch('app/showSuccess', 'Posting journal selesai.')
            }
          }

          this.postingState = response.data
        })
    }
  }
}
</script>
