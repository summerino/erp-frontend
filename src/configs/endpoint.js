export default {
  master: 'master',
  
  general: {
    currency: 'currency',
    customer: {
      customer: 'customer',
      type: 'customer-type'
    },
    supplier: {
      supplier: 'supplier',
      type: 'supplier-type'
    },
    employee: 'employee',
    vehicle: {
      vehicle: 'vehicle',
      type: 'vehicle-type'
    },
    tax: 'tax',
    master: 'master',
    paymentTerm: 'payment-term',
    approval: 'approval'
  },

  inventory: {
    item: {
      category: 'item-category',
      group: 'item-group',
      item: 'item'
    },
    uom: 'uom',
    warehouse: 'warehouse',
    transferStock: 'transfer-stock',
    consignee: 'consignee',
    adjustment: 'adjustment',
    beginBalanceStock: 'bb',
    warehouseQuantity: 'warehouse-quantity',
    smReport: 'sm-report'
  },

  purchase: {
    order: 'purchase-order',
    receive: 'purchase-receive',
    invoice: 'purchase-invoice',
    return: 'purchase-return',
    debitMemo: 'debit-memo',
    apReport: 'ap-report',
    apmReport: 'ap-mutation-report',
    apaReport: 'ap-aging-report',
    dmReport: 'debit-memo-report'
  },

  sales: {
    area: 'area',
    salesman: 'salesman-group',
    promo: 'promo',
    order: 'sales-order',
    delivery: 'sales-delivery',
    invoice: 'sales-invoice',
    directInvoice: 'direct-invoice',
    return: 'sales-return',
    plan: 'delivery-plan',
    creditMemo: 'credit-memo',
    visitPlan: 'visit-plan',
    visitOrder: 'visit-order',
    arReport: 'ar-report',
    armReport: 'ar-mutation-report',
    araReport: 'ar-aging-report',
    cmReport: 'credit-memo-report'
  },

  expedition: {
    invoice: 'expedition-invoice',
    epApReport: 'ep-ap-report'
  },

  finance: {
    cashBank: 'general-cash-bank',
    interCashBank: 'inter-cash-bank',
    cashBankType: 'cash-bank-type',
    cbReport: 'cb-report'
  },

  accounting: {
    coa: 'coa',
    coaType: 'coa-type',
    currencyRate: 'currency-rate',
    generalJournal: 'general-journal',
    beginBalance: {
      ap: 'bb-ap',
      ar: 'bb-ar',
      dm: 'bb-debit-memo',
      cm: 'bb-credit-memo'
    },
    journalReport: 'journal-report',
    generalLedgerReport: 'gl-report',
    trialBalanceReport: 'tb-report',
    balanceSheetReport: 'bs-report',
    incomeStatementReport: 'is-report',
    closingMonth: 'closing-month',
    incomeStatementFormat: 'is-format'
  },
  
  assetManagement: {
    asset: {
      type: 'asset-type',
      fixedAsset: 'fixed-asset'
    }
  },

  humanResource: {
    attendanceReport: 'attendance-report'
  },

  mobileSales: {
    reason: 'mobile-reason',
    customer: 'mobile-customer',
    paymentMethod: 'mobile-payment-method',
    itemRequest: 'mobile-item-request',
    salesCost: 'mobile-sales-cost',
    visitLog: 'mobile-visit-log',
    order: 'mobile-order',
    paymentInvoice: 'mobile-payment-invoice',
    visitPerformanceReport: 'mobile-visit-performance-report',
    activiyLogReport: 'mobile-activity-log-report',
    mapTrackingReport: 'mobile-map-tracking-report'
  },

  mobileWarehouse: {
    receiveItem: 'mobile-receive-item',
    deliveryItem: 'mobile-delivery-item',
    transferStock: 'mobile-transfer-stock'
  },
  
  systemManagement:{
    companyProfile: 'company-profile',
    user: 'user',
    role: 'role',
    parameter: 'system-parameter',
    menu: 'menu',
    action: 'action'
  }
}
