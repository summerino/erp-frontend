import mock from '@/fake-db/mock.js'

const data = {
  uoms: [{
    id: 1,
    code: 'DUS @ 6 KLG',
    name: 'DUS',
    baseUnit: 'KLG'
  }, {
    id: 2,
    code: 'DUS @ 6 PAK X 20 BKS',
    name: 'DUS',
    baseUnit: 'BKS'
  }, {
    id: 3,
    code: 'DUS @ 4 PAK X 6 BKS',
    name: 'DUS',
    baseUnit: 'BKS'
  }]
}

mock.onPost('/api/uom/list').reply((request) => {
  const datas = data.uoms

  return [200, datas]
})
