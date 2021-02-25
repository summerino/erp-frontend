import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

import './category'

mock.onGet(`/api/${endpoint.general.customer}`).reply(async (config) => {
  var searchBy = ''
  var searchOp = ''
  var search = ''
  if (config.params) {
    var { searchBy, searchOp, search } = config.params
  }

  var flt_op = ''
  switch (searchOp) {
    case 'neq':
      flt_op = '_ne'
      break;
    case 'contains':
      flt_op = '_like'
      break;
  }

  const param = (searchBy.toLowerCase() == 'code')
    ? `code${flt_op}=${search}&_sort=code`
    : `name${flt_op}=${search}&_sort=name`
    
  const response = await axiosJsonServer.get(`/customers?${param}`)
  
  return [response.status, response.data]
})
