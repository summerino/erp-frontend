export default [{
  path: '/general/customer',
  name: 'customer',
  component: () => import(/* webpackChunkName: "general-customer" */ '@/views/general/Customer.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/customer-type',
  name: 'customer-type',
  component: () => import(/* webpackChunkName: "general-customer-type" */ '@/views/general/CustomerType.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/supplier',
  name: 'supplier',
  component: () => import(/* webpackChunkName: "general-supplier" */ '@/views/general/Supplier.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/supplier-type',
  name: 'supplier-type',
  component: () => import(/* webpackChunkName: "general-supplier-type" */ '@/views/general/SupplierType.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/employee',
  name: 'employee',
  component: () => import(/* webpackChunkName: "general-employee" */ '@/views/general/Employee.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/tax',
  name: 'tax',
  component: () => import(/* webpackChunkName: "general-tax" */ '@/views/general/Tax.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/currency',
  name: 'currency',
  component: () => import(/* webpackChunkName: "general-currency" */ '@/views/general/Currency.vue'),
  meta: {
    authRequired: true
  }
}]
