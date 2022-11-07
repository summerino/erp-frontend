<template>
  <v-data-table
    :headers="grid.columns"
    :items="grid.data"
    class="flex-grow-1"
    :footer-props="{ itemsPerPageOptions: gridDefOpts.pageSizes }"
    :height="gridDefOpts.height"
    :items-per-page="gridDefOpts.pageSize"
    :server-items-length="grid.total"
    :options.sync="grid.options"
    :sort-by="grid.options.sortBy"
    :sort-desc="grid.options.sortDesc"
    fixed-header
  >
    <template v-for="header in grid.columns" v-slot:[header.slot]="{ item }">
      <div v-if="header.copyLabel" :key="header.value">
        <div class="d-flex align-center py-1">
          <div class="ml-1 caption font-weight-bold">
            <copy-label :text="item[header.value]" />
          </div>
        </div>
      </div>
      <div v-else-if="header.displayAs==='tick'" :key="header.value" class="text-xs-center">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-if="item[header.value]"  v-on="on"  small color="success">
              mdi-check-circle
            </v-icon>
            <v-icon v-else small v-on="on" :key="header.value">
              mdi-circle-outline
            </v-icon>
            </template>
          <span>{{item[header.value]}}</span>
        </v-tooltip>
      </div> 
      <div v-else-if="header.dateFormat" :key="header.value">
      <!-- {{ item[header.value] | formatDate(header.dateFormat) }} -->
        {{ item[header.value] | formatDate('dd-MMM-yyyy')}}
      </div>
      <div v-else-if="header.numberFormat" :key="header.value">
        <!-- {{ item[header.value] | numberFormatWithString(header.numberFormat) }} -->
        {{ item[header.value] | formatCurrency }}
      </div>
      <v-chip
        v-else-if="header.displayAs=='hightlights' && header.hightlightValue " 
        label
        small
        class="font-weight-bold"
        :color="item.role === header.hightlightValue ? 'primary' : undefined"
        :key="header.value"
      >{{ item[header.value] | capitalize }}</v-chip>
      <div v-else :key="header.value">
        {{item[header.value]}}
      </div>
    </template>
    
    <template v-slot:[`item.sw_action`]="{ item }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            @click="edit(item[grid.primaryKey])"
            color="orange lighten-1"
            icon
            small
          >
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <span class="text-caption">Edit</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            small
            color="red"
            @click="remove(`${item[grid.primaryKey]}`)"
          >
            <v-icon small>mdi-close-thick</v-icon>
          </v-btn>
        </template>
        <span>Delete</span>
      </v-tooltip>
    </template>
      
  </v-data-table>
</template>

<script>
import CopyLabel from '@/components/common/CopyLabel.vue'
import { mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

export default {
  components: {
    CopyLabel
  },
  props: ['grid'],
  computed: {
    ...mapState({
      gridDefaultHeight: state => state.app.grid.height,
      gridDefOpts: state => state.app.grid
    }),
    formatDate(date) {
      return date ? format(parseISO(date), 'dd-MMM-yyyy') : ''
    },
    numberFormatWithString(number) {
      return number
    }
  },
  methods:{
    edit(id) {
      this.$emit('edit', id)
    },
    remove(id) {
      this.$emit('remove', id)
    }
  },
  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  }
}
</script>
<style lang="scss" scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>