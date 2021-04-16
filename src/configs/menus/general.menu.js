export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Master Data', regex: /^\/general/,
    items: [
      { text: 'Customer', regex: /^\/general\/customer/,
        items: [
          { text: 'Customer', link: 'customer' },
          { text: 'Type', link: 'customer-type' }
        ]
      }
    ]
  }
]
