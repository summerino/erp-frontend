export default [{
  path: '/systemmanagement/user',
  name: 'user',
  component: () => import(/* webpackChunkName: "systemmanagement-user" */ '@/views/systemmanagement/User.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/systemmanagement/role',
  name: 'role',
  component: () => import(/* webpackChunkName: "systemmanagement-role" */ '@/views/systemmanagement/Role.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/systemmanagement/system-parameter',
  name: 'system-parameter',
  component: () => import(/* webpackChunkName: "systemmanagement-parameter" */ '@/views/systemmanagement/SystemParameter.vue'),
  meta: {
    authRequired: true
  }
}]
