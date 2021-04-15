export default [
  {
    path: '/parameter/item/Customers',
    name: 'parameter-master',
    component: () => import('@/views/parameter/MasterCustomers.vue'),
    meta: {
      authRequired: true
    },
    props: true
  }
]
