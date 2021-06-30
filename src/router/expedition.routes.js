export default [{
  path: '/expedition/expedition-invoice',
  name: 'expedition-invoice',
  component: () => import(/* webpackChunkName: "expedition-invoice" */ '@/views/expedition/ExpeditionInvoice.vue'),
  meta: {
    authRequired: false
  }
}]
