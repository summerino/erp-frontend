export default [{
  path: '/inventory/master/item/category',
  name: 'item-category',
  component: () => import(/* webpackChunkName: "inventory-master-item-category" */ '@/views/inventory/master/ItemCategory.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/inventory/master/item/group',
  name: 'item-group',
  component: () => import(/* webpackChunkName: "inventory-master-item-group" */ '@/views/inventory/master/ItemGroup.vue'),
  meta: {
    authRequired: true
  }
}]
