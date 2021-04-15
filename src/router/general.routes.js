export default [{
  path: '/general/customer',
  name: 'customer',
  component: () => import(/* webpackChunkName: "general-customer" */ '@/views/general/Customer.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/customer-type',
  name: 'customer-type',
  component: () => import(/* webpackChunkName: "general-customer-type" */ '@/views/general/Customer.vue'),
  meta: {
    authRequired: true
  }
}]
