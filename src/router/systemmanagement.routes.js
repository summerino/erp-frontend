export default [{
  path: '/system-management/company-profile',
  name: 'company-profile',
  component: () => import(/* webpackChunkName: "company-profile" */ '@/views/systemmanagement/CompanyProfile.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/system-management/user',
  name: 'user',
  component: () => import(/* webpackChunkName: "user" */ '@/views/systemmanagement/User.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/system-management/user-role',
  name: 'user-role',
  component: () => import(/* webpackChunkName: "user-role" */ '@/views/systemmanagement/Role.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/system-management/system-parameter',
  name: 'system-parameter',
  component: () => import(/* webpackChunkName: "system-parameter" */ '@/views/systemmanagement/SystemParameter.vue'),
  meta: {
    authRequired: true
  }
}]
