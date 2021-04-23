export default [{
  path: '/accounting/master/currency-rate',
  name: 'currency-rate',
  component: () => import(/* webpackChunkName: "sales-trans-order" */ '@/views/accounting/master/CurrencyRate.vue'),
  meta: {
    authRequired: true
  }
}]
  