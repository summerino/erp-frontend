export default [{
  path: '/purchase/transaction/purchase-order',
  name: 'purchase-order',
  component: () => import(/* webpackChunkName: "purchase-trans-order" */ '@/views/purchase/transaction/PurchaseOrder.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/transaction/purchase-receive',
  name: 'purchase-receive',
  component: () => import(/* webpackChunkName: "purchase-trans-receive" */ '@/views/purchase/transaction/PurchaseReceive.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/transaction/purchase-invoice',
  name: 'purchase-invoice',
  component: () => import(/* webpackChunkName: "purchase-trans-invoice" */ '@/views/purchase/transaction/PurchaseInvoice.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/transaction/purchase-return',
  name: 'purchase-return',
  component: () => import(/* webpackChunkName: "purchase-trans-return" */ '@/views/purchase/transaction/PurchaseReturn.vue'),
  meta: {
    authRequired: true
  }
}]
