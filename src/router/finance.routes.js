export default [
  {
    path: '/finance/transaction/cashbank',
    name: 'cashbank',
    component: () => import(/* webpackChunkName: "finance-cashbank" */ '@/views/finance/transaction/CashBank.vue'),
    meta: {
      authRequired: true
    }
  }, {
    path: '/finance/transaction/cash-bank-inter',
    name: 'cash-bank-inter',
    component: () => import(/* webpackChunkName: "cash-bank-inter" */ '@/views/finance/transaction/CashBankInter.vue'),
    meta: {
      authRequired: true
    }
  }
]
