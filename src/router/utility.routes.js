export default [{
  path: '/accounting/utility/posting',
  name: 'posting',
  component: () => import(/* webpackChunkName: "posting" */ '@/views/accounting/utility/PostingJournal.vue'),
  meta: {
    authRequired: true
  }
}]
