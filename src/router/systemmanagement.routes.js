export default [{
  path: '/system-management/user',
  name: 'user',
  component: () => import(/* webpackChunkName: "systemmanagement-user" */ '@/views/systemmanagement/User.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/system-management/user-role',
  name: 'user-role',
  component: () => import(/* webpackChunkName: "systemmanagement-user-role" */ '@/views/systemmanagement/Role.vue'),
  meta: {
    authRequired: true
  }
}]
