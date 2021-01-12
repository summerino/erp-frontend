import mock from '@/fake-db/mock.js'
import { sortBy as _sortBy  } from 'lodash'

const datas = [{
  code: 'W00001',
  name: 'Moon Ga Young'
}, {
  code: 'W00002',
  name: 'Song Hye Kyo'
}, {
  code: 'W00003',
  name: 'Kim Seon Ho'
}, {
  code: 'W00004',
  name: 'Nam Joo Hyuk'
}, {
  code: 'W00005',
  name: 'Bae Suzy'
}, {
  code: 'W00006',
  name: 'Kang Han Na'
}, {
  code: 'W00007',
  name: 'Cha Eun Woo'
}, {
  code: 'W00008',
  name: 'Hwang In Yeop'
}, {
  code: 'W00009',
  name: 'Jo Woo Ri'
}]

mock.onPost('/api/salesman/lists').reply((request) => {
  var filter = null
  if (request.data) {
    var { filter } = JSON.parse(request.data)
  }
  
  const results = datas.filter(c => {
    if (filter) return c.name.toLowerCase().includes(filter.toLowerCase())
    else return c
  })
  
  return [200, _sortBy(results, ['name'])]
})
