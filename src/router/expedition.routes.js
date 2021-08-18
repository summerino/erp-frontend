export default [{
  path: '/expedition/expedition-invoice',
  name: 'expedition-invoice',
  component: () => import(/* webpackChunkName: "expedition-invoice" */ '@/views/expedition/ExpeditionInvoice.vue'),
  meta: {
    authRequired: false
  }
}, {
  path: '/expedition/report/ep-ap-report',
  name: 'ep-ap-report',
  component: () => import(/* webpackChunkName: "ep-ap-report" */ '@/views/expedition/report/EPAPReport.vue'),
  meta: {
    authRequired: false
  }
}]
