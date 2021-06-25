export default [
  {
    path: '/asset-management/asset-type',
    name: 'asset-type',
    component: () => import(/* webpackChunkName: "asset-type" */ '@/views/assetmanagement/AssetType.vue'),
    meta: {
      authRequired: true
    }
  }, {
    path: '/asset-management/asset',
    name: 'asset',
    component: () => import(/* webpackChunkName: "asset" */ '@/views/assetmanagement/Asset.vue'),
    meta: {
      authRequired: true
    }
  }
]
  