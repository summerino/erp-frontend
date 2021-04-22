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
      { text: 'Employee', regex: /^\/general\/employee/,
        items: [
          { text: 'Employee', link: 'employee' }
        ]
      },
      { text: 'Tax', regex: /^\/general\/tax/,
        items: [
          { text: 'Tax', link: 'tax' }
        ]
      }
    ]
  }
]
