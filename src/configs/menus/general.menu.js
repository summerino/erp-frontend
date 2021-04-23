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
      },
      { text: 'Employee', link: 'employee' },
      { text: 'Tax', link: 'tax' },
      { text: 'Currency', regex: /^\/general\/currency/,
        items: [
          { text: 'Currency', link: 'currency' }
        ]
      }
    ]
  }
]
