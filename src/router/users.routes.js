export default [{
  path: '/users',
  redirect: 'users-list'
}, {
  path: '/users/list',
  name: 'users-list',
  component: () => import(/* webpackChunkName: "users-list" */ '@/views/users/UsersPage.vue')
}, {
  path: '/users/edit',
  name: 'users-edit',
  component: () => import(/* webpackChunkName: "users-edit" */ '@/views/users/EditUserPage.vue')
}]
