export default [{
  path: '/mobile-warehouse/transaction/receive-item',
  name: 'mobile-receive-item',
  component: () => import(/* webpackChunkName: "mobile-receive-item" */ '@/views/mobilewarehouse/transaction/MobileReceiveItem.vue'),
  meta: {
    authRequired: true
  }
}]