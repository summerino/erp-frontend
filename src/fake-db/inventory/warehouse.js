import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.inventory.warehouse}`).reply(async (request) => {
  var filter = null
  if (request.data) {
    var { filter } = JSON.parse(request.data)
  }
  filter = filter || ''
  
  const response = await axiosJsonServer.get(`/warehouses?name_like=${filter}&_sort=initial,name`)
  
  return [response.status, response.data]
})
