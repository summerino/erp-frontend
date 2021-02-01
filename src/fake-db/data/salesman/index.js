import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onPost('/api/salesman/lists').reply(async (request) => {
  var filter = null
  if (request.data) {
    var { filter } = JSON.parse(request.data)
  }
  filter = filter || ''
  
  const response = await axiosJsonServer.get(`/salesmans?name_like=${filter}&_sort=name`)
  
  return [response.status, response.data]
})
