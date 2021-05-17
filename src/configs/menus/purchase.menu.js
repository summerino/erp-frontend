export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Master Data', regex: /^\/purchase\/master/,
    items: [
    ]
  },
  { icon: 'mdi-clipboard-edit-outline', text: 'Transaction', regex: /^\/purchase\/transaction/,
    items: [
      { text: 'Purchase', regex: /^\/purchase\/transaction\/purchase/,
        items: [
          { text: 'Order', link: 'purchase-order' },
          { text: 'Receive', link: 'purchase-receive' },
          { text: 'Invoice', link: 'purchase-invoice' },
          { text: 'Return', link: 'purchase-return-wo-doc' }
        ]
      },
      { text: 'Debit Memo', link: 'debit-memo' }
    ]
  },
  { icon: 'mdi-chart-line', text: 'Report', regex: /^\/purchase\/report/,
    items: [
    ]
  }
]
