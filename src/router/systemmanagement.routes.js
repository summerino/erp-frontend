export default [{
  path: '/system-management/company-profile',
  name: 'company-profile',
  component: () => import(/* webpackChunkName: "systemmanagement-company-profile" */ '@/views/systemmanagement/CompanyProfile.vue'),
  meta: {
    authRequired: true
  }
}, {
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
}, {
  path: '/system-management/system-parameter',
  name: 'system-parameter',
  component: () => import(/* webpackChunkName: "systemmanagement-parameter" */ '@/views/systemmanagement/SystemParameter.vue'),
  meta: {
    authRequired: true
  }
}]
