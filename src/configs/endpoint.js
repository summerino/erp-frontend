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
    master: 'master'
  },

  inventory: {
    item: {
      category: 'item-category',
      group: 'item-group',
      item: 'item'
    },
    uom: 'uom',
    uomConversion: 'uom-conversion',
    warehouse: 'warehouse',
    transferStock: 'transfer-stock',
    adjustment: 'adjustment',
    warehouseQuantity: 'warehouse-quantity'
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
    order: 'sales-order',
    delivery: 'sales-delivery',
    invoice: 'sales-invoice',
    directInvoice: 'direct-invoice',
    return: 'sales-return',
    plan: 'delivery-plan',
    creditMemo: 'credit-memo'
  },

  accounting: {
    coa: 'coa',
    currencyRate: 'currency-rate'
  },

  systemManagement:{
    user: 'user',
    parameter: 'system-parameter',
    role: 'role',
    menu: 'menu'
  }
}
