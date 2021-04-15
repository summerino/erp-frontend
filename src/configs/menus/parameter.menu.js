export default [
  {
    icon: 'mdi-alpha-m-circle-outline',
    text: 'Master Data', // regex: /^\/parameter/,
    items: [
      {
        text: 'Umum',
        regex: /^\/parameter\/item/,
        items: [
          {
            text: 'Person',
            link: 'parameter-master',
            params: { param: 'Person' }
          },
          {
            text: 'Contacts',
            link: 'parameter-master',
            params: { param: 'Contacts' }
          },
          {
            text: 'Currencies',
            link: 'parameter-master',
            params: { param: 'Currencies' }
          },
          {
            text: 'Customers',
            link: 'parameter-master',
            params: { param: 'Customers' }
          },
          {
            text: 'Driver',
            link: 'parameter-master',
            params: { param: 'Driver' }
          },
          {
            text: 'Customer Category',
            link: 'parameter-master',
            params: { param: 'CustomerCategory' }
          },
          {
            text: 'Business Partners',
            link: 'parameter-master',
            params: { param: 'BusinessPartners' }
          }
        ]
      },
      {
        text: 'Test',
        items: [{ text: 'Grid Test', link: 'gridedit' }]
      }
    ]
    // items: [
    //   { text: 'Category', link: { name: 'parameter-master', params: { master: 'Category' } } },
    //   { text: 'Supplier', link: { name: 'parameter-master', params: { master: 'Supplier' } } }
    // ]
  }
]
