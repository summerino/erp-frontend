export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Master Data', regex: /^\/sales\/master/,
    items: [
    ]
  },
  { icon: 'mdi-clipboard-edit-outline', text: 'Transaction', regex: /^\/sales\/transaction/,
    items: [
      { text: 'Sales', regex: /^\/sales\/transaction\/sales/,
        items: [
          { text: 'Order', link: 'sales-order' },
          { text: 'Delivery', link: 'delivery-order' },
          { text: 'Invoice', link: 'sales-invoice' },
          { text: 'Return W/O Doc.', link: 'sales-return-wo-doc' }
        ]
      }
    ]
  },
  { icon: 'mdi-chart-line', text: 'Report', regex: /^\/sales\/report/,
    items: [
    ]
  }
]
