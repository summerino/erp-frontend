<template>
  <div>
    <v-autocomplete
      v-model="data"
      :label="param"
      :items="datas"
      :rules="rules"
      class="mt-0"
      @change="onSelected"
    ></v-autocomplete>
  </div>
</template>

<script>
import api from '@/services/axios.service'
import { mapState } from 'vuex'

export default {
  props:['param', 'fieldValue', 'fieldName', 'fieldModel', 'value', 'rules'],
  data() {
    return {
      data: null,
      datas:[]    
    }
  },
  methods: {
    onSelected() {
      const vm = {
        field : this.fieldModel,
        value : this.data
      }
      this.$emit('onSelected', vm)
    },
    getItems() {
      const fieldNames = []
      const value = this.fieldValue.toLowerCase()
      const text = this.fieldName.toLowerCase()
      fieldNames.push(value)
      fieldNames.push(text)
      api.getAll(this.endpoint.general.master, {
        params: {
          param: this.param,
          fieldNames: fieldNames.join(',')
        }
      }).then(response => {
        const responseData = response.data.tableData 
        for (let i = 0; i < responseData.length; i++) {
          this.datas.push(
            {
              text: responseData[i][text],
              value: responseData[i][value]
            }
          )
        }
        if (this.value) {
          this.data = this.value
        }
      })
    }
  },
  computed: {
    ...mapState({
      endpoint: state => state.api.endpoint
    })
  },
  created: function () {
    this.getItems()
  }
}
</script>
