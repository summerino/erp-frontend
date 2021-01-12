import mock from '@/fake-db/mock.js'

const datas = [{
  id: 1,
  code: 'IDR',
  name: 'Indonesian Rupiah',
  sort: 1
}, {
  id: 2,
  code: 'USD',
  name: 'US Dollar',
  sort: 2
}, {
  id: 3,
  code: 'SGD',
  name: 'Singapore Dollar',
  sort: 3
}, {
  id: 4,
  code: 'EUR',
  name: 'Euro',
  sort: 4
}, {
  id: 5,
  code: 'JPY',
  name: 'Japanese Yen',
  sort: 5
}, {
  id: 6,
  code: 'GBP',
  name: 'Pound Sterling',
  sort: 6
}, {
  id: 7,
  code: 'AUD',
  name: 'Australian Dollar',
  sort: 7
}, {
  id: 8,
  code: 'SAR',
  name: 'Saudi Riyal',
  sort: 8
}, {
  id: 9,
  code: 'CAD',
  name: 'Canadian Dollar',
  sort: 9
}, {
  id: 10,
  code: 'CHF',
  name: 'Swiss Franc',
  sort: 10
}, {
  id: 11,
  code: 'NZD',
  name: 'New Zealand Dollar',
  sort: 11
}, {
  id: 12,
  code: 'THB',
  name: 'Thai baht',
  sort: 12
}, {
  id: 13,
  code: 'PHP',
  name: 'Philippine Peso',
  sort: 13
}, {
  id: 14,
  code: 'KRW',
  name: 'South Korean Won',
  sort: 14
}, {
  id: 15,
  code: 'KPW',
  name: 'North Korean Won',
  sort: 15
}, {
  id: 16,
  code: 'CNY',
  name: 'China Yuan',
  sort: 16
}, {
  id: 17,
  code: 'MYR',
  name: 'Malaysian Ringgit',
  sort: 17
}, {
  id: 18,
  code: 'HKD',
  name: 'Hong Kong Dollar',
  sort: 18
}, {
  id: 19,
  code: 'AED',
  name: 'United Arab Emirates dirham',
  sort: 19
}, {
  id: 20,
  code: 'EGP',
  name: 'Egypt Pound',
  sort: 20
}, {
  id: 21,
  code: 'QAR',
  name: 'Qatar Riyal',
  sort: 21
}, {
  id: 22,
  code: 'INR',
  name: 'India Rupee',
  sort: 22
}, {
  id: 23,
  code: 'TWD',
  name: 'Taiwan New Dollar',
  sort: 23
}, {
  id: 24,
  code: 'VND',
  name: 'Viet Nam Dong',
  sort: 24
}, {
  id: 25,
  code: 'LKR',
  name: 'Sri Lanka Rupee',
  sort: 25
}, {
  id: 26,
  code: 'PKR',
  name: 'Pakistan Rupee',
  sort: 26
}, {
  id: 27,
  code: 'MXN',
  name: 'Mexico Peso',
  sort: 27
}, {
  id: 28,
  code: 'UYU',
  name: 'Uruguay Peso',
  sort: 28
}, {
  id: 29,
  code: 'ARS',
  name: 'Argentina Peso',
  sort: 29
}, {
  id: 30,
  code: 'CLP',
  name: 'Chile Peso',
  sort: 30
}, {
  id: 31,
  code: 'COP',
  name: 'Colombia Peso',
  sort: 31
}, {
  id: 32,
  code: 'CUP',
  name: 'Cuba Peso',
  sort: 32
}, {
  id: 33,
  code: 'DOP',
  name: 'Dominican Peso',
  sort: 33
}, {
  id: 34,
  code: 'BRL',
  name: 'Brazil Real',
  sort: 34
}, {
  id: 35,
  code: 'BND',
  name: 'Brunei Dollar',
  sort: 35
}, {
  id: 36,
  code: 'FJD',
  name: 'Fiji Dollar',
  sort: 36
}]

mock.onPost('/api/currency/lists').reply((request) => {
  var filter = null
  if (request.data) {
    var { filter } = JSON.parse(request.data)
  }
  
  const results = datas.filter(c => {
    if (filter) return c.code.toLowerCase().includes(filter.toLowerCase())
    else return c
  })
  
  return [200, results]
})
