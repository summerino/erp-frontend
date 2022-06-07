export default [{
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
  path: '/accounting/master/currency-rate',
  name: 'currency-rate',
  component: () => import(/* webpackChunkName: "currency-rate" */ '@/views/accounting/master/CurrencyRate.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/transaction/general-journal',
  name: 'general-journal',
  component: () => import(/* webpackChunkName: "general-journal" */ '@/views/accounting/transaction/GeneralJournal.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/transaction/begin-balance-ap',
  name: 'begin-balance-ap',
  component: () => import(/* webpackChunkName: "begin-balance-ap" */ '@/views/accounting/transaction/begin-balance/AccountPayable.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/transaction/begin-balance-ar',
  name: 'begin-balance-ar',
  component: () => import(/* webpackChunkName: "begin-balance-ar" */ '@/views/accounting/transaction/begin-balance/AccountReceiveable.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/transaction/begin-balance-debit-memo',
  name: 'begin-balance-debit-memo',
  component: () => import(/* webpackChunkName: "begin-balance-debit-memo" */ '@/views/accounting/transaction/begin-balance/DebitMemo.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/transaction/begin-balance-credit-memo',
  name: 'begin-balance-credit-memo',
  component: () => import(/* webpackChunkName: "begin-balance-credit-memo" */ '@/views/accounting/transaction/begin-balance/CreditMemo.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/report/journal-report',
  name: 'journal-report',
  component: () => import(/* webpackChunkName: "journal-report" */ '@/views/accounting/report/JournalReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/report/gl-report',
  name: 'gl-report',
  component: () => import(/* webpackChunkName: "gl-report" */ '@/views/accounting/report/GeneralLedgerReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/report/tb-report',
  name: 'tb-report',
  component: () => import(/* webpackChunkName: "tb-report" */ '@/views/accounting/report/TrialBalanceReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/report/financial/bs-report',
  name: 'bs-report',
  component: () => import(/* webpackChunkName: "bs-report" */ '@/views/accounting/report/BalanceSheetReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/report/financial/is-report',
  name: 'is-report',
  component: () => import(/* webpackChunkName: "is-report" */ '@/views/accounting/report/IncomeStatementReport.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/utility/posting',
  name: 'posting',
  component: () => import(/* webpackChunkName: "posting" */ '@/views/accounting/utility/PostingJournal.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/utility/closing-month',
  name: 'closing-month',
  component: () => import(/* webpackChunkName: "closing-month" */ '@/views/accounting/utility/ClosingMonth.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/accounting/utility/is-format',
  name: 'is-format',
  component: () => import(/* webpackChunkName: "is-format" */ '@/views/accounting/utility/FormatIS.vue'),
  meta: {
    authRequired: true
  }
}]
  