import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.general.salesman}`).reply(async (request) => {
  var filter = null
  if (request.data) {
    var { filter } = JSON.parse(request.data)
  }
  filter = filter || ''
  
  const response = await axiosJsonServer.get(`/salesmans?name_like=${filter}&_sort=name`)
  
  return [response.status, response.data]
})
