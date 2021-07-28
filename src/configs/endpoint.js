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
    adjustment: 'adjustment',
    warehouseQuantity: 'warehouse-quantity',
    consignee: 'consignee'
  },

  purchase: {
    order: 'purchase-order',
    receive: 'purchase-receive',
    invoice: 'purchase-invoice',
    return: 'purchase-return',
    debitMemo: 'debit-memo'
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
    visitOrder: 'visit-order'
  },

  finance: {
    cashBank: 'general-cash-bank',
    interCashBank: 'inter-cash-bank',
    cashBankType: 'cash-bank-type'
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
    closingMonth: 'closing-month'
  },
  
  systemManagement:{
    companyProfile: 'company-profile',
    user: 'user',
    role: 'role',
    parameter: 'system-parameter',
    menu: 'menu'
  },
  
  assetManagement: {
    asset: {
      type: 'asset-type',
      fixedAsset: 'fixed-asset'
    }
  },

  expedition: {
    invoice: 'expedition-invoice'
  }
}
