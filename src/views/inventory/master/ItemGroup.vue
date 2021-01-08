<template>
  <div class="w-full">
    <v-card v-if="main">
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        this is main
      </v-card-title>

      <v-data-table
        :headers="grid.columns"
        :items="grid.data"
        :items-per-page="5"
        class="elevation-1"
      >
        <template v-slot:[`item.action`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                small
                color="orange lighten-1"
                @click="edit(item)"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Edit</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                small
                color="red"
                @click="remove(item)"
              >
                <v-icon small>mdi-close-thick</v-icon>
              </v-btn>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-card v-else>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-icon color="indigo lighten-2">mdi-square-edit-outline</v-icon>
            <span class="mx-1">Item Group</span>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <v-btn
              dark
              small
              tile
              color="blue darken-2"
              class="font-weight-regular">
              <v-icon left>
                mdi-content-save
              </v-icon>
              Save
            </v-btn>
            <v-btn
              small
              tile
              class="font-weight-regular ml-1">
              <v-icon left>
                mdi-undo-variant
              </v-icon>
              Back
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-form v-model="valid">
          <v-container class="px-1 pt-0 pb-1">
            <v-row dense>
              <v-col
                cols="12"
                class="pt-0">
                <v-text-field
                  v-model="code"
                  :rules="rules.code"
                  label="Code"
                  counter="100"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col
                cols="12"
                class="pt-0">
                <v-text-field
                  v-model="name"
                  :rules="rules.name"
                  label="Name"
                  counter="500"
                  class="mt-0"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>

    <confirm ref="confirm"></confirm>
  </div>
</template>

<script>
import axios from '@/axios'

import Confirm from '@/components/dialog/Confirm'

export default {
  components: {
    Confirm
  },
  data: () => ({
    main: true,
    grid: {
      data: [],
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90' },
        { text: 'Code', value: 'code', divider: true, width: '300' },
        { text: 'Name', value: 'name' }
      ]
    },
    valid: false,
    code: '',
    name: '',
    rules: {
      code: [
        (v) => !!v || 'Code is required',
        (v) => (v || '').length <= 100 || 'Code must be less than 100 characters'
      ],
      name: [
        (v) => !!v || 'Name is required',
        (v) => (v || '').length <= 500 || 'Name must be less than 500 characters'
      ]
    }
  }),
  mounted: function () {
    this.getList()
  },
  methods: {
    getList() {
      axios.post('/item/list')
        .then(response => {
          this.grid.data = response.data
        })
    },
    edit(item) {
      console.log(item)
    },
    remove() {
      console.log(this.$refs.confirm)
      this.$refs.confirm.open('Delete?', 'Are you sure want to delete this data?')
      // console.log(item)
    }
  }
}
</script>
