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
}, {
  path: '/inventory/master/item-group',
  name: 'item-group',
  component: () => import(/* webpackChunkName: "inventory-master-item-group" */ '@/views/inventory/master/ItemGroup.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/inventory/master/warehouse',
  name: 'warehouse',
  component: () => import(/* webpackChunkName: "inventory-master-warehouse" */ '@/views/inventory/master/Warehouse.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/inventory/master/unit-of-measurement',
  name: 'unit-of-measurement',
  component: () => import(/* webpackChunkName: "inventory-master-unit-of-measurement" */ '@/views/inventory/master/UnitOfMeasurement.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/inventory/transaction/adjustment',
  name: 'adjustment',
  component: () => import(/* webpackChunkName: "inventory-trans-adjustment" */ '@/views/inventory/transaction/Adjustment.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/inventory/transaction/transfer-stock',
  name: 'transfer-stock',
  component: () => import(/* webpackChunkName: "inventory-trans-transfer-stock" */ '@/views/inventory/transaction/TransferStock.vue'),
  meta: {
    authRequired: true
  }
}]
