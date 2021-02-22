export default [{
  path: '/purchase/transaction/purchase/order',
  name: 'purchase-order',
  component: () => import('@/views/purchase/transaction/PurchaseOrder.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/transaction/purchase/receive',
  name: 'purchase-receive',
  component: () => import('@/views/purchase/transaction/PurchaseReceive.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/transaction/purchase/invoice',
  name: 'purchase-invoice',
  component: () => import('@/views/purchase/transaction/PurchaseInvoice.vue'),
  meta: {
    authRequired: true
  }
}]
