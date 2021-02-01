import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

import category from './category'

mock.onPost('/api/customer/list').reply(async (request) => {
  const { searchBy, search } = JSON.parse(request.data)

  const param = (searchBy.toLowerCase() == 'code')
    ? `code_like=${search}`
    : `name_like=${search}`
    
  const response = await axiosJsonServer.get(`/customers?${param}`)

  // const datas = data.customers.filter(c => {
  //   if (searchBy.toLowerCase() == 'code') return c.code.toLowerCase().includes(search.toLowerCase())
  //   else return c.name.toLowerCase().includes(search.toLowerCase())
  // })
  
  return [response.status, response.data]
})
