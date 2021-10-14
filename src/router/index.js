import Vue from 'vue'
import Router from 'vue-router'
import auth from '@/services/auth.service'

// Routes
import AccountingRoutes from './accounting.routes'
import AssetManagementRoutes from './assetmanagement.routes'
import ExpeditionRoutes from './expedition.routes'
import FinanceRoutes from './finance.routes'
import GeneralRoutes from './general.routes'
import HumanResourcesRoutes from './humanresource.routes'
import InventoryRoutes from './inventory.routes'
import MobileSalesRoutes from './mobilesales.routes'
import MobileWarehouseRoutes from './mobilewarehouse.routes'
import ParameterRoutes from './parameter.routes'
import PurchaseRoutes from './purchase.routes'
import SalesRoutes from './sales.routes'
import SystemManagementRoutes from './systemmanagement.routes'

Vue.use(Router)

export const routes = [{
  path: '/',
  redirect: '/dashboard/analytics'
}, {
  path: '/dashboard/analytics',
  name: 'dashboard',
  component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/Dashboard.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/user/change-password',
  name: 'user-change-password',
  component: () => import(/* webpackChunkName: "user-change-password" */ '@/views/user/ChangePassword.vue')
},
...AccountingRoutes,
...AssetManagementRoutes,
...ExpeditionRoutes,
...FinanceRoutes,
...GeneralRoutes,
...HumanResourcesRoutes,
...InventoryRoutes,
...MobileSalesRoutes,
...MobileWarehouseRoutes,
...ParameterRoutes,
...PurchaseRoutes,
...SalesRoutes,
...SystemManagementRoutes,
{
  path: '/login',
  name: 'login',
  component: () => import(/* webpackChunkName: "login" */ '@/views/pages/Login.vue'),
  meta: {
    layout: 'auth'
  }
}, {
  path: '/error/unexpected',
  name: 'error-unexpected',
  component: () => import(/* webpackChunkName: "error-unexpected" */ '@/views/pages/UnexpectedPage.vue'),
  meta: {
    layout: 'error'
  }
}, {
  path: '*',
  name: 'error',
  component: () => import(/* webpackChunkName: "error-not-found" */ '@/views/pages/NotFoundPage.vue'),
  meta: {
    layout: 'error'
  }
}]

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL || '/',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition

    return { x: 0, y: 0 }
  },
  routes
})

/**
 * Before each route update
 */
router.beforeEach((to, from, next) => {
  // If auth required, check login. If login fails redirect to login page
  if (to.meta.authRequired) {
    if (!auth.isAuthenticated()) {
      router.push({ name: 'login', query: { to: to.path } })
    }
  }

  // If route name is login & auth authenticated, redirect to dashboard page
  if (to.name === 'login') {
    if (auth.isAuthenticated()) {
      router.push('/').catch(() => {})
    }
  }

  return next()
})

/**
 * After each route update
 */
router.afterEach(() => {
})

export default router
