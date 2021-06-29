export default [{
  path: '/asset-management/master/asset-type',
  name: 'asset-type',
  component: () => import(/* webpackChunkName: "asset-type" */ '@/views/assetmanagement/master/AssetType.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/asset-management/transaction/fixed-asset',
  name: 'fixed-asset',
  component: () => import(/* webpackChunkName: "fixed-asset" */ '@/views/assetmanagement/transaction/FixedAsset.vue'),
  meta: {
    authRequired: true
  }
}]
  