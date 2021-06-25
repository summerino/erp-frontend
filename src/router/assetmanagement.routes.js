export default [
  {
    path: '/asset-management/fixed-asset',
    name: 'fixed-asset',
    component: () => import(/* webpackChunkName: "fixed-asset" */ '@/views/assetmanagement/FixedAsset.vue'),
    meta: {
      authRequired: true
    }
  },
  {
    path: '/asset-management/asset-type',
    name: 'asset-type',
    component: () => import(/* webpackChunkName: "asset-type" */ '@/views/assetmanagement/AssetType.vue'),
    meta: {
      authRequired: true
    }
  }
]
  