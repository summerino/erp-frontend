import data from '@/fake-db/db.json'
import mock from '@/fake-db/mock.js'

import category from './category'

mock.onPost('/api/customer/list').reply((request) => {
  const { searchBy, search } = JSON.parse(request.data)

  const datas = data.customers.filter(c => {
    if (searchBy.toLowerCase() == 'code') return c.code.toLowerCase().includes(search.toLowerCase())
    else return c.name.toLowerCase().includes(search.toLowerCase())
  })
  
  return [200, datas]
})
