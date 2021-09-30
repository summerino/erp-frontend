export default [{
  path: '/mobilesales/master/reason',
  name: 'reason',
  component: () => import(/* webpackChunkName: "reason" */ '@/views/mobilesales/master/MobileReason.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/mobilesales/master/customer',
  name: 'mobile-customer',
  component: () => import(/* webpackChunkName: "mobile-customer" */ '@/views/mobilesales/master/MobileCustomer.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/mobilesales/master/item-request',
  name: 'mobile-item-request',
  component: () => import(/* webpackChunkName: "mobile-item-request" */ '@/views/mobilesales/transaction/MobileItemRequest.vue'),
  meta: {
    authRequired: true
  }
}]