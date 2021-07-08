export default [
  {
    path: '/finance/transaction/cashbank',
    name: 'cashbank',
    component: () => import(/* webpackChunkName: "finance-cashbank" */ '@/views/finance/transaction/CashBank.vue'),
    meta: {
      authRequired: true
    }
  }
]
