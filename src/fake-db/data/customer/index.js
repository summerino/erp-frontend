import mock from '@/fake-db/mock.js'
import category from './category'

const data = {
  customers: [{
    id: 1,
    code: 'C00001',
    name: 'John Doe',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 1,
    categoryCode: 'CAS',
    categoryName: 'CASH',
    contactPerson: ''
  }, {
    id: 2,
    code: 'C00002',
    name: 'Mary Jane',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 1,
    categoryCode: 'CAS',
    categoryName: 'CASH',
    contactPerson: ''
  }, {
    id: 3,
    code: 'C00003',
    name: 'Trevor Smith',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 9,
    categoryCode: 'WRL',
    categoryName: 'Warung / Lapak',
    contactPerson: ''
  }, {
    id: 4,
    code: 'C00004',
    name: 'Lauren Clark',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 3,
    categoryCode: 'KON',
    categoryName: 'Konsumen',
    contactPerson: ''
  }, {
    id: 5,
    code: 'C00005',
    name: 'Andrew Johnson',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 3,
    categoryCode: 'KON',
    categoryName: 'Konsumen',
    contactPerson: ''
  }, {
    id: 6,
    code: 'C00006',
    name: 'Tyler Kendall',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 9,
    categoryCode: 'WRL',
    categoryName: 'Warung / Lapak',
    contactPerson: ''
  }, {
    id: 7,
    code: 'C00007',
    name: 'Jacob King',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 7,
    categoryCode: 'GRO',
    categoryName: 'Grosir',
    contactPerson: ''
  }, {
    id: 8,
    code: 'C00008',
    name: 'Amand Kliens',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 7,
    categoryCode: 'GRO',
    categoryName: 'Grosir',
    contactPerson: ''
  }, {
    id: 9,
    code: 'C00009',
    name: 'Gregg Ross',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 10,
    categoryCode: 'RET',
    categoryName: 'Retail',
    contactPerson: ''
  }, {
    id: 10,
    code: 'C00010',
    name: 'Kara Evans',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 10,
    categoryCode: 'RET',
    categoryName: 'Retail',
    contactPerson: ''
  }, {
    id: 11,
    code: 'C00011',
    name: 'Eve Crawford',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 5,
    categoryCode: 'UKM',
    categoryName: 'UKM',
    contactPerson: ''
  }, {
    id: 12,
    code: 'C00012',
    name: 'Zak Reid',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 1,
    categoryCode: 'CAS',
    categoryName: 'CASH',
    contactPerson: ''
  }, {
    id: 13,
    code: 'C00013',
    name: 'Jack Graham',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 5,
    categoryCode: 'UKM',
    categoryName: 'UKM',
    contactPerson: ''
  }, {
    id: 14,
    code: 'C00014',
    name: 'Aura Brook',
    address: 'This Is My Address',
    phone1: '021 - 999 999',
    fax: '',
    creditLimit: 0,
    categoryId: 9,
    categoryCode: 'WRL',
    categoryName: 'Warung / Lapak',
    contactPerson: ''
  }]
}

mock.onPost('/api/customer/list').reply((request) => {
  const { searchBy, search } = JSON.parse(request.data)

  const datas = data.customers.filter(c => {
    if (searchBy.toLowerCase() == 'code') return c.code.toLowerCase().includes(search.toLowerCase())
    else return c.name.toLowerCase().includes(search.toLowerCase())
  })
  
  return [200, datas]
})
