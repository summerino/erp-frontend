export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Master Data', regex: /^\/general/,
    items: [
      { text: 'Customer', regex: /^\/general\/customer/,
        items: [
          { text: 'Customer', link: 'customer' },
          { text: 'Type', link: 'customer-type' }
        ]
      },
      { text: 'Supplier', regex: /^\/general\/supplier/,
        items: [
          { text: 'Supplier', link: 'supplier' },
          { text: 'Type', link: 'supplier-type' }
        ]
      }
    ]
  }
]
