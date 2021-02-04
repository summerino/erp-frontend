export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Master Data', regex: /^\/purchase\/master/,
    items: [
    ]
  },
  { icon: 'mdi-clipboard-edit-outline', text: 'Transaction', regex: /^\/purchase\/transaction/,
    items: [
      { text: 'Purchase', regex: /^\/purchase\/transaction\/purchase/,
        items: [
          { text: 'Order', link: 'purchase-order' }
        ]
      }
    ]
  },
  { icon: 'mdi-chart-line', text: 'Report', regex: /^\/purchase\/report/,
    items: [
    ]
  }
]
