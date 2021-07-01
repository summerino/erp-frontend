export default [{
  path: '/accounting/master/currency-rate',
  name: 'currency-rate',
  component: () => import(/* webpackChunkName: "sales-trans-order" */ '@/views/accounting/master/CurrencyRate.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/master/coa',
  name: 'coa',
  component: () => import(/* webpackChunkName: "coa" */ '@/views/accounting/master/Coa.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/master/coa-type',
  name: 'coa-type',
  component: () => import(/* webpackChunkName: "coa-type" */ '@/views/accounting/master/CoaType.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/transaction/begin-balance/begin-balance-ap',
  name: 'begin-balance-ap',
  component: () => import(/* webpackChunkName: "begin-balance-ap" */ '@/views/accounting/transaction/begin-balance/AccountPayable.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/transaction/begin-balance/begin-balance-ar',
  name: 'begin-balance-ar',
  component: () => import(/* webpackChunkName: "begin-balance-ar" */ '@/views/accounting/transaction/begin-balance/AccountReceiveable.vue'),
  meta: {
    authRequired: true
  }
}]
  