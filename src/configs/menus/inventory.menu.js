export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Master Data', regex: /^\/inventory\/master/,
    items: [
      { text: 'Item', regex: /^\/inventory\/master\/item/,
        items: [
          { text: 'Item', link: 'item' },
          { text: 'Category', link: 'item-category' },
          { text: 'Group', link: 'item-group' }
        ]
      }
    ]
  },
  { icon: 'mdi-clipboard-edit-outline', text: 'Transaction', regex: /^\/inventory\/transaction/,
    items: [
      { icon: 'mdi-file-outline', text: 'Not Found / 404', link: 'error' },
      { icon: 'mdi-file-outline', text: 'Unexpected / 500', link: 'error-unexpected' }
    ]
  },
  { icon: 'mdi-chart-line', text: 'Report', regex: /^\/inventory\/report/,
    items: [
    ]
  }
]
