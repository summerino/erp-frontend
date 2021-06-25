export default [{
  path: '/accounting/master/currency-rate',
  name: 'currency-rate',
  component: () => import(/* webpackChunkName: "sales-trans-order" */ '@/views/accounting/master/CurrencyRate.vue'),
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
}]
  