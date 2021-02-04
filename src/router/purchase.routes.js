export default [{
  path: '/purchase/transaction/purchase/order',
  name: 'purchase-order',
  component: () => import('@/views/purchase/transaction/PurchaseOrder.vue'),
  meta: {
    authRequired: true
  }
}]
