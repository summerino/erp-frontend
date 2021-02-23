import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

import './category'

mock.onGet(`/api/${endpoint.general.customer}`).reply(async (config) => {
  var searchBy = ''
  var search = ''
  if (config.params) {
    var { searchBy, search } = config.params
  }

  const param = (searchBy.toLowerCase() == 'code')
    ? `code_like=${search}&_sort=code`
    : `name_like=${search}&_sort=name`
    
  const response = await axiosJsonServer.get(`/customers?${param}`)
  
  return [response.status, response.data]
})
