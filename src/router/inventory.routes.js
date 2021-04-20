export default [{
  path: '/inventory/master/item/item',
  name: 'item',
  component: () => import(/* webpackChunkName: "inventory-master-item" */ '@/views/inventory/master/Item.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/inventory/master/item-category',
  name: 'item-category',
  component: () => import(/* webpackChunkName: "inventory-master-item-category" */ '@/views/inventory/master/ItemCategory.vue'),
  meta: {
    authRequired: true
  }
},
{
  path: '/inventory/master/warehouse',
  name: 'warehouse',
  component: () => import(/* webpackChunkName: "inventory-master-item-category" */ '@/views/inventory/master/Warehouse.vue'),
  meta: {
    authRequired: true
  }
},
{
  path: '/inventory/master/item-group',
  name: 'item-group',
  component: () => import(/* webpackChunkName: "inventory-master-item-group" */ '@/views/inventory/master/ItemGroup.vue'),
  meta: {
    authRequired: true
  }
}]
