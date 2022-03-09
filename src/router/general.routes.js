export default [{
  path: '/general/master/customer',
  name: 'customer',
  component: () => import(/* webpackChunkName: "customer" */ '@/views/general/master/Customer.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/master/customer-type',
  name: 'customer-type',
  component: () => import(/* webpackChunkName: "customer-type" */ '@/views/general/master/CustomerType.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/master/supplier',
  name: 'supplier',
  component: () => import(/* webpackChunkName: "supplier" */ '@/views/general/master/Supplier.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/master/supplier-type',
  name: 'supplier-type',
  component: () => import(/* webpackChunkName: "supplier-type" */ '@/views/general/master/SupplierType.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/master/employee',
  name: 'employee',
  component: () => import(/* webpackChunkName: "employee" */ '@/views/general/master/Employee.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/master/currency',
  name: 'currency',
  component: () => import(/* webpackChunkName: "currency" */ '@/views/general/master/Currency.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/master/vehicle',
  name: 'vehicle',
  component: () => import(/* webpackChunkName: "vehicle" */ '@/views/general/master/Vehicle.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/master/vehicle-type',
  name: 'vehicle-type',
  component: () => import(/* webpackChunkName: "vehicle-type" */ '@/views/general/master/VehicleType.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/master/tax',
  name: 'tax',
  component: () => import(/* webpackChunkName: "tax" */ '@/views/general/master/Tax.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/master/payment-term',
  name: 'payment-term',
  component: () => import(/* webpackChunkName: "payment-term" */ '@/views/general/master/PaymentTerm.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/approval',
  name: 'approval',
  component: () => import(/* webpackChunkName: "approval" */ '@/views/general/transaction/Approval.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/active-transaction',
  name: 'active-transaction',
  component: () => import(/* webpackChunkName: "active-transaction" */ '@/views/general/transaction/ActiveTransaction.vue'),
  meta: {
    authRequired: true
  }
}, {
  path: '/general/master/dynamic-report-template',
  name: 'dynamic-report-template',
  component: () => import(/* webpackChunkName: "dynamic-report-template" */ '@/views/general/master/DynamicReportTemplate.vue'),
  meta: {
    authRequired: true
  }
}]
