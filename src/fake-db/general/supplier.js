import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.general.supplier}`).reply(async (config) => {
  const { searchBy, search } = config.params

  const param = (searchBy.toLowerCase() == 'code')
    ? `code_like=${search}`
    : `name_like=${search}`
    
  const response = await axiosJsonServer.get(`/suppliers?${param}&_sort=name`)

  return [response.status, response.data]
})
