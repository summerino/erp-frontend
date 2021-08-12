export default [
  {
    path: '/finance/transaction/cash-bank',
    name: 'cash-bank',
    component: () => import(/* webpackChunkName: "finance-cashbank" */ '@/views/finance/transaction/CashBank.vue'),
    meta: {
      authRequired: true
    }
  }, {
    path: '/finance/transaction/cash-bank-inter',
    name: 'cash-bank-inter',
    component: () => import(/* webpackChunkName: "finance-inter-cash-bank" */ '@/views/finance/transaction/InterCashBank.vue'),
    meta: {
      authRequired: true
    }
  }, {
    path: '/finance/report/cb-report',
    name: 'cb-report',
    component: () => import(/* webpackChunkName: "finance-cb-report" */ '@/views/finance/report/CBReport.vue'),
    meta: {
      authRequired: true
    }
  }
]
