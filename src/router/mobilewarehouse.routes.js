export default [{
  path: '/mobile-warehouse/transaction/receive-item',
  name: 'mobile-receive-item',
  component: () => import(/* webpackChunkName: "mobile-receive-item" */ '@/views/mobilewarehouse/transaction/MobileReceiveItem.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/mobile-warehouse/transaction/delivery-item',
  name: 'mobile-delivery-item',
  component: () => import(/* webpackChunkName: "mobile-delivery-item" */ '@/views/mobilewarehouse/transaction/MobileDeliveryItem.vue'),
  meta: {
    authRequired: true
  }
}]