export default [{
  path: '/finance/transaction/cash-bank',
  name: 'cash-bank',
  component: () => import(/* webpackChunkName: "cash-bank" */ '@/views/finance/transaction/CashBank.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/finance/transaction/cash-bank-inter',
  name: 'cash-bank-inter',
  component: () => import(/* webpackChunkName: "inter-cash-bank" */ '@/views/finance/transaction/InterCashBank.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/finance/report/cb-report',
  name: 'cb-report',
  component: () => import(/* webpackChunkName: "cb-report" */ '@/views/finance/report/CBReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/finance/report/outstanding-cheque-report',
  name: 'outstanding-cheque-report',
  component: () => import(/* webpackChunkName: "outstanding-cheque-report" */ '@/views/finance/report/OutstandingChequeReport.vue'),
  meta: {
    authRequired: true
  }
}]
