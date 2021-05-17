<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="hierarchy.search"
              append-icon="mdi-magnify"
              label="Cari..."
              class="font-weight-regular mt-0 pt-0"
              single-line
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="6" class="text-right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'alt', 'n']"
                  color="green darken-1"
                  class="font-weight-regular"
                  dark
                  small
                  tile
                  @click="add"
                  @shortkey="add"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Data Baru
                </v-btn>
              </template>
              <span class="text-caption">(Ctrl + Alt + N)</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card style="overflow-y: scroll" height="400">
        <v-card-text>
          <v-treeview
            :items="hierarchy.data"
            :search="hierarchy.search"
            :open.sync="open"
            hoverable
            dense
          >
            <template v-slot:append="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-if="item.id !== 0"
                    v-bind="attrs"
                    v-on="on"
                    color="orange lighten-1"
                    icon
                    small
                    @click="edit(item)"
                  >
                    <v-icon small>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span class="text-caption">Ubah</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-if="item.id !== 0"
                    v-bind="attrs"
                    v-on="on"
                    :disabled="item.isParent"
                    color="red"
                    icon
                    small
                    @click="remove(item)"
                  >
                    <v-icon small>mdi-close-thick</v-icon>
                  </v-btn>
                </template>
                <span class="text-caption">Hapus</span>
              </v-tooltip>
            </template>
          </v-treeview>
        </v-card-text>
      </v-card>
    </v-card>

    <v-dialog
      v-model="dialog.add"
      transition="dialog-bottom-transition"
      fullscreen
      hide-overlay
      persistent
      scrollable
      @keydown.esc="close"
    >
      <v-card :style="{ background: $vuetify.theme.themes[theme].surface }">
        <v-toolbar
          color="primary"
          max-height="64"
          dark
        >
          <v-btn icon dark @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Kategori Barang</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="data.isActive === false"
                  dark
                  text
                  @click="save(true)"
                  @shortkey="save(true)"
                >Simpan & Tutup</v-btn>
              </template>
              <span class="text-caption">(Ctrl + Enter)</span>
            </v-tooltip>
            <v-divider vertical></v-divider>
            <v-menu
              bottom
              eager
              left
              open-on-hover
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  dark
                  icon
                >
                  <v-icon>mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list class="cursor-pointer">
                <v-list-item
                  v-shortkey="['ctrl', 's']"
                  :disabled="data.isActive === false"
                  @click="save(false)"
                  @shortkey="save(false)"
                >
                  <v-list-item-title>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                        >
                          Simpan
                        </span>
                      </template>
                      <span class="text-caption">(Ctrl + S)</span>
                    </v-tooltip>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-divider vertical></v-divider>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text class="px-2">
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-row dense>
              <v-col cols="7">
                <v-card>
                  <v-card-title>Umum</v-card-title>

                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12" md="6">
                        <v-autocomplete
                          ref="ParentId"
                          v-model="data.parentId"
                          :items="parentRef"
                          :item-text="item => `${item.name}`"
                          :readonly="data.action === 'edit'"
                          label="Induk Kategori"
                          item-value="id"
                          class="mt-0"
                          required
                          @change="setPrefix"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6" class="pl-md-1">
                        <v-autocomplete
                          ref="GroupId"
                          v-model="data.groupId"
                          :items="groupRef"
                          :item-text="item => `${item.name}`"
                          label="Grup Barang"
                          item-value="id"
                          class="mt-0"
                          required
                        ></v-autocomplete>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="4">
                        <v-text-field
                          ref="Initial"
                          v-model="data.initial"
                          label="ID Kategori"
                          class="mt-0"
                          counter="50"
                          :rules="[rules.required[0], rules.max50chars[0]]"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="8" class="pl-md-1">
                        <v-text-field
                          ref="Name"
                          v-model="data.name"
                          label="Nama Kategori"
                          class="mt-0"
                          counter="100"
                          :rules="[rules.required[0], rules.max100chars[0]]"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="5">
                <v-card>
                  <v-tabs v-model="tab.advancedItem">
                    <v-tab key="user">Pengguna</v-tab>

                    <v-tab-item
                      key="user"
                      transition="false"
                    >
                      <v-card>
                        <v-card-text>
                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-text-field
                                v-model="data.createdInitial"
                                label="Dibuat Oleh"
                                class="mt-0"
                                readonly
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-text-field
                                v-model="data.createdDate"
                                label="Tanggal Dibuat"
                                class="mt-0"
                                readonly
                              ></v-text-field>
                            </v-col>
                          </v-row>
                          
                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-text-field
                                v-model="data.updatedInitial"
                                label="Diperbarui Oleh"
                                class="mt-0"
                                readonly
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6" class="pl-md-1">
                              <v-text-field
                                v-model="data.updatedDate"
                                label="Tanggal Diperbarui"
                                class="mt-0"
                                readonly
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                  </v-tabs>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <confirm ref="confirm"></confirm>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format, parseISO }  from 'date-fns'

import api from '@/services/axios.service'

import Confirm from '@/components/dialog/Confirm'

export default {
  components: {
    Confirm
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      receiveDate: false
    },
    hierarchy: {
      data: [],
      search: null
    },
    tab: {
      advancedItem: null
    },
    valid: false,
    open: [],
    parentRef: [],
    groupRef: [],
    data: {}
  }),

  created: function () {
    this.getList()
  },

  mounted: function () {
    setTimeout(() => {
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  watch: {
    'grid.options': {
      handler() {
        this.getList()
      },
      deep: true
    }
  },

  computed: {
    ...mapState({
      gridDefOpts: state => state.app.grid,
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        initial: '',
        name: '',
        parentId: null,
        groupId: 0,
        deep: null,
        seq: null,
        lineage: '',
        isParent: null,
        isActive: null
      }
      this.parentRef = []
      this.groupRef = []
      this.tab.advancedItem = 0

      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }
    },
    getList() {
      api.getAll(`${this.endpoint.inventory.item.category}/hierarchy`, {
        params: { search: this.hierarchy.search }
      })
        .then(response => {
          this.hierarchy.data = [response.data]
          this.open = [0]
        })
    },
    close() {
      this.dialog.add = false
    },
    add() {
      if (this.dialog.add) return
      this.dialog.add = true
      this.reset(false)
      this.data.action = 'add'
      this.data.isActive = true 
      this.getParent()   
      this.getGroup()

      setTimeout(() => {
        // Set focus to receive initial field
        this.$refs.ParentId.focus()

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    edit(item) {
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.getParent()
      this.getGroup()

      this.data = {
        ...item,
        action: 'edit',
        createdDate: format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Set focus to receive code field
      setTimeout(() => {
        this.$refs.Initial.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Non-Aktif?',
          'Apakah anda yakin ingin me-non-aktifkan data ini?')
      ) {
        api.delete(this.endpoint.inventory.item.category, item.id)
          .then(response => {
            if (response.data.success) {
              this.$store.dispatch('app/showSuccess', response.data.message)
              this.getList()
            }
          })
      }
    },
    async save(closeDialog) {
      if (!this.$refs.form.validate()) {
        this.$store.dispatch('app/showInfo', 'Silahkan periksa kembali data yang wajib diisi.')
        return
      }

      let result = { success: false, message: '' }
      if (this.data.action === 'add') {
        this.setOthers()
        const resp = await api.create(this.endpoint.inventory.item.category, this.data)
        result = resp.data
      } else if (this.data.action === 'edit') {
        const resp = await api.update(this.endpoint.inventory.item.category, this.data.id, this.data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else {
          this.data.initial = result.data
        }
        this.getList()
      }
    },
    getParent() {
      api.getAll(`${this.endpoint.inventory.item.category}/lists`, {})
        .then(response => {
          this.parentRef = response.data.tableData
          const itemRef = [{ id: null, initial: null, name: 'Semua Kategori', parentId: null, groupId: 0, seq: 0, deep: 0, lineage: '', isParent: true}, ...this.parentRef]
          this.parentRef = itemRef
        })
    },
    getGroup() {
      api.getAll(`${this.endpoint.inventory.item.group}/lists`, {})
        .then(response => {
          this.groupRef = response.data.tableData
        })
    },
    setPrefix() {
      if (this.data.parentId === 0) {
        this.data.initial = null
        this.data.name = null
        this.data.deep = 0
      } else {
        const item = this.parentRef.find(x => x.id === this.data.parentId)
        this.data.initial = `${item.initial}-`
        this.data.name = `${item.name} - `
        this.data.lineage = item.lineage
        this.data.deep = item.deep
      }
    },
    setOthers() {
      // Set Deep, Seq & Lineage. set Seq always 0
      this.data.deep += 1
      this.data.seq = 0

      const initialResult = this.data.initial
      this.data.lineage = `${this.data.lineage}${initialResult}\\`
    }
  }
}
</script>
