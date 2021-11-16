export default [{
  path: '/mobile-sales/master/reason',
  name: 'mobile-reason',
  component: () => import(/* webpackChunkName: "mobile-reason" */ '@/views/mobilesales/master/MobileReason.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/mobile-sales/master/customer',
  name: 'mobile-customer',
  component: () => import(/* webpackChunkName: "mobile-customer" */ '@/views/mobilesales/master/MobileCustomer.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/mobile-sales/master/payment-method',
  name: 'mobile-payment-method',
  component: () => import(/* webpackChunkName: "mobile-payment-method" */ '@/views/mobilesales/master/MobilePaymentMethod.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/mobile-sales/transaction/item-request',
  name: 'mobile-item-request',
  component: () => import(/* webpackChunkName: "mobile-item-request" */ '@/views/mobilesales/transaction/MobileItemRequest.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/mobile-sales/transaction/sales-cost',
  name: 'mobile-sales-cost',
  component: () => import(/* webpackChunkName: "mobile-sales-cost" */ '@/views/mobilesales/transaction/MobileCost.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/mobile-sales/transaction/visit-log',
  name: 'mobile-visit-log',
  component: () => import(/* webpackChunkName: "mobile-visit-log" */ '@/views/mobilesales/transaction/MobileVisitLog.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/mobile-sales/transaction/visit-order',
  name: 'mobile-order',
  component: () => import(/* webpackChunkName: "mobile-order" */ '@/views/mobilesales/transaction/MobileOrder.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/mobile-sales/transaction/visit-payment',
  name: 'mobile-payment-invoice',
  component: () => import(/* webpackChunkName: "mobile-payment-invoice" */ '@/views/mobilesales/transaction/MobilePaymentInvoice.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/mobile-sales/report/visit-performance-report',
  name: 'mobile-visit-performance-report',
  component: () => import(/* webpackChunkName: "mobile-visit-performance-report" */ '@/views/mobilesales/report/MobileVisitPerformanceReport.vue'),
  meta: {
    authRequired: true
  }
}]