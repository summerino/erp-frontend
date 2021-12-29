export default [{
  path: '/purchase/transaction/purchase-order',
  name: 'purchase-order',
  component: () => import(/* webpackChunkName: "purchase-order" */ '@/views/purchase/transaction/PurchaseOrder.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/transaction/purchase-receive',
  name: 'purchase-receive',
  component: () => import(/* webpackChunkName: "purchase-receive" */ '@/views/purchase/transaction/PurchaseReceive.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/transaction/purchase-invoice',
  name: 'purchase-invoice',
  component: () => import(/* webpackChunkName: "purchase-invoice" */ '@/views/purchase/transaction/PurchaseInvoice.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/transaction/purchase-return',
  name: 'purchase-return',
  component: () => import(/* webpackChunkName: "purchase-return" */ '@/views/purchase/transaction/PurchaseReturn.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/transaction/purchase-return-wo-doc',
  name: 'purchase-return-wo-doc',
  component: () => import(/* webpackChunkName: "purchase-return-wo-doc" */ '@/views/purchase/transaction/PurchaseReturnNoDoc.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/transaction/debit-memo',
  name: 'debit-memo',
  component: () => import(/* webpackChunkName: "debit-memo" */ '@/views/purchase/transaction/DebitMemo.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/report/ap-report',
  name: 'ap-report',
  component: () => import(/* webpackChunkName: "ap-report" */ '@/views/purchase/report/APReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/report/ap-mutation-report',
  name: 'ap-mutation-report',
  component: () => import(/* webpackChunkName: "ap-mutation-report" */ '@/views/purchase/report/APMutationReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/report/ap-aging-report',
  name: 'ap-aging-report',
  component: () => import(/* webpackChunkName: "ap-aging-report" */ '@/views/purchase/report/APAgingReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/report/debit-memo-report',
  name: 'debit-memo-report',
  component: () => import(/* webpackChunkName: "debit-memo-report" */ '@/views/purchase/report/DebitMemoReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/report/purchase-order-report',
  name: 'purchase-order-report',
  component: () => import(/* webpackChunkName: "purchase-order-report" */ '@/views/purchase/report/PurchaseOrderReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/purchase/report/purchase-receive-report',
  name: 'purchase-receive-report',
  component: () => import(/* webpackChunkName: "purchase-receive-report" */ '@/views/purchase/report/PurchaseReceiveReport.vue'),
  meta: {
    authRequired: true
  }
}]
