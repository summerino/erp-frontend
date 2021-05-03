<template>
  <div class="d-flex flex-column flex-grow-1">
    <div class="w-full">
      <v-card>
        <v-card-title class="indigo--text text--lighten-2 pb-1">
          <v-row dense>
            <v-col cols="12" md="6">
              <span class="mx-1">{{ action }} {{ param }}</span>
            </v-col>
            <!-- <v-col cols="12" md="6" class="text-right">
              <v-btn
                color="blue darken-2"
                class="font-weight-regular"
                dark
                small
                tile
                @click="save"
              >
                Save
              </v-btn>
            </v-col> -->
            <v-col cols="12" md="6" class="text-right">
              <!-- <label
                v-if="data.action == 'edit'"
                class="text-caption mr-1"
              >
                Last Updated: {{ data.updatedDate }} by {{ data.updatedBy }}
              </label> -->
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
                  >
                    <v-icon left>
                      mdi-content-save
                    </v-icon>
                    Save
                  </v-btn>
                </template>
                <span class="text-caption">(Ctrl + S)</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    v-shortkey="['esc']"
                    class="font-weight-regular ml-1"
                    small
                    tile
                    @click="back"
                    @shortkey="back"
                  >
                    <v-icon left>
                      mdi-undo-variant
                    </v-icon>
                    Back
                  </v-btn>
                </template>
                <span class="text-caption">(Esc)</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-container class="px-1 pt-0 pb-1">
              <div v-for="field in fields" :key="field.id">
                <v-row no-gutters>
                  <template v-if="field.componentType == 'textfield'" >
                    <v-col cols="12" :md="field.length">
                      <v-text-field
                          v-model="paramdata[field.name]"
                          :label="field.label"
                          :placeholder="field.placeholder"
                          :rules="field.rules"
                          :counter="field.maxLength"
                          :ref="field.name"
                          class="mt-0"
                        ></v-text-field>
                    </v-col>
                  </template>
                  <template v-else-if="field.componentType == 'textarea'">
                    <v-col cols="12" :md="field.length">
                      <v-textarea
                        v-model="paramdata[field.name]"
                        :label="field.label"
                        :placeholder="field.placeholder"
                        :rules="field.rules"
                        :counter="field.maxLength"
                        :rows="field.rows"
                        :ref="field.name"
                        class="mt-0"
                      ></v-textarea>
                    </v-col>
                  </template>
                  <template v-else-if="field.componentType == 'switch'">
                    <v-col cols="12">
                      <v-switch
                        v-model="paramdata[field.name]"
                        :label="field.label"
                      ></v-switch>
                    </v-col>
                  </template>
                  <template v-else-if="field.componentType == 'currencyfield'">
                    <v-col cols="12">
                      <v-currency-field
                          v-model="paramdata[field.name]"
                          :decimal-length="field.numericScale === 255 ? 0 : field.numericScale"
                          :max-length="field.numericPrecision"
                          class="text-body-2 text-right mt-0"
                          :rules="field.rules"
                          dense
                          :ref="field.name"
                      ></v-currency-field>
                    </v-col>
                  </template>
                  <template v-else-if="field.componentType == 'datepicker'">
                    <v-col cols="12">
                      <v-menu
                        v-model="menu[field.name]"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        min-width="290px"
                        offset-y
                      >
                        <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          :value="convertDate(paramdata[field.name])"
                          v-bind="attrs"
                          v-on="on"
                          :rules="field.rules"
                          :label="field.label"
                          class="mt-0"
                          readonly
                          required
                          >
                        </v-text-field>
                        <!-- <v-text-field                        
                          v-bind="attrs"
                          v-on="on"
                          :value="paramdata[field.name]"
                          :rules="field.rules"
                          :label="field.label"
                          class="mt-0"
                          readonly
                          required
                          v-show="false"
                        ></v-text-field> -->
                        </template>
                        <v-date-picker
                            v-model="paramdata[field.name]"
                            no-title
                            scrollable
                            @change="menu[field.name] = false"
                        ></v-date-picker>
                      </v-menu>
                    </v-col>
                  </template>
                  <!-- <template v-else-if="field.componentType == 'email'">
                    <v-col cols="12" sm="6" :md="field.length">
                      <v-text-field
                        v-model="paramdata[field.name]"
                        :label="field.label"
                        :rules="field.rules"
                        :counter="field.maxLength"
                        required
                        outlined
                        dense
                      ></v-text-field>
                    </v-col>
                  </template> -->
                  <template v-else>
                    <p>else</p>
                  </template>
                </v-row>
              </div>
            </v-container>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import api from '@/services/axios.service'
import { format, parseISO } from 'date-fns'
import { mapState } from 'vuex'
export default {
  props: ['master', 'param', 'id'],
  created: function () {
    this.getView()
  },
  computed: {
    ...mapState({
      gridDefaultHeight: state => state.app.grid.height,
      endpoint: state => state.api.endpoint,
      rules: state => state.app.rules
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },
  data() {
    return {
      action: 'add',
      paramdata: {},
      fields: [],
      valid: false,
      menu: {},
      mapDataTypeToCategory: [
        {
          category: 'number',
          dataTypes: [
            'bigint',
            'decimal',
            'float',
            'int',
            'money',
            'real',
            'smallint',
            'smallmoney',
            'tinyint'
          ]
        },
        {
          category: 'text',
          dataTypes: [
            'nchar',
            'ntext',
            'nvarchar',
            'text',
            'varchar',
            'char'
          ]
        },
        {
          category: 'datetime',
          dataTypes: [
            'datetime',
            'timestamp',
            'date',
            'time',
            'datetime2'
          ]
        },
        {
          category: 'bit',
          dataTypes: [
            'bit'
          ]
        }
      ]     
    }
  },
  methods: {
    convertDate(date) {
      return date ? format(parseISO(date), 'dd-MMM-yyyy') : ''
    },
    createDefaultValue(data) {
      const dataType = data.sqlDbType.toLowerCase()
      const selectedCategory = this.mapDataTypeToCategory.find(x => x.dataTypes.includes(dataType))
      if (selectedCategory.category === 'datetime') {
        this.paramdata[data.name] = format(new Date(), 'yyyy-MM-dd')
      } else if (selectedCategory.category === 'bit') {
        this.paramdata[data.name] = false
      }
    },
    defineRules(fields) {
      const result = fields
      result.forEach(item => {
        const rules = []
        if (item.required) {
          rules.push(this.rules.required[0])
        }
        item.rules = rules   
        this.createDefaultValue(item)      
      })
      return result
    }, 
    async save() {
      debugger
      const form = this.$refs.form.validate()
      console.log(form)
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Please kindly check mandatory fields or fields that have an error.')
        return
      }   
      let result = { success: false, message: '' }
      const url = `${this.endpoint.general.master}?param=${this.param}&id=${this.id}`
      if (this.action === 'add') {
        const resp = await api.create(url, this.paramdata)
        result = resp.data
      } else if (this.action === 'edit') {
        const resp = await api.updatemaster(url, this.paramdata)
        result = resp.data
      }
      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        this.back()
        //this.getList()
      }
    },
    getView() {
      this.id = this.$route.params.id
      this.action = this.id === undefined ? 'add' : 'edit'
      if (this.action === 'add') {
        api.getAll(`${this.endpoint.general.master}/addnew`, {
          params:{
            param:this.param
          }
        }).then(response => {
          //this.fields = response.data.metaData
          this.fields = this.defineRules(response.data.metaData)
        })
      } else {
        api.getAll(`${this.endpoint.general.master}/${this.id}`, {
          params:{
            param:this.param
          }
        }).then(response => {
          this.fields = this.defineRules(response.data.metaData)         
          this.bindData(response.data.tableData)
          console.log(this.fields)
        })
      }
    },
    bindData(datas) {
      for (const [key, value] of Object.entries(datas)) {
        this.paramdata[key] = value
      }
    },
    back() {
      this.$router.push({ name: 'parameter-master', params: { param: this.param } })
    }
  }
}
</script>

<style>
  .container {
    max-width: 100%;
  }
</style>
