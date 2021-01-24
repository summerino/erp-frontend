import mock from '@/fake-db/mock.js'

const data = {
  itemGroups: [{
    id: 1,
    code: 'PRD',
    name: 'Product'
  }, {
    id: 2,
    code: 'PRD-2',
    name: 'Product 2'
  }, {
    id: 3,
    code: 'PRD-3',
    name: 'Product 3'
  }, {
    id: 4,
    code: 'PRD-4',
    name: 'Product 4'
  }, {
    id: 5,
    code: 'PRD-5',
    name: 'Product 5'
  }, {
    id: 6,
    code: 'PRD-6',
    name: 'Product 6'
  }, {
    id: 7,
    code: 'PRD-7',
    name: 'Product 7'
  }, {
    id: 8,
    code: 'PRD-8',
    name: 'Product 8'
  }, {
    id: 9,
    code: 'PRD-9',
    name: 'Product 9'
  }, {
    id: 10,
    code: 'PRD-10',
    name: 'Product 10'
  }, {
    id: 11,
    code: 'PRD-11',
    name: 'Product 11'
  }, {
    id: 12,
    code: 'PRD-12',
    name: 'Product 12'
  }, {
    id: 13,
    code: 'PRD-13',
    name: 'Product 13'
  }, {
    id: 14,
    code: 'PRD-14',
    name: 'Product 14'
  }]
}

mock.onPost('/api/item/list').reply((request) => {
  // const {username, password} = JSON.parse(request.data)

  const datas = data.itemGroups

  return [200, datas]
})
