export default [{
  path: '/accounting/master/currency-rate',
  name: 'currency-rate',
  component: () => import(/* webpackChunkName: "accounting-currency-rate" */ '@/views/accounting/master/CurrencyRate.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/master/coa',
  name: 'coa',
  component: () => import(/* webpackChunkName: "accounting-coa" */ '@/views/accounting/master/Coa.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/master/coa-type',
  name: 'coa-type',
  component: () => import(/* webpackChunkName: "accounting-coa-type" */ '@/views/accounting/master/CoaType.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/transaction/begin-balance/begin-balance-ap',
  name: 'begin-balance-ap',
  component: () => import(/* webpackChunkName: "accounting-begin-balance-ap" */ '@/views/accounting/transaction/begin-balance/AccountPayable.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/transaction/begin-balance/begin-balance-ar',
  name: 'begin-balance-ar',
  component: () => import(/* webpackChunkName: "accounting-begin-balance-ar" */ '@/views/accounting/transaction/begin-balance/AccountReceiveable.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/transaction/general-journal',
  name: 'general-journal',
  component: () => import(/* webpackChunkName: "accounting-general-journal" */ '@/views/accounting/transaction/GeneralJournal.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/utility/posting',
  name: 'posting',
  component: () => import(/* webpackChunkName: "accounting-posting" */ '@/views/accounting/utility/PostingJournal.vue'),
  meta: {
    authRequired: true
  }
}]
  