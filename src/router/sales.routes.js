export default [{
  path: '/sales/transaction/sales/order',
  name: 'sales-order',
  component: () => import('@/views/sales/transaction/SalesOrder.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/sales/delivery',
  name: 'delivery-order',
  component: () => import('@/views/sales/transaction/DeliveryOrder.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/sales/invoice',
  name: 'sales-invoice',
  component: () => import('@/views/sales/transaction/SalesInvoice.vue'),
  meta: {
    authRequired: true
  }
}]
