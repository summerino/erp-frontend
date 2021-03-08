export default [{
  path: '/inventory/master/item/category',
  name: 'item-category',
  component: () => import('@/views/inventory/master/ItemCategory.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/inventory/master/item/group',
  name: 'item-group',
  component: () => import('@/views/inventory/master/ItemGroup.vue'),
  meta: {
    authRequired: true
  }
}]
