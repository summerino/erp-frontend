export default [{
  path: '/sales/master/area',
  name: 'area',
  component: () => import(/* webpackChunkName: "sales-master-area" */ '@/views/sales/master/Area.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/sales-order',
  name: 'sales-order',
  component: () => import(/* webpackChunkName: "sales-trans-order" */ '@/views/sales/transaction/SalesOrder.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/sales-delivery',
  name: 'delivery-order',
  component: () => import(/* webpackChunkName: "sales-trans-delivery" */ '@/views/sales/transaction/DeliveryOrder.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/sales-invoice',
  name: 'sales-invoice',
  component: () => import(/* webpackChunkName: "sales-trans-invoice" */ '@/views/sales/transaction/SalesInvoice.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/direct-invoice/:action?/:code?',
  name: 'direct-invoice',
  component: () => import(/* webpackChunkName: "sales-trans-direct-invoice" */ '@/views/sales/transaction/DirectInvoice.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/sales-return-wo-doc',
  name: 'sales-return-wo-doc',
  component: () => import(/* webpackChunkName: "sales-trans-return-wo-doc" */ '@/views/sales/transaction/SalesReturnNoDoc.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/credit-memo',
  name: 'credit-memo',
  component: () => import(/* webpackChunkName: "credit-memo" */ '@/views/sales/transaction/CreditMemo.vue'),
  meta: {
    authRequired: true
  }
}]
