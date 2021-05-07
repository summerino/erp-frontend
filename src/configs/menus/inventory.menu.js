export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Master Data', regex: /^\/inventory\/master/,
    items: [
      { text: 'Item', regex: /^\/inventory\/master\/item/,
        items: [
          { text: 'Item', link: 'item' },
          { text: 'Category', link: 'item-category' },
          { text: 'Group', link: 'item-group' }
        ]
      },
      { text: 'Warehouse', link: 'warehouse' },
      { text: 'Unit Of Measurement', link: 'unitofmeasurement' }
    ]
  },
  { icon: 'mdi-clipboard-edit-outline', text: 'Transaction', regex: /^\/inventory\/transaction/,
    items: [
      { text: 'Adjustment', link: 'adjustment' }
    ]
  },
  { icon: 'mdi-chart-line', text: 'Report', regex: /^\/inventory\/report/,
    items: [
    ]
  }
]
