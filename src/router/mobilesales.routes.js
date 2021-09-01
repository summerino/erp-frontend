export default [{
  path: '/mobilesales/master/reason',
  name: 'reason',
  component: () => import(/* webpackChunkName: "reason" */ '@/views/mobilesales/master/MobileReason.vue'),
  meta: {
    authRequired: true
  }
}]