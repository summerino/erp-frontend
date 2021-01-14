export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Master Data', regex: /^\/sales\/master/,
    items: [
    ]
  },
  { icon: 'mdi-clipboard-edit-outline', text: 'Transaction', regex: /^\/sales\/transaction/,
    items: [
      { text: 'Sales', regex: /^\/sales\/transaction\/sales/,
        items: [
          { text: 'Order', link: 'sales-order' }
        ]
      }
    ]
  },
  { icon: 'mdi-chart-line', text: 'Report', regex: /^\/sales\/report/,
    items: [
    ]
  }
]
