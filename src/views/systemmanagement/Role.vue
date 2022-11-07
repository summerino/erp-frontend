<template>
  <div class="w-full">
    <v-card>
      <v-card-title class="indigo--text text--lighten-2 pb-1">
        <v-row dense>
          <v-col cols="12" md="2">
            Peran
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="grid.search"
              append-icon="mdi-magnify"
              label="Cari..."
              class="font-weight-regular mt-0 pt-0"
              single-line
              @keyup.enter="getList()"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="1">
            <export-excel
              ref="exportExcel"
              :company="companyName"
              :grid="grid"
              :gridDefOpts="gridDefOpts"
              title="Daftar Peran"
            ></export-excel>
          </v-col>
          <v-col cols="12" md="5" class="text-right">
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
                  :disabled="!auth.allowCreate"
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

      <v-data-table
        :headers="grid.columns"
        :footer-props="{ itemsPerPageOptions: gridDefOpts.pageSizes }"
        :height="gridDefOpts.height"
        :items="grid.data"
        :items-per-page="gridDefOpts.pageSize"
        :options.sync="grid.options"
        :server-items-length="grid.total"
        :sort-by="grid.options.sortBy"
        :sort-desc="grid.options.sortDesc"
        class="elevation-1"
        fixed-header
      >
        <template v-slot:[`item.action`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
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
                v-bind="attrs"
                v-on="on"
                :disabled="!auth.allowDelete"
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
      </v-data-table>
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
          <v-toolbar-title>Peran</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  v-shortkey="['ctrl', 'enter']"
                  :disabled="data.action === 'edit' && !auth.allowUpdate"
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
                  :disabled="data.action === 'edit' && !auth.allowUpdate"
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
                      <v-col cols="12">
                        <v-text-field
                          ref="Initial"
                          v-model="data.initial"
                          :readonly="data.isActive === false"
                          :rules="[rules.required[0], rules.max50chars[0]]"
                          counter="50"
                          label="Inisial"
                          class="mt-0"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          ref="Name"
                          v-model="data.name"
                          :readonly="data.isActive === false"
                          :rules="[rules.required[0], rules.max100chars[0]]"
                          counter="100"
                          label="Nama"
                          class="mt-0"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="12" md="6" class="pr-md-3">
                        <v-checkbox
                          v-model="data.isActive"
                          label="Aktif"
                        ></v-checkbox>
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

            <v-row v-if="this.data.action === 'edit'" dense>
              <v-col cols="6">
                <v-card style="overflow-y: scroll" height="480">
                  <v-card-title>Menu Peran</v-card-title>
                  <v-card-text>
                    <v-row justify="space-between">
                      <v-col cols="12">
                        <v-treeview
                          ref="itemMenuName"
                          v-model="selectionForView"
                          :active.sync="active"
                          :items="hierarchy.data"
                          :open.sync="open"
                          selection-type="leaf"
                          activatable
                          open-on-click 
                          selectable
                          transition
                          dense
                        ></v-treeview>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-scroll-y-transition mode="out-in">
                  <v-card 
                    v-if="!selectedItem"
                    height="480"
                    class="title grey--text text--lighten-1 font-weight-light text-center"
                  >
                    <v-row>
                      <v-col cols="12">
                        <span>Aksi tidak tersedia</span>
                      </v-col>
                    </v-row>
                  </v-card>
                  <v-card
                    v-else
                    :key="selectedItem"
                    height="480"
                    style="overflow-y: scroll"
                  >
                    <v-card-title>{{ menuName }}</v-card-title>
                    <v-card-text>
                      <v-row v-if="menuAction.length > 0" dense>
                        <v-col cols="12">
                          <v-row dense>
                            <v-col cols="12">
                              <span>Silahkan pilih Aksi</span>
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12">
                              <v-checkbox
                                v-for="item in listAction" :key="item.id"
                                v-model="item.isChecked"
                                :label="item.name"
                                :disabled="data.isActive === false"
                                class="shrink mt-0"
                              ></v-checkbox>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      <v-row v-else 
                        class="title grey--text text--lighten-1 font-weight-light text-center"
                        dense
                      >
                        <v-col cols="12">
                          <span>Aksi tidak tersedia</span>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-scroll-y-transition>
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
import { uniq as _uniq, sortBy as _sortBy } from 'lodash'

import { dateToTick } from '@/helpers/date-helpers'
import api from '@/services/axios.service'
import auth from '@/services/authorization.service'

import ExportExcel from '@/components/common/ExportExcel.vue'
import Confirm from '@/components/dialog/Confirm'

export default {
  components: {
    ExportExcel,
    Confirm
  },

  data: () => ({
    dialog: {
      add: false
    },
    menu: {
      receiveDate: false
    },
    tab: {
      advancedItem: null
    },
    hierarchy: {
      data: [],
      search: null
    },
    grid: {
      columns: [
        { value: 'action', sortable: false, divider: true, width: '90', excelColWidth:'10' },
        { text: 'Inisial', value: 'initial', divider: true, width: '110', excelColWidth:'13' },
        { text: 'Nama', value: 'name', divider: true, width: '270', excelColWidth:'30' }
      ],
      data: [],
      options: {
        sortBy: ['initial'],
        sortDesc: [false]
      },
      total: 0,
      search: null
    },
    valid: false,
    itemBefore: 0,
    menuName: null,
    active: [],
    defaultListAction: [],
    listAction: [],
    selection: [],
    selectionForView: [],
    selectionAction: [],
    selectionParent: [],
    selectionTable: [],
    menuAction: [],
    menuList: [],
    open: [],
    data: {}
  }),

  created: function () {
    this.getList()
    this.loadAction()
    auth.getAction(this.endpoint, this.menuId.role)
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
        text: 'Pengguna'
      }, {
        text: 'Peran'
      }])
      this.$store.commit('app/setGridDefaultHeight', this.$el.clientHeight)
    }, 0)
  },

  watch: {
    'grid.options': {
      handler() {
        this.getList()
      },
      deep: true
    },
    'selectedItem': {
      handler: function (value) {
        this.listingAction(value)
      },
      deep: true
    }
  },

  computed: {
    ...mapState({
      gridDefOpts: state => state.app.grid,
      rules: state => state.app.rules,
      endpoint: state => state.api.endpoint,
      companyName: state => state.api.companyName,
      auth: state => state.api.authorization,
      menuId: state => state.api.menus
    }),
    theme() {
      return this.$vuetify.theme.isDark ? 'dark' : 'light'
    },
    selectedItem() {
      if (!this.active.length) {
        return undefined
      } else {
        return this.active[0]
      }
    }
  },

  methods: {
    reset(resetValidation = true) {
      this.data = {
        initial: '',
        name: '',
        isActive: null
      }
      this.tab.advancedItem = 0
      this.menuAction = []
      this.hierarchy.data = []
      this.selection = []
      this.selectionForView = []
      this.selectionAction = []
      this.listAction = []
      this.selectionTable = []
      this.selectionParent = []
      this.itemBefore = 0
      this.menuName = ''

      this.getList()
      this.loadAction()

      // Reset form validation
      if (resetValidation) {
        setTimeout(() => {
          this.$refs.form.resetValidation()
        }, 0)
      }
    },
    getList(bindToForm = false) {
      const sorts = []
      for (let i = 0; i < this.grid.options.sortBy.length; i++) {
        sorts.push({
          field: this.grid.options.sortBy[i],
          direction: this.grid.options.sortDesc[i] ? 'desc' : 'asc'
        })
      }

      api.getAll(this.endpoint.systemManagement.role, {
        params: {
          search: this.grid.search,
          skip: ((this.grid.options.page - 1) * this.grid.options.itemsPerPage) || 0,
          take: this.grid.options.itemsPerPage || this.gridDefOpts.pageSize,
          sorts: JSON.stringify(sorts)
        }
      })
        .then(response => {
          this.grid.data = response.data.tableData
          this.grid.total = response.data.rowCount
          if (bindToForm) {
            const item = this.grid.data.find(h => h.initial === this.data.initial)
            this.edit(item)
          }
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

      setTimeout(() => {
        // Set focus to receive initial field
        this.$refs.Initial.focus()

        // Validate form first
        this.$refs.form.validate()
      }, 0)
    },
    edit(item) {
      if (!item) return

      this.dialog.add = true
      this.reset()

      this.data = {
        ...item,
        action: 'edit',
        createdDate: format(parseISO(item.createdDate), 'dd-MMM-yyyy HH:mm:ss'),
        updatedDate: format(parseISO(item.updatedDate), 'dd-MMM-yyyy HH:mm:ss')
      }

      // Get menu
      this.getMenu()
      this.getMenuList()

      // Set focus to receive code field
      setTimeout(() => {
        this.$refs.Initial.focus()
      }, 0)
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          'Hapus Data?',
          'Apakah anda yakin ingin menghapus data ini?')
      ) {
        api.delete(this.endpoint.systemManagement.role, item.id)
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
        this.$store.dispatch('app/showInfo', 'Mohon periksa kembali inputan yang wajib diisi atau yang terdapat kesalahan.')
        return
      }

      const data = this.data

      let result = { success: false, message: '' }
      if (data.action === 'add') {
        const resp = await api.create(this.endpoint.systemManagement.role, data)
        result = resp.data
      } else if (data.action === 'edit') {
        // Just edit
        this.updateMenu(this.itemBefore)
        this.getSelectionParent()
        this.createRoleMenuSave()
        data.roleMenus = this.selectionTable
        data.roleMenuActions = this.selectionAction

        const resp = await api.update(this.endpoint.systemManagement.role, data.id, data)
        result = resp.data
      }

      if (result.success) {
        this.$store.dispatch('app/showSuccess', result.message)
        if (closeDialog) {
          this.dialog.add = false
        } else {
          this.data.initial = result.data
        }
        this.getList(!closeDialog)
      }
    },
    createRoleMenuSave() {
      // Inserting parent
      this.selectionParent = _uniq(this.selectionParent)
      if (this.selectionParent.length) {
        for (let j = 0; j < this.selectionParent.length; j++) {
          this.addSelection(this.selectionParent[j])
        }
      }

      // Inserting child
      this.selectionForView = _uniq(this.selectionForView)
      for (let i = 0; i < this.selectionForView.length; i++) {
        this.addSelection(this.selectionForView[i])
      }
    },
    addSelection(id) {
      const item = {
        id: -dateToTick(),
        menuId: id,
        isActive: true,
        updatedDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      }
      this.selectionTable.push(item)
    },
    loadAction() {
      api.getAll(`${this.endpoint.systemManagement.menu}/menu/actions`, {})
        .then(response => {
          this.defaultListAction = response.data.tableData
        })
    },
    getMenuName(id) {
      return `Menu ${this.menuList.find(x => x.id === id).name}`
    },
    listingAction(item) {
      if (!item) return

      api.getAll(`${this.endpoint.systemManagement.menu}/lists`, {
        params: { id: item }
      })
        .then(response => {
          this.menuAction = response.data.tableData

          // Update menu before change to another menu 
          // Notes : to prevent action on save, call updateMenu once again to update the last item
          this.updateMenu(this.itemBefore)
          
          // Reset variable
          this.listAction = JSON.parse(JSON.stringify(this.defaultListAction))

          // Get title menu name
          this.menuName = this.getMenuName(item)

          for (let i = 0; i < this.menuAction.length; i++) {
            const idx = this.listAction.findIndex(x => x.id === this.menuAction[i].actionId)
            if (idx >= 0) {
              this.listAction[idx].isActive = true
              this.listAction[idx].seq = this.menuAction[i].seq
            }
          }

          const filterList = this.listAction.filter(x => x.isActive)
          this.listAction = _sortBy(filterList, ['seq', 'id'])

          for (let j = 0; j < this.selectionAction.length; j++) {
            if (this.selectionAction[j].menuId === item) {
              const isExist = this.listAction.find(x => x.id === this.selectionAction[j].actionId)
              if (isExist) {
                this.listAction.find(x => x.id === this.selectionAction[j].actionId).isChecked = true
              }
            }
          }

          // Save the last id of user's click
          this.itemBefore = item
        })
    },
    updateMenu(itemId) {
      const isAvailable = this.listAction.filter(x => x.isChecked)
      if (isAvailable.length) {
        // Update to array selection action before change to another menu
        const filterSelectionAction = this.selectionAction.filter(x => x.menuId === itemId)
        if (filterSelectionAction.length) {
          // Update
          this.deleteSelectionAction(itemId)
          for (let i = 0; i < isAvailable.length; i++) {
            this.addSelectionAction(itemId, isAvailable[i].id)
          }
        } else {
          // Add
          for (let i = 0; i < isAvailable.length; i++) {
            this.addSelectionAction(itemId, isAvailable[i].id)
          }
        }

        const isExistSelection = this.selection.find(x => x === itemId)
        if (!isExistSelection) {
          this.selection.push(itemId)
          this.selectionForView.push(itemId)
        }
      } else {
        // Delete
        this.deleteSelectionAction(itemId)
      }
    },
    addSelectionAction(itemId, itemAction) {
      const item = {
        id: -dateToTick(),
        menuId: itemId,
        actionId: itemAction,
        updatedDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      }
      this.selectionAction.push(item)
    },
    deleteSelectionAction(itemId) {
      const delSelectionAction = this.selectionAction.filter(x => x.menuId === itemId)
        
      if (delSelectionAction.length) {
        for (let k = 0; k < delSelectionAction.length; k++) {
          const idx = this.selectionAction.findIndex(x => x.id === delSelectionAction[k].id)
          this.selectionAction.splice(idx, 1)
        }
      }
    },
    getMenu() {
      api.getAll(`${this.endpoint.systemManagement.menu}/hierarchy`, {})
        .then(response => {
          this.hierarchy.data = [response.data]
          this.open = [0]
          this.loadRoleMenu()
          this.loadRoleMenuAction()
        })
    },
    getSelectionForView() {
      for (let i = 0; i < this.selection.length; i++) {
        const item = this.selection[i]
        const temp = this.menuList.find(x => x.id === item)
        if (temp) {
          if (temp.link) {
            this.selectionForView.push(item)
          }
        }
      }
    },
    loadRoleMenu() {
      api.getAll(`${this.endpoint.systemManagement.role}/role-menus`, {
        params: { id: this.data.id }
      })
        .then(response => {
          this.selection = response.data
          this.getSelectionForView()
        })
    },
    loadRoleMenuAction() {
      api.getAll(`${this.endpoint.systemManagement.role}/role-menu-actions`, {
        params: { id: this.data.id }
      })
        .then(response => {
          this.selectionAction = response.data.tableData
        })
    },
    getMenuList() {
      api.getAll(`${this.endpoint.systemManagement.menu}`, {
        params: {
          filters: JSON.stringify([{
            field: 'isactive',
            operator: 'eq',
            keyword: true
          }]),
          sorts: JSON.stringify([{
            field: 'id',
            direction: 'asc'
          }])
        }
      })
        .then(response => {
          this.menuList = response.data.tableData
        })
    },
    getSelectionParent() {
      // for (let i = 0; i < this.selection.length; i++) {
      //   this.lookParent(this.selection[i])
      // }
      for (let i = 0; i < this.selectionForView.length; i++) {
        this.lookParent(this.selectionForView[i])
      }
    },
    lookParent(id) {
      const parentId = this.menuList.find(x => x.id === id).parentId

      if (parentId && !this.selectionParent.find(x => x === parentId)) {
        this.selectionParent.push(parentId)
        this.lookParent(parentId)
      }
    }
  }
}
</script>
