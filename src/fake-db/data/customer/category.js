import mock from '@/fake-db/mock.js'

const data = {
  categories: [{
    id: 1,
    code: 'CAS',
    name: 'CASH'
  }, {
    id: 2,
    code: 'SPM',
    name: 'Supermarket'
  }, {
    id: 3,
    code: 'KON',
    name: 'Konsumen'
  }, {
    id: 4,
    code: 'IND',
    name: 'Industri'
  }, {
    id: 5,
    code: 'UKM',
    name: 'UKM'
  }, {
    id: 6,
    code: 'SPR',
    name: 'Spreading'
  }, {
    id: 7,
    code: 'GRO',
    name: 'Grosir'
  }, {
    id: 8,
    code: 'SPE',
    name: 'Spesial'
  }, {
    id: 9,
    code: 'WRL',
    name: 'Warung / Lapak'
  }, {
    id: 10,
    code: 'RET',
    name: 'Retail'
  }]
}

mock.onPost('/api/customer/category/list').reply((request) => {
  const datas = data.categories

  return [200, datas]
})
