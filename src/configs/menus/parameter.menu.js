export default [
  {
    icon: 'mdi-alpha-m-circle-outline',
    text: 'Master Data', 
    regex: /^\/parameter\/master/,
    items: [
      {
        text: 'General',
        items: [
          {
            text: 'Customer Type',
            link: 'parameter-master',
            params: { 
              param: 'customertype' 
            }
          },
          {
            text: 'Currency',
            link: 'parameter-master',
            params: { param: 'currency' }
          },
          {
            text: 'Currency Rate',
            link: 'parameter-master',
            params: { param: 'currencyrate' }
          },
          {
            text: 'Vechicle',
            link: 'parameter-master',
            params: { param: 'vehicle' }
          }
        ]
      }   
    ]
  }
]