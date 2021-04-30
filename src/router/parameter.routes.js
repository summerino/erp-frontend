export default [
  {
    path: '/parameter/master/:param',
    name: 'parameter-master',
    component: () => import('@/views/parameter/MasterView.vue'),
    meta: {
      authRequired: true
    },
    props: true
  },
  {
    path: '/parameter/item/:param/edit/:id',
    name: 'parameter-master-edit',
    component: () => import('@/views/parameter/MasterAddEdit.vue'),
    meta: {
      authRequired: true
    },
    props: true
  },
  {
    path: '/parameter/item/:param/add',
    name: 'parameter-master-add',
    component: () => import('@/views/parameter/MasterAddEdit.vue'),
    meta: {
      authRequired: true
    },
    props: true
  }
]