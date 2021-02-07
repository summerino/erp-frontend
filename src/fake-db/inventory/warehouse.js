import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.inventory.warehouse}`).reply(async (config) => {
  var filter = null
  if (config.params) {
    var { filter } = config.params
  }
  filter = filter || ''
  
  const response = await axiosJsonServer.get(`/warehouses?name_like=${filter}&_sort=initial,name`)
  
  return [response.status, response.data]
})
