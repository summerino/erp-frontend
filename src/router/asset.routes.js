export default [{
  path: '/asset/asset-type',
  name: 'asset-type',
  component: () => import(/* webpackChunkName: "assets-type" */ '@/views/assetmanagement/AssetType.vue'),
  meta: {
    authRequired: true
  }
}]
  