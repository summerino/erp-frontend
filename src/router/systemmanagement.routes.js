export default [{
  path: '/systemmanagement/user',
  name: 'user',
  component: () => import(/* webpackChunkName: "systemmanagement-user" */ '@/views/systemmanagement/User.vue'),
  meta: {
    authRequired: true
  }
}]
