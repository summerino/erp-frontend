export default [{
  path: '/sales/transaction/sales/order',
  name: 'sales-order',
  component: () => import('@/views/sales/transaction/SalesOrder.vue'),
  meta: {
    authRequired: true
  }
}]
