export default {
  master: 'master',
  localReport: 'local-report',
  
  general: {
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
    paymentTerm: 'payment-term',
    dynamicReportTemplate: 'dynamic-report-template',
    currency: 'currency',
    master: 'master',
    approval: 'approval',
    activeTransaction: 'active-transaction',
    customDynamicReport: 'custom-dynamic-report'
  },

  inventory: {
    item: {
      item: 'item',
      category: 'item-category',
      group: 'item-group'
    },
    uom: 'uom',
    warehouse: 'warehouse',
    transferStock: 'transfer-stock',
    consignee: 'consignee',
    adjustment: 'adjustment',
    beginBalanceStock: 'bb-stock',
    warehouseQuantity: 'warehouse-quantity',
    smReport: 'sm-report'
  },

  purchase: {
    order: 'purchase-order',
    receive: 'purchase-receive',
    invoice: 'purchase-invoice',
    return: 'purchase-return',
    debitMemo: 'debit-memo',
    poReport: 'purchase-order-report',
    rcvReport: 'purchase-receive-report',
    invReport: 'purchase-invoice-report',
    prReport: 'purchase-return-report',
    apReport: 'ap-report',
    apmReport: 'ap-mutation-report',
    apaReport: 'ap-aging-report',
    apcReport: 'ap-card-report',
    dmReport: 'debit-memo-report'
  },

  sales: {
    area: 'area',
    salesman: 'salesman-group',
    salesmanTarget: 'salesman-target',
    promo: 'promo',
    order: 'sales-order',
    delivery: 'sales-delivery',
    invoice: 'sales-invoice',
    directInvoice: 'direct-invoice',
    return: 'sales-return',
    overlimitApproval: 'overlimit-approval',
    creditMemo: 'credit-memo',
    downPayment: 'sales-down-payment',
    deliveryPlan: 'delivery-plan',
    visitPlan: 'visit-plan',
    visitOrder: 'visit-order',
    soReport: 'sales-order-report',
    doReport: 'sales-delivery-report',
    siReport: 'sales-invoice-report',
    srReport: 'sales-return-report',
    stReport: 'sales-target-report',
    arReport: 'ar-report',
    armReport: 'ar-mutation-report',
    araReport: 'ar-aging-report',
    arcReport: 'ar-card-report',
    cmReport: 'credit-memo-report',
    dpReport: 'delivery-plan-report',
    dlvPlanReport: 'delivery-plan-report',
    roReport: 'release-overlimit-report',
    sdpReport: 'sales-down-payment-report'
  },

  expedition: {
    invoice: 'expedition-invoice',
    epApReport: 'ep-ap-report'
  },

  finance: {
    cashBank: 'general-cash-bank',
    interCashBank: 'inter-cash-bank',
    cashBankType: 'cash-bank-type',
    cbReport: 'cb-report',
    cfReport: 'cash-flow-report',
    ocReport: 'outstanding-cheque-report'
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
  
  systemManagement: {
    companyProfile: 'company-profile',
    user: 'user',
    role: 'role',
    parameter: 'system-parameter',
    menu: 'menu',
    action: 'action'
  }
}
