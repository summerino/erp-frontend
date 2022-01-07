export default [{
  path: '/sales/master/area',
  name: 'area',
  component: () => import(/* webpackChunkName: "area" */ '@/views/sales/master/Area.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/master/salesman-group',
  name: 'salesman-group',
  component: () => import(/* webpackChunkName: "salesman-group" */ '@/views/sales/master/SalesmanGroup.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/master/promo',
  name: 'promo',
  component: () => import(/* webpackChunkName: "promo" */ '@/views/sales/master/Promo.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/sales-order',
  name: 'sales-order',
  component: () => import(/* webpackChunkName: "sales-order" */ '@/views/sales/transaction/SalesOrder.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/sales-delivery',
  name: 'delivery-order',
  component: () => import(/* webpackChunkName: "delivery-order" */ '@/views/sales/transaction/DeliveryOrder.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/sales-invoice',
  name: 'sales-invoice',
  component: () => import(/* webpackChunkName: "sales-invoice" */ '@/views/sales/transaction/SalesInvoice.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/direct-invoice/:action?/:code?',
  name: 'direct-invoice',
  component: () => import(/* webpackChunkName: "direct-invoice" */ '@/views/sales/transaction/DirectInvoice.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/sales-return-wo-doc',
  name: 'sales-return-wo-doc',
  component: () => import(/* webpackChunkName: "sales-return-wo-doc" */ '@/views/sales/transaction/SalesReturnNoDoc.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/delivery-plan',
  name: 'delivery-plan',
  component: () => import(/* webpackChunkName: "delivery-plan" */ '@/views/sales/transaction/DeliveryPlan.vue'),
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
}, {
  path: '/sales/transaction/visit-plan',
  name: 'visit-plan',
  component: () => import(/* webpackChunkName: "visit-plan" */ '@/views/sales/transaction/VisitPlan.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/transaction/visit-order',
  name: 'visit-order',
  component: () => import(/* webpackChunkName: "visit-order" */ '@/views/sales/transaction/VisitOrder.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/report/sales-order-report',
  name: 'sales-order-report',
  component: () => import(/* webpackChunkName: "sales-order-report" */ '@/views/sales/report/SalesOrderReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/report/sales-delivery-report',
  name: 'sales-delivery-report',
  component: () => import(/* webpackChunkName: "sales-delivery-report" */ '@/views/sales/report/SalesDeliveryReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/report/sales-invoice-report',
  name: 'sales-invoice-report',
  component: () => import(/* webpackChunkName: "sales-invoice-report" */ '@/views/sales/report/SalesInvoiceReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/report/ar-report',
  name: 'ar-report',
  component: () => import(/* webpackChunkName: "ar-report" */ '@/views/sales/report/ARReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/report/ar-mutation-report',
  name: 'ar-mutation-report',
  component: () => import(/* webpackChunkName: "ar-mutation-report" */ '@/views/sales/report/ARMutationReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/report/ar-aging-report',
  name: 'ar-aging-report',
  component: () => import(/* webpackChunkName: "ar-aging-report" */ '@/views/sales/report/ARAgingReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/sales/report/credit-memo-report',
  name: 'credit-memo-report',
  component: () => import(/* webpackChunkName: "credit-memo-report" */ '@/views/sales/report/CreditMemoReport.vue'),
  meta: {
    authRequired: true
  }
}]